import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'List Your Business',
  description: 'Register your local business on DeshKhoj and reach thousands of potential customers in your area for free.',
  openGraph: {
    title: 'List Your Business | DeshKhoj',
    description: 'Register your business on DeshKhoj and reach local customers.',
  },
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
