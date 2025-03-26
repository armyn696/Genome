import type { AppProps } from 'next/app';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { Layout } from '@/components/Layout';
import { Toaster } from 'sonner';
import '@/styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
      <Toaster position="top-right" />
    </AuthProvider>
  );
}
