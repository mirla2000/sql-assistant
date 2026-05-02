export default function QueryHistory({ conversations, onSelect }) {
  if (conversations.length === 0) {
    return <div className="history-empty">No previous conversations</div>
  }

  return (
    <div className="history-list">
      {conversations.map((conv) => {
        const msgCount = conv.messages.filter(m => m.role === 'user').length
        return (
          <div
            key={conv.id}
            className="history-item"
            onClick={() => onSelect(conv)}
          >
            <div className="history-question">{conv.firstQuestion}</div>
            <div className="history-time">
              {conv.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              {' · '}{msgCount} {msgCount === 1 ? 'message' : 'messages'}
            </div>
          </div>
        )
      })}
    </div>
  )
}
