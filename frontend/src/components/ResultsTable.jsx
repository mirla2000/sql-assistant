export default function ResultsTable({ columns, rows, rowCount }) {
  function downloadCsv() {
    const header = columns.join(',')
    const body = rows
      .map(row =>
        row
          .map(val => {
            if (val === null || val === undefined) return ''
            const str = String(val)
            return str.includes(',') || str.includes('"') || str.includes('\n')
              ? `"${str.replace(/"/g, '""')}"`
              : str
          })
          .join(',')
      )
      .join('\n')
    const blob = new Blob([header + '\n' + body], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `query_results_${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!columns.length) return null

  return (
    <div className="results-table-wrap">
      <div className="results-meta">
        <span className="results-count">{rowCount} row{rowCount !== 1 ? 's' : ''}</span>
        <button className="csv-btn" onClick={downloadCsv}>⬇ Download CSV</button>
      </div>
      <div className="table-scroll">
        {rows.length === 0 ? (
          <div className="no-results">No rows returned</div>
        ) : (
          <table>
            <thead>
              <tr>{columns.map(col => <th key={col}>{col}</th>)}</tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i}>
                  {row.map((val, j) => (
                    <td key={j} title={val === null ? 'NULL' : String(val)}>
                      {val === null ? <span style={{ color: 'var(--text-muted)' }}>NULL</span> : String(val)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
