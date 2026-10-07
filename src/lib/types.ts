export interface User {
  id: number;
  name: string;
  email: string;
  photo: string | null;
  created_at: string;
}

export interface Post {
  id: number;
  user_id: number;
  cover: string | null;
  description: string;
  created_at: string;
  author: { name: string; photo: string | null };
  likes: number[];
  comments: unknown[];
}

export interface PostComment {
  id: number;
  comment: string;
  created_at: string;
}

export interface PostDetail extends Omit<Post, 'comments'> {
  comments: PostComment[];
  my_comment?: PostComment | null;
}

export interface Notice {
  id: number;
  kind: 'success' | 'error';
  text: string;
}
