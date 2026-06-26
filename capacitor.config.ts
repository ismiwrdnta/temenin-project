import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'id.temenin.app',
  appName: 'Temenin',
  webDir: 'dist/spa',
  server: {
    // Untuk development: arahkan ke IP lokal (ganti dengan IP komputer kamu)
    // url: 'http://192.168.x.x:8080',
    // cleartext: true,
    androidScheme: 'https',
  },
  android: {
    allowMixedContent: true,
  },
};

export default config;
