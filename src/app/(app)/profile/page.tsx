import type { Metadata } from 'next';
import PageHeading from '@/components/PageHeading';
import ProfileForms from '@/components/ProfileForms';

export const metadata: Metadata = {
  title: 'Profil',
  description: 'Perbarui nama, email, foto, dan kata sandi akun Rumpi kamu.',
};

export default function Page() {
  return (
    <>
      <PageHeading title="Profil Saya" subtitle="Atur identitas dan keamanan akunmu." />
      <ProfileForms />
    </>
  );
}
