#!/usr/bin/env python3

import sys
import os
import json
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from src.main import create_app
from src.models import db, Doctor

if __name__ == '__main__':
    app = create_app()
    with app.app_context():
        # Check if Dr. Nadin Abdulghani already exists
        existing_doctor = Doctor.query.filter_by(name='Dr. Nadin Abdulghani').first()
        if existing_doctor:
            print("Dr. Nadin Abdulghani already exists!")
        else:
            # Add Dr. Nadin Abdulghani
            new_doctor = Doctor(
                name='Dr. Nadin Abdulghani',
                specialty='Aesthetic Dermatologist',
                available_times=json.dumps([
                    '09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00'
                ])
            )
            db.session.add(new_doctor)
            db.session.commit()
            print("Dr. Nadin Abdulghani added successfully!")
        
        # List all doctors
        doctors = Doctor.query.all()
        print(f"\nTotal doctors: {len(doctors)}")
        for doctor in doctors:
            print(f"- {doctor.name} - {doctor.specialty}")

