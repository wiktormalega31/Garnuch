import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

@pytest.fixture
def user(db):
    User = get_user_model()
    return User.objects.create_user(username='testuser', password='testpass')

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def auth_client(api_client, user):
    api_client.login(username='testuser', password='testpass')
    return api_client