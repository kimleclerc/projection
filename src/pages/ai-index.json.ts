import type { APIRoute } from 'astro';
import { buildAiIndex } from '../lib/aiDocuments';

export const prerender = true;

export const GET: APIRoute = () => new Response(`${JSON.stringify(buildAiIndex(), null, 2)}\n`, {
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'public, max-age=3600',
  },
});
