export default function StatCard({ icon: Icon, value, label, color = 'mint' }) {
  return (
    <div className="stat-card">
      <div className={`stat-card-icon ${color}`}>
        <Icon size={22} />
      </div>
      <div className="stat-card-value">{value}</div>
      <div className="stat-card-label">{label}</div>
    </div>
  )
}