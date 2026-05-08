#!/usr/bin/env python3
import argparse
import functools
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import os
from pathlib import Path
import urllib.error
import urllib.parse
import urllib.request


PROXY_PREFIX = "/api/lmstudio"
HOP_BY_HOP_HEADERS = {
    "connection",
    "keep-alive",
    "proxy-authenticate",
    "proxy-authorization",
    "te",
    "trailer",
    "transfer-encoding",
    "upgrade",
}


def build_upstream_url(request_path, upstream_base):
    parsed = urllib.parse.urlsplit(request_path)
    if parsed.path == PROXY_PREFIX:
        suffix = "/"
    elif parsed.path.startswith(PROXY_PREFIX + "/"):
        suffix = parsed.path[len(PROXY_PREFIX):]
    else:
        raise ValueError("not an LM Studio proxy path")

    url = upstream_base.rstrip("/") + suffix
    if parsed.query:
        url += "?" + parsed.query
    return url


class TutorHandler(SimpleHTTPRequestHandler):
    upstream_base = "http://127.0.0.1:1234"

    def is_proxy_request(self):
        path = urllib.parse.urlsplit(self.path).path
        return path == PROXY_PREFIX or path.startswith(PROXY_PREFIX + "/")

    def do_OPTIONS(self):
        if not self.is_proxy_request():
            return super().do_OPTIONS()
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.end_headers()

    def do_GET(self):
        if self.is_proxy_request():
            return self.proxy_to_lmstudio()
        return super().do_GET()

    def do_HEAD(self):
        if self.is_proxy_request():
            return self.proxy_to_lmstudio()
        return super().do_HEAD()

    def do_POST(self):
        if self.is_proxy_request():
            return self.proxy_to_lmstudio()
        self.send_error(405, "Method Not Allowed")

    def proxy_to_lmstudio(self):
        try:
            target = build_upstream_url(self.path, self.upstream_base)
        except ValueError:
            self.send_error(404)
            return

        body = None
        if self.command in {"POST", "PUT", "PATCH"}:
            length = int(self.headers.get("Content-Length", "0") or "0")
            body = self.rfile.read(length) if length else b""

        headers = {}
        for name, value in self.headers.items():
            lower = name.lower()
            if lower in HOP_BY_HOP_HEADERS or lower == "host" or lower == "content-length":
                continue
            headers[name] = value

        req = urllib.request.Request(target, data=body, headers=headers, method=self.command)
        try:
            with urllib.request.urlopen(req, timeout=300) as upstream:
                self.send_response(upstream.status)
                self.copy_upstream_headers(upstream.headers)
                self.end_headers()
                if self.command != "HEAD":
                    self.copy_response_body(upstream)
        except urllib.error.HTTPError as e:
            self.send_response(e.code)
            self.copy_upstream_headers(e.headers)
            self.end_headers()
            if self.command != "HEAD":
                self.copy_response_body(e)
        except urllib.error.URLError as e:
            self.send_response(502)
            self.send_header("Content-Type", "text/plain; charset=utf-8")
            self.end_headers()
            self.wfile.write(f"LM Studio proxy error: {e.reason}".encode("utf-8"))

    def copy_upstream_headers(self, headers):
        for name, value in headers.items():
            if name.lower() in HOP_BY_HOP_HEADERS:
                continue
            self.send_header(name, value)
        self.send_header("Cache-Control", "no-store")

    def copy_response_body(self, upstream):
        while True:
            chunk = upstream.read(8192)
            if not chunk:
                break
            self.wfile.write(chunk)
            self.wfile.flush()


def main():
    parser = argparse.ArgumentParser(description="Serve PostgreSQL Tutor with LM Studio proxy.")
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=8000)
    parser.add_argument("--lmstudio-url", default=os.environ.get("LMSTUDIO_URL", "http://127.0.0.1:1234"))
    args = parser.parse_args()

    root = Path(__file__).resolve().parent
    TutorHandler.upstream_base = args.lmstudio_url
    handler = functools.partial(TutorHandler, directory=str(root))

    server = ThreadingHTTPServer((args.host, args.port), handler)
    print(f"Serving http://{args.host}:{args.port}")
    print(f"Proxying {PROXY_PREFIX} -> {args.lmstudio_url}")
    server.serve_forever()


if __name__ == "__main__":
    main()
