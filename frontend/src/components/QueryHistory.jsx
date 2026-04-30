export default function QueryHistory({ history, onSelect, current }) {
  if (history.length === 0) {
    return <div className="history-empty">No queries yet</div>
  }

  return (
    <div className="history-list">
      {history.map((entry, i) => (
        <div
          key={i}
          className={`history-item ${entry === current ? 'active' : ''}`}
          onClick={() => onSelect(entry)}
        >
          <div className="history-question">
            {entry.error && <span className="history-error-dot" title="Query failed" />}
            {entry.question}
          </div>
          <div className="history-time">
            {entry.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      ))}
    </div>
  )
}
