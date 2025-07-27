from src.models import db, Product, Doctor
import json

def init_database(app):
    """Initialize database with products and sample doctors"""
    # Create all tables
    db.create_all()
    
    # Check if products already exist
    if Product.query.first():
        print("Database already initialized with products")
        # Don't return here - we still want to check for doctors
    else:
        # Add QueenCare products based on uploaded images
        products = [
            {
                'name': 'Liquorice Lotion',
                'description': 'لوشن عرق السوس - تفتيح البشرة، تقليل البقع الداكنة والتصبغات، تهدئة الالتهابات والتهيج، تجديد خلايا البشرة وتحسين نضارتها، يعمل على ترطيب البشرة وتنعيمها',
                'price': 45000,  # SYP
                'image_url': '/static/images/liquoricelotion.jpg',
                'category': 'skincare'
            },
            {
                'name': 'Vitamin C Serum',
                'description': 'سيروم فيتامين سي - تقليل ظهور الهالات السوداء تحت العين، تهدئة التهابات البشرة وتقليل الاحمرار، تحسين مظهر الندب، حماية البشرة من أضرار أشعة الشمس، تفتيح البقع الداكنة وتوحيد لون البشرة، ترطيب البشرة والحفاظ على رطوبتها، إنتاج الكولاجين في البشرة مما يساعد في تأخير ظهور التجاعيد',
                'price': 55000,  # SYP
                'image_url': '/static/images/VitmenCserun.jpg',
                'category': 'skincare'
            },
            {
                'name': 'Shampoo',
                'description': 'شامبو متوفر للشعر الدهني، الشعر العادي، الشعر الجاف - مناسب لجميع الفطور والقشرة',
                'price': 35000,  # SYP
                'image_url': '/static/images/Shampoo.jpg',
                'category': 'haircare'
            },
            {
                'name': 'Shower Gel',
                'description': 'غسول للجسم متوفر برائحة الفندر، رائحة زهر الليمون',
                'price': 30000,  # SYP
                'image_url': '/static/images/showergel.jpg',
                'category': 'bodycare'
            },
            {
                'name': 'Salicylic Acid',
                'description': 'حمض الساليسيليك - يسيطر على إفرازات الدهون، تفتيح البقع الداكنة وتنعيم البشرة، تقليل ظهور الرؤوس السوداء والمسام',
                'price': 48000,  # SYP
                'image_url': '/static/images/salicylicacid.jpg',
                'category': 'skincare'
            },
            {
                'name': 'Nail Oil',
                'description': 'مقوي للأظافر - يطول ويقوي الأظافر',
                'price': 25000,  # SYP
                'image_url': '/static/images/oilnail.jpg',
                'category': 'nailcare'
            },
            {
                'name': 'Perfume Splash',
                'description': 'معطر للجسم - الروائح المتوفرة: Pretty perfume، Sea perfume',
                'price': 40000,  # SYP
                'image_url': '/static/images/SplashPerfum.jpg',
                'category': 'fragrance'
            },
            {
                'name': 'Sunblock',
                'description': 'واقي شمسي من QueenCare يتوفر لجميع أنواع البشرة - يحمي البشرة من الأضرار الناجمة عن أشعة الشمس فوق البنفسجية، يقلل من خطر الإصابة بحروق الشمس، يساعد في تقليل ظهور التجاعيد والبقع الداكنة',
                'price': 50000,  # SYP
                'image_url': '/static/images/Sunblock.jpg',
                'category': 'skincare'
            },
            {
                'name': 'Niacinamide Serum',
                'description': 'تفتيح البشرة ومقاومة التصبغات، علاج حب الشباب، مقاومة شيخوخة البشرة، مقاومة العديد من المشكلات الجلدية',
                'price': 52000,  # SYP
                'image_url': '/static/images/Nicmendserum.png',
                'category': 'skincare'
            },
            {
                'name': 'TTO (Tea Tree Oil)',
                'description': 'زيت شجرة الشاي - مضاد للبكتيريا والفطريات، مهدئ للالتهابات',
                'price': 35000,  # SYP
                'image_url': '/static/images/TTO.jpg',
                'category': 'skincare'
            },
            {
                'name': 'Body Lotion',
                'description': 'لوشن للجسم - ترطيب عميق ونعومة للبشرة',
                'price': 38000,  # SYP
                'image_url': '/static/images/BodyLotion.png',
                'category': 'bodycare'
            },
            {
                'name': 'Hyaluronic Acid Serum',
                'description': 'سيروم حمض الهيالورونيك - ترطيب مكثف، تقليل التجاعيد، تعزيز إنتاج الكولاجين، يمنح البشرة إشراقة ونضارة، يساعد في تقليل ظهور البقع الداكنة والخطوط الدقيقة، مناسب لجميع أنواع البشرة',
                'price': 58000,  # SYP
                'image_url': '/static/images/hyaluronicacid.png',
                'category': 'skincare'
            },
            {
                'name': 'Whitening Cream',
                'description': 'كريم التفتيح - تفتيح لطيف، ترطيب عميق، تفتيح وتوحيد لون البشرة',
                'price': 42000,  # SYP
                'image_url': '/static/images/WhitingCream.png',
                'category': 'skincare'
            },
            {
                'name': 'Hair Toner',
                'description': 'تونر الشعر - يحتوي على فيتامينات تساعد على إيقاف تساقط الشعر، يكثف الشعر، يعطي الشعر لمعة وحيوية',
                'price': 45000,  # SYP
                'image_url': '/static/images/HairToner.png',
                'category': 'haircare'
            }
        ]
        
        # Add products to database
        for product_data in products:
            product = Product(**product_data)
            db.session.add(product)
        
        print("Products added to database!")
    
    # Check if doctors already exist
    if not Doctor.query.first():
        # Add sample doctors
        doctors = [
            {
                'name': 'Dr. Layla Ahmad',
                'specialty': 'Dermatologist',
                'available_times': json.dumps([
                    '09:00', '10:00', '11:00', '14:00', '15:00', '16:00'
                ])
            },
            {
                'name': 'Dr. Omar Hassan',
                'specialty': 'Cosmetic Dermatologist',
                'available_times': json.dumps([
                    '10:00', '11:00', '12:00', '15:00', '16:00', '17:00'
                ])
            },
            {
                'name': 'Dr. Fatima Al-Zahra',
                'specialty': 'Skin Care Specialist',
                'available_times': json.dumps([
                    '08:00', '09:00', '10:00', '13:00', '14:00', '15:00'
                ])
            },
            {
                'name': 'Dr. Nadin Abdulghani',
                'specialty': 'Aesthetic Dermatologist',
                'available_times': json.dumps([
                    '09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00'
                ])
            }
        ]
        
        for doctor_data in doctors:
            doctor = Doctor(**doctor_data)
            db.session.add(doctor)
        
        print("Doctors added to database!")
    else:
        print("Database already initialized with doctors")
    
    # Commit all changes
    db.session.commit()
    print("Database initialization completed!")

if __name__ == '__main__':
    from main import create_app
    app = create_app()
    init_database(app)

