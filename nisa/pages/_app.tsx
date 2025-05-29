// pages/_app.tsx
import '@/pages/styles/globals.css' // Import Tailwind CSS
import type { AppProps } from 'next/app'

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}
