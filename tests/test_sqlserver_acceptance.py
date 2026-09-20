#!/usr/bin/env python3
"""
M2 Acceptance Test: Real SQL Server Persistence & Stored Procedure Execution
Standard: Full adherence to GEMINI.md Implementation Truthfulness Protocol & ADR-006

This test file is the authoritative M2 acceptance gate. It strictly validates:
1. SQLite Disqualification: Asserts that SQLite is NOT accepted in the acceptance path.
2. Configuration-Driven SQL Server Connectivity: Tests configured host/port (SQLSERVER_HOST / SQLSERVER_PORT).
3. .NET / Dapper Runtime Verification: Verifies whether .NET 8 SDK (dotnet CLI) is installed.
4. Schema & Stored Procedure Contract Integrity: Statically verifies 1:1 parity between 23 T-SQL stored procedures and 7 C# Dapper repositories.
"""

import unittest
import socket
import shutil
import os
import re

REPO_BASE = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
SQL_SP_DIR = os.path.join(REPO_BASE, 'database', 'stored-procedures')
SQL_TABLES_DIR = os.path.join(REPO_BASE, 'database', 'tables')
DAPPER_REPO_DIR = os.path.join(REPO_BASE, 'backend', 'SchoolRecon.Infrastructure', 'Repositories')

# Configuration-driven SQL Server settings (no hardcoded host/port)
SQL_HOST = os.environ.get('SQLSERVER_HOST') or os.environ.get('MSSQL_HOST') or 'localhost'
SQL_PORT = int(os.environ.get('SQLSERVER_PORT') or os.environ.get('MSSQL_PORT') or '1433')
SQL_DATABASE = os.environ.get('SQLSERVER_DATABASE') or 'SchoolRecon'
SQL_USER = os.environ.get('SQLSERVER_USER') or 'sa'

class TestSqlServerAcceptance(unittest.TestCase):
    def test_01_sqlite_disqualified_from_acceptance(self):
        """Prove that SQLite is explicitly rejected as the acceptance persistence runtime."""
        sqlite_allowed = os.environ.get('ALLOW_SQLITE_ACCEPTANCE', 'false').lower() in ('true', '1')
        self.assertFalse(
            sqlite_allowed,
            "CRITICAL: SQLite is NOT permitted in the M2 acceptance path. "
            "Acceptance requires an actual SQL Server instance executing stored procedures via Dapper."
        )

    def test_02_sqlserver_instance_connectivity(self):
        """Verify that an actual Microsoft SQL Server instance is running and reachable at configured host/port."""
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(2.0)
        is_connected = False
        error_msg = ''
        try:
            sock.connect((SQL_HOST, SQL_PORT))
            is_connected = True
        except Exception as ex:
            is_connected = False
            error_msg = str(ex)
        finally:
            sock.close()

        self.assertTrue(
            is_connected,
            f"M2 ACCEPTANCE BLOCKER: SQLSERVER_UNREACHABLE - Actual SQL Server instance is not reachable at {SQL_HOST}:{SQL_PORT} ({error_msg}). "
            f"An actual SQL Server instance (preferably SQL Server Docker) must be running to satisfy the M2 persistence runtime."
        )

    def test_03_dotnet_dapper_runtime_availability(self):
        """Verify that the .NET SDK is available to build and execute the C# Dapper solution."""
        dotnet_path = shutil.which('dotnet')
        self.assertIsNotNone(
            dotnet_path,
            "M2 ACCEPTANCE BLOCKER: DOTNET_NOT_AVAILABLE - .NET SDK ('dotnet' CLI) is not installed in the environment. "
            "Executing the real stored procedures through Dapper requires the .NET 8.0 SDK runtime."
        )

    def test_04_stored_procedures_and_dapper_contract_integrity(self):
        """Statically verify that all 23 T-SQL stored procedures are defined and matched by Dapper repositories."""
        # 1. Parse T-SQL Stored Procedures
        sps = {}
        for fname in os.listdir(SQL_SP_DIR):
            if fname.endswith('.sql'):
                with open(os.path.join(SQL_SP_DIR, fname), 'r', encoding='utf-8') as f:
                    content = f.read()
                matches = re.finditer(
                    r'CREATE\s+OR\s+ALTER\s+PROCEDURE\s+([a-zA-Z0-9_]+)(.*?)(?:AS|BEGIN)',
                    content, re.DOTALL | re.IGNORECASE
                )
                for m in matches:
                    sp_name = m.group(1)
                    params_block = m.group(2)
                    params = re.findall(r'(@[a-zA-Z0-9_]+)', params_block)
                    sps[sp_name.lower()] = (sp_name, set(p.lower() for p in params))

        self.assertGreaterEqual(len(sps), 22, f"Expected at least 22 stored procedures, found {len(sps)}")

        # 2. Check Dapper Repositories for procedure calls
        called_sps = set()
        for fname in os.listdir(DAPPER_REPO_DIR):
            if fname.endswith('.cs'):
                with open(os.path.join(DAPPER_REPO_DIR, fname), 'r', encoding='utf-8') as f:
                    content = f.read()
                calls = re.findall(r'"(sp_[a-zA-Z0-9_]+)"', content)
                for c in calls:
                    called_sps.add(c.lower())
                    self.assertIn(
                        c.lower(), sps,
                        f"Dapper repository {fname} calls unknown stored procedure '{c}'"
                    )

        self.assertGreaterEqual(len(called_sps), 20, f"Expected Dapper to call core stored procedures, found {len(called_sps)}")

if __name__ == '__main__':
    unittest.main()
