import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';

vi.mock('next/navigation', async () => {
  const { nav } = await import('@/navMock');
  return { useRouter: () => nav, usePathname: () => nav.pathname };
});

afterEach(async () => {
  cleanup();
  localStorage.clear();
  vi.useRealTimers();
  vi.unstubAllGlobals();
  const { nav } = await import('@/navMock');
  nav.push.mockClear();
  nav.replace.mockClear();
  nav.pathname = '/';
});
