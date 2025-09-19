import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ToastProvider } from '@/components/ui/toast'
import { AuthProvider } from '@/lib/auth-context'
import { AuthHandler } from '@/components/auth/auth-handler'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'App Preview Generator',
  description: 'Create beautiful app store screenshots with ease',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <AuthHandler />
          <ToastProvider>
            {children}
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  )
}