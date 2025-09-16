import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import produtosRoutes from './routes/produtos.routes.js';
import { notFound, errorHandler } from './middlewares/error.js';

const app = express();
const ORIGENS = [
  'http://172.28.1.1:4001',
  'http://localhost:4001',
  'http://192.168.192.1:4001'
];
const PORT = process.env.PORT || 4000;
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') ?? '*' }));
app.use(express.json());
app.use('/api/produtos', produtosRoutes);
app.get('/health', (req, res) => res.json({ ok: true }));
app.use(notFound);
app.use(errorHandler);
app.listen(PORT, process.env.HOST || '0.0.0.0', () => {
  console.log(`API Node rodando em http://${process.env.HOST || '0.0.0.0'}:${PORT}`);
});