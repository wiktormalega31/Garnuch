@echo off
REM setup_and_run.bat - instalacja zależności i uruchomienie backendu oraz frontendu

REM Aktywacja wirtualnego środowiska (jeśli istnieje)
if exist venv\Scripts\activate.bat (
    echo Aktywacja wirtualnego srodowiska...
    call venv\Scripts\activate.bat
) else (
    echo Brak wirtualnego srodowiska. Kontynuacja bez aktywacji.
)

echo.
echo Instalacja zaleznosci backendu...
pip install -r backend\requirements.txt
echo.
echo Instalacja zaleznosci frontendu...
cd FrontEnd
npm install
cd ..
echo.
echo Wykonywanie migracji Django...
cd backend
py manage.py migrate
py manage.py makemigrations
cd ..
echo.
echo Uruchamianie serwera backend...
start "Backend Server" cmd /k "cd backend && py manage.py runserver"
echo.
echo Uruchamianie serwera frontend...
start "Frontend Server" cmd /k "cd FrontEnd && npm run dev"
echo.
echo Wszystko uruchomione. Zamknij to okno, aby zakonczyc skrypt lub pozostaw otwarte, by widziec logi.
pause
