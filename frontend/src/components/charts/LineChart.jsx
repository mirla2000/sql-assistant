import {
  ResponsiveContainer, LineChart as ReLineChart,
  Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts'

const COLORS = ['#3b82f6', '#34d399', '#f59e0b', '#f87171', '#a78bfa']

export default function LineChart({ columns, rows, x, y }) {
  const xCol = x || columns[0]
  const yCols = (y?.length > 0 ? y : columns.filter(c => c !== xCol)).slice(0, 4)

  const data = rows.map(row => {
    const obj = {}
    columns.forEach((col, i) => { obj[col] = row[i] })
    return obj
  })

  return (
    <ResponsiveContainer width="100%" height={240}>
      <ReLineChart data={data} margin={{ top: 5, right: 16, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey={xCol} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
        <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} width={48} />
        <Tooltip
          contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 6, fontSize: 12 }}
          labelStyle={{ color: 'var(--text)' }}
        />
        {yCols.length > 1 && <Legend wrapperStyle={{ color: 'var(--text-muted)', fontSize: 11 }} />}
        {yCols.map((col, i) => (
          <Line key={col} type="monotone" dataKey={col}
            stroke={COLORS[i % COLORS.length]} dot={false} strokeWidth={2} />
        ))}
      </ReLineChart>
    </ResponsiveContainer>
  )
}
