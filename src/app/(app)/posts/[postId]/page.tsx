import type { Metadata } from 'next';
import PageHeading from '@/components/PageHeading';
import PostDetail from '@/components/PostDetail';

export const metadata: Metadata = {
  title: 'Detail Postingan',
  description: 'Baca postingan lengkap, beri suka, dan tinggalkan komentar.',
};

export default async function Page({ params }: { params: Promise<{ postId: string }> }) {
  const { postId } = await params;
  return (
    <>
      <PageHeading title="Detail Postingan" subtitle="Baca, beri suka, dan berkomentar." />
      <PostDetail postId={Number(postId)} />
    </>
  );
}
