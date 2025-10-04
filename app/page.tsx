import { redirect } from 'next/navigation'

export default function HomePage() {
  // Server-side redirect to landing page
  redirect('/landing')
}

// Alternative approach in case redirect doesn't work in some environments
export const metadata = {
  title: 'Cosplay Shoot Manager',
  description: 'Professional cosplay photography planning and management platform'
}
