import { useState, useCallback } from 'react'

function useCopyButton() {
  const [copied, setCopied] = useState(false)
  const copy = useCallback((text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }, [])
  return [copied, copy]
}

function formatSql(sql) {
  if (!sql) return ''
  // Preserve string literals before lowercasing so values like UUIDs stay intact
  const literals = []
  const masked = sql.replace(/'[^']*'/g, match => {
    literals.push(match)
    return `\x00LIT${literals.length - 1}\x00`
  })
  const s = masked
    .toLowerCase()
    .trim()
    .replace(/\bunion all\b/g, '\nunion all\n')
    .replace(/\bleft join\b/g, '\nleft join')
    .replace(/\bright join\b/g, '\nright join')
    .replace(/\binner join\b/g, '\ninner join')
    .replace(/(?<!\bleft |\bright |\binner )\bjoin\b/g, '\njoin')
    .replace(/\bwhere\b/g, '\nwhere')
    .replace(/\band\s+/g, '\n  and ')
    .replace(/\bgroup by\b/g, '\ngroup by')
    .replace(/\border by\b/g, '\norder by')
    .replace(/\bhaving\b/g, '\nhaving')
    .replace(/\blimit\b/g, '\nlimit')
    .replace(/^\n+/, '')
  return s.replace(/\x00lit(\d+)\x00/g, (_, i) => literals[parseInt(i)])
}

const PAGE_SIZES = [10, 25, 50, 100]

export default function ResultsTable({ sql, columns, rows, rowCount }) {
  const [sqlOpen, setSqlOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [copied, copy] = useCopyButton()

  function downloadCsv() {
    const header = columns.join(',')
    const body = rows.map(row =>
      row.map(val => {
        if (val === null || val === undefined) return ''
        const str = String(val)
        return str.includes(',') || str.includes('"') || str.includes('\n')
          ? `"${str.replace(/"/g, '""')}"` : str
      }).join(',')
    ).join('\n')
    const blob = new Blob([header + '\n' + body], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `results_${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!columns.length) return null

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const start = (safePage - 1) * pageSize
  const pageRows = rows.slice(start, start + pageSize)

  function getPageNumbers() {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)
    const pages = [1]
    if (safePage > 3) pages.push('...')
    for (let i = Math.max(2, safePage - 1); i <= Math.min(totalPages - 1, safePage + 1); i++) pages.push(i)
    if (safePage < totalPages - 2) pages.push('...')
    pages.push(totalPages)
    return pages
  }

  return (
    <div className="results-wrap">
      <div className="results-header">
        <div className="results-header-left">
          {sql && (
            <button className={`view-sql-btn${sqlOpen ? ' active' : ''}`} onClick={() => setSqlOpen(o => !o)}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="3" width="12" height="1.5" rx="0.75" fill="currentColor"/><rect x="1" y="6.25" width="12" height="1.5" rx="0.75" fill="currentColor"/><rect x="1" y="9.5" width="8" height="1.5" rx="0.75" fill="currentColor"/></svg>
              View SQL
              <span className="vsql-arrow">{sqlOpen ? '▲' : '▼'}</span>
            </button>
          )}
          <span className="results-count">{(rowCount || rows.length).toLocaleString()} rows</span>
        </div>
        <button className="csv-btn" onClick={downloadCsv}>↓ Download CSV</button>
      </div>

      {sqlOpen && sql && (
        <div className="sql-expand">
          <div className="sql-expand-header">
            <button className={`copy-sql-btn${copied ? ' copied' : ''}`} onClick={() => copy(sql)}>
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          </div>
          <pre className="sql-code">{formatSql(sql)}</pre>
        </div>
      )}

      <div className="table-scroll">
        {rows.length === 0 ? (
          <div className="no-results">No rows returned</div>
        ) : (
          <table>
            <thead>
              <tr>{columns.map(col => <th key={col}>{col}</th>)}</tr>
            </thead>
            <tbody>
              {pageRows.map((row, i) => (
                <tr key={i}>
                  {row.map((val, j) => (
                    <td key={j} title={val === null ? 'NULL' : String(val)}>
                      {val === null ? <span className="null-val">NULL</span> : String(val)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {rows.length > pageSize && (
        <div className="pagination">
          <label className="page-size">
            Show
            <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1) }}>
              {PAGE_SIZES.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </label>
          <div className="page-controls">
            <button onClick={() => setPage(1)} disabled={safePage === 1}>«</button>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={safePage === 1}>‹</button>
            {getPageNumbers().map((p, i) =>
              p === '...'
                ? <span key={`e${i}`} className="page-ellipsis">…</span>
                : <button key={p} className={safePage === p ? 'page-btn active' : 'page-btn'} onClick={() => setPage(p)}>{p}</button>
            )}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}>›</button>
            <button onClick={() => setPage(totalPages)} disabled={safePage === totalPages}>»</button>
          </div>
          <span className="page-info">
            {(start + 1).toLocaleString()}–{Math.min(start + pageSize, rows.length).toLocaleString()} of {rows.length.toLocaleString()}
          </span>
        </div>
      )}
    </div>
  )
}
