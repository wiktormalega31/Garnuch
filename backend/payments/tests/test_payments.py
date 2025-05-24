import pytest
from django.urls import reverse
from rest_framework import status
from payments.models import Payment

def monkey_create_order(amount, currency, return_url, cancel_url):
    return "order123", "https://approve.url"

def monkey_capture_order(order_id):
    return {"id": order_id}

@pytest.mark.django_db
def test_start_payment_success(monkeypatch, auth_client, user):
    # login and premium flag unaffected
    url = reverse('payments:start')
    monkeypatch.setattr('payments.views.create_order', monkey_create_order)
    resp = auth_client.post(url)
    assert resp.status_code == status.HTTP_200_OK
    data = resp.json()
    assert data['redirect_url'] == 'https://approve.url'
    # Payment record created
    pay = Payment.objects.get(order_id='order123')
    assert pay.user == user
    assert pay.status == 'created'

@pytest.mark.django_db
def test_start_payment_unauthenticated(api_client):
    url = reverse('payments:start')
    resp = api_client.post(url)
    assert resp.status_code == status.HTTP_401_UNAUTHORIZED

@pytest.mark.django_db
def test_capture_payment_success(monkeypatch, auth_client, user):
    # prepare existing payment
    pay = Payment.objects.create(user=user, order_id='ord1', amount='1.00', currency='USD', status='created')
    monkeypatch.setattr('payments.views.capture_order', monkey_capture_order)
    url = reverse('payments:capture')
    resp = auth_client.post(url, {'order_id': 'ord1'})
    assert resp.status_code == status.HTTP_200_OK
    pay.refresh_from_db()
    assert pay.status == 'captured'
    user.refresh_from_db()
    assert user.is_premium is True

@pytest.mark.django_db
def test_capture_payment_failure(monkeypatch, auth_client, user):
    # prepare payment
    pay = Payment.objects.create(user=user, order_id='ord2', amount='1.00', currency='USD', status='created')
    def fail_capture(order_id):
        raise Exception('fail')
    monkeypatch.setattr('payments.views.capture_order', fail_capture)
    url = reverse('payments:capture')
    resp = auth_client.post(url, {'order_id': 'ord2'})
    assert resp.status_code == status.HTTP_502_BAD_GATEWAY or resp.status_code == status.HTTP_502_BAD_GATEWAY
    pay.refresh_from_db()
    assert pay.status == 'failed'
    user.refresh_from_db()
    assert user.is_premium is False

@pytest.mark.django_db
def test_success_return_no_token(api_client, settings):
    url = reverse('payments:success')
    resp = api_client.get(url)
    assert resp.status_code == status.HTTP_302_FOUND
    assert resp['Location'] == f"{settings.FRONTEND_URL}/premium?err=no_token"

@pytest.mark.django_db
def test_success_return_capture(monkeypatch, api_client, user, settings):
    # existing payment
    pay = Payment.objects.create(user=user, order_id='ord3', amount='1.00', currency='USD', status='created')
    def fake_capture(order_id):
        return {'id': order_id}
    monkeypatch.setattr('payments.views.capture_order', fake_capture)
    url = reverse('payments:success') + '?token=ord3'
    user.is_premium = False
    user.save()
    resp = api_client.get(url)
    assert resp.status_code == status.HTTP_302_FOUND
    assert resp['Location'] == f"{settings.FRONTEND_URL}/shoppinglist"
    pay.refresh_from_db()
    assert pay.status == 'captured'
    user.refresh_from_db()
    assert user.is_premium is True

@pytest.mark.django_db
def test_success_return_capture_failure(monkeypatch, api_client, user, settings):
    # existing payment
    pay = Payment.objects.create(user=user, order_id='ord4', amount='1.00', currency='USD', status='created')
    def fail_capture(order_id):
        raise Exception('err')
    monkeypatch.setattr('payments.views.capture_order', fail_capture)
    url = reverse('payments:success') + '?token=ord4'
    resp = api_client.get(url)
    assert resp.status_code == status.HTTP_302_FOUND
    assert resp['Location'] == f"{settings.FRONTEND_URL}/premium?err=capture"
    pay.refresh_from_db()
    assert pay.status == 'failed'

@pytest.mark.django_db
def test_cancel_return(api_client, settings):
    url = reverse('payments:cancel')
    resp = api_client.get(url)
    assert resp.status_code == status.HTTP_302_FOUND
    assert resp['Location'] == f"{settings.FRONTEND_URL}/premium?err=cancel"
