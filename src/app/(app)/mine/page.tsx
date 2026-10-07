import type { Metadata } from 'next';
import PageHeading from '@/components/PageHeading';
import Timeline from '@/components/Timeline';

export const metadata: Metadata = {
  title: 'Postingan Saya',
  description: 'Kelola semua postingan yang pernah kamu tulis di Rumpi.',
};

export default function Page() {
  return (
    <>
      <PageHeading title="Postingan Saya" subtitle="Semua cerita yang pernah kamu tulis." />
      <Timeline scope="mine" />
    </>
  );
}
