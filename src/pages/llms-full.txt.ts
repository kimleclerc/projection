import type { APIRoute } from 'astro';
import { buildLlmsFullTxt } from '../lib/aiDocuments';

export const prerender = true;

export const GET: APIRoute = () => new Response(buildLlmsFullTxt(), {
  headers: {
    'Content-Type': 'text/plain; charset=utf-8',
    'Cache-Control': 'public, max-age=3600',
  },
});
