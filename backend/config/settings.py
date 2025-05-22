from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = "django-insecure-xyz"
DEBUG = True
ALLOWED_HOSTS = []

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    # REST & auth
    "rest_framework",
    "rest_framework.authtoken",

    # Allauth + dj-rest-auth
    "allauth",
    "allauth.account",
    "allauth.socialaccount",
    "allauth.socialaccount.providers.google",
    "dj_rest_auth",
    "dj_rest_auth.registration",

    # Twoje aplikacje
    "users",
    "core",
    "payments",
    "corsheaders",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",

    # jeśli używasz django-cors-headers:
    "corsheaders.middleware.CorsMiddleware",

    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",

    # wymagane przez allauth
    "allauth.account.middleware.AccountMiddleware",

    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"
WSGI_APPLICATION = "config.wsgi.application"

# Ustawienia szablonów (konieczne dla admina i allauth)
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],  # możesz dodać własne katalogi szablonów
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

# Ustawienia bazy danych (przykład z SQLite, dostosuj jeśli używasz PostgreSQL)
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / "db.sqlite3",
    }
}

# Django Allauth
SITE_ID = 1
ACCOUNT_EMAIL_VERIFICATION = "none"

ACCOUNT_SIGNUP_FIELDS = ['username*', 'email*', 'password1*', 'password2*']
ACCOUNT_LOGIN_METHODS = {'email', 'username'}

# REST framework
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework.authentication.SessionAuthentication",
        "rest_framework.authentication.TokenAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
}

# PayPal sandbox
PAYPAL_CLIENT_ID = "AY0UB3Ky67XSElXRz_6UndiO2RuUEumY2h7OU_kStXichaIrNWMJ52FUfOoDPQ5ZF7GGlIO_v_Q5ENjM"
PAYPAL_CLIENT_SECRET = "EONPV-9_UFjWq3y9Yo08D93Cf-p8WynT2hGTawDL-kCr3qiZDnXozbAOqu6eeCgSPPcCQADTwnMQgiEp"
PAYPAL_MODE = "sandbox"

# CORS (jeśli masz django-cors-headers)
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",  # Twój frontend Vite
    "https://ngkk839p-5173.euw.devtunnels.ms"
]

# Użytkownik niestandardowy
AUTH_USER_MODEL = "users.CustomUser"

# Ustawienia plików statycznych
STATIC_URL = "/static/"
STATICFILES_DIRS = [BASE_DIR / "static"]

# Ustawienia domyślnego pola ID
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
