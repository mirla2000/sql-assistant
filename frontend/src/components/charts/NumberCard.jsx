function fmt(val) {
  const n = Number(val)
  if (isNaN(n)) return String(val)
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return n % 1 === 0 ? n.toLocaleString() : n.toFixed(2)
}

export default function NumberCard({ columns, rows }) {
  if (!rows?.length || !columns?.length) return null

  const entries = columns
    .map((col, i) => ({ label: col, value: rows[0][i] }))
    .filter(({ value }) => value !== null && !isNaN(Number(value)))
    .slice(0, 4)

  if (entries.length === 0) {
    return <div className="kpi-number">{String(rows[0][0])}</div>
  }

  if (entries.length === 1) {
    return (
      <div className="kpi-single">
        <div className="kpi-number">{fmt(entries[0].value)}</div>
        <div className="kpi-label">{entries[0].label}</div>
      </div>
    )
  }

  return (
    <div className="kpi-multi">
      {entries.map(({ label, value }) => (
        <div key={label} className="kpi-item">
          <div className="kpi-value">{fmt(value)}</div>
          <div className="kpi-label">{label}</div>
        </div>
      ))}
    </div>
  )
}
