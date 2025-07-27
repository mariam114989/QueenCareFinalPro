from .user import db
from datetime import datetime
import json

class Order(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    products_json = db.Column(db.Text, nullable=False)  # JSON string of products
    total_price = db.Column(db.Float, nullable=False)  # Total in SYP
    payment_method = db.Column(db.String(50), nullable=False)  # Cash on delivery, Syriatel Cash, Bank Al Baraka
    status = db.Column(db.String(20), default='pending')  # pending, confirmed, shipped, delivered
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def set_products(self, products_list):
        """Set products as JSON string"""
        self.products_json = json.dumps(products_list)
    
    def get_products(self):
        """Get products as Python list"""
        return json.loads(self.products_json) if self.products_json else []
    
    def __repr__(self):
        return f'<Order {self.id} - User {self.user_id}>'

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'products': self.get_products(),
            'total_price': self.total_price,
            'payment_method': self.payment_method,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

