from .user import db
from datetime import datetime

class Doctor(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    specialty = db.Column(db.String(100), nullable=False)
    available_times = db.Column(db.Text, nullable=False)  # JSON string of available time slots
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    appointments = db.relationship('Appointment', backref='doctor', lazy=True)
    
    def __repr__(self):
        return f'<Doctor {self.name} - {self.specialty}>'

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'specialty': self.specialty,
            'available_times': self.available_times,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

