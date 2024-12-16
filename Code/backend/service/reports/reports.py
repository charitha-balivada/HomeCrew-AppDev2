from datetime import datetime as dt
from jinja2 import Template
from backend.models import User, ServiceRequest
import os
from sqlalchemy import extract
import io
import csv
from io import BytesIO
from csv import DictWriter

basedir = os.path.abspath(os.path.dirname(__file__))


def generate_monthly_activity_report():
    """Generate HTML report for the current month's activities."""
    current_month = dt.now().month
    current_year = dt.now().year

    customers = User.query.filter(User.roles.any(name='customer')).all()
    service_details = []

    for customer in customers:
        requests = ServiceRequest.query.filter(
            ServiceRequest.customer_id == customer.id,
            extract('month', ServiceRequest.date_of_request) == current_month,
            extract('year', ServiceRequest.date_of_request) == current_year
        ).all()

        for req in requests:
            service_details.append({
                "customer_name": customer.fullname,
                "service_name": req.service.name,
                "date_of_request": req.date_of_request.strftime("%Y-%m-%d"),
                "status": req.service_status
            })

    template_path = os.path.join(basedir, "templates/activity.html")
    with open(template_path, "r") as f:
        template = Template(f.read())

    return template.render(service_details=service_details, month=current_month, year=current_year)


def draft_monthly_report_email(pdf_base64):
    """Draft the HTML email for the monthly activity report."""
    template_path = os.path.join(basedir, "templates/monthly_report.html")
    with open(template_path, "r") as f:
        template = Template(f.read())

    return template.render(pdf=pdf_base64)


def generate_admin_csv():
    from sqlalchemy.orm import joinedload

    # Query closed service requests and fetch related customer/professional in one go
    closed_requests = ServiceRequest.query.options(
        joinedload(ServiceRequest.customer),  # Assuming a relationship `customer`
        joinedload(ServiceRequest.professional)  # Assuming a relationship `professional`
    ).filter_by(service_status='closed').all()

    # Create a StringIO object to hold the CSV data
    f = io.StringIO()

    # Define the CSV headers
    headers = [
        'service_id', 'customer_id', 'professional_id', 'date_of_request', 'time',
        'remarks', 'rating', 'customer_fullname', 'professional_fullname'
    ]

    # Initialize the CSV writer
    writer = DictWriter(f, headers)
    writer.writeheader()

    # Write each row to the CSV
    for request in closed_requests:
        writer.writerow({
            'service_id': request.service_id,
            'customer_id': request.customer_id,
            'professional_id': request.professional_id,
            'date_of_request': request.date_of_request.strftime('%Y-%m-%d %H:%M:%S'),
            'time': request.time if request.time else 'N/A',
            'remarks': request.remarks if request.remarks else 'N/A',
            'rating': request.rating if request.rating is not None else 'N/A',
            'customer_fullname': request.customer.fullname if request.customer else 'N/A',
            'professional_fullname': request.professional.fullname if request.professional else 'N/A',
        })

    # Save the CSV data in memory
    mem = io.BytesIO()
    mem.write(f.getvalue().encode())
    mem.seek(0)
    f.close()

    return mem
