import { useState, useRef, useEffect } from 'react'

export default function ChatInput({ onSubmit, loading, initialValue = '' }) {
  const [value, setValue] = useState(initialValue)
  const textareaRef = useRef(null)

  useEffect(() => {
    if (initialValue && textareaRef.current) {
      textareaRef.current.focus()
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
    }
  }, [])

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  function submit() {
    const q = value.trim()
    if (!q || loading) return
    setValue('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
    onSubmit(q)
  }

  function handleInput(e) {
    setValue(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = e.target.scrollHeight + 'px'
  }

  return (
    <div className="chat-input-wrap">
      <div className="chat-input-inner">
        <textarea
          ref={textareaRef}
          rows={1}
          placeholder="Ask a question about your data… (Enter to send, Shift+Enter for new line)"
          value={value}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          disabled={loading}
        />
        <button className="send-btn" onClick={submit} disabled={loading || !value.trim()}>
          {loading ? 'Running…' : 'Ask'}
        </button>
      </div>
    </div>
  )
}
