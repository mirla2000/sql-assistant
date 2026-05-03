import { useState, useRef, useEffect } from 'react'
import ChatInput from './components/ChatInput'
import DashboardInput from './components/DashboardInput'
import ChatMessage from './components/ChatMessage'
import DashboardGrid from './components/DashboardGrid'
import QueryHistory from './components/QueryHistory'

export default function App() {
  const [mode, setMode] = useState('chat')
  const [messages, setMessages] = useState([])
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(false)
  const [dashboardSpec, setDashboardSpec] = useState(null)
  const [dashboardLoading, setDashboardLoading] = useState(false)
  const [dashboardError, setDashboardError] = useState(null)
  const threadRef = useRef(null)

  useEffect(() => {
    if (threadRef.current) {
      threadRef.current.scrollTop = threadRef.current.scrollHeight
    }
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
      setConversations(prev => [{
        id: crypto.randomUUID(), messages: [...messages], firstQuestion, timestamp: new Date(),
      }, ...prev])
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

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-header">
          <span className="logo">⚡ SQL Assistant</span>
        </div>
        <QueryHistory conversations={conversations} onSelect={handleSelectConversation} />
      </aside>

      <main className="main">
        <div className="main-header">
          <div className="mode-toggle">
            <button
              className={`mode-btn ${mode === 'chat' ? 'active' : ''}`}
              onClick={() => setMode('chat')}
            >Chat</button>
            <button
              className={`mode-btn ${mode === 'dashboard' ? 'active' : ''}`}
              onClick={() => setMode('dashboard')}
            >Dashboard</button>
          </div>
          {mode === 'chat' && (
            <button className="new-chat-btn" onClick={handleNewChat}>+ New chat</button>
          )}
        </div>

        <div className="content" ref={mode === 'chat' ? threadRef : null}>
          {mode === 'chat' ? (
            messages.length === 0 ? (
              <div className="empty-state">
                <h2>Ask anything about your data</h2>
                <p>Type a question in plain English — no SQL knowledge needed.</p>
                <div className="examples">
                  <span>e.g. "Show me daily subscriptions last 7 days"</span>
                  <span>e.g. "Which Facebook campaigns had the best CPA last 30 days?"</span>
                  <span>e.g. "What goal answers have the highest subscription rate?"</span>
                </div>
              </div>
            ) : (
              <div className="chat-thread">
                {messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
              </div>
            )
          ) : (
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
                <div className="examples">
                  <span>e.g. "Weekly subscriptions, revenue, and CPA for last 30 days"</span>
                  <span>e.g. "Facebook vs Google performance this month"</span>
                  <span>e.g. "Funnel conversion and quiz answer analysis last 30 days"</span>
                </div>
              </div>
            )
          )}
        </div>

        {mode === 'chat'
          ? <ChatInput onSubmit={handleQuery} loading={loading} />
          : <DashboardInput onSubmit={handleDashboard} loading={dashboardLoading} />
        }
      </main>
    </div>
  )
}
