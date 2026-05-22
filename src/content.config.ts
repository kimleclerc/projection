import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const editorial = defineCollection({
  loader: glob({
    pattern: '**/*.{json,md}',
    base: './src/content/editorial',
    generateId: ({ entry }) => entry.replace(/\.(json|md)$/, ''),
  }),
  schema: z.object({
    locale: z.enum(['en', 'fr', 'es']),
    slug: z.string(),
    title: z.string(),
    description: z.string(),
    eyebrow: z.string().optional(),
    h1Html: z.string(),
    intro: z.string().optional(),
    sections: z
      .array(
        z.object({
          number: z.string().optional(),
          title: z.string(),
          bodyHtml: z.string(),
        })
      )
      .default([]),
    callout: z.string().optional(),
    cards: z
      .array(
        z.object({
          kicker: z.string(),
          title: z.string(),
          itemsHtml: z.array(z.string()).optional(),
          bodyHtml: z.string().optional(),
        })
      )
      .default([]),
    canonicalSlug: z.string(),
    alternates: z.object({
      en: z.string().optional(),
      fr: z.string().optional(),
      es: z.string().optional(),
    }),
  }),
});

export const collections = { editorial };
