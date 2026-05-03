import ChartCard from './ChartCard'

export default function DashboardGrid({ spec, onRetry }) {
  if (!spec) return null

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">{spec.title}</h2>
      <div className="dashboard-grid">
        {spec.charts.map(chart => (
          <ChartCard key={chart.id} chart={chart} onRetry={() => onRetry(chart)} />
        ))}
      </div>
    </div>
  )
}
