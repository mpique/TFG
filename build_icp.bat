@echo off
REM Build Interface Control Panel app

REM Install dependencies
py -m pip install -r requirements.txt

REM Check if static folder exists
IF EXIST static (
    set STATIC_FLAG=--add-data "static;static"
) ELSE (
    echo [!] Warning: static folder not found, skipping static files.
    set STATIC_FLAG=
)

REM Compile the app with templates and (optionally) static
py -m PyInstaller --onedir --name icp ^
  --collect-all flask ^
  --collect-all jinja2 ^
  --collect-all werkzeug ^
  --collect-all click ^
  --collect-all itsdangerous ^
  --collect-all markupsafe ^
  --hidden-import=ncclient ^
  --add-data "templates;templates" %STATIC_FLAG% app.py

REM Create output directory if it doesn't exist
if not exist output mkdir output

REM Move the entire dist\icp folder to output\icp
xcopy /E /I /Y dist\icp output\icp >nul

echo.
echo [OK] Executable and resources copied to output\icp\
pause
