import { CapacitorConfig } from '@capacitor/core';

const config: CapacitorConfig = {
  appId: 'app.lovable.0ef0f2be909b4f949d6761a0e229d7ca',
  appName: 'חדשות ישראל - וידג\'ט חדשות',
  webDir: 'dist',
  server: {
    url: 'https://0ef0f2be-909b-4f94-9d67-61a0e229d7ca.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#5A9FD4',
      showSpinner: false
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#5A9FD4'
    }
  }
};

export default config;