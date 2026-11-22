
import { useEffect, useState } from 'react'
import axios from 'axios'
import api from './services/api'
import { loginAdmin } from './services/authService'
import Dashboard from './pages/Dashboard'

function App() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isCheckingSession, setIsCheckingSession] = useState(true)

  // Verify an existing session when the application loads
  useEffect(() => {
    const verifySession = async () => {
      const token = sessionStorage.getItem('adminToken')

      if (!token) {
        setIsCheckingSession(false)
        return
      }

      try {
        await api.get('/auth/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        setIsAuthenticated(true)
      } catch {
        sessionStorage.removeItem('adminToken')
        sessionStorage.removeItem('admin')
        setIsAuthenticated(false)
      } finally {
        setIsCheckingSession(false)
      }
    }

    verifySession()
  }, [])

  // Handle admin login
  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault()

    setMessage('')

    if (!email.trim() || !password) {
      setMessage('Please enter your email and password.')
      return
    }

    try {
      setIsLoading(true)

      const response = await loginAdmin({
        email: email.trim(),
        password,
      })

      sessionStorage.setItem('adminToken', response.token)
      sessionStorage.setItem(
        'admin',
        JSON.stringify(response.admin)
      )

      setIsAuthenticated(true)
      setPassword('')
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setMessage(
          error.response?.data?.message ||
          'Unable to connect to the server. Please try again.'
        )
      } else {
        setMessage('Something went wrong. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Handle logout
  const handleLogout = () => {
    sessionStorage.removeItem('adminToken')
    sessionStorage.removeItem('admin')

    setIsAuthenticated(false)
    setEmail('')
    setPassword('')
    setMessage('')
  }

  // Show loading screen while verifying the session
  if (isCheckingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <p className="font-semibold text-violet-700">
          Checking your session...
        </p>
      </div>
    )
  }

  // Display dashboard after authentication
  if (isAuthenticated) {
    return <Dashboard onLogout={handleLogout} />
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl md:grid-cols-2">

        {/* Left Branding Section */}
        <div className="hidden flex-col justify-between bg-slate-950 p-12 text-white md:flex">

          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-600 text-xl font-bold">
                P
              </div>

              <span className="text-xl font-bold tracking-wide">
                Portfolio CMS
              </span>
            </div>

            <div className="mt-24">
              <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-violet-400">
                Admin Dashboard
              </p>

              <h1 className="text-4xl font-bold leading-tight">
                Manage your portfolio.
                <span className="text-violet-400">
                  {' '}Build your future.
                </span>
              </h1>

              <p className="mt-6 leading-7 text-slate-400">
                Manage your projects, skills, experience, blogs
                and portfolio content from one secure dashboard.
              </p>
            </div>
          </div>

          <p className="text-sm text-slate-500">
            © 2026 Portfolio CMS. All rights reserved.
          </p>
        </div>

        {/* Right Login Section */}
        <div className="flex flex-col justify-center px-7 py-12 sm:px-12">

          <div className="mb-8">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 text-2xl">
              🔐
            </div>

            <h2 className="text-3xl font-bold text-slate-900">
              Welcome back!
            </h2>

            <p className="mt-2 text-slate-500">
              Sign in to access your admin dashboard.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Email Address
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="admin@example.com"
                autoComplete="username"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Password
              </label>

              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 pr-20 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-violet-600 hover:text-violet-800"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {message && (
              <div
                role="alert"
                className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
              >
                {message}
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-violet-600 py-3 font-semibold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>

          </form>

          <p className="mt-8 text-center text-sm text-slate-500">
            Secure access for portfolio administrators only.
          </p>

        </div>
      </div>
    </div>
  )
}

export default App
