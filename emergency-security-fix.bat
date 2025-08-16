@echo off
echo.
echo ====================================================
echo  INKFLOW CRM - EMERGENCY SECURITY FIX
echo ====================================================
echo.
echo This script will help you implement critical security fixes.
echo.
echo STEP 1: Backup current configuration
echo ====================================================
mkdir backup 2>nul
copy backend\.env backup\backend-env-backup.txt 2>nul
copy inkflow-crm\.env backup\frontend-env-backup.txt 2>nul
echo ✓ Current configuration backed up to backup\ folder
echo.

echo STEP 2: Apply secure configuration templates
echo ====================================================
copy backend\.env.secure backend\.env.new
copy inkflow-crm\.env.secure inkflow-crm\.env.new
echo ✓ Secure templates created (.env.new files)
echo.

echo STEP 3: What you need to do MANUALLY:
echo ====================================================
echo 1. IMMEDIATELY change MongoDB user password in Atlas
echo 2. Create new Firebase service account key
echo 3. Edit backend\.env.new with your secure credentials
echo 4. Edit inkflow-crm\.env.new with your secure credentials  
echo 5. Rename .env.new files to .env when ready
echo 6. Test the configuration
echo.

echo STEP 4: Verify security (after completing manual steps)
echo ====================================================
echo Run these commands to test:
echo   cd backend
echo   npm start
echo   (Should NOT show authentication bypass warnings)
echo.

echo CRITICAL REMINDERS:
echo - Never commit .env files to git
echo - Test in development before production
echo - Follow the complete SECURITY_REMEDIATION_GUIDE.md
echo.
echo Press any key to continue...
pause >nul