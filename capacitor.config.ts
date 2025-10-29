import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.88b1ef88d6a44283865341d7a19f6085',
  appName: 'attached-magic-box',
  webDir: 'dist',
  server: {
    url: 'https://88b1ef88-d6a4-4283-8653-41d7a19f6085.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    Camera: {
      quality: 90,
      allowEditing: false,
      resultType: 'uri'
    }
  }
};

export default config;
