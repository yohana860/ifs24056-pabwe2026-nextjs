import type { Metadata } from 'next';
import PageHeading from '@/components/PageHeading';
import UsersList from '@/components/UsersList';

export const metadata: Metadata = {
  title: 'Pengguna',
  description: 'Temukan pengguna lain yang bergabung di Rumpi.',
};

export default function Page() {
  return (
    <>
      <PageHeading title="Pengguna" subtitle="Orang-orang yang bergabung di Rumpi." />
      <UsersList />
    </>
  );
}
