import { defineCollection, z } from 'astro:content';

const briefs = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    region: z.string(),
    alert: z.enum(['alert', 'watch', 'stable']),
    ews: z.number(),
    food_price: z.string().optional(),
    responses: z.number(),
    summary: z.string(),
    sources: z.string().optional(),
  }),
});

const expert = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    author: z.string(),
    region: z.string(),
    responses: z.number(),
    summary: z.string(),
  }),
});

export const collections = { briefs, expert };
