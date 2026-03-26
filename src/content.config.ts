import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const briefs = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/briefs' }),
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
  loader: glob({ pattern: '**/*.md', base: './src/content/expert' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    author: z.string(),
    region: z.string(),
    responses: z.number(),
    summary: z.string(),
    subtitle: z.string().optional(),
    image: z.string().optional(),
    category: z.string().optional(),
    tags: z.array(z.string()).optional(),
  }),
});

const reports = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/reports' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    type: z.literal('situational-report'),
    region: z.string(),
    alert: z.enum(['alert', 'watch', 'stable']),
    ews: z.number(),
    respondent_count: z.number(),
    entry_count: z.number(),
    summary: z.string(),
    external_sources: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
  }),
});

export const collections = { briefs, expert, reports };
