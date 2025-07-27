from flask import Blueprint, request, jsonify, session
from src.models import db, Appointment, Doctor, User
from datetime import datetime

appointments_bp = Blueprint('appointments', __name__)

@appointments_bp.route('/appointments', methods=['POST'])
def create_appointment():
    """Create a new appointment"""
    try:
        # Check authentication
        if 'user_id' not in session:
            return jsonify({'error': 'Authentication required'}), 401
        
        data = request.get_json()
        
        # Validate required fields
        if not data or not data.get('doctor_id') or not data.get('appointment_datetime') or not data.get('payment_method'):
            return jsonify({'error': 'Doctor ID, appointment datetime, and payment method are required'}), 400
        
        # Validate payment method
        valid_payment_methods = ['cash_on_delivery', 'syriatel_cash', 'bank_al_baraka']
        if data['payment_method'] not in valid_payment_methods:
            return jsonify({'error': 'Invalid payment method'}), 400
        
        # Validate doctor exists
        doctor = Doctor.query.get(data['doctor_id'])
        if not doctor:
            return jsonify({'error': 'Doctor not found'}), 404
        
        # Parse appointment datetime
        try:
            appointment_dt = datetime.fromisoformat(data['appointment_datetime'].replace('Z', '+00:00'))
        except ValueError:
            return jsonify({'error': 'Invalid datetime format'}), 400
        
        # Create new appointment
        appointment = Appointment(
            user_id=session['user_id'],
            doctor_id=data['doctor_id'],
            appointment_datetime=appointment_dt,
            payment_method=data['payment_method'],
            notes=data.get('notes', '')
        )
        
        db.session.add(appointment)
        db.session.commit()
        
        return jsonify({
            'message': 'Appointment created successfully',
            'appointment': appointment.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@appointments_bp.route('/appointments', methods=['GET'])
def get_user_appointments():
    """Get appointments for the current user"""
    try:
        # Check authentication
        if 'user_id' not in session:
            return jsonify({'error': 'Authentication required'}), 401
        
        appointments = Appointment.query.filter_by(user_id=session['user_id']).order_by(Appointment.appointment_datetime.desc()).all()
        
        # Include doctor information
        appointments_with_doctors = []
        for appointment in appointments:
            appointment_dict = appointment.to_dict()
            doctor = Doctor.query.get(appointment.doctor_id)
            appointment_dict['doctor'] = doctor.to_dict() if doctor else None
            appointments_with_doctors.append(appointment_dict)
        
        return jsonify({
            'appointments': appointments_with_doctors
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@appointments_bp.route('/doctors', methods=['GET'])
def get_doctors():
    """Get all available doctors"""
    try:
        doctors = Doctor.query.all()
        return jsonify({
            'doctors': [doctor.to_dict() for doctor in doctors]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@appointments_bp.route('/doctors/<int:doctor_id>', methods=['GET'])
def get_doctor(doctor_id):
    """Get a specific doctor by ID"""
    try:
        doctor = Doctor.query.get_or_404(doctor_id)
        return jsonify({'doctor': doctor.to_dict()}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

