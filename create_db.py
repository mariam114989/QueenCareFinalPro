#!/usr/bin/env python3

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from src.main import create_app
from src.init_db import init_database

if __name__ == '__main__':
    app = create_app()
    with app.app_context():
        init_database(app)
    print("Database initialized successfully!")

