#!/usr/bin/env python3
"""
Development Prototype Test: Dynamic Configuration Lifecycle
Standards: Full adherence to GEMINI.md Truthfulness Protocol & ADR-006

Note: This test exercises the dynamic configuration lifecycle using the local Python/FastAPI
development mock API server. It is NOT an acceptance proof for SQL Server or Dapper.
Authoritative SQL Server acceptance is validated strictly via test_sqlserver_acceptance.py.
"""

import unittest
import subprocess
import time
import urllib.request
import json
import os
import sys

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
SERVER_DIR = os.path.join(BASE_DIR, 'server')
if SERVER_DIR not in sys.path:
    sys.path.append(SERVER_DIR)

from vendor_collection_agent import collection_agent

API_BASE = "http://127.0.0.1:5000/api"

class TestDynamicConfiguration(unittest.TestCase):
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

    def test_dynamic_navigation_configuration_lifecycle(self):
        print("\n--- STEP 1: Verify Initial Configuration via Mock API ---")
        req = urllib.request.Request(f"{API_BASE}/vendors/VEND-01/navigation-steps")
        with urllib.request.urlopen(req) as resp:
            initial_steps = json.loads(resp.read().decode())
        
        self.assertEqual(len(initial_steps), 13)
        self.assertEqual(initial_steps[0]["sequence"], 1)
        self.assertEqual(initial_steps[0]["action"], "NAVIGATE")
        print(f"Step 1 initial description: '{initial_steps[0]['description']}', timeout: {initial_steps[0]['timeoutMs']}ms")

        print("\n--- STEP 2: Run Initial TransBingo Collection ---")
        job_id_1 = f"COL-DYN-1-{int(time.time())}"
        res_1 = collection_agent.run_collection_job(job_id_1)
        self.assertEqual(res_1["status"], "COMPLETED")
        self.assertEqual(res_1["totalSteps"], 13)
        self.assertIn("artifact", res_1)
        print(f"Initial Run Status: {res_1['status']}, SHA-256: {res_1['artifact']['sha256']}")

        print("\n--- STEP 3: Change Configurable Property & Save via API ---")
        updated_steps = list(initial_steps)
        # Modify Step 1: Change description and increase timeout
        updated_steps[0]["description"] = "Open Login URL (Enhanced Timeout 18s)"
        updated_steps[0]["timeoutMs"] = 18000

        save_req = urllib.request.Request(
            f"{API_BASE}/vendors/VEND-01/navigation-steps",
            data=json.dumps(updated_steps).encode(),
            headers={'Content-Type': 'application/json'},
            method='PUT'
        )
        with urllib.request.urlopen(save_req) as resp:
            saved_steps = json.loads(resp.read().decode())

        self.assertEqual(saved_steps[0]["description"], "Open Login URL (Enhanced Timeout 18s)")
        self.assertEqual(saved_steps[0]["timeoutMs"], 18000)
        print("Updated configuration persisted via API.")

        print("\n--- STEP 4: Refresh/Reload from API ---")
        reload_req = urllib.request.Request(f"{API_BASE}/vendors/VEND-01/execution-config")
        with urllib.request.urlopen(reload_req) as resp:
            reloaded_config = json.loads(resp.read().decode())

        reloaded_step_1 = reloaded_config["navigationSteps"][0]
        self.assertEqual(reloaded_step_1["description"], "Open Login URL (Enhanced Timeout 18s)")
        self.assertEqual(reloaded_step_1["timeoutMs"], 18000)
        print(f"Verified reloaded value: '{reloaded_step_1['description']}', timeout: {reloaded_step_1['timeoutMs']}ms")

        print("\n--- STEP 5: Run Collection Again & Confirm Worker Used Updated Config ---")
        job_id_2 = f"COL-DYN-2-{int(time.time())}"
        res_2 = collection_agent.run_collection_job(job_id_2)
        self.assertEqual(res_2["status"], "COMPLETED")

        # Verify that the worker logged the updated description and timeout
        step_1_log = next(e for e in res_2["events"] if "Executing Step 1" in e["message"])
        print(f"Worker Event Log: {step_1_log['message']}")
        self.assertIn("Open Login URL (Enhanced Timeout 18s)", step_1_log["message"])
        self.assertIn("18000ms", step_1_log["message"])
        print("CONFIRMED: Worker dynamically loaded and executed updated configuration from API!")

if __name__ == '__main__':
    unittest.main()
