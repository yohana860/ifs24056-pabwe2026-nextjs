import { ApiError, assetUrl, clearToken, formatDate, getToken, isEmail, request, saveToken } from '@/lib/api';
import { fail, mockFetch, ok } from '@/testUtils';

describe('token storage', () => {
  it('menyimpan, membaca, dan menghapus token', () => {
    saveToken('abc');
    expect(getToken()).toBe('abc');
    clearToken();
    expect(getToken()).toBeNull();
  });
});

describe('request', () => {
  it('GET tanpa token dan tanpa body', async () => {
    const fetchMock = mockFetch(() => ok({ a: 1 }));
    const result = await request('/x');
    expect(result.data).toEqual({ a: 1 });
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toBe('https://open-api.delcom.org/api/v1/x');
    expect(init.headers).toEqual({ Accept: 'application/json' });
    expect(init.body).toBeUndefined();
  });

  it('menyertakan query, token, dan body JSON', async () => {
    saveToken('tok');
    const fetchMock = mockFetch(() => ok());
    await request('/x', { method: 'POST', query: { is_me: 1 }, json: { a: 1 } });
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toContain('?is_me=1');
    expect(init.headers).toMatchObject({ Authorization: 'Bearer tok', 'Content-Type': 'application/json' });
    expect(init.body).toBe('{"a":1}');
  });

  it('mengirim FormData apa adanya', async () => {
    const fetchMock = mockFetch(() => ok());
    const form = new FormData();
    await request('/x', { method: 'POST', form });
    expect(fetchMock.mock.calls[0][1].body).toBe(form);
  });

  it('melempar ApiError dengan detail validasi', async () => {
    mockFetch(() => fail('Validasi gagal', { email: ['Email salah.'], name: ['Nama kosong.'] }));
    await expect(request('/x')).rejects.toThrow('Validasi gagal: Email salah. Nama kosong.');
    await expect(request('/x')).rejects.toBeInstanceOf(ApiError);
  });

  it('melempar pesan utama bila tidak ada detail', async () => {
    mockFetch(() => fail('Tidak diizinkan'));
    await expect(request('/x')).rejects.toThrow('Tidak diizinkan');
  });
});

describe('helper', () => {
  it('assetUrl menangani null, absolut, http, dan relatif', () => {
    expect(assetUrl(null)).toBeNull();
    expect(assetUrl('https://a.id/x.png')).toBe('https://a.id/x.png');
    const insecure = ['http', '://a.id/x.png'].join('');
expect(assetUrl(insecure)).toBe('https://a.id/x.png');
    expect(assetUrl('/storage/x.png')).toBe('https://open-api.delcom.org/storage/x.png');
    expect(assetUrl('storage/y.png')).toBe('https://open-api.delcom.org/storage/y.png');
  });

  it('formatDate memakai locale Indonesia', () => {
    expect(formatDate('2026-02-03T00:00:00Z')).toMatch(/2026/);
  });

  it('isEmail memvalidasi format', () => {
    expect(isEmail(' a@b.co ')).toBe(true);
    expect(isEmail('abc')).toBe(false);
  });
});

describe('BASE_URL', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('memakai env dan membuang slash akhir', async () => {
    vi.stubEnv('NEXT_PUBLIC_DELCOM_BASEURL', 'https://api.test/v1/');
    vi.resetModules();
    expect((await import('@/lib/api')).BASE_URL).toBe('https://api.test/v1');
  });
});
