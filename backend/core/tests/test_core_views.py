import pytest
from django.urls import reverse
from rest_framework import status
from django.utils import timezone
from datetime import timedelta
from core.models import RecipeCache, FavoriteRecipe

@pytest.mark.django_db
def test_csrf_cookie(api_client):
    resp = api_client.get('/api/csrf/')
    assert resp.status_code == status.HTTP_200_OK
    assert 'csrftoken' in resp.cookies

@pytest.mark.django_db
def test_direct_github_login(api_client):
    resp = api_client.get('/auth/github-direct/')
    assert resp.status_code == status.HTTP_302_FOUND
    assert 'github.com/login' in resp['Location']

@pytest.mark.django_db
def test_premium_cookie_default(api_client, user):
    api_client.force_login(user)
    resp = api_client.get(reverse('product-list'))
    assert resp.status_code == status.HTTP_200_OK
    assert 'premiumstatus' in resp.cookies
    assert resp.cookies['premiumstatus'].value == 'false'

@pytest.mark.django_db
def test_premium_cookie_true(api_client, user):
    user.is_premium = True
    user.save(update_fields=['is_premium'])
    api_client.force_login(user)
    resp = api_client.get(reverse('product-list'))
    assert resp.cookies['premiumstatus'].value == 'true'

@pytest.mark.django_db
def test_latest_recipes(api_client, user):
    now = timezone.now()
    for i in range(3):
        RecipeCache.objects.create(spoon_id=i, json={'id': i, 'title': f'T{i}', 'image': ''}, updated_at=now - timedelta(days=i))
    api_client.force_login(user)
    url = reverse('latest_recipes')
    resp = api_client.get(url)
    assert resp.status_code == status.HTTP_200_OK
    data = resp.json()
    assert isinstance(data, list)
    assert len(data) == 3

@pytest.mark.django_db
def test_favorite_recipes_flow(auth_client, user):
    # premium required
    user.is_premium = True
    user.save(update_fields=['is_premium'])
    url = reverse('favorite_recipes')
    # GET empty
    resp = auth_client.get(url)
    assert resp.status_code == status.HTTP_200_OK
    assert resp.json() == []
    # POST invalid
    resp = auth_client.post(url, {})
    assert resp.status_code == status.HTTP_400_BAD_REQUEST
    # POST valid
    data = {'recipe_id': 42, 'title': 'Test', 'image': 'http://img'}
    resp = auth_client.post(url, data)
    assert resp.status_code == status.HTTP_201_CREATED
    out = resp.json()
    assert out['recipe_id'] == 42
    # GET now one
    resp = auth_client.get(url)
    assert len(resp.json()) == 1
    # DELETE
    resp = auth_client.delete(f"{url}?id=42")
    assert resp.status_code == status.HTTP_204_NO_CONTENT
    resp = auth_client.get(url)
    assert resp.json() == []
