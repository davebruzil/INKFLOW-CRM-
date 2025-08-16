@echo off
cd "C:\Users\david\OneDrive\Desktop\INKFLOW CRM\inkflow-crm\android"
keytool -genkey -v -keystore inkflow-keystore.jks -keyalg RSA -keysize 2048 -validity 10000 -alias inkflow-key -storepass inkflow123456 -keypass inkflow123456 -dname "CN=INKFLOW CRM, OU=Mobile App, O=INKFLOW, L=City, S=State, C=US"
echo Keystore created successfully!
pause