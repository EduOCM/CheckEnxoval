// server/src/validators/produtos.schema.js
import { z } from 'zod';

// JS puro (sem TS):
export const AMBIENTES = ['cozinha', 'quarto', 'sala', 'banheiro'];

const numeroBR = z.preprocess((v) => {
  if (v === '' || v == null) return null;
  // troca milhar/decimal do BR -> número JS
  const s = String(v).replace(/\./g, '').replace(',', '.');
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}, z.number().nullable().optional());

export const createProdutoSchema = z.object({
  nome: z.string().min(1, 'nome obrigatório'),
  categoria: z.enum(AMBIENTES, { message: 'categoria inválida' }),
  orcamento: numeroBR,      // float ou null
  valorfinal: numeroBR,     // float ou null
  quantidade: z.preprocess((v) => (v === '' || v == null ? 1 : v),
               z.coerce.number().int().positive().default(1)),
  link_referencia: z.string().url().optional().nullable(),
  link_compra: z.string().url().optional().nullable(),
  comprado: z.coerce.boolean().optional().default(false),
  prioridade: z.coerce.boolean().optional().default(false),
});
