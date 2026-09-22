#!/usr/bin/env python3
"""
Vendor Collection Agent Regression Tests
Standards: Full adherence to GEMINI.md Truthfulness Protocol
"""

import unittest
import sys
import os

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
SERVER_DIR = os.path.join(BASE_DIR, 'server')
if SERVER_DIR not in sys.path:
    sys.path.append(SERVER_DIR)

from vendor_collection_agent import collection_agent

class TestAgentRegression(unittest.TestCase):
    def test_01_normal_success(self):
        res = collection_agent.run_collection_job("TEST-NORM", scenario="normal")
        self.assertEqual(res["status"], "COMPLETED")
        self.assertIsNotNone(res["artifact"])
        self.assertEqual(res["artifact"]["rowCount"], 1842)
        self.assertEqual(res["artifact"]["totalAmount"], 4821500)
        self.assertEqual(len(res["artifact"]["sha256"]), 64)

    def test_02_invalid_password_failure(self):
        res = collection_agent.run_collection_job("TEST-INV-PW", scenario="invalid_password")
        self.assertEqual(res["status"], "FAILED")
        self.assertEqual(res["failureReason"], "LOGIN_FAILED")

    def test_03_portal_unreachable_failure(self):
        res = collection_agent.run_collection_job("TEST-UNREACH", scenario="portal_unreachable")
        self.assertEqual(res["status"], "FAILED")
        self.assertEqual(res["failureReason"], "PORTAL_UNREACHABLE")

    def test_04_login_element_changed(self):
        res = collection_agent.run_collection_job("TEST-ELEM-CHG", scenario="login_element_changed")
        self.assertEqual(res["status"], "NEEDS_ATTENTION")
        self.assertEqual(res["failureReason"], "LOGIN_ELEMENT_CHANGED")
        self.assertIn("aiSuggestion", res)

    def test_05_report_menu_changed(self):
        res = collection_agent.run_collection_job("TEST-MENU-CHG", scenario="report_menu_changed")
        self.assertEqual(res["status"], "NEEDS_ATTENTION")
        self.assertEqual(res["failureReason"], "REPORT_MENU_CHANGED")
        self.assertIn("aiSuggestion", res)

    def test_06_download_timeout(self):
        res = collection_agent.run_collection_job("TEST-TIMEOUT", scenario="download_timeout")
        self.assertEqual(res["status"], "FAILED")
        self.assertEqual(res["failureReason"], "DOWNLOAD_TIMEOUT")

if __name__ == '__main__':
    unittest.main()
