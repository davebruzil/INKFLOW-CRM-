@echo off
echo Building INKFLOW CRM Release APK...
cd "C:\Users\david\OneDrive\Desktop\INKFLOW CRM\inkflow-crm"

echo 1. Building React app...
call npm run build

echo 2. Copying to Android...
call npx cap copy android
call npx cap sync android

echo 3. Building APK...
cd android
call gradlew assembleRelease

echo Done! APK location: android\app\build\outputs\apk\release\
pause