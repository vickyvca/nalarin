import {defineConfig} from 'vite';
export default defineConfig({server:{proxy:{'/api':process.env.TKA_DEV_API||'http://127.0.0.1:18186'}}});
