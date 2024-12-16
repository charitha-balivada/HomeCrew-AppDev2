from flask import current_app as app
from backend.models import db
from flask_security import SQLAlchemyUserDatastore
from flask_security.utils import hash_password

with app.app_context():
    db.create_all()

    userdatastore: SQLAlchemyUserDatastore = app.security.datastore

    # Ensure roles exist
    admin_role = userdatastore.find_or_create_role(name='admin', description='Administrator')
    professional_role = userdatastore.find_or_create_role(name='service_professional', description='Service Professional')
    customer_role = userdatastore.find_or_create_role(name='customer', description='Customer')

    # Create admin user if not exists
    if not userdatastore.find_user(email='admin@mail.com'):
        userdatastore.create_user(
            email='admin@mail.com',
            passhash=hash_password('123'),
            roles=[admin_role],
            fullname='Admin'
        )

    # Create service professional user if not exists
    if not userdatastore.find_user(email='service-professional1@mail.com'):
        userdatastore.create_user(
            email='service-professional1@mail.com',
            passhash=hash_password('123'),
            roles=[professional_role],
            fullname='Service Professional 1',
            phone='0987654321',
            address='Professional Address',
            pincode='654321',
            accepted = 'Yes',
            service_category = 'Gardening'
        )

    # Create customer user if not exists
    if not userdatastore.find_user(email='customer1@mail.com'):
        userdatastore.create_user(
            email='customer1@mail.com',
            passhash=hash_password('123'),
            roles=[customer_role],
            fullname='Customer 1',
            phone='1122334455',
            address='Customer Address',
            pincode='987654',
        )

    # Commit users to database
    db.session.commit()
