import { and, eq, isNull, or } from 'drizzle-orm';
import { z } from 'zod';
import { ITEM_CATEGORIES } from '@bartools/types';
import { db } from './db';
import { bottles } from './schema';

export const manualBottleSchema = z.object({
  name: z.string().trim().min(1).max(200),
  category: z.enum(ITEM_CATEGORIES),
  subcategory: z.string().trim().min(1).max(100).optional(),
  sizeMl: z.number().int().positive().max(10_000).optional(),
  upc: z.string().trim().min(1).max(64).optional(),
});

export type ManualBottleInput = z.infer<typeof manualBottleSchema>;

type BottleQueryClient = Pick<typeof db, 'select' | 'insert'>;

function sizePredicate(sizeMl: number | undefined) {
  return sizeMl === undefined ? isNull(bottles.sizeMl) : eq(bottles.sizeMl, sizeMl);
}

function identityPredicate(input: ManualBottleInput) {
  const nameAndSize = and(eq(bottles.name, input.name), sizePredicate(input.sizeMl));
  return input.upc ? or(eq(bottles.upc, input.upc), nameAndSize) : nameAndSize;
}

export async function findOrCreateBottle(
  input: ManualBottleInput,
  client: BottleQueryClient = db
) {
  const normalized = manualBottleSchema.parse(input);

  const [existing] = await client
    .select({
      id: bottles.id,
      name: bottles.name,
      category: bottles.category,
      upc: bottles.upc,
      sizeMl: bottles.sizeMl,
    })
    .from(bottles)
    .where(identityPredicate(normalized))
    .limit(1);

  if (existing) {
    return existing;
  }

  const [inserted] = await client
    .insert(bottles)
    .values({
      name: normalized.name,
      category: normalized.category,
      subcategory: normalized.subcategory,
      sizeMl: normalized.sizeMl,
      upc: normalized.upc,
    })
    .onConflictDoNothing()
    .returning({
      id: bottles.id,
      name: bottles.name,
      category: bottles.category,
      upc: bottles.upc,
      sizeMl: bottles.sizeMl,
    });

  if (inserted) {
    return inserted;
  }

  const [resolved] = await client
    .select({
      id: bottles.id,
      name: bottles.name,
      category: bottles.category,
      upc: bottles.upc,
      sizeMl: bottles.sizeMl,
    })
    .from(bottles)
    .where(identityPredicate(normalized))
    .limit(1);

  if (!resolved) {
    throw new Error('bottle_create_failed');
  }

  return resolved;
}
