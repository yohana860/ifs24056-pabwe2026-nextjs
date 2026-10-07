import type { Metadata } from 'next';
import { LoginForm } from '@/components/AuthForms';

export const metadata: Metadata = {
  title: 'Masuk',
  description: 'Masuk ke akun Rumpi untuk membaca dan membagikan cerita.',
};

export default function Page() {
  return <LoginForm />;
}
