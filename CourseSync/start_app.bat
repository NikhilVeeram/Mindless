@echo off
set "PATH=C:\Program Files\nodejs;%PATH%"
cd /d "%~dp0"
echo Starting CourseSync Development Server...
cmd /c npx expo start --clear
pause
