from django.contrib import admin
from django.urls import path, include
from payments.views import PaypalPaymentView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("auth/", include("dj_rest_auth.urls")),
    path("auth/registration/", include("dj_rest_auth.registration.urls")),
    path("auth/google/", include("allauth.socialaccount.providers.google.urls")),
    path("api/paypal/", PaypalPaymentView.as_view()),
    path("api/products/", include("core.urls")),
]
