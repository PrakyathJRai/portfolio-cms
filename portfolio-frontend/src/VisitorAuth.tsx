
import { useEffect, useState, type FormEvent } from 'react'

const API =
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

type Visitor = {
  id: string
  name: string
  email: string
  createdAt?: string
}

type AuthResponse = {
  success: boolean
  message: string
  token?: string
  visitor?: Visitor
}

export default function VisitorAuth() {
  const [mode, setMode] = useState<'login' | 'register'>('register')
  const [visitor, setVisitor] = useState<Visitor | null>(null)

  const [token, setToken] = useState(
    () => sessionStorage.getItem('visitorToken') || ''
  )

  // Registration and login states
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [loading, setLoading] = useState(false)
  const [checkingProfile, setCheckingProfile] = useState(
    () => Boolean(sessionStorage.getItem('visitorToken'))
  )

  // Edit profile states
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)

  // Change password states
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)

  // General messages
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  // ==========================================
  // LOAD VISITOR PROFILE
  // ==========================================

  useEffect(() => {
    if (!token) {
      setCheckingProfile(false)
      return
    }

    const loadProfile = async () => {
      setCheckingProfile(true)

      try {
        const response = await fetch(
          `${API}/visitor-auth/profile`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )

        const result = await response.json()

        if (!response.ok || !result.success) {
          throw new Error(result.message || 'Session expired.')
        }

        setVisitor(result.visitor)
      } catch {
        sessionStorage.removeItem('visitorToken')
        setToken('')
        setVisitor(null)
        setMode('login')
        setError('Your session expired. Please log in again.')
      } finally {
        setCheckingProfile(false)
      }
    }

    void loadProfile()
  }, [token])

  // ==========================================
  // VISITOR REGISTRATION AND LOGIN
  // ==========================================

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault()

    setLoading(true)
    setError('')
    setMessage('')

    try {
      const endpoint =
        mode === 'register' ? 'register' : 'login'

      const payload =
        mode === 'register'
          ? {
              name: name.trim(),
              email: email.trim(),
              password,
            }
          : {
              email: email.trim(),
              password,
            }

      const response = await fetch(
        `${API}/visitor-auth/${endpoint}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      )

      const result: AuthResponse = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || 'Authentication failed.'
        )
      }

      if (!result.token || !result.visitor) {
        throw new Error('Invalid authentication response.')
      }

      sessionStorage.setItem('visitorToken', result.token)

      setVisitor(result.visitor)
      setToken(result.token)

      setName('')
      setEmail('')
      setPassword('')

      setMessage(
        mode === 'register'
          ? 'Registration successful!'
          : 'Login successful!'
      )
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Something went wrong. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  // ==========================================
  // OPEN EDIT PROFILE
  // ==========================================

  const handleEditProfile = () => {
    if (!visitor) return

    setEditName(visitor.name)
    setEditEmail(visitor.email)
    setEditing(true)
    setError('')
    setMessage('')
  }

  // ==========================================
  // UPDATE VISITOR PROFILE
  // ==========================================

  const handleProfileUpdate = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault()

    if (!token) {
      setError('Please log in again.')
      return
    }

    setSavingProfile(true)
    setError('')
    setMessage('')

    try {
      const response = await fetch(
        `${API}/visitor-auth/profile`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: editName.trim(),
            email: editEmail.trim(),
          }),
        }
      )

      const result: AuthResponse = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || 'Unable to update your profile.'
        )
      }

      if (!result.visitor) {
        throw new Error('Invalid profile update response.')
      }

      setVisitor(result.visitor)
      setEditing(false)
      setMessage('Your profile was updated successfully!')
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Something went wrong. Please try again.'
      )
    } finally {
      setSavingProfile(false)
    }
  }

  // ==========================================
  // CHANGE VISITOR PASSWORD
  // ==========================================

  const handlePasswordChange = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault()

    setError('')
    setMessage('')

    if (!token) {
      setError('Please log in again.')
      return
    }

    if (newPassword !== confirmPassword) {
      setError(
        'New password and confirmation password do not match.'
      )
      return
    }

    if (newPassword.length < 8) {
      setError(
        'New password must contain at least 8 characters.'
      )
      return
    }

    setChangingPassword(true)

    try {
      const response = await fetch(
        `${API}/visitor-auth/change-password`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            currentPassword,
            newPassword,
          }),
        }
      )

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || 'Unable to change password.'
        )
      }

      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')

      setMessage(
        'Your password has been changed successfully!'
      )
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Something went wrong. Please try again.'
      )
    } finally {
      setChangingPassword(false)
    }
  }

  // ==========================================
  // VISITOR LOGOUT
  // ==========================================

  const handleLogout = () => {
    sessionStorage.removeItem('visitorToken')

    setToken('')
    setVisitor(null)
    setEditing(false)

    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')

    setMessage('You have logged out successfully.')
    setError('')
    setMode('login')
  }

  // ==========================================
  // MEMBER SINCE DATE
  // ==========================================

  const memberSince = visitor?.createdAt
    ? new Date(visitor.createdAt).toLocaleDateString(
        'en-IN',
        {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }
      )
    : 'Account registered'

  // ==========================================
  // UI
  // ==========================================

  return (
    <section
      id="account"
      className="border-t border-white/10 bg-[#0c1120] px-5 py-24"
    >
      <div className="mx-auto max-w-5xl">

        {/* Dashboard heading */}
        <div className="mb-12 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-cyan-400">
            Visitor Account
          </p>

          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            {visitor ? 'Your Dashboard' : 'Welcome to My Portfolio'}
          </h2>

          <p className="mt-4 text-slate-400">
            {visitor
              ? 'Manage and view your visitor account.'
              : 'Create an account or sign in to access your visitor profile.'}
          </p>
        </div>

        {/* Loading profile */}
        {checkingProfile ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-12 text-center">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-cyan-400/20 border-t-cyan-400" />
            <p className="text-slate-300">
              Loading your dashboard...
            </p>
          </div>
        ) : visitor ? (

          /* =====================================
             VISITOR DASHBOARD
          ===================================== */

          <div className="space-y-7">

            {/* Success and error messages */}
            {message && (
              <p
                role="status"
                className="rounded-lg border border-green-400/20 bg-green-400/10 p-4 text-sm text-green-400"
              >
                {message}
              </p>
            )}

            {error && (
              <p
                role="alert"
                className="rounded-lg border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-400"
              >
                {error}
              </p>
            )}

            {/* Welcome card */}
            <div className="rounded-2xl border border-cyan-400/20 bg-gradient-to-br from-cyan-400/10 to-blue-500/5 p-7 sm:p-10">
              <div className="flex flex-col items-center gap-5 sm:flex-row">

                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-cyan-400 text-3xl font-bold text-slate-950">
                  {visitor.name.charAt(0).toUpperCase()}
                </div>

                <div className="text-center sm:text-left">
                  <p className="text-sm text-cyan-400">
                    Welcome back!
                  </p>

                  <h3 className="mt-1 text-2xl font-bold text-white sm:text-3xl">
                    {visitor.name}
                  </h3>

                  <p className="mt-2 text-slate-400">
                    You are successfully logged in to your visitor account.
                  </p>
                </div>

                <div className="sm:ml-auto">
                  <span className="inline-flex items-center gap-2 rounded-full border border-green-400/20 bg-green-400/10 px-4 py-2 text-sm font-medium text-green-400">
                    <span className="h-2 w-2 rounded-full bg-green-400" />
                    Active
                  </span>
                </div>

              </div>
            </div>

            {/* Account overview */}
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-cyan-400/10 text-cyan-400">
                  <span className="text-xl">👤</span>
                </div>

                <p className="text-sm text-slate-400">
                  Account Name
                </p>

                <h4 className="mt-2 break-words font-semibold text-white">
                  {visitor.name}
                </h4>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-blue-400/10 text-blue-400">
                  <span className="text-xl">✉️</span>
                </div>

                <p className="text-sm text-slate-400">
                  Email Address
                </p>

                <h4 className="mt-2 break-all font-semibold text-white">
                  {visitor.email}
                </h4>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-purple-400/10 text-purple-400">
                  <span className="text-xl">📅</span>
                </div>

                <p className="text-sm text-slate-400">
                  Member Since
                </p>

                <h4 className="mt-2 font-semibold text-white">
                  {memberSince}
                </h4>
              </div>

            </div>

            {/* =====================================
                ACCOUNT INFORMATION / EDIT PROFILE
            ===================================== */}

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-7 sm:p-9">

              <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

                <div>
                  <h3 className="text-xl font-bold text-white">
                    Account Information
                  </h3>

                  <p className="mt-2 text-sm text-slate-400">
                    Manage your registered account details.
                  </p>
                </div>

                {!editing && (
                  <button
                    type="button"
                    onClick={handleEditProfile}
                    className="rounded-lg bg-cyan-400 px-6 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300"
                  >
                    ✏️ Edit Profile
                  </button>
                )}

              </div>

              {editing ? (
                <form
                  onSubmit={handleProfileUpdate}
                  className="space-y-5"
                >

                  <div>
                    <label className="mb-2 block text-sm text-slate-300">
                      Full Name
                    </label>

                    <input
                      type="text"
                      required
                      minLength={2}
                      maxLength={100}
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full rounded-lg border border-white/10 bg-[#111827] px-4 py-3 text-white outline-none focus:border-cyan-400"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-slate-300">
                      Email Address
                    </label>

                    <input
                      type="email"
                      required
                      maxLength={255}
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="w-full rounded-lg border border-white/10 bg-[#111827] px-4 py-3 text-white outline-none focus:border-cyan-400"
                      placeholder="Enter your email address"
                    />
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row">

                    <button
                      type="submit"
                      disabled={savingProfile}
                      className="rounded-lg bg-cyan-400 px-7 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:opacity-50"
                    >
                      {savingProfile ? 'Saving...' : 'Save Changes'}
                    </button>

                    <button
                      type="button"
                      disabled={savingProfile}
                      onClick={() => {
                        setEditing(false)
                        setError('')
                      }}
                      className="rounded-lg border border-white/20 px-7 py-3 font-semibold text-slate-300 transition hover:bg-white/10"
                    >
                      Cancel
                    </button>

                  </div>

                </form>
              ) : (

                <div className="space-y-5">

                  <div className="border-b border-white/10 pb-5">
                    <p className="text-sm text-slate-500">
                      Full Name
                    </p>

                    <p className="mt-2 font-medium text-white">
                      {visitor.name}
                    </p>
                  </div>

                  <div className="border-b border-white/10 pb-5">
                    <p className="text-sm text-slate-500">
                      Email Address
                    </p>

                    <p className="mt-2 break-all font-medium text-white">
                      {visitor.email}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-500">
                      Visitor ID
                    </p>

                    <p className="mt-2 break-all font-mono text-sm text-cyan-400">
                      {visitor.id}
                    </p>
                  </div>

                </div>

              )}

            </div>

            {/* =====================================
                CHANGE PASSWORD
            ===================================== */}

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-7 sm:p-9">

              <div className="mb-7">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-400/10 text-2xl">
                  🔐
                </div>

                <h3 className="text-xl font-bold text-white">
                  Change Password
                </h3>

                <p className="mt-2 text-sm text-slate-400">
                  Update your account password to keep your account secure.
                </p>
              </div>

              <form
                onSubmit={handlePasswordChange}
                className="space-y-5"
              >

                <div>
                  <label className="mb-2 block text-sm text-slate-300">
                    Current Password
                  </label>

                  <input
                    type="password"
                    required
                    autoComplete="current-password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter your current password"
                    className="w-full rounded-lg border border-white/10 bg-[#111827] px-4 py-3 text-white outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-slate-300">
                    New Password
                  </label>

                  <input
                    type="password"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter your new password"
                    className="w-full rounded-lg border border-white/10 bg-[#111827] px-4 py-3 text-white outline-none focus:border-cyan-400"
                  />

                  <p className="mt-2 text-xs text-slate-500">
                    Password must contain at least 8 characters.
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-sm text-slate-300">
                    Confirm New Password
                  </label>

                  <input
                    type="password"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your new password"
                    className="w-full rounded-lg border border-white/10 bg-[#111827] px-4 py-3 text-white outline-none focus:border-cyan-400"
                  />
                </div>

                <button
                  type="submit"
                  disabled={changingPassword}
                  className="rounded-lg bg-cyan-400 px-7 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {changingPassword
                    ? 'Updating...'
                    : 'Change Password'}
                </button>

              </form>

            </div>

            {/* =====================================
                QUICK NAVIGATION
            ===================================== */}

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-7">

              <h3 className="text-xl font-bold text-white">
                Explore My Portfolio
              </h3>

              <p className="mt-2 text-sm text-slate-400">
                Quickly navigate to different sections of my portfolio.
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                {[
                  { label: 'About Me', href: '#about' },
                  { label: 'My Skills', href: '#skills' },
                  { label: 'Projects', href: '#projects' },
                  { label: 'Contact Me', href: '#contact' },
                ].map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    className="rounded-lg border border-white/10 bg-[#111827] px-4 py-4 text-center text-sm font-semibold text-slate-300 transition hover:border-cyan-400 hover:text-cyan-400"
                  >
                    {item.label} →
                  </a>
                ))}

              </div>
            </div>

            {/* =====================================
                LOGOUT
            ===================================== */}

            <div className="flex flex-col items-center justify-between gap-5 rounded-2xl border border-red-400/10 bg-red-400/[0.03] p-7 sm:flex-row">

              <div>
                <h3 className="font-semibold text-white">
                  Sign out of your account
                </h3>

                <p className="mt-1 text-sm text-slate-400">
                  You can log in again whenever you want.
                </p>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg bg-red-500 px-7 py-3 font-semibold text-white transition hover:bg-red-600"
              >
                Logout
              </button>

            </div>

          </div>

        ) : (

          /* =====================================
             REGISTRATION AND LOGIN
          ===================================== */

          <div className="mx-auto max-w-3xl rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-10">

            <div className="mb-8 grid grid-cols-2 rounded-lg bg-[#111827] p-1">

              <button
                type="button"
                onClick={() => {
                  setMode('register')
                  setError('')
                  setMessage('')
                }}
                className={`rounded-md py-3 text-sm font-semibold transition ${
                  mode === 'register'
                    ? 'bg-cyan-400 text-slate-950'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Register
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode('login')
                  setError('')
                  setMessage('')
                }}
                className={`rounded-md py-3 text-sm font-semibold transition ${
                  mode === 'login'
                    ? 'bg-cyan-400 text-slate-950'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Login
              </button>

            </div>

            <h3 className="mb-6 text-xl font-bold text-white">
              {mode === 'register'
                ? 'Create Your Account'
                : 'Welcome Back'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-5">

              {mode === 'register' && (
                <div>
                  <label className="mb-2 block text-sm text-slate-300">
                    Full Name
                  </label>

                  <input
                    type="text"
                    required
                    minLength={2}
                    maxLength={100}
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full rounded-lg border border-white/10 bg-[#111827] px-4 py-3 text-white outline-none focus:border-cyan-400"
                  />
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  Email Address
                </label>

                <input
                  type="email"
                  required
                  maxLength={255}
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full rounded-lg border border-white/10 bg-[#111827] px-4 py-3 text-white outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  Password
                </label>

                <input
                  type="password"
                  required
                  minLength={8}
                  autoComplete={
                    mode === 'register'
                      ? 'new-password'
                      : 'current-password'
                  }
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full rounded-lg border border-white/10 bg-[#111827] px-4 py-3 text-white outline-none focus:border-cyan-400"
                />
              </div>

              {error && (
                <p role="alert" className="text-sm text-red-400">
                  {error}
                </p>
              )}

              {message && (
                <p role="status" className="text-sm text-green-400">
                  {message}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-cyan-400 px-6 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading
                  ? 'Please wait...'
                  : mode === 'register'
                    ? 'Create Account'
                    : 'Login'}
              </button>

            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
              Your visitor account is separate from the Admin CMS account.
            </p>

          </div>

        )}

      </div>
    </section>
  )
}
