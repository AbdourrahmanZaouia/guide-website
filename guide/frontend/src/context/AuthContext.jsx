import { createContext, useContext, useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://ojypojtinavhmzisgckt.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qeXBvanRpbmF2aG16aXNnY2t0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4Njk0MTUsImV4cCI6MjA4OTQ0NTQxNX0.AsNzRHgwCG6wU7ErrNs8YZPz-Zq7_uozRS7y_kEheGE'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.name || session.user.email.split('@')[0],
          role: session.user.user_metadata?.role || 'buyer'
        })
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.name || session.user.email.split('@')[0],
          role: session.user.user_metadata?.role || 'buyer'
        })
      } else {
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw new Error(error.message)
    return {
      id: data.user.id,
      email: data.user.email,
      name: data.user.user_metadata?.name || data.user.email.split('@')[0],
      role: data.user.user_metadata?.role || 'buyer'
    }
  }

  const signup = async (name, email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, role: 'buyer' } }
    })
    if (error) throw new Error(error.message)
    if (data.user) {
      setUser({
        id: data.user.id,
        email: data.user.email,
        name,
        role: 'buyer'
      })
    }
    return { id: data.user?.id, email, name, role: 'buyer' }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  const getToken = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token || null
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, getToken }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
