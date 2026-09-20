#!/usr/bin/env python3
"""
Development API Integration Tests (Mock Backend)
Standards: Full adherence to GEMINI.md Truthfulness Protocol & ADR-006

Verifies endpoint contracts of the Python development mock API server (FastAPI).
Real ASP.NET Core REST API acceptance is pending deployment with .NET SDK.
"""

import unittest
import subprocess
import time
import urllib.request
import urllib.error
import json
import os
import sys

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
SERVER_DIR = os.path.join(BASE_DIR, 'server')
if SERVER_DIR not in sys.path:
    sys.path.append(SERVER_DIR)

API_BASE = "http://127.0.0.1:5000/api"

class TestApiServer(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        api_script = os.path.join(SERVER_DIR, 'api_server.py')
        cls.server_proc = subprocess.Popen(
            ['python3', api_script],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        time.sleep(2)

    @classmethod
    def tearDownClass(cls):
        cls.server_proc.terminate()
        cls.server_proc.communicate()

    def _get(self, path):
        req = urllib.request.Request(f"{API_BASE}{path}")
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read().decode())

    def _put(self, path, data):
        req = urllib.request.Request(
            f"{API_BASE}{path}",
            data=json.dumps(data).encode(),
            headers={'Content-Type': 'application/json'},
            method='PUT'
        )
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read().decode())

    def _post(self, path, data):
        req = urllib.request.Request(
            f"{API_BASE}{path}",
            data=json.dumps(data).encode(),
            headers={'Content-Type': 'application/json'},
            method='POST'
        )
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read().decode())

    def test_01_get_vendors(self):
        vendors = self._get("/vendors")
        self.assertIsInstance(vendors, list)
        self.assertGreaterEqual(len(vendors), 3)
        v1 = next(v for v in vendors if v["id"] == "VEND-01")
        self.assertEqual(v1["name"], "TransBingo Demo")
        self.assertEqual(len(v1["navigationSteps"]), 13)

    def test_02_get_vendor_by_id(self):
        v = self._get("/vendors/VEND-01")
        self.assertEqual(v["id"], "VEND-01")
        self.assertEqual(v["code"], "TRANSBINGO")
        self.assertIn("credentialReference", v)
        self.assertEqual(v["credentialReference"]["vaultPath"], "vault://transbingo/demo/operator")

    def test_03_zero_password_exposure(self):
        v = self._get("/vendors/VEND-01")
        v_str = json.dumps(v).lower()
        self.assertNotIn("transbingosecure", v_str)
        self.assertNotIn("password123", v_str)
        self.assertNotIn("password-input", v.get("credentialReference", {}).values())

        cfg = self._get("/vendors/VEND-01/execution-config")
        self.assertNotIn("password", cfg["credential"])
        self.assertEqual(cfg["credential"]["secretReference"], "vault://transbingo/demo/operator")

    def test_04_concurrency_conflict_handling(self):
        v = self._get("/vendors/VEND-01")
        current_version = v["rowVersion"]

        # Conflict update
        v_conflict = dict(v)
        v_conflict["rowVersion"] = 99999
        v_conflict["name"] = "Conflict Vendor"

        req = urllib.request.Request(
            f"{API_BASE}/vendors/VEND-01",
            data=json.dumps(v_conflict).encode(),
            headers={'Content-Type': 'application/json'},
            method='PUT'
        )
        with self.assertRaises(urllib.error.HTTPError) as ctx:
            urllib.request.urlopen(req)
        self.assertEqual(ctx.exception.code, 409)

    def test_05_navigation_steps_validation(self):
        # Missing required actions or invalid action
        bad_steps = [
            {"id": "STEP-1", "sequence": 1, "action": "INVALID_ACTION", "selectorStrategy": "css", "selector": "#btn", "description": "Test", "timeoutMs": 5000, "retryCount": 1, "isRequired": True, "isActive": True}
        ]
        req = urllib.request.Request(
            f"{API_BASE}/vendors/VEND-01/navigation-steps",
            data=json.dumps(bad_steps).encode(),
            headers={'Content-Type': 'application/json'},
            method='PUT'
        )
        with self.assertRaises(urllib.error.HTTPError) as ctx:
            urllib.request.urlopen(req)
        self.assertEqual(ctx.exception.code, 400)

    def test_06_execution_config_endpoint(self):
        cfg = self._get("/vendors/VEND-01/execution-config")
        self.assertEqual(cfg["vendor"]["vendorCode"], "TRANSBINGO")
        self.assertEqual(cfg["connector"]["loginUrl"], "http://localhost:8085/demo-vendor/login")
        self.assertEqual(len(cfg["navigationSteps"]), 13)
        self.assertEqual(cfg["reportDefinition"]["expectedFileType"], "XLSX")
        self.assertGreaterEqual(len(cfg["schoolMappings"]), 1)

if __name__ == '__main__':
    unittest.main()
