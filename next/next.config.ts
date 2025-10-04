import type { NextConfig } from 'next'
import path from 'path'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Silence workspace root inference warning in a nested app setup
  outputFileTracingRoot: path.join(__dirname, '..'),
}

export default nextConfig
