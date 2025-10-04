import { useState, useEffect, useCallback } from 'react'
import { apiClient, ApiClientError } from '@/lib/api-client'

interface UseApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

interface UseApiOptions {
  immediate?: boolean
}

// Generic hook for API operations
export function useApi<T>(
  apiCall: () => Promise<T>,
  dependencies: any[] = [],
  options: UseApiOptions = { immediate: true }
) {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: options.immediate ?? true,
    error: null,
  })

  const execute = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const result = await apiCall()
      setState({ data: result, loading: false, error: null })
      return result
    } catch (error) {
      const errorMessage = error instanceof ApiClientError 
        ? error.message 
        : 'An error occurred'
      
      setState(prev => ({ ...prev, loading: false, error: errorMessage }))
      throw error
    }
  }, [apiCall])

  useEffect(() => {
    if (options.immediate) {
      execute()
    }
  }, [execute, options.immediate])

  const retry = useCallback(() => {
    execute()
  }, [execute])

  return {
    ...state,
    execute,
    retry,
  }
}

// Hook for team data
export function useTeam() {
  return useApi(() => apiClient.getTeam())
}

// Hook for shoots data
export function useShoots() {
  return useApi(() => apiClient.getShoots())
}

// Hook for individual shoot data
export function useShoot(id: string | null) {
  return useApi(
    () => apiClient.getShoot(id!),
    [id],
    { immediate: !!id }
  )
}

// Hook for shoot participants
export function useShootParticipants(shootId: string | null) {
  return useApi(
    () => apiClient.getShootParticipants(shootId!),
    [shootId],
    { immediate: !!shootId }
  )
}

// Hook for shoot references
export function useShootReferences(shootId: string | null) {
  return useApi(
    () => apiClient.getShootReferences(shootId!),
    [shootId],
    { immediate: !!shootId }
  )
}

// Hook for mutation operations (create, update, delete)
export function useMutation<TArgs extends any[], TResult>(
  mutationFn: (...args: TArgs) => Promise<TResult>
) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const mutate = useCallback(async (...args: TArgs): Promise<TResult> => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await mutationFn(...args)
      setLoading(false)
      return result
    } catch (error) {
      const errorMessage = error instanceof ApiClientError 
        ? error.message 
        : 'An error occurred'
      
      setError(errorMessage)
      setLoading(false)
      throw error
    }
  }, [mutationFn])

  return {
    mutate,
    loading,
    error,
    clearError: () => setError(null),
  }
}

// Specific mutation hooks
export function useCreateShoot() {
  return useMutation((shootData: any) => apiClient.createShoot(shootData))
}

export function useUpdateShoot() {
  return useMutation((id: string, updates: any) => apiClient.updateShoot(id, updates))
}

export function useDeleteShoot() {
  return useMutation((id: string) => apiClient.deleteShoot(id))
}

export function useCreateTeam() {
  return useMutation((name: string) => apiClient.createTeam(name))
}

export function useUpdateTeam() {
  return useMutation((name: string) => apiClient.updateTeam(name))
}