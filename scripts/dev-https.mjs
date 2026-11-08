import { createServer } from 'vite';
process.env.FARO_HTTPS='1';
const server=await createServer({server:{port:8446,host:'0.0.0.0',strictPort:true}});
await server.listen();
server.printUrls();
