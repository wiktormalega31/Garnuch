import pytest
from django.urls import reverse
from rest_framework import status
from django.utils import timezone
from datetime import timedelta
from core.models import RecipeCache

@pytest.mark.django_db
def test_recipe_info_cache_miss(monkeypatch, api_client):
    # simulate external fetch returning a list
    def fake_sp_fetch(endpoint, params=None):
        return [{'id': 1, 'name': 'test'}]

    monkeypatch.setattr('core.views.sp_fetch', fake_sp_fetch)
    url = reverse('api:') if False else '/api/recipes/1/'  # direct URL
    resp = api_client.get('/api/recipes/1/')
    assert resp.status_code == status.HTTP_200_OK
    assert resp.json()['id'] == 1
    # cache created
    cache = RecipeCache.objects.get(spoon_id=1)
    assert cache.json['name'] == 'test'

@pytest.mark.django_db
def test_recipe_info_cache_hit(monkeypatch, api_client):
    # create fresh cache
    now = timezone.now()
    rec = RecipeCache.objects.create(spoon_id=2, json={'id':2,'name':'old'})
    rec.updated_at = now
    rec.save()
    # fake fetch should not be called
    monkeypatch.setattr('core.views.sp_fetch', lambda endpoint, params=None: (_ for _ in ()).throw(AssertionError("Should not call sp_fetch")))
    resp = api_client.get('/api/recipes/2/')
    assert resp.status_code == status.HTTP_200_OK
    assert resp.json()['name'] == 'old'

@pytest.mark.django_db
def test_random_recipes(monkeypatch, api_client):
    monkeypatch.setattr('core.views.sp_fetch', lambda endpoint, params=None: {'recipes': [{'a':1}, {'b':2}]})
    resp = api_client.get('/api/random/?number=5')
    assert resp.status_code == status.HTTP_200_OK
    data = resp.json()
    assert isinstance(data, list)
    assert {'a':1} in data

@pytest.mark.django_db
def test_bulk_no_ids(api_client):
    resp = api_client.get('/api/recipes/bulk/')
    assert resp.status_code == status.HTTP_200_OK
    assert resp.json() == []

@pytest.mark.django_db
def test_search_cuisine(monkeypatch, api_client):
    monkeypatch.setattr('core.views.sp_fetch', lambda ep, params=None: {'results': [{'c':'x'}]})
    resp = api_client.get('/api/cuisine/?name=italian&number=1')
    assert resp.status_code == status.HTTP_200_OK
    assert resp.json() == [{'c':'x'}]

@pytest.mark.django_db
def test_search_query(monkeypatch, api_client):
    monkeypatch.setattr('core.views.sp_fetch', lambda ep, params=None: {'results': [{'q':'y'}]})
    resp = api_client.get('/api/search/?query=pizza&number=1')
    assert resp.status_code == status.HTTP_200_OK
    assert resp.json() == [{'q':'y'}]
