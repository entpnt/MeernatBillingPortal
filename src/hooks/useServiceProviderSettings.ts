import { useState, useEffect } from 'react'
import { useUser } from '@clerk/clerk-react'
import { supabase } from '@/lib/supabase'
import type { Tables } from '@/types/supabase'

type ServiceProvider = Tables<'service_providers'>

interface ServiceProviderSettings {
  name: string
  logo_url: string | null
  location: string | null
  phone_number: string | null
  email: string | null
  website_url: string | null
}

export const useServiceProviderSettings = () => {
  const { user } = useUser()
  const [settings, setSettings] = useState<ServiceProviderSettings>({
    name: '',
    logo_url: null,
    location: '',
    phone_number: '',
    email: '',
    website_url: '',
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [serviceProviderId, setServiceProviderId] = useState<string | null>(null)

  // Load service provider settings
  const loadSettings = async () => {
    if (!user) return

    try {
      setIsLoading(true)
      setError(null)

      // Use standard Supabase client with anon key
      // Since RLS is disabled, this should work
      const { data: existingProvider, error: fetchError } = await supabase
        .from('service_providers')
        .select('*')
        .eq('id', user.id)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') {
        // PGRST116 is "not found" error, which is expected if no record exists
        console.error('Supabase fetch error:', fetchError)
        throw fetchError
      }

      if (existingProvider) {
        setServiceProviderId(existingProvider.id)
        setSettings({
          name: existingProvider.name || '',
          logo_url: existingProvider.logo_url,
          location: existingProvider.location || '',
          phone_number: existingProvider.phone_number || '',
          email: existingProvider.email || '',
          website_url: existingProvider.website_url || '',
        })
      } else {
        // No existing provider, use empty settings
        setSettings({
          name: '',
          logo_url: null,
          location: '',
          phone_number: '',
          email: user.emailAddresses?.[0]?.emailAddress || '',
          website_url: '',
        })
      }
    } catch (err) {
      console.error('Error loading service provider settings:', err)
      setError('Failed to load settings. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Save service provider settings
  const saveSettings = async (newSettings: ServiceProviderSettings) => {
    if (!user) return { success: false, error: 'No user found' }

    try {
      setIsSaving(true)
      setError(null)

      const settingsData = {
        id: user.id,
        name: newSettings.name,
        logo_url: newSettings.logo_url,
        location: newSettings.location,
        phone_number: newSettings.phone_number,
        email: newSettings.email,
        website_url: newSettings.website_url,
        updated_at: new Date().toISOString(),
      }

      if (serviceProviderId) {
        // Update existing record
        const { error } = await supabase
          .from('service_providers')
          .update(settingsData)
          .eq('id', serviceProviderId)

        if (error) throw error
      } else {
        // Create new record
        const { error } = await supabase
          .from('service_providers')
          .insert({
            ...settingsData,
            created_at: new Date().toISOString(),
          })

        if (error) throw error
        setServiceProviderId(user.id)
      }

      setSettings(newSettings)
      return { success: true }
    } catch (err) {
      console.error('Error saving service provider settings:', err)
      setError('Failed to save settings. Please try again.')
      return { success: false, error: err }
    } finally {
      setIsSaving(false)
    }
  }

  // Update a single setting
  const updateSetting = (key: keyof ServiceProviderSettings, value: string | null) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }))
  }

  // Load settings when user changes
  useEffect(() => {
    if (user) {
      loadSettings()
    }
  }, [user])

  return {
    settings,
    isLoading,
    isSaving,
    error,
    saveSettings,
    updateSetting,
    loadSettings,
  }
} 