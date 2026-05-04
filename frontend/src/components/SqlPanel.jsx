import { useState, useCallback } from 'react'

export default function SqlPanel({ sql }) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const copy = useCallback(() => {
    navigator.clipboard.writeText(sql).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }, [sql])

  if (!sql) return null

  return (
    <div className="sql-panel">
      <div className="sql-panel-header" onClick={() => setOpen(o => !o)}>
        <span className="sql-label">Generated SQL</span>
        <span className="sql-toggle">{open ? '▲ Hide' : '▼ Show'}</span>
      </div>
      {open && (
        <>
          <div className="sql-expand-header">
            <button className={`copy-sql-btn${copied ? ' copied' : ''}`} onClick={e => { e.stopPropagation(); copy() }}>
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          </div>
          <pre className="sql-code">{sql}</pre>
        </>
      )}
    </div>
  )
}
