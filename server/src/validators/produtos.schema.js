// server/src/schemas/produtos.schema.js
import { z } from 'zod';

const AMBIENTES = ['cozinha', 'quarto', 'sala', 'banheiro'];

const moneyPre = (v) => {
  if (v === '' || v == null) return null;
  const n = Number(String(v).replace(/\./g, '').replace(',', '.'));
  return Number.isFinite(n) ? n : null;
};

export const createProdutoSchema = z.object({
  nome: z.string().min(1, 'nome obrigatório'),
  categoria: z.enum(AMBIENTES, { errorMap: () => ({ message: 'categoria inválida' }) }),

  orcamento: z.preprocess(moneyPre, z.number().nullable().optional()),
  valorfinal: z.preprocess(moneyPre, z.number().nullable().optional()),
  quantidade: z.preprocess(v => (v === '' || v == null ? 1 : v),
                           z.coerce.number().int().positive().default(1)),

  link_referencia: z.string().url().optional().nullable().or(z.literal('')).optional(),
  link_compra:     z.string().url().optional().nullable().or(z.literal('')).optional(),

  comprado:   z.coerce.boolean().optional().default(false),
  prioridade: z.coerce.boolean().optional().default(false),
});

export const patchProdutoSchema = createProdutoSchema.partial();
