import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import produtosRoutes from './routes/produtos.routes.js';
import { notFound, errorHandler } from './middlewares/error.js';

const app = express();
const PORT = process.env.PORT || 3001;
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') ?? '*' }));
app.use(express.json());
app.use('/api/produtos', produtosRoutes);
app.get('/health', (req, res) => res.json({ ok: true }));
app.use(notFound);
app.use(errorHandler);
app.listen(PORT, process.env.HOST || '0.0.0.0', () => {
  console.log(`API Node rodando em http://${process.env.HOST || '0.0.0.0'}:${PORT}`);
});