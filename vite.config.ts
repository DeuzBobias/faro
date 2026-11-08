import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { localApi } from './server/local-plugin'
import path from 'node:path'
import { readFileSync } from 'node:fs'
export default defineConfig({
 plugins:[react(),tailwindcss(),localApi()],
 resolve:{alias:{'@':path.resolve(__dirname,'src')}},
 build:{outDir:'dist/client'},
 server:{host:'0.0.0.0',port:8445,strictPort:true,...(process.env.FARO_HTTPS==='1'?{https:{key:readFileSync('.local/https/key.pem'),cert:readFileSync('.local/https/cert.pem')}}:{})},
})
