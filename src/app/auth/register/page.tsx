import type { Metadata } from 'next';
import { RegisterForm } from '@/components/AuthForms';

export const metadata: Metadata = {
  title: 'Daftar',
  description: 'Buat akun Rumpi gratis dan mulai berbagi cerita singkat.',
};

export default function Page() {
  return <RegisterForm />;
}
