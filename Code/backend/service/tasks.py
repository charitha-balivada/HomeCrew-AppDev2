from celery import shared_task
import json
from httplib2 import Http
from datetime import datetime
from weasyprint import HTML
from base64 import b64encode
from backend.models import ServiceRequest, User
from backend.mail import send_mail
from backend.service.reports.reports import generate_monthly_activity_report, draft_monthly_report_email


# Daily Reminder Task
@shared_task(ignore_result=True)
def daily_reminder():
    """Send daily reminders to service professionals about pending service requests."""
    professionals = User.query.filter(User.roles.any(name='service_professional')).all()
    webhook_url = "https://chat.googleapis.com/v1/spaces/AAAADqrs1Zo/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=iODbzolfK4cHPtfImVZ6sp4_4JSL7EUGZf63RdmE0IY"

    for professional in professionals:
        pending_requests = ServiceRequest.query.filter_by(
            professional_id=professional.id, service_status='requested'
        ).all()

        if pending_requests:
            card_message = {
                "cards": [
                    {
                        "header": {"title": "Daily Reminder", "subtitle": "Pending Service Requests Alert"},
                        "sections": [
                            {
                                "widgets": [
                                    {"textParagraph": {"text": f"<b>Dear {professional.fullname},</b>"}},
                                    {
                                        "textParagraph": {
                                            "text": f"You have {len(pending_requests)} pending service request(s). "
                                                    f"Please visit/accept/reject them promptly."
                                        }
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }

            message_headers = {"Content-Type": "application/json; charset=UTF-8"}
            http_obj = Http()
            response = http_obj.request(
                uri=webhook_url,
                method="POST",
                headers=message_headers,
                body=json.dumps(card_message),
            )

            if response[0].status != 200:
                print(f"Failed to send reminder for {professional.fullname}")
            else:
                print(f"Reminder sent to {professional.fullname}")


# Monthly Activity Report Task
@shared_task(ignore_result=True)
def monthly_activity_report():
    """Generate and send a monthly activity report to the admin."""
    report_html = generate_monthly_activity_report()
    pdf = HTML(string=report_html).write_pdf()
    encoded_pdf = f"data:application/pdf;base64,{b64encode(pdf).decode('utf-8')}"
    email_content = draft_monthly_report_email(encoded_pdf)

    send_mail(to="admin@mail.com", subject="Monthly Activity Report", content_body=email_content, pdf=pdf)
    return "Monthly activity report sent successfully."
