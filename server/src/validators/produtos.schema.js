import { z } from 'zod';

export const criarProdutoSchema = z.object({
  nome: z.string().min(1),
  preco_centavos: z.number().int().nonnegative(),
  descricao: z.string().optional().nullable(),
  categoria: z.string().optional().nullable()
});

export const atualizarProdutoSchema = criarProdutoSchema.partial();
