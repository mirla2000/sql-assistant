import { useState } from 'react'

export default function SqlPanel({ sql }) {
  const [open, setOpen] = useState(false)

  if (!sql) return null

  return (
    <div className="sql-panel">
      <div className="sql-panel-header" onClick={() => setOpen(o => !o)}>
        <span className="sql-label">Generated SQL</span>
        <span className="sql-toggle">{open ? '▲ Hide' : '▼ Show'}</span>
      </div>
      {open && <pre className="sql-code">{sql}</pre>}
    </div>
  )
}
