
import { useEffect, useState } from 'react'
import type { MouseEvent } from 'react'

import {
  getDashboardStats,
  type DashboardStats,
} from '../services/dashboardService'

import Projects from './Projects'
import Skills from './Skills'
import About from './About'
import Experience from './Experience'
import Blogs from './Blogs'
import Media from './Media'
import Messages from './Messages'

interface DashboardProps {
  onLogout: () => void
}

type ActivePage =
  | 'dashboard'
  | 'projects'
  | 'skills'
  | 'about'
  | 'experience'
  | 'blogs'
  | 'media'
  | 'messages'

const modules = [
  {
    name: 'About Me',
    description: 'Manage your personal information',
    icon: '👤',
    id: 'about',
  },
  {
    name: 'Skills',
    description: 'Manage your technical skills',
    icon: '💻',
    id: 'skills',
  },
  {
    name: 'Projects',
    description: 'Manage your portfolio projects',
    icon: '📁',
    id: 'projects',
  },
  {
    name: 'Experience',
    description: 'Manage your work experience',
    icon: '💼',
    id: 'experience',
  },
  {
    name: 'Blogs',
    description: 'Create and manage blog posts',
    icon: '📝',
    id: 'blogs',
  },
  {
    name: 'Media',
    description: 'Upload and manage portfolio images',
    icon: '🖼️',
    id: 'media',
  },
  {
    name: 'Messages',
    description: 'View and manage contact messages',
    icon: '📩',
    id: 'messages',
  },
]

function Dashboard({ onLogout }: DashboardProps) {
  const [activePage, setActivePage] =
    useState<ActivePage>('dashboard')

  const [stats, setStats] =
    useState<DashboardStats | null>(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const adminData = sessionStorage.getItem('admin')
  const admin = adminData ? JSON.parse(adminData) : null

  // Fetch dashboard statistics
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setError('')

        const data = await getDashboardStats()
        setStats(data)
      } catch (error) {
        console.error('Dashboard statistics error:', error)

        setError(
          'Unable to load dashboard statistics. Please try again.'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  // Handle module navigation
  const handleModuleClick = (
    event: MouseEvent<HTMLAnchorElement>,
    moduleId: string
  ) => {
    event.preventDefault()

    if (moduleId === 'projects') {
      setActivePage('projects')
    } else if (moduleId === 'skills') {
      setActivePage('skills')
    } else if (moduleId === 'about') {
      setActivePage('about')
    } else if (moduleId === 'experience') {
      setActivePage('experience')
    } else if (moduleId === 'blogs') {
      setActivePage('blogs')
    } else if (moduleId === 'media') {
      setActivePage('media')
    } else if (moduleId === 'messages') {
      setActivePage('messages')
    }
  }

  // Display Projects Management
  if (activePage === 'projects') {
    return (
      <Projects
        onBack={() => setActivePage('dashboard')}
      />
    )
  }

  // Display Skills Management
  if (activePage === 'skills') {
    return (
      <Skills
        onBack={() => setActivePage('dashboard')}
      />
    )
  }

  // Display About Management
  if (activePage === 'about') {
    return (
      <div className="min-h-screen bg-slate-100 p-5 sm:p-8">
        <button
          onClick={() => setActivePage('dashboard')}
          className="mb-6 rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
        >
          ← Back to Dashboard
        </button>

        <About />
      </div>
    )
  }

  // Display Experience Management
  if (activePage === 'experience') {
    return (
      <Experience
        onBack={() => setActivePage('dashboard')}
      />
    )
  }

  // Display Blogs Management
  if (activePage === 'blogs') {
    return (
      <div className="min-h-screen bg-slate-100 p-5 sm:p-8">
        <button
          onClick={() => setActivePage('dashboard')}
          className="mb-6 rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
        >
          ← Back to Dashboard
        </button>

        <Blogs />
      </div>
    )
  }

  // Display Media Management
  if (activePage === 'media') {
    return (
      <div className="min-h-screen bg-slate-100 p-5 sm:p-8">
        <button
          onClick={() => setActivePage('dashboard')}
          className="mb-6 rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
        >
          ← Back to Dashboard
        </button>

        <Media />
      </div>
    )
  }

  // Display Messages Management
  if (activePage === 'messages') {
    return (
      <Messages
        onBack={() => setActivePage('dashboard')}
      />
    )
  }

  // Dashboard statistics
  const statistics = [
    {
      title: 'Projects',
      value: stats?.projects,
      icon: '📁',
    },
    {
      title: 'Skills',
      value: stats?.skills,
      icon: '💻',
    },
    {
      title: 'Blogs',
      value: stats?.blogs,
      icon: '📝',
    },
    {
      title: 'Messages',
      value: stats?.messages,
      icon: '📩',
    },
  ]

  return (
    <div className="flex min-h-screen bg-slate-100">

      {/* Sidebar */}
      <aside className="hidden w-64 flex-shrink-0 flex-col bg-slate-950 p-6 text-white md:flex">

        {/* Logo */}
        <div className="mb-12 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-600 text-xl font-bold">
            P
          </div>

          <span className="text-xl font-bold">
            Portfolio CMS
          </span>
        </div>

        <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-500">
          Main Menu
        </p>

        {/* Navigation */}
        <nav className="space-y-2">

          <button
            onClick={() => setActivePage('dashboard')}
            className={`w-full rounded-lg px-4 py-3 text-left font-medium transition ${
              activePage === 'dashboard'
                ? 'bg-violet-600 text-white'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            📊 Dashboard
          </button>

          {modules.map((module) => (
            <a
              key={module.id}
              href={`#${module.id}`}
              onClick={(event) =>
                handleModuleClick(event, module.id)
              }
              className={`block rounded-lg px-4 py-3 transition ${
                activePage === module.id
                  ? 'bg-violet-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {module.icon} {module.name}
            </a>
          ))}

        </nav>

        {/* Logout */}
        <div className="mt-auto border-t border-slate-800 pt-6">
          <button
            onClick={onLogout}
            className="w-full rounded-lg px-4 py-3 text-left font-medium text-red-400 transition hover:bg-red-500/10"
          >
            ↪ Sign Out
          </button>
        </div>

      </aside>

      {/* Main Content */}
      <main
        id="overview"
        className="min-w-0 flex-1 p-5 sm:p-8"
      >

        {/* Header */}
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">

          <div>
            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              Dashboard Overview
            </h1>

            <p className="mt-2 text-slate-500">
              Manage your portfolio from one place.
            </p>
          </div>

          {/* Admin Profile */}
          <div className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm">

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 font-bold text-violet-700">
              {admin?.name?.charAt(0).toUpperCase() || 'A'}
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-800">
                {admin?.name || 'Administrator'}
              </p>

              <p className="text-xs text-slate-500">
                {admin?.email || 'Admin Account'}
              </p>
            </div>

          </div>

        </header>

        {/* Welcome Section */}
        <section className="mb-8 rounded-2xl bg-gradient-to-r from-violet-700 to-indigo-700 p-7 text-white shadow-lg">

          <p className="text-sm font-medium text-violet-200">
            PORTFOLIO CMS ADMIN PANEL
          </p>

          <h2 className="mt-3 text-2xl font-bold sm:text-3xl">
            Welcome back, {admin?.name || 'Admin'}! 👋
          </h2>

          <p className="mt-3 max-w-xl text-sm leading-6 text-violet-100">
            Your portfolio management workspace is ready.
            Manage your website content from one secure dashboard.
          </p>

        </section>

        {/* Statistics */}
        <section className="mb-8">

          <div className="mb-5">
            <h2 className="text-xl font-bold text-slate-900">
              Portfolio Statistics
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Live information retrieved from your PostgreSQL database.
            </p>
          </div>

          {loading ? (
            <div className="rounded-xl bg-white p-8 text-center shadow-sm">
              <p className="font-medium text-violet-600">
                Loading dashboard statistics...
              </p>
            </div>
          ) : error ? (
            <div className="rounded-xl bg-red-50 p-6 text-red-700">
              <p>{error}</p>

              <button
                onClick={() => window.location.reload()}
                className="mt-3 font-semibold underline"
              >
                Refresh Dashboard
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

              {statistics.map((item) => (
                <div
                  key={item.title}
                  className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >

                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-500">
                      {item.title}
                    </p>

                    <span className="text-2xl">
                      {item.icon}
                    </span>
                  </div>

                  <h3 className="mt-4 text-3xl font-bold text-slate-900">
                    {item.value ?? 0}
                  </h3>

                </div>
              ))}

            </div>
          )}

        </section>

        {/* Backend Status */}
        <section className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

          <h2 className="mb-4 text-lg font-bold text-slate-900">
            System Status
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">

            {/* Backend API */}
            <div className="flex items-center gap-3">
              <span className="h-3 w-3 rounded-full bg-green-500" />

              <div>
                <p className="font-semibold text-slate-800">
                  Backend API
                </p>

                <p className="text-sm text-slate-500">
                  API requests configured
                </p>
              </div>
            </div>

            {/* Authentication */}
            <div className="flex items-center gap-3">
              <span className="h-3 w-3 rounded-full bg-green-500" />

              <div>
                <p className="font-semibold text-slate-800">
                  Authentication
                </p>

                <p className="text-sm text-slate-500">
                  JWT session active
                </p>
              </div>
            </div>

          </div>

        </section>

        {/* Content Management */}
        <section>

          <div className="mb-5">
            <h2 className="text-xl font-bold text-slate-900">
              Content Management
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Select a module to manage your portfolio content.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">

            {modules.map((module) => (
              <a
                key={module.id}
                href={`#${module.id}`}
                onClick={(event) =>
                  handleModuleClick(event, module.id)
                }
                className="group rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-violet-300 hover:shadow-lg"
              >

                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 text-2xl">
                  {module.icon}
                </div>

                <h3 className="text-lg font-bold text-slate-900">
                  {module.name}
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  {module.description}
                </p>

                <p className="mt-5 text-sm font-semibold text-violet-600">
                  Management module →
                </p>

              </a>
            ))}

          </div>

        </section>

        {/* Footer */}
        <footer className="mt-10 border-t border-slate-200 py-6 text-center text-sm text-slate-500">
          © 2026 Portfolio CMS. Built with React, TypeScript and Tailwind CSS.
        </footer>

      </main>

    </div>
  )
}

export default Dashboard
