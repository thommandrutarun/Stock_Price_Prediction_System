@echo off
rem backup.bat - Delegates database backup execution to backup.ps1
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0backup.ps1"
