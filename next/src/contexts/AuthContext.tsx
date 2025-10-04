'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { apiClient, ApiClientError } from '@/lib/api-client'
import { User } from '@/types/database'

interface AuthState {
  user: User | null
  token: string | null
  loading: boolean
  error: string | null
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    loading: true,
    error: null,
  })

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedToken = localStorage.getItem('auth_token')
        const storedUser = localStorage.getItem('auth_user')

        if (storedToken && storedUser) {
          const user = JSON.parse(storedUser)
          apiClient.setToken(storedToken)
          setState({
            user,
            token: storedToken,
            loading: false,
            error: null,
          })
        } else {
          setState(prev => ({ ...prev, loading: false }))
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
        localStorage.removeItem('auth_token')
        localStorage.removeItem('auth_user')
        setState(prev => ({ ...prev, loading: false }))
      }
    }

    initializeAuth()
  }, [])

  const login = async (email: string, password: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const response = await apiClient.login(email, password)
      
      // Store auth data
      localStorage.setItem('auth_token', response.token)
      localStorage.setItem('auth_user', JSON.stringify(response.user))
      
      // Update API client token
      apiClient.setToken(response.token)
      
      setState({
        user: response.user,
        token: response.token,
        loading: false,
        error: null,
      })
    } catch (error) {
      const errorMessage = error instanceof ApiClientError 
        ? error.message 
        : 'Login failed. Please try again.'
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }))
      throw error
    }
  }

  const logout = async () => {
    setState(prev => ({ ...prev, loading: true }))

    try {
      await apiClient.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Clear local storage and state regardless of API call result
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
      apiClient.setToken(null)
      
      setState({
        user: null,
        token: null,
        loading: false,
        error: null,
      })
    }
  }

  const clearError = () => {
    setState(prev => ({ ...prev, error: null }))
  }

  const contextValue: AuthContextType = {
    ...state,
    login,
    logout,
    clearError,
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Higher-order component for protected routes
export function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function AuthenticatedComponent(props: P) {
    const { user, loading } = useAuth()

    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )
    }

    if (!user) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
            <p className="text-muted-foreground">Please log in to access this page.</p>
          </div>
        </div>
      )
    }

    return <Component {...props} />
  }
}