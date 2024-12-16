from flask import Flask
from backend.models import db, User, Role
from backend.config import LocalDevelopmentConfig
from flask_security import Security, SQLAlchemyUserDatastore
from backend.cache import cache
from backend.celery.celery_factory import celery_init_app
from celery.schedules import crontab
from backend.service.tasks import monthly_activity_report, daily_reminder


def create_app():
    app = Flask(__name__, template_folder='frontend', static_folder='frontend', static_url_path='/static')

    app.config.from_object(LocalDevelopmentConfig)

    db.init_app(app)

    cache.init_app(app)

    datastore = SQLAlchemyUserDatastore(db, User, Role)
    app.security = Security(app, datastore=datastore, register_blueprint=False)
    app.app_context().push()
    from backend.resources import api
    api.init_app(app)
    return app

app = create_app()

celery_app = celery_init_app(app)

import backend.upload_initial_data as upload_initial_data
# from backend.routes import *
import backend.routes

@celery_app.on_after_configure.connect
def send_webhook_message(sender, **kwargs):
    sender.add_periodic_task(
        crontab(hour= 22,  minute=22),
        daily_reminder.s(),
    )
    sender.add_periodic_task(
        crontab(day_of_month=3, hour=22, minute= 22),
        monthly_activity_report.s(),
    )

if __name__=='__main__':
    app.run(debug=True)