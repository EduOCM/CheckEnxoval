import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import produtosRoutes from './routes/produtos.routes.js';
import { notFound, errorHandler } from './middlewares/error.js';

const app = express();

const PORT = process.env.PORT || 4000;
const HOST = process.env.HOST || '0.0.0.0';

// CORS liberado (para validar rápido)
app.use(cors()); // <— simples e garante o header

app.use(express.json());
app.get('/health', (req, res) => res.json({ ok: true }));
app.use('/api/produtos', produtosRoutes);
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, HOST, () => {
  console.log(`API Node rodando em http://${HOST}:${PORT}`);
});
