import { useState, useRef, useEffect } from 'react'
import ChatInput from './components/ChatInput'
import ChatMessage from './components/ChatMessage'
import QueryHistory from './components/QueryHistory'

export default function App() {
  const [messages, setMessages] = useState([])
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(false)
  const threadRef = useRef(null)

  useEffect(() => {
    if (threadRef.current) {
      threadRef.current.scrollTop = threadRef.current.scrollHeight
    }
  }, [messages])

  function buildHistory(msgs) {
    return msgs
      .filter(m => !m.loading && !(m.role === 'assistant' && m.error))
      .map(m => ({
        role: m.role,
        content: m.role === 'assistant' ? (m.sql || '') : m.content,
      }))
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
        id: loadingId,
        role: 'assistant',
        loading: false,
        content: data.sql || '',
        sql: data.sql || '',
        columns: data.columns || [],
        rows: data.rows || [],
        row_count: data.row_count || 0,
        error: data.error || null,
      } : m))
    } catch {
      setMessages(prev => prev.map(m => m.id === loadingId ? {
        id: loadingId,
        role: 'assistant',
        loading: false,
        content: '',
        sql: '',
        columns: [],
        rows: [],
        row_count: 0,
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
        id: crypto.randomUUID(),
        messages: [...messages],
        firstQuestion,
        timestamp: new Date(),
      }, ...prev])
    }
    setMessages([])
  }

  function handleSelectConversation(conv) {
    if (messages.length > 0) {
      const firstQuestion = messages.find(m => m.role === 'user')?.content || 'Untitled'
      setConversations(prev => {
        const alreadySaved = prev.some(c => c.id !== conv.id && c.messages === messages)
        if (alreadySaved) return prev
        return [{ id: crypto.randomUUID(), messages: [...messages], firstQuestion, timestamp: new Date() }, ...prev]
      })
    }
    setMessages([...conv.messages])
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-header">
          <span className="logo">⚡ SQL Assistant</span>
          <button className="new-chat-btn" onClick={handleNewChat}>+ New chat</button>
        </div>
        <QueryHistory conversations={conversations} onSelect={handleSelectConversation} />
      </aside>

      <main className="main">
        <div className="content" ref={threadRef}>
          {messages.length === 0 ? (
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
              {messages.map(msg => (
                <ChatMessage key={msg.id} message={msg} />
              ))}
            </div>
          )}
        </div>

        <ChatInput onSubmit={handleQuery} loading={loading} />
      </main>
    </div>
  )
}
