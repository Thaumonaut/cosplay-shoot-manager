'use client'

import { useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import ShootCard from '@/components/ShootCard'
import CreateShootDialog from '@/components/CreateShootDialog'
import { useShoots } from '@/hooks/useApi'
import { useAuth } from '@/contexts/AuthContext'
import { Shoot } from '@/types/database'

export default function DashboardPage() {
  const { user } = useAuth()
  const { data: shootsData, loading, error, retry } = useShoots()
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  
  const shoots = Array.isArray(shootsData) ? shootsData as Shoot[] : []

  // If not authenticated, redirect to login (this would normally be handled by middleware)
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Please sign in to continue
            </h2>
          </div>
        </div>
      </div>
    )
  }

  const handleShootCreated = () => {
    setShowCreateDialog(false)
    retry()
  }

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-gray-900">Shoots</h1>
            <p className="mt-2 text-sm text-gray-700">
              Manage your cosplay photoshoots and track their progress.
            </p>
          </div>
          <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
            <button
              type="button"
              onClick={() => setShowCreateDialog(true)}
              className="block rounded-md bg-blue-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              New Shoot
            </button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mt-6 rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Error loading shoots
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  {error || 'An unexpected error occurred'}
                </div>
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => retry()}
                    className="rounded-md bg-red-50 px-2 py-1.5 text-sm font-medium text-red-800 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-red-50"
                  >
                    Try again
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="mt-6 flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-gray-600">Loading shoots...</span>
          </div>
        )}

        {/* Shoots Grid */}
        {!loading && !error && (
          <div className="mt-6">
            {shoots.length === 0 ? (
              <div className="text-center py-12">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-semibold text-gray-900">No shoots</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by creating your first photoshoot.
                </p>
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={() => setShowCreateDialog(true)}
                    className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                  >
                    New Shoot
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {shoots.map((shoot: Shoot) => (
                  <ShootCard
                    key={shoot.id}
                    shoot={shoot}
                    onClick={() => console.log('View shoot:', shoot.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Create Shoot Dialog */}
        {showCreateDialog && (
          <CreateShootDialog
            isOpen={showCreateDialog}
            onClose={() => setShowCreateDialog(false)}
            onSuccess={handleShootCreated}
          />
        )}
      </div>
    </DashboardLayout>
  )
}
