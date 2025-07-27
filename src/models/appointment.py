from .user import db
from datetime import datetime

class Appointment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    doctor_id = db.Column(db.Integer, db.ForeignKey('doctor.id'), nullable=False)
    appointment_datetime = db.Column(db.DateTime, nullable=False)
    payment_method = db.Column(db.String(50), nullable=False)  # Cash on delivery, Syriatel Cash, Bank Al Baraka
    status = db.Column(db.String(20), default='scheduled')  # scheduled, confirmed, completed, cancelled
    notes = db.Column(db.Text)  # Optional notes from user
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<Appointment {self.id} - User {self.user_id} with Doctor {self.doctor_id}>'

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'doctor_id': self.doctor_id,
            'appointment_datetime': self.appointment_datetime.isoformat() if self.appointment_datetime else None,
            'payment_method': self.payment_method,
            'status': self.status,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

