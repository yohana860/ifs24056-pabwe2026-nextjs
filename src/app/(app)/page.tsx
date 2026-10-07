import type { Metadata } from 'next';
import PageHeading from '@/components/PageHeading';
import Timeline from '@/components/Timeline';

export const metadata: Metadata = {
  title: 'Linimasa',
  description: 'Baca cerita terbaru dari semua pengguna Rumpi.',
};

export default function Page() {
  return (
    <>
      <PageHeading title="Linimasa" subtitle="Cerita terbaru dari semua pengguna." />
      <Timeline scope="all" />
    </>
  );
}
