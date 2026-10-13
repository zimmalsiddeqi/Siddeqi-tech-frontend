export default function LiveBadge({ text = 'LIVE' }) {
  return (
    <span className="live-badge">
      <span className="live-badge-dot" />
      {text}
    </span>
  )
}