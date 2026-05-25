dependencies

npm init -y
npm install
npm install @capacitor/cli @capacitor/android

{
  "appId": "com.peerlynx.app",
  "appName": "PeerLynx",
  "webDir": "dist",
  "server": {
    "url": "http://10.63.181.132:5173",
    "cleartext": true
  }
}

{
  "appId": "com.peerlynx.app",
  "appName": "PeerLynx",
  "webDir": "dist",
    "server": {
    "url": "https://peerlynx-server.onrender.com",
    "cleartext": true
  }
}

{
  "appId": "com.peerlynx.app",
  "appName": "PeerLynx",
  "webDir": "dist"
}

{
  "appId": "com.peerlynx.app",
  "appName": "PeerLynx",
  "webDir": "dist",
  "bundledWebRuntime": false,
  "server": {
    "cleartext": true
  }
}