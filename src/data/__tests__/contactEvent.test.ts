import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Context } from '@netlify/functions';
const mocks = vi.hoisted(() => ({ setJSON: vi.fn(), getStore: vi.fn(), getDeployStore: vi.fn() }));
vi.mock('@netlify/blobs', () => ({ getStore: mocks.getStore, getDeployStore: mocks.getDeployStore }));
import handler from '../../../netlify/functions/contact-event.mts';

const context = (published: boolean) => ({ deploy: { published } } as Context);
const request = (body: unknown, origin = 'https://maison-vuelac.com') => new Request(`${origin}/api/contact-event`, { method: 'POST', headers: { origin }, body: JSON.stringify(body) });
beforeEach(() => {
  vi.clearAllMocks();
  mocks.setJSON.mockResolvedValue(undefined);
  mocks.getStore.mockReturnValue({ setJSON: mocks.setJSON });
  mocks.getDeployStore.mockReturnValue({ setJSON: mocks.setJSON });
});
describe('contact measurement', () => {
  it('stores only day, event and page, with independent event keys', async () => {
    const body = { event: 'phone_click', page: '/en/contact/', email: 'ignored@example.com' };
    expect((await handler(request(body), context(true))).status).toBe(204);
    expect((await handler(request(body), context(true))).status).toBe(204);
    expect(mocks.getStore).toHaveBeenCalledWith('maison-contact-events');
    expect(Object.keys(mocks.setJSON.mock.calls[0][1]).sort()).toEqual(['day', 'event', 'page']);
    expect(mocks.setJSON.mock.calls[0][0]).not.toBe(mocks.setJSON.mock.calls[1][0]);
  });
  it('isolates draft events from production', async () => {
    await handler(request({ event: 'contact_view', page: '/contact/' }, 'https://draft--maison.netlify.app'), context(false));
    expect(mocks.getStore).not.toHaveBeenCalled();
    expect(mocks.getDeployStore).toHaveBeenCalledWith('maison-contact-events-preview');
  });
  it.each([null, {}, {event:'anything',page:'/'}, {event:'phone_click',page:'/contact/?email=private'}, {event:'phone_click',page:'https://elsewhere.example/'}])('rejects invalid payloads: %j', async body => {
    expect((await handler(request(body), context(true))).status).toBe(400);
    expect(mocks.setJSON).not.toHaveBeenCalled();
  });
  it('rejects foreign origins and non-POST requests', async () => {
    expect((await handler(new Request('https://maison-vuelac.com/api/contact-event'), context(true))).status).toBe(405);
    expect((await handler(new Request('https://maison-vuelac.com/api/contact-event', { method:'POST', headers:{origin:'https://other.example'}, body:'{}' }), context(true))).status).toBe(403);
  });
  it('does not report success when storage fails', async () => {
    mocks.setJSON.mockRejectedValue(new Error('storage unavailable'));
    expect((await handler(request({event:'phone_click',page:'/'}), context(true))).status).toBe(503);
  });
});
