from flask import Blueprint, request, jsonify, session
from src.models import db, Order, User, Product

orders_bp = Blueprint('orders', __name__)

@orders_bp.route('/orders', methods=['POST'])
def create_order():
    """Create a new order"""
    try:
        # Check authentication
        if 'user_id' not in session:
            return jsonify({'error': 'Authentication required'}), 401
        
        data = request.get_json()
        
        # Validate required fields
        if not data or not data.get('products') or not data.get('total_price') or not data.get('payment_method'):
            return jsonify({'error': 'Products, total_price, and payment_method are required'}), 400
        
        # Validate payment method
        valid_payment_methods = ['cash_on_delivery', 'syriatel_cash', 'bank_al_baraka']
        if data['payment_method'] not in valid_payment_methods:
            return jsonify({'error': 'Invalid payment method'}), 400
        
        # Create new order
        order = Order(
            user_id=session['user_id'],
            total_price=data['total_price'],
            payment_method=data['payment_method']
        )
        order.set_products(data['products'])
        
        db.session.add(order)
        db.session.commit()
        
        return jsonify({
            'message': 'Order created successfully',
            'order': order.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@orders_bp.route('/orders', methods=['GET'])
def get_user_orders():
    """Get orders for the current user"""
    try:
        # Check authentication
        if 'user_id' not in session:
            return jsonify({'error': 'Authentication required'}), 401
        
        orders = Order.query.filter_by(user_id=session['user_id']).order_by(Order.created_at.desc()).all()
        
        return jsonify({
            'orders': [order.to_dict() for order in orders]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@orders_bp.route('/orders/<int:order_id>', methods=['GET'])
def get_order(order_id):
    """Get a specific order"""
    try:
        # Check authentication
        if 'user_id' not in session:
            return jsonify({'error': 'Authentication required'}), 401
        
        order = Order.query.filter_by(id=order_id, user_id=session['user_id']).first()
        
        if not order:
            return jsonify({'error': 'Order not found'}), 404
        
        return jsonify({'order': order.to_dict()}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

