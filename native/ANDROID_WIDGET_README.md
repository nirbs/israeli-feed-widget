# Android App Widget (Capacitor)

This project includes a native Android home-screen App Widget that mirrors the web app style and features:
- Header with refresh button
- Resizable widget
- Scrollable list of news with image, title, source, time
- Tap an item to open its link in the browser

Setup steps on your machine:
1. Export to your GitHub repo and clone it locally
2. npm install
3. npx cap add android
4. npm run build
5. npx cap sync
6. Open Android Studio (android/) and run on a device

Notes:
- Widget source code is under android/app/src/main/…
- If the generated AndroidManifest.xml conflicts, merge our receiver/service entries and the INTERNET permission manually.
- Data fetching is native (no CORS needed). If a feed fails, a small fallback is shown.
