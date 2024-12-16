from flask_restful import Api, Resource, fields, marshal_with
from flask_security import auth_required, current_user
from backend.models import db, Service, ServiceRequest, User
from flask import jsonify, request, current_app as app
from datetime import datetime
from backend.cache import cache

api = Api(prefix='/api')

service_fields = {
    'id' : fields.Integer,
    'name' : fields.String,
    'price' : fields.Integer,
    'time_required' : fields.String,
    'description' : fields.String,
    'category' : fields.String,
    'user_id' : fields.Integer
}

class ServiceAPI(Resource):
    @cache.memoize()
    @marshal_with(service_fields)
    @auth_required('token')
    def get(self, service_id):
        service = Service.query.get(service_id)
        if not service:
            return {"message": "Service not found"}, 404
        return service

    @auth_required('token')
    def delete(self, service_id):
        service = Service.query.get(service_id)
        if not service:
            return {"message": "Service not found"}, 404
        if service.user_id == current_user.id:
            db.session.delete(service)
            db.session.commit()
            return {"message": "Service deleted successfully"}, 200
        else:
            return {"message": "Not authorized to delete this service"}, 403

    @auth_required('token')
    def put(self, service_id):
        service = Service.query.get(service_id)
        if not service:
            return {"message": "Service not found"}, 404

        if service.user_id != current_user.id:
            return {"message": "Not authorized to edit this service"}, 403

        try:
            data = request.get_json()
            service.name = data.get("name", service.name)
            service.price = data.get("price", service.price)
            service.time_required = data.get("time_required", service.time_required)
            service.description = data.get("description", service.description)
            service.category = data.get("category", service.category)

            db.session.commit()
            return {"message": "Service updated successfully"}, 200
        except Exception as e:
            db.session.rollback()
            return {"message": f"Error updating service: {str(e)}"}, 500
        
class ServiceListAPI(Resource):
    @marshal_with(service_fields)
    @auth_required('token')
    @cache.cached(timeout=5)
    def get(self):
        category = request.args.get('category')
        if category:
            # Filter services by category
            services = Service.query.filter_by(category=category).all()
        else:
            # Return all services if no category is specified
            services = Service.query.all()

        return services

    @auth_required('token')
    def post(self):
        try:
            data = request.get_json()
            # Extract data from the request payload
            name = data.get('name')
            price = data.get('price')
            time_required = data.get('time_required')
            description = data.get('description')
            category = data.get('category')

            # Validate the extracted data
            if not all([name, price, time_required, description, category]):
                return {"message": "Missing required fields"}, 400

            # Create and save a new Service
            service = Service(
                name=name,
                price=int(price),  # Convert price to integer
                time_required=time_required,
                description=description,
                category=category,
                user_id=current_user.id
            )
            db.session.add(service)
            db.session.commit()

            return {"message": "Service created successfully"}, 201
        except Exception as e:
            db.session.rollback()
            return {"message": f"Error creating service: {str(e)}"}, 500
        
class ServiceRequestAPI(Resource):
    @auth_required('token')
    def post(self):
        try:
            data = request.get_json()
            service_id = data.get("service_id")
            date_of_request = datetime.strptime(data.get("date_of_request"), "%Y-%m-%d")
            time = data.get("time")
            remarks = data.get("remarks", "")

            if not all([service_id, date_of_request, time]):
                return {"message": "Missing required fields"}, 400

            # Create the ServiceRequest object
            service_request = ServiceRequest(
                service_id=service_id,
                customer_id=current_user.id,
                date_of_request=date_of_request,
                time=time,
                service_status="requested",
                remarks=remarks,
            )

            db.session.add(service_request)
            db.session.commit()

            return {"message": "Service request created successfully"}, 201
        except Exception as e:
            db.session.rollback()
            return {"error": str(e)}, 500


# Corrected add_resource call
api.add_resource(ServiceAPI, '/services/<int:service_id>')
api.add_resource(ServiceListAPI, '/services')
api.add_resource(ServiceRequestAPI, '/api/service-requests')



