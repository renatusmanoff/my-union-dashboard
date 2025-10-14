import { redirect } from 'next/navigation';

export default function HomePage() {
  // Перенаправляем на страницу входа
  redirect('/login');
}
