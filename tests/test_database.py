#!/usr/bin/env python3
"""
Development Prototype Test: SQLite Schema Verification
Standards: Full adherence to GEMINI.md Truthfulness Protocol & ADR-006

WARNING: This test verifies the local SQLite prototype database structure used for
offline frontend prototyping. Per ADR-006, SQLite is DISQUALIFIED from the M2 acceptance path.
The authoritative M2 acceptance test is in test_sqlserver_acceptance.py.
"""

import unittest
import sqlite3
import os

DB_PATH = '/tmp/school_recon.db'

class TestDatabase(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        if not os.path.exists(DB_PATH):
            target_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'database', 'school_recon.db'))
            if os.path.exists(target_path):
                import shutil
                shutil.copy(target_path, DB_PATH)
            else:
                from database.migrations_or_deployment.init_db import init_database
                init_database()

        cls.conn = sqlite3.connect(DB_PATH)
        cls.conn.row_factory = sqlite3.Row
        cls.conn.execute("PRAGMA foreign_keys = ON;")

    @classmethod
    def tearDownClass(cls):
        cls.conn.close()

    def test_01_tables_exist(self):
        c = self.conn.cursor()
        tables = [r[0] for r in c.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()]
        expected = [
            'Vendor', 'VendorCredentialReference', 'VendorConnector',
            'VendorNavigationStep', 'VendorReportDefinition', 'VendorReportParameter',
            'School', 'VendorSchoolMapping', 'VendorCollectionJob',
            'VendorCollectionEvent', 'VendorArtifact', 'AuditLog'
        ]
        for t in expected:
            self.assertIn(t, tables, f"Table {t} should exist in prototype database")

    def test_02_seed_data_loaded(self):
        c = self.conn.cursor()
        vendors = c.execute("SELECT * FROM Vendor").fetchall()
        self.assertGreaterEqual(len(vendors), 3, "At least 3 seed vendors must exist")
        
        tb = c.execute("SELECT * FROM Vendor WHERE VendorId='VEND-01'").fetchone()
        self.assertIsNotNone(tb)
        self.assertEqual(tb['VendorName'], 'TransBingo Demo')

        steps = c.execute("SELECT * FROM VendorNavigationStep WHERE VendorConnectorId='CONN-01'").fetchall()
        self.assertEqual(len(steps), 13, "TransBingo must have 13 seeded navigation steps")

        schools = c.execute("SELECT * FROM School").fetchall()
        self.assertGreaterEqual(len(schools), 3, "At least 3 schools seeded")

    def test_03_foreign_keys(self):
        c = self.conn.cursor()
        with self.assertRaises(sqlite3.IntegrityError):
            c.execute("""
                INSERT INTO VendorCredentialReference (
                    VendorCredentialReferenceId, VendorId, Environment, SecretProvider,
                    SecretReference, AuthenticationType, IsConfigured, CreatedAt, UpdatedAt
                ) VALUES ('test-cred', 'NON_EXISTENT_VENDOR', 'DEMO', 'Dev', 'ref', 'auth', 1, 'now', 'now')
            """)

    def test_04_unique_constraints(self):
        c = self.conn.cursor()
        with self.assertRaises(sqlite3.IntegrityError):
            c.execute("""
                INSERT INTO VendorNavigationStep (
                    VendorNavigationStepId, VendorConnectorId, SequenceNo, StepCode,
                    ActionType, SelectorStrategy, SelectorValue, Description, CreatedAt, UpdatedAt
                ) VALUES ('dup-step', 'CONN-01', 1, 'DUP', 'NAVIGATE', 'css', '/login', 'Desc', 'now', 'now')
            """)

if __name__ == '__main__':
    unittest.main()
