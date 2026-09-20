#!/usr/bin/env python3
import unittest
import sys
import os
import importlib.util

def load_module(filepath, name):
    spec = importlib.util.spec_from_file_location(name, filepath)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod

if __name__ == '__main__':
    test_dir = os.path.dirname(os.path.abspath(__file__))
    test_files = [
        'test_agent_regression.py',
        'test_api.py',
        'test_database.py',
        'test_dynamic_config.py',
        'test_sqlserver_acceptance.py'
    ]
    loader = unittest.TestLoader()
    suite = unittest.TestSuite()
    for tf in test_files:
        fpath = os.path.join(test_dir, tf)
        if os.path.exists(fpath):
            mod = load_module(fpath, tf[:-3])
            suite.addTests(loader.loadTestsFromModule(mod))
    
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    sys.exit(0 if result.wasSuccessful() else 1)
