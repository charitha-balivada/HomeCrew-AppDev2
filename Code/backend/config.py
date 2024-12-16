import os

class Config():
    DEBUG = False
    SQL_ALCHEMY_TRACK_MODIFICATIONS = False
    
class LocalDevelopmentConfig(Config):
    SQLALCHEMY_DATABASE_URI = 'sqlite:///db.sqlite3'
    DEBUG = True
    UPLOAD_FOLDER = os.path.join(os.getcwd(), 'uploads/resumes')
    ALLOWED_EXTENSIONS = {'pdf'}
    SECURITY_PASSWORD_HASH = 'bcrypt'
    SECURITY_PASSWORD_SALT = 'thisissalty'
    SECRET_KEY='somethingsecret'
    SECURITY_TOKEN_AUTHENTICATION_KEY = 'Authentication-Token'
    WTF_CSRF_ENABLED = False
    CACHE_TYPE = "RedisCache"
    CACHE_REDIS_HOST = "localhost"
    CACHE_REDIS_PORT = 6379
    CACHE_REDIS_DB = 3
    
    if not os.path.exists(UPLOAD_FOLDER):
        os.makedirs(UPLOAD_FOLDER)


class CeleryConfig:
    broker_url = "redis://localhost:6379/1"
    result_backend = "redis://localhost:6379/2"
    timezone = "Asia/kolkata"
    broker_connection_retry_on_startup = True
    CELERY_BEAT_SCHEDULE = {}


class MailConfig:
    SMTP_HOST = "localhost"
    SMTP_PORT = 1025
    SENDER_EMAIL = 'admin@mail.com'
    SENDER_PASSWORD = ''