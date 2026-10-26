const rank = { normal: 0, watch: 1, alert: 2 }
const worse = (a, b) => (rank[a] >= rank[b] ? a : b)
const hi = (v, w, a) => (v >= a ? 'alert' : v >= w ? 'watch' : 'normal')
const lo = (v, w, a) => (v < a ? 'alert' : v < w ? 'watch' : 'normal')
export function cageTier(r, anoms, s, night) {
  const f = night ? s.night_factor : 1
  let t = 'normal'
  if (r) { t = worse(t, hi(r.temperature_c, s.temp_watch_c, s.temp_alert_c)); t = worse(t, lo(r.activity_index, s.activity_watch * f, s.activity_alert * f)); t = worse(t, lo(r.feeding_index, s.feeding_watch, s.feeding_alert)) }
  const open = anoms.filter((a) => a.status === 'open')
  if (open.length) t = worse(t, 'watch')
  if (open.some((a) => a.confidence_pct >= 80)) t = 'alert'
  return t
}
export const freshness = (lastSeen, cage, s, now) => {
  const age = (now - Date.parse(lastSeen)) / 1000
  return { age, state: age > s.heartbeat_limit_s ? 'offline' : age > s.stale_multiplier * cage.expected_interval_s ? 'stale' : 'live' }
}
export function cageView(s, c, now, isNight) {
  const arr = s.readings[c.id]
  const all = s.anomalies.filter((a) => a.cage_id === c.id)
  return { last: arr[arr.length - 1], open: all.filter((a) => a.status === 'open'), pigs: s.pigs.filter((p) => p.cage_id === c.id), fresh: freshness(c.last_seen, c, s.settings, now), tier: cageTier(arr[arr.length - 1], all, s.settings, isNight(now)) }
}
export function suggestion(c, tier, reports) {
  if (tier !== 'normal' && c.since && !reports.some((r) => r.cage_id === c.id && Date.parse(r.created_at) >= c.since)) return 'new'
  if (tier === 'normal' && c.followup) return 'follow'
  return null
}
