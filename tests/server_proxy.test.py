import unittest
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from server import build_upstream_url


class ProxyRoutingTest(unittest.TestCase):
    def test_maps_proxy_path_to_lmstudio_api(self):
        self.assertEqual(
            build_upstream_url(
                "/api/lmstudio/api/v1/chat?x=1",
                "http://127.0.0.1:1234",
            ),
            "http://127.0.0.1:1234/api/v1/chat?x=1",
        )

    def test_rejects_non_proxy_path(self):
        with self.assertRaises(ValueError):
            build_upstream_url("/assets/app.js", "http://127.0.0.1:1234")


if __name__ == "__main__":
    unittest.main()
