import { useState, useRef, useEffect, useCallback } from 'react'
import ChatInput from './components/ChatInput'
import DashboardInput from './components/DashboardInput'
import ChatMessage from './components/ChatMessage'
import DashboardGrid from './components/DashboardGrid'
import QueryHistory from './components/QueryHistory'

function DatabasePanel({ schema }) {
  if (!schema) return <div className="db-loading"><div className="spinner" /><p>Loading schema…</p></div>
  return (
    <div className="db-panel">
      <h2 className="db-title">Database Schema</h2>
      <pre className="db-schema">{schema}</pre>
    </div>
  )
}

export default function App() {
  const [mode, setMode] = useState('chat')
  const [messages, setMessages] = useState([])
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(false)
  const [dashboardSpec, setDashboardSpec] = useState(null)
  const [dashboardLoading, setDashboardLoading] = useState(false)
  const [dashboardError, setDashboardError] = useState(null)
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark')
  const [chatExample, setChatExample] = useState({ q: '', k: 0 })
  const [dashExample, setDashExample] = useState({ q: '', k: 0 })
  const [dbSchema, setDbSchema] = useState(null)
  const threadRef = useRef(null)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  useEffect(() => {
    if (mode === 'database' && !dbSchema) {
      fetch('/api/schema').then(r => r.json()).then(d => setDbSchema(d.schema)).catch(() => setDbSchema('Failed to load schema.'))
    }
  }, [mode, dbSchema])

  const fillChat = useCallback((q) => { setMode('chat'); setChatExample(p => ({ q, k: p.k + 1 })) }, [])
  const fillDash = useCallback((q) => { setMode('dashboard'); setDashExample(p => ({ q, k: p.k + 1 })) }, [])

  useEffect(() => {
    if (threadRef.current) threadRef.current.scrollTop = threadRef.current.scrollHeight
  }, [messages])

  function buildHistory(msgs) {
    return msgs
      .filter(m => !m.loading && !(m.role === 'assistant' && m.error))
      .map(m => ({ role: m.role, content: m.role === 'assistant' ? (m.sql || '') : m.content }))
  }

  async function handleQuery(question) {
    const history = buildHistory(messages)
    const userMsg = { id: crypto.randomUUID(), role: 'user', content: question }
    const loadingId = crypto.randomUUID()
    const loadingMsg = { id: loadingId, role: 'assistant', loading: true }
    setMessages(prev => [...prev, userMsg, loadingMsg])
    setLoading(true)
    try {
      const res = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, history }),
      })
      const data = await res.json()
      setMessages(prev => prev.map(m => m.id === loadingId ? {
        id: loadingId, role: 'assistant', loading: false,
        content: data.sql || '', sql: data.sql || '',
        columns: data.columns || [], rows: data.rows || [],
        row_count: data.row_count || 0, error: data.error || null,
      } : m))
    } catch {
      setMessages(prev => prev.map(m => m.id === loadingId ? {
        id: loadingId, role: 'assistant', loading: false,
        content: '', sql: '', columns: [], rows: [], row_count: 0,
        error: 'Network error — is the backend running?',
      } : m))
    } finally {
      setLoading(false)
    }
  }

  function handleNewChat() {
    if (messages.length > 0) {
      const firstQuestion = messages.find(m => m.role === 'user')?.content || 'Untitled'
      setConversations(prev => [{ id: crypto.randomUUID(), messages: [...messages], firstQuestion, timestamp: new Date() }, ...prev])
    }
    setMessages([])
  }

  function handleSelectConversation(conv) {
    if (messages.length > 0) {
      const firstQuestion = messages.find(m => m.role === 'user')?.content || 'Untitled'
      setConversations(prev => {
        const alreadySaved = prev.some(c => c.messages === messages)
        if (alreadySaved) return prev
        return [{ id: crypto.randomUUID(), messages: [...messages], firstQuestion, timestamp: new Date() }, ...prev]
      })
    }
    setMessages([...conv.messages])
    setMode('chat')
  }

  async function runChart(id, sql) {
    try {
      const res = await fetch('/api/chart/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, sql }),
      })
      const data = await res.json()
      setDashboardSpec(prev => prev ? {
        ...prev,
        charts: prev.charts.map(c => c.id === id ? { ...c, ...data, loading: false } : c),
      } : prev)
    } catch {
      setDashboardSpec(prev => prev ? {
        ...prev,
        charts: prev.charts.map(c => c.id === id ? { ...c, error: 'Network error', loading: false } : c),
      } : prev)
    }
  }

  async function handleDashboard(description) {
    setDashboardLoading(true)
    setDashboardSpec(null)
    setDashboardError(null)
    try {
      const res = await fetch('/api/dashboard/spec', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || data.error || `HTTP ${res.status}`)
      if (!data.charts) throw new Error('No charts in response: ' + JSON.stringify(data).slice(0, 200))
      setDashboardSpec({
        ...data,
        charts: data.charts.map(c => ({ ...c, loading: true, columns: [], rows: [], row_count: 0 })),
      })
      setDashboardLoading(false)
      data.charts.forEach(chart => runChart(chart.id, chart.sql))
    } catch (e) {
      setDashboardLoading(false)
      setDashboardError(e.message)
    }
  }

  function handleRetryChart(chart) {
    setDashboardSpec(prev => prev ? {
      ...prev,
      charts: prev.charts.map(c => c.id === chart.id ? { ...c, loading: true, error: null } : c),
    } : prev)
    runChart(chart.id, chart.sql)
  }

  const NAV = [
    { id: 'chat',      icon: '💬', label: 'Chat' },
    { id: 'dashboard', icon: '📊', label: 'Dashboard' },
    { id: 'database',  icon: '🗄️',  label: 'Database' },
  ]

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-header">
          <span className="logo">⚡ SQL Assistant</span>
        </div>

        <nav className="sidebar-nav">
          {NAV.map(item => (
            <button
              key={item.id}
              className={`nav-item${mode === item.id ? ' active' : ''}`}
              onClick={() => setMode(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {mode === 'chat' && (
          <div className="sidebar-section">
            <div className="sidebar-section-header">
              <span>History</span>
              <button className="new-chat-btn" onClick={handleNewChat}>+ New</button>
            </div>
            <QueryHistory conversations={conversations} onSelect={handleSelectConversation} />
          </div>
        )}
      </aside>

      <main className="main">
        <div className="main-header">
          <div className="main-header-title">
            {mode === 'chat' && 'Chat'}
            {mode === 'dashboard' && 'Dashboard'}
            {mode === 'database' && 'Database'}
          </div>
          <button className="theme-toggle" onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}>
            {theme === 'dark' ? '☀ Light' : '☾ Dark'}
          </button>
        </div>

        <div className="content" ref={mode === 'chat' ? threadRef : null}>
          {mode === 'chat' ? (
            messages.length === 0 ? (
              <div className="empty-state">
                <h2>Ask anything about your data</h2>
                <p>Type a question in plain English — no SQL knowledge needed.</p>
                <div className="example-cards">
                  <button className="example-card" onClick={() => fillChat('Show me daily subscriptions last 7 days')}>
                    <span className="example-card-icon">📈</span>
                    <span className="example-card-title">Subscription trends</span>
                    <span className="example-card-desc">Daily subscriptions for the last 7 days</span>
                  </button>
                  <button className="example-card" onClick={() => fillChat('Show Facebook adset performance last 30 days: spend, subscriptions, CAC, avg LTV, ROI')}>
                    <span className="example-card-icon">📱</span>
                    <span className="example-card-title">Facebook adsets</span>
                    <span className="example-card-desc">Spend, CAC, LTV and ROI per adset</span>
                  </button>
                  <button className="example-card" onClick={() => fillChat('Total revenue by subscription plan last 30 days')}>
                    <span className="example-card-icon">💰</span>
                    <span className="example-card-title">Revenue by plan</span>
                    <span className="example-card-desc">Breakdown by 1-week, 4-week, 12-week plans</span>
                  </button>
                  <button className="example-card" onClick={() => fillChat('What quiz answers have the highest subscription rate last 30 days?')}>
                    <span className="example-card-icon">🧠</span>
                    <span className="example-card-title">Quiz insights</span>
                    <span className="example-card-desc">Which answers drive the most subscriptions</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="chat-thread">
                {messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
              </div>
            )
          ) : mode === 'dashboard' ? (
            dashboardLoading ? (
              <div className="dashboard-loading">
                <div className="spinner" />
                <p>Building dashboard spec…</p>
              </div>
            ) : dashboardSpec ? (
              <DashboardGrid spec={dashboardSpec} onRetry={handleRetryChart} />
            ) : dashboardError ? (
              <div className="empty-state">
                <h2>Failed to build dashboard</h2>
                <div className="error-box">{dashboardError}</div>
              </div>
            ) : (
              <div className="empty-state">
                <h2>AI-generated dashboards</h2>
                <p>Describe what you want to see and get a multi-chart dashboard instantly.</p>
                <div className="example-cards">
                  <button className="example-card" onClick={() => fillDash('Weekly subscriptions, revenue, and CPA for last 30 days')}>
                    <span className="example-card-icon">📊</span>
                    <span className="example-card-title">Growth overview</span>
                    <span className="example-card-desc">Weekly subscriptions, revenue and CPA</span>
                  </button>
                  <button className="example-card" onClick={() => fillDash('Facebook adset performance last 30 days: spend, subscriptions, CAC, LTV, ROI, funnel metrics')}>
                    <span className="example-card-icon">📱</span>
                    <span className="example-card-title">Facebook performance</span>
                    <span className="example-card-desc">Full adset table with spend, CAC and ROI</span>
                  </button>
                  <button className="example-card" onClick={() => fillDash('Current month risk dashboard: VAMP rate, Visa fraud rate, Mastercard chargeback rate as KPI cards')}>
                    <span className="example-card-icon">⚠️</span>
                    <span className="example-card-title">Risk metrics</span>
                    <span className="example-card-desc">VAMP, fraud rate and chargeback KPIs</span>
                  </button>
                  <button className="example-card" onClick={() => fillDash('Funnel conversion from landing page to subscription by geo T1 vs WW last 30 days')}>
                    <span className="example-card-icon">🌍</span>
                    <span className="example-card-title">Geo funnel</span>
                    <span className="example-card-desc">T1 vs WW conversion and subscription rates</span>
                  </button>
                </div>
              </div>
            )
          ) : (
            <DatabasePanel schema={dbSchema} />
          )}
        </div>

        {mode === 'chat' && (
          <ChatInput key={chatExample.k} initialValue={chatExample.q} onSubmit={handleQuery} loading={loading} />
        )}
        {mode === 'dashboard' && (
          <DashboardInput key={dashExample.k} initialValue={dashExample.q} onSubmit={handleDashboard} loading={dashboardLoading} />
        )}
      </main>
    </div>
  )
}
