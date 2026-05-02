import SqlPanel from './SqlPanel'
import ResultsTable from './ResultsTable'

export default function ChatMessage({ message }) {
  if (message.role === 'user') {
    return (
      <div className="chat-msg user">
        <div className="user-bubble">{message.content}</div>
      </div>
    )
  }

  if (message.loading) {
    return (
      <div className="chat-msg assistant">
        <div className="loading-bubble">
          <div className="spinner small" />
          <span>Generating query and fetching results…</span>
        </div>
      </div>
    )
  }

  return (
    <div className="chat-msg assistant">
      <div className="assistant-bubble">
        {message.error ? (
          <div className="error-box">{message.error}</div>
        ) : (
          <>
            <SqlPanel sql={message.sql} />
            <ResultsTable
              columns={message.columns}
              rows={message.rows}
              rowCount={message.row_count}
            />
          </>
        )}
      </div>
    </div>
  )
}
