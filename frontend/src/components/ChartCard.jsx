import SqlPanel from './SqlPanel'
import ResultsTable from './ResultsTable'
import LineChart from './charts/LineChart'
import BarChart from './charts/BarChart'
import NumberCard from './charts/NumberCard'

function downloadCsv(chart) {
  const { columns, rows, title } = chart
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
  a.download = `${title || 'chart'}_${Date.now()}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

function renderChart(chart) {
  const { type, columns, rows, x, y } = chart
  if (type === 'number') return <NumberCard columns={columns} rows={rows} />
  if (type === 'line') return <LineChart columns={columns} rows={rows} x={x} y={y} />
  if (type === 'bar') return <BarChart columns={columns} rows={rows} x={x} y={y} />
  return <ResultsTable columns={columns} rows={rows} rowCount={chart.row_count} />
}

export default function ChartCard({ chart, onRetry }) {
  const w = chart.layout?.w || 6
  const gridColumn = `span ${w}`

  if (chart.loading) {
    return (
      <div className="chart-card" style={{ gridColumn }}>
        <div className="chart-card-header">
          <span className="chart-card-title">{chart.title}</span>
        </div>
        <div className="chart-skeleton"><div className="skeleton-shimmer" /></div>
      </div>
    )
  }

  if (chart.error) {
    return (
      <div className="chart-card" style={{ gridColumn }}>
        <div className="chart-card-header">
          <span className="chart-card-title">{chart.title}</span>
        </div>
        <div className="chart-error">
          <p className="chart-error-msg">Couldn't load this chart</p>
          <code className="chart-error-detail">{chart.error.slice(0, 180)}</code>
          <div className="chart-error-actions">
            <button className="chart-action-btn" onClick={onRetry}>↺ Retry</button>
          </div>
        </div>
        {chart.sql && <SqlPanel sql={chart.sql} />}
      </div>
    )
  }

  const hasData = chart.columns?.length > 0

  return (
    <div className="chart-card" style={{ gridColumn }}>
      <div className="chart-card-header">
        <span className="chart-card-title">{chart.title}</span>
        {hasData && (
          <button className="chart-csv-btn" onClick={() => downloadCsv(chart)}>⬇ CSV</button>
        )}
      </div>

      <div className="chart-card-body">
        {hasData ? renderChart(chart) : <div className="chart-empty">No data returned</div>}
      </div>

      {chart.sql && <SqlPanel sql={chart.sql} />}
    </div>
  )
}
