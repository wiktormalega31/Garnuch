Pełna wersja backendu Django dla projektu Garnuch.

Wymagania wstępne:

- Python 3.9 lub nowszy
- Node.js 14+ i npm (dla frontendu)
- PostgreSQL
- Git

Automatyczne uruchomienie:
W katalogu głównym projektu znajdziesz skrypt Windows `setup_and_run.bat`,
który: - aktywuje (jeśli istnieje) virtualenv - instaluje zależności backendu i frontendu - wykonuje migracje - uruchamia serwery backend i frontend w osobnych oknach konsoli

Manualne uruchomienie

1. Skonfiguruj zmienne środowiskowe:
   a) W katalogu `backend/` utwórz plik `.env`.
   b) Uzupełnij wartości:
   SECRET_KEY=<twój_secret_key>
   DEBUG=True
   ALLOWED_HOSTS=localhost,127.0.0.1
   DB_NAME=<nazwa_bazy>
   DB_USER=<użytkownik_bazy>
   DB_PASSWORD=<hasło_do_bazy>
   DB_HOST=localhost
   DB_PORT=5432
   SPOONACULAR_KEY=<twój_klucz_spoonacular>
   PAYPAL_CLIENT_ID=<twój_paypal_client_id>
   PAYPAL_CLIENT_SECRET=<twój_paypal_secret>
   PAYPAL_MODE=sandbox # lub production

2. Tworzenie i aktywacja środowiska wirtualnego (Windows PowerShell):
   cd backend
   python -m venv venv
   .\venv\Scripts\Activate.ps1

3. Instalacja zależności backendu:
   pip install --upgrade pip
   pip install -r requirements.txt

4. Instalacja zależności frontendu:
   cd ..\FrontEnd
   npm install
   cd ..\backend

5. Uruchomienie migracji Django:
   python manage.py makemigrations
   python manage.py migrate

6. Uruchomienie serwera backend:
   python manage.py runserver

   # serwer dostępny pod http://127.0.0.1:8000/

7. Uruchomienie serwera frontend:
   cd ..\FrontEnd
   npm run dev

   # aplikacja frontend dostępna pod http://localhost:5173/

8. Testy:
   cd backend
   pytest

Kontakt / wsparcie:
W razie problemów sprawdź logi w `backend/api.log` lub zgłoś issue w repozytorium.
