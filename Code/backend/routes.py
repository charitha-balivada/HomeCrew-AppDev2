from flask import current_app as app, jsonify, request, render_template, url_for, session, send_from_directory, send_file
from flask_security import auth_required, verify_password, hash_password, login_required, current_user, login_user, logout_user, SQLAlchemyUserDatastore, roles_required
from backend.models import db, Role, User, Service, ServiceRequest, UserRoles
from flask_login import login_required, current_user
from flask_security.utils import logout_user
from datetime import datetime, time
from werkzeug.utils import secure_filename
import os
from sqlalchemy.orm import joinedload
from backend.cache import cache
from functools import wraps
from collections import Counter
from sqlalchemy.orm import joinedload
from backend.service.reports.reports import generate_admin_csv


datastore = app.security.datastore

#---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
#auth functions

# Role-based decorator for customer role
def customer_required(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        if not current_user.has_role('customer'):  
            return jsonify({"message": "Access denied: Customers only"}), 403
        return func(*args, **kwargs)
    return wrapper

# Role-based decorator for service professional role
def professional_required(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        if not current_user.has_role('service_professional'):  
            return jsonify({"message": "Access denied: Service professionals only"}), 403
        return func(*args, **kwargs)
    return wrapper

# Role-based decorator for admin role
def admin_required(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        if not current_user.has_role('admin'):  
            return jsonify({"message": "Access denied: Admins only"}), 403
        return func(*args, **kwargs)
    return wrapper
#-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/protected')
@auth_required('token')
def protected():
    return '<h1> this is the auth user </h1>'

@app.route('/login', methods=['POST'], endpoint='security.login')
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'message': 'Email and password are required'}), 400

    user = datastore.find_user(email=email)
    if not user:
        return jsonify({'message': 'User not found'}), 404

    # Check if the user is active
    if not user.active:
        return jsonify({'message': 'You have been flagged by the admin, you cannot login.'}), 403

    if verify_password(password, user.passhash):
        login_user(user)  # Log the user in
        roles = [role.name for role in user.roles]
        if 'admin' in roles:
            redirect_path = '/admin/home'
        elif 'service_professional' in roles:
            redirect_path = '/professional/home'
        elif 'customer' in roles:
            redirect_path = '/customer/home'

        return jsonify({
            'token': user.get_auth_token(),
            'email': user.email,
            'roles': roles,
            'id': user.id,
            'redirect_url': redirect_path
        }), 200

    return jsonify({'message': 'Invalid credentials'}), 401


@app.route('/customer/register', methods=['POST'])
def register_customer():
    data = request.get_json()
    
    
    email = data.get('email')
    password = data.get('password')
    confirm_password = data.get('confirmPassword')
    fullname = data.get('fullname')
    phone = data.get('phone')
    address = data.get('address')
    pincode = data.get('pincode')

    
    if not all([email, password, confirm_password, fullname, phone, address, pincode]):
        return jsonify({"message": "All fields are required"}), 400

   
    if password != confirm_password:
        return jsonify({"message": "Passwords do not match"}), 400

    role = app.security.datastore.find_role('customer')
    if not role:
        return jsonify({"message": "Customer role is invalid"}), 400

    user = app.security.datastore.find_user(email=email)
    if user:
        return jsonify({"message": "User already exists"}), 409

    try:
        
        user = app.security.datastore.create_user(
            email=email,
            passhash=hash_password(password),
            roles=[role],
            fullname=fullname,
            phone=phone,
            address=address,
            pincode=pincode,
            active=True
        )
        db.session.commit()
        return jsonify({"message": "Customer registered successfully"}), 201
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Error creating customer user: {e}")
        return jsonify({"message": "Error creating customer user"}), 500

    
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

@app.route('/professional/register', methods=['POST'])
def register_professional():
    
    email = request.form.get('email')
    password = request.form.get('password')
    confirm_password = request.form.get('confirmPassword')
    fullname = request.form.get('fullname')
    phone = request.form.get('phone')
    address = request.form.get('address')
    pincode = request.form.get('pincode')
    experience = request.form.get('experience')
    service_category = request.form.get('serviceCategory')
    resume = request.files.get('resume')

    
    if not all([email, password, confirm_password, fullname, phone, address, pincode, experience, service_category, resume]):
        return jsonify({"message": "All fields are required"}), 400

   
    if password != confirm_password:
        return jsonify({"message": "Passwords do not match"}), 400


    role = app.security.datastore.find_role('service_professional')
    if not role:
        return jsonify({"message": "Service Professional role is invalid"}), 400

 
    user = app.security.datastore.find_user(email=email)
    if user:
        return jsonify({"message": "User already exists"}), 409

    try:
        
        UPLOAD_FOLDER = os.path.join(os.getcwd(), 'uploads/resumes')
        os.makedirs(UPLOAD_FOLDER, exist_ok=True)
        filename = secure_filename(resume.filename)
        resume_path = os.path.join(UPLOAD_FOLDER, filename)
        resume.save(resume_path)

        
        user = app.security.datastore.create_user(
            email=email,
            passhash=hash_password(password),
            roles=[role],
            fullname=fullname,
            phone=phone,
            address=address,
            pincode=pincode,
            experience=experience,
            service_category=service_category,
            resume=filename,  
            active=True
        )

        
        db.session.commit()
        return jsonify({"message": "Service Professional registered successfully"}), 201
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Error creating service professional user: {e}")
        return jsonify({"message": "Error creating service professional user"}), 500


@app.route('/logout', methods=['GET'])
def logout():
    logout_user()
    return jsonify({"message": 'User logged out.'}), 200

# --------------------------------------------------------------------------------------------------------------------------------

#Customer_Routes

@auth_required('token')
@app.route('/customer/profile')
@customer_required
@cache.cached(timeout=50)
def customer_profile():
    try:
        user = current_user
        customer_data = {
            "name": user.fullname,
            "email": user.email,
            "phone_number": user.phone,
            "address": user.address,
        }
        return jsonify(customer_data)
    except Exception as e:
        app.logger.error(f"Error fetching customer profile: {e}")
        return jsonify({"message": "Authentication failed"}), 401

@auth_required('token')
@app.route('/customer/home', methods=['GET'])
@customer_required
def customer_home():
    try:
        services = Service.query.all()
        services_data = [{
            'id': service.id,
            'name': service.name,
            'price': service.price,
            'time_required': service.time_required,
            'description': service.description,
            'category': service.category
        } for service in services]
        return jsonify(services_data)
    except Exception as e:
        app.logger.error(f"Error fetching services: {e}")
        return jsonify({"message": "Error fetching services"}), 500
    
@app.route('/professionals', methods=['GET'])
@auth_required('token')
@customer_required
def get_professionals():
    try:
        category = request.args.get('category')
        query = User.query.filter(User.roles.any(name='service_professional'))
        if category:
            query = query.filter_by(service_category=category)
        professionals = query.all()

        professionals_data = [{
            'id': professional.id,
            'fullname': professional.fullname,
            'email': professional.email,
            'phone': professional.phone,
            'service_category': professional.service_category,
            'address': professional.address,
        } for professional in professionals]

        return jsonify(professionals_data)
    except Exception as e:
        app.logger.error(f"Error fetching professionals: {e}")
        return jsonify({"message": "Error fetching professionals"}), 500


@auth_required('token')
@app.route('/api/service-requests', methods=['POST'])
@customer_required
def request_service():
    try:
        data = request.get_json()
        service_id = data.get('service_id')
        customer_id = data.get('customer_id')
        date_of_request = datetime.strptime(data.get('date_of_request'), "%Y-%m-%d")
        time = data.get('time')

        if not service_id or not customer_id or not date_of_request or not time:
            return jsonify({"error": "Missing required fields"}), 400

        new_request = ServiceRequest(
            service_id=service_id,
            customer_id=customer_id,
            date_of_request=date_of_request,
            time=time,
            service_status="requested",
        )

        db.session.add(new_request)
        db.session.commit()

        return jsonify({
            "message": "Service request created successfully",
            "request_id": new_request.id
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@app.route('/api/service-requests/professionals/<int:professional_id>', methods=['POST'])
@auth_required('token')
def create_service_request(professional_id):
    try:
        # Get JSON data from the request
        data = request.json

        # Extract fields
        service_name = data.get('service_name')  # This corresponds to the service name
        customer_id = data.get('customer_id')
        date_of_request = data.get('date_of_request')
        time = data.get('time')

        # Validate fields
        if not all([service_name, customer_id, professional_id, date_of_request, time]):
            return jsonify({"error": "All fields are required"}), 400

        # Convert date_of_request to datetime
        try:
            date_of_request = datetime.strptime(date_of_request, "%Y-%m-%d")
        except ValueError:
            return jsonify({"error": "Invalid date format"}), 400

        # Retrieve the service ID based on the service name
        service = Service.query.filter_by(name=service_name).first()
        if not service:
            return jsonify({"error": f"Service '{service_name}' not found"}), 404

        # Create a new service request
        new_request = ServiceRequest(
            service_id=service.id,  # Use the retrieved service ID
            customer_id=customer_id,
            professional_id=professional_id,
            date_of_request=date_of_request,
            service_status="requested",
            time=time
        )

        # Save to the database
        db.session.add(new_request)
        db.session.commit()

        return jsonify({"message": "Service request created successfully", "id": new_request.id}), 201

    except Exception as e:
        app.logger.error(f"Error creating service request: {str(e)}")
        return jsonify({"error": "Server error"}), 500

@auth_required('token')
@app.route('/api/service-requests/pending', methods=['GET'])
@customer_required
def get_pending_service_requests():
    customer_id = request.args.get('customer_id')
    
    # Fetch requests with status 'requested' or 'assigned'
    requests = ServiceRequest.query.filter(
        ServiceRequest.customer_id == customer_id,
        ServiceRequest.service_status.in_(['requested', 'assigned', 'rejected'])
    ).all()
    
    return jsonify([
        {
            "id": req.id,
            "service_id": req.service_id,
            "service_name": req.service.name,
            "service_category": req.service.category,
            "date_of_request": req.date_of_request,
            "time": req.time,
            "service_status": req.service_status
        }
        for req in requests
    ])


@auth_required('token')
@app.route('/api/service-requests/<int:request_id>', methods=['DELETE'])
@customer_required
def delete_service_request(request_id):
    request = ServiceRequest.query.get(request_id)
    if not request:
        return jsonify({"error": "Request not found"}), 404
    db.session.delete(request)
    db.session.commit()
    return jsonify({"message": "Request canceled"}), 200

@auth_required('token')
@app.route('/api/service-requests/<int:request_id>/update', methods=['POST'])
@customer_required
def update_service_request(request_id):
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid JSON payload"}), 400

    service_request = ServiceRequest.query.get(request_id)
    if not service_request:
        return jsonify({"error": "Request not found"}), 404

    try:
        if 'date_of_request' in data:
            date_str = data['date_of_request']
            try:
                service_request.date_of_request = datetime.strptime(date_str, '%Y-%m-%d %H:%M:%S')
            except ValueError:
                service_request.date_of_request = datetime.strptime(date_str, '%Y-%m-%d')

        if 'time' in data:
            time_str = data['time']
            datetime.strptime(time_str, '%H:%M')
            service_request.time = time_str

        if 'remarks' in data:
            service_request.remarks = data['remarks']
    except ValueError as e:
        return jsonify({"error": f"Invalid date or time format: {e}"}), 400

    db.session.commit()
    return jsonify({"message": "Request updated successfully"}), 200

@app.route('/customer/service-history', methods=['GET', 'POST'])
@login_required
def service_history():
    if request.method == 'GET':
        # Fetch all 'closed' service requests for the logged-in customer
        closed_requests = ServiceRequest.query.filter_by(
            customer_id=current_user.id, service_status='completed'
        ).all()

        result = []
        for req in closed_requests:
            result.append({
                'id': req.id,
                'service_name': req.service.name,
                'date_of_request': req.date_of_request.strftime('%Y-%m-%d'),
                'time': req.time,
                'professional_name': req.professional.fullname if req.professional else 'Unassigned',
                'remarks': req.remarks,
                'rating': req.rating
            })

        return jsonify(result)

    elif request.method == 'POST':
        # Update remarks and rating for a specific service request
        data = request.json
        service_request = ServiceRequest.query.get(data['id'])

        if service_request.customer_id != current_user.id:
            return jsonify({'error': 'Unauthorized access'}), 403

        service_request.rating = data['rating']
        service_request.remarks = data['remarks']

        db.session.commit()
        return jsonify({'message': 'Feedback updated successfully'})
    

@app.route('/search-services', methods=['GET'])
def search_services():
    # Get the search query from the request args
    query = request.args.get('query', type=str)

    if not query:
        return jsonify({"message": "Search query is required"}), 400

    try:
        # Search services by name (case-insensitive)
        services = Service.query.filter(Service.name.ilike(f"%{query}%")).all()

        # If no services are found, return an appropriate message
        if not services:
            return jsonify({"message": "No services found matching the search query"}), 404

        # Return the services found
        result = [{
            'id': service.id,
            'name': service.name,
            'category': service.category,
            'price': service.price,
            'time_required': service.time_required,
            'description': service.description
        } for service in services]

        return jsonify(result), 200

    except Exception as e:
        app.logger.error(f"Error occurred: {str(e)}")
        return jsonify({"message": "Error occurred while searching for services"}), 500


#------------------------------------------------------------------------------------------------------------------------------------------------------------

#service_professional_routes

@app.route('/professional/home', methods=['GET'])
@login_required
@professional_required
def professional_home():
    user = current_user

    # Check user acceptance status
    if user.accepted == 'Pending':
        return jsonify({"message": "Your document verification is still pending."}), 200

    if user.accepted == 'No':
        return jsonify({"message": "Sorry, you're not selected. Better luck next time."}), 200

    if user.accepted == 'Yes':
        # Fetch available service requests
        available_requests = ServiceRequest.query.join(Service).filter(
            db.func.lower(Service.category) == user.service_category.lower(),
            ServiceRequest.professional_id.is_(None),
            ServiceRequest.service_status == 'requested'
        ).all()

        available_requests_data = [
            {
                "id": req.id,
                "service_name": req.service.name,
                "description": req.service.description,
                "price": req.service.price,
                "time_required": req.service.time_required,
                "customer_name": req.customer.fullname,
                "customer_address": req.customer.address,
                "customer_pincode": req.customer.pincode,
                "date_of_request": req.date_of_request,
                "time": req.time
            }
            for req in available_requests
        ]

        # Fetch personal service requests
        personal_requests = ServiceRequest.query.filter_by(
            professional_id=user.id, service_status='requested'
        ).all()

        personal_requests_data = [
            {
                "id": req.id,
                "service_name": req.service.name,
                "description": req.service.description,
                "price": req.service.price,
                "time_required": req.service.time_required,
                "customer_name": req.customer.fullname,
                "customer_address": req.customer.address,
                "customer_pincode": req.customer.pincode,
                "date_of_request": req.date_of_request,
                "time": req.time
            }
            for req in personal_requests
        ]

        return jsonify({
            "message": "Service requests available",
            "available_requests": available_requests_data,
            "personal_requests": personal_requests_data
        }), 200

    return jsonify({"message": "Invalid status"}), 400


@app.route('/service-requests/<int:request_id>/assign', methods=['POST'])
@login_required
@professional_required
def accept_service_request(request_id):
    user = current_user
    request = ServiceRequest.query.filter_by(id=request_id, service_status='assign').first()

    if not request:
        return jsonify({"message": "Service request not found or already assigned."}), 404

    request.service_status = 'assigned'
    request.professional_id = user.id
    db.session.commit()
    return jsonify({"message": "Service request accepted successfully!"}), 200

@app.route('/service-requests/<int:request_id>/<action>', methods=['POST'])
@login_required
@professional_required
def professional_handle_service_request(request_id, action):
    user = current_user
    valid_actions = ['accept', 'reject']

    if action not in valid_actions:
        return jsonify({"message": "Invalid action"}), 400

    request = ServiceRequest.query.filter_by(id=request_id, professional_id=user.id).first()

    if not request:
        return jsonify({"message": "Service request not found or unauthorized"}), 404

    if action == 'accept':
        request.service_status = 'assigned'
    elif action == 'reject':
        request.service_status = 'rejected'

    db.session.commit()
    return jsonify({"message": f"Request {action}ed successfully"}), 200

@app.route('/professional/profile', methods=['GET'])
@login_required
@professional_required
def get_professional_profile():
    user = current_user
    return jsonify({
        "id": user.id,
        "name": user.fullname,
        "email": user.email,
        "phone": user.phone,
        "service_category": user.service_category,
        "address": user.address,
        "experience": user.experience
    }), 200

@app.route('/professional/profile', methods=['PUT'])
@login_required
@professional_required
def update_professional_profile():
    data = request.get_json()
    user = current_user
    
    # Only allow specific fields to be updated
    if 'name' in data:
        user.fullname = data['name']
    if 'address' in data:
        user.address = data['address']
    if 'experience' in data:
        user.experience = data['experience']
    
    db.session.commit()
    return jsonify({"message": "Profile updated successfully"}), 200

@app.route('/professional/service-requests', methods=['GET'])
@login_required
@professional_required
def professional_service_requests():
    user = current_user

    if user.accepted != 'Yes':
        return jsonify({"message": "Unauthorized access"}), 403

    # Fetch service requests accepted by the professional
    service_requests = ServiceRequest.query.filter(
        ServiceRequest.professional_id == user.id,
        ServiceRequest.service_status == 'assigned'
    ).all()

    requests_data = [
        {
            "id": req.id,
            "service_name": req.service.name,
            "description": req.service.description,
            "price": req.service.price,
            "time_required": req.service.time_required,
            "customer_name": req.customer.fullname,
            "customer_address": req.customer.address,  # Include customer address
            "customer_pincode": req.customer.pincode,  # Include customer pincode
            "date_of_request": req.date_of_request,
            "time": req.time,
        }
        for req in service_requests
    ]

    return jsonify({
        "message": "Accepted service requests fetched successfully",
        "requests": requests_data
    }), 200

@app.route('/service-requests/<int:request_id>/close', methods=['POST'])
@login_required
@professional_required
def close_service_request(request_id):
    user = current_user

    # Fetch the service request
    service_request = ServiceRequest.query.filter_by(id=request_id, professional_id=user.id).first()

    if not service_request:
        return jsonify({"message": "Service request not found or unauthorized access"}), 404

    if service_request.service_status != 'assigned':
        return jsonify({"message": "Cannot close a non-assigned service request"}), 400

    # Update the service request status
    service_request.service_status = 'completed'
    db.session.commit()

    return jsonify({"message": "Service request closed successfully"}), 200

@app.route('/professional/service-history', methods=['GET'])
@login_required
def professional_service_history():
    # Check if the user has the 'service_professional' role
    if 'service_professional' not in current_user.roles:
        return jsonify({"error": "Unauthorized access"}), 403

    # Fetch the closed service requests for the professional
    service_requests = ServiceRequest.query.filter_by(
        professional_id=current_user.id, 
        service_status="completed"
    ).join(Service).join(User, ServiceRequest.customer_id == User.id).all()

    # Format the service history
    history = [
        {
            "id": req.id,
            "service_name": req.service.name,
            "date_of_request": req.date_of_request.strftime('%Y-%m-%d'),
            "time": req.time,
            "customer_name": f"{req.customer.fullname}",  # Using full_name instead of first_name and last_name
            "rating": req.rating,  # Ensure this is a valid field or modify accordingly
            "remarks": req.remarks or "No remarks",  # Handle None values for remarks
        }
        for req in service_requests
    ]

    # Return the service history as a JSON response
    return jsonify(history), 200



#----------------------------------------------------------------------------------------------------------------------------------------------

#admin routes

@app.route('/admin/service-requests', methods=['GET'])
@login_required
@admin_required
def get_service_requests():
    service_requests = ServiceRequest.query.all()
    requests_data = [
        {
            "id": req.id,
            "service": {
                "name": req.service.name,
                "description": req.service.description,
                "category": req.service.category,
                "price": req.service.price,
            } if req.service else None,
            "customer": {
                "fullname": req.customer.fullname,
                "email": req.customer.email,
                "phone": req.customer.phone,
            } if req.customer else None,
            "service_status": req.service_status,
            "date_of_request": req.date_of_request.strftime('%Y-%m-%d'),
            "remarks": req.remarks,
        }
        for req in service_requests
    ]
    return jsonify({"requests": requests_data})

@app.route('/admin/pending-professionals', methods=['GET'])
@login_required
@admin_required
def get_pending_professionals():
    pending_professionals = User.query.filter(
        User.roles.any(Role.name == 'service_professional'),
        User.accepted == 'Pending'
    ).all()
    professionals_data = [
        {
            "id": user.id,
            "name": user.fullname,
            "email": user.email,
            "phone": user.phone,
            "address": user.address,
            "pincode": user.pincode,
            "experience": user.experience,
            "resume": f"/uploads/resumes/{user.resume}",
            "service_category": user.service_category,
        }
        for user in pending_professionals
    ]
    return jsonify({"professionals": professionals_data})

@app.route('/admin/flag-service-request/<int:request_id>', methods=['POST'])
@login_required
@admin_required
def flag_service_request(request_id):
    service_request = ServiceRequest.query.get_or_404(request_id)
    service_request.service_status = 'flagged'
    db.session.commit()
    return jsonify({"message": "Service request flagged successfully"})

@app.route('/admin/accept-professional/<int:user_id>', methods=['POST'])
@login_required
@admin_required
def accept_professional(user_id):
    professional = User.query.get_or_404(user_id)
    professional.accepted = 'Yes'
    db.session.commit()
    return jsonify({"message": "Professional accepted successfully"})

@app.route('/admin/reject-professional/<int:user_id>', methods=['POST'])
@login_required
@admin_required
def reject_professional(user_id):
    professional = User.query.get_or_404(user_id)
    professional.accepted = 'No'
    db.session.commit()
    return jsonify({"message": "Professional rejected successfully"})

@app.route('/uploads/resumes/<filename>')
@login_required
@admin_required
def serve_resume(filename):
    try:
        upload_folder = os.path.join(os.getcwd(), 'uploads/resumes')
        return send_from_directory(upload_folder, filename)
    except FileNotFoundError:
        return jsonify({"error": "File not found"}), 404

@app.route('/admin/users', methods=['GET'])
@login_required
@admin_required
def get_users():
    role = request.args.get('role', None)
    if role:
        if role not in ['customer', 'service_professional']:
            return jsonify({"message": "Invalid role. Only 'customer' or 'professional' are allowed."}), 400
        
        users = User.query.join(UserRoles).join(Role).filter(Role.name == role).all()
    else:
        users = User.query.join(UserRoles).join(Role).filter(Role.name.in_(['customer', 'service_professional'])).all()

    users_data = [
        {
            "id": user.id,
            "name": user.fullname,
            "email": user.email,
            "phone": user.phone,
            "role": [role.name for role in user.roles],
            "active": user.active
        }
        for user in users
    ]
    return jsonify({"users": users_data}), 200

@app.route('/admin/flag-user', methods=['POST'])
@login_required
@admin_required
def flag_user():
    user_id = request.json.get('user_id')
    if not user_id:
        return jsonify({"message": "User ID is required"}), 400

    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404

    user.active = False
    db.session.commit()
    return jsonify({"message": "User flagged successfully"}), 200

@app.route('/admin/service-requests-by-category', methods=['GET'])
@login_required
def service_requests_by_category():
    # Fetch service requests and group them by category
    service_requests = ServiceRequest.query.join(Service).all()

    # Count requests by category
    category_counts = Counter([req.service.category for req in service_requests])

    return jsonify(category_counts), 200

@app.route('/admin/ratings-distribution', methods=['GET'])
@login_required
def ratings_distribution():
    # Fetch all completed service requests with ratings
    service_requests = ServiceRequest.query.filter(ServiceRequest.rating.isnot(None)).all()

    # Count ratings occurrences (e.g., 1 star, 2 stars, etc.)
    rating_counts = Counter([req.rating for req in service_requests])

    return jsonify(rating_counts), 200

@app.route('/admin/professionals-by-category', methods=['GET'])
@login_required
def professionals_by_category():
    # Fetch professionals with the 'service_professional' role
    professionals = User.query.filter(User.roles.any(name='service_professional')).all()

    # Count professionals by service category
    category_counts = Counter([prof.service_category for prof in professionals])

    return jsonify(category_counts), 200


@app.route('/admin/total-users', methods=['GET'])
@login_required
def total_users():
    # Count number of customers and professionals
    num_customers = User.query.filter(User.roles.any(name='customer')).count()
    num_professionals = User.query.filter(User.roles.any(name='service_professional')).count()

    return jsonify({
        'num_customers': num_customers,
        'num_professionals': num_professionals
    }), 200

@app.route('/admin/export-closed-requests', methods=['GET'])
def export_closed_requests():
    csv_file = generate_admin_csv()
    return send_file(
        csv_file,
        mimetype='text/csv',
        as_attachment=True,
        download_name='admin.csv'
    )
@app.route('/admin/export-status/<task_id>', methods=['GET'])
def export_status(task_id):
    task = generate_admin_csv.AsyncResult(task_id)
    if task.state == "SUCCESS":
        return jsonify({"status": "completed", "file_path": task.result}), 200
    elif task.state == "PENDING":
        return jsonify({"status": "pending"}), 202
    elif task.state == "FAILURE":
        return jsonify({"status": "failed", "error": str(task.info)}), 500
    else:
        return jsonify({"status": task.state}), 200
