import type { Context, Config } from '@netlify/functions';
import { getStore, getDeployStore } from '@netlify/blobs';
import property from '../../src/data/property.json';

export default async function handler(request: Request, context: Context) {
  if (request.method !== 'POST') return new Response(null, { status: 405 });
  const origin = new URL(request.url).origin;
  if (request.headers.get('origin') !== origin) return new Response(null, { status: 403 });
  const body = await request.text();
  if (body.length > 512) return new Response(null, { status: 413 });
  let event: { event?: string; page?: string } | null;
  try { event = JSON.parse(body); } catch { return new Response(null, { status: 400 }); }
  if (!event || !['phone_click', 'contact_view'].includes(event.event ?? '') || typeof event.page !== 'string' || !/^\/(?:[a-z0-9-]+\/)*$/.test(event.page) || event.page.length > 160) return new Response(null, { status: 400 });
  const production = context.deploy.published && origin === property.origin;
  const store = production ? getStore('maison-contact-events') : getDeployStore('maison-contact-events-preview');
  const day = new Date().toISOString().slice(0, 10);
  // Append separate events: no lost increments and no visitor identifiers.
  const key = `${day}/${event.event}/${encodeURIComponent(event.page)}/${crypto.randomUUID()}`;
  try {
    await store.setJSON(key, { day, event: event.event, page: event.page });
  } catch {
    return new Response(null, { status: 503 });
  }
  return new Response(null, { status: 204, headers: { 'Cache-Control': 'no-store' } });
}

export const config: Config = { path: '/api/contact-event', rateLimit: { windowLimit: 20, windowSize: 60, aggregateBy: ['ip', 'domain'] } };
