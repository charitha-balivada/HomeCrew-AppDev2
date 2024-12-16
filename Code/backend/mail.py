from smtplib import SMTP
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication
from .config import MailConfig

def send_mail(to, subject, content_body, pdf=None):
    msg = MIMEMultipart()
    msg["To"] = to
    msg["Subject"] = subject
    msg["From"] = MailConfig.SENDER_EMAIL
    msg.attach(MIMEText(content_body, 'html'))
    if pdf is not None:
        msg.attach(MIMEApplication(pdf, 'pdf'))
    client = SMTP(host=MailConfig.SMTP_HOST, port=MailConfig.SMTP_PORT)
    client.send_message(msg=msg)
    client.quit()