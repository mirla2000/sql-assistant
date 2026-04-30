import { useState } from 'react'
import ChatInput from './components/ChatInput'
import QueryHistory from './components/QueryHistory'
import ResultsTable from './components/ResultsTable'
import SqlPanel from './components/SqlPanel'

export default function App() {
  const [history, setHistory] = useState([])
  const [current, setCurrent] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleQuery(question) {
    setLoading(true)
    try {
      const res = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      })
      const data = await res.json()
      const entry = { question, ...data, timestamp: new Date() }
      setCurrent(entry)
      setHistory(prev => [entry, ...prev])
    } catch (err) {
      const entry = {
        question,
        sql: '',
        columns: [],
        rows: [],
        row_count: 0,
        error: 'Network error — is the backend running?',
        timestamp: new Date(),
      }
      setCurrent(entry)
      setHistory(prev => [entry, ...prev])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-header">
          <span className="logo">⚡ SQL Assistant</span>
        </div>
        <QueryHistory history={history} onSelect={setCurrent} current={current} />
      </aside>

      <main className="main">
        <div className="content">
          {!current && !loading && (
            <div className="empty-state">
              <h2>Ask anything about your data</h2>
              <p>Type a question in plain English — no SQL knowledge needed.</p>
              <div className="examples">
                <span>e.g. "Show me daily signups last month"</span>
                <span>e.g. "Top 10 customers by revenue this year"</span>
                <span>e.g. "Which campaigns had the best conversion rate?"</span>
              </div>
            </div>
          )}

          {loading && (
            <div className="loading-state">
              <div className="spinner" />
              <p>Generating query and fetching results…</p>
            </div>
          )}

          {!loading && current && (
            <div className="result">
              <div className="result-question">{current.question}</div>

              {current.error ? (
                <div className="error-box">{current.error}</div>
              ) : (
                <>
                  <SqlPanel sql={current.sql} />
                  <ResultsTable
                    columns={current.columns}
                    rows={current.rows}
                    rowCount={current.row_count}
                  />
                </>
              )}
            </div>
          )}
        </div>

        <ChatInput onSubmit={handleQuery} loading={loading} />
      </main>
    </div>
  )
}
