@echo off
REM Run Python unittests for Interface Control Panel

echo Running test suite...
py -3.12 -m unittest tests.py

echo.
echo Test execution completed.
pause
