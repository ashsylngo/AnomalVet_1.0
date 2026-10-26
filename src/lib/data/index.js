import { useSyncExternalStore } from 'react'
import { hrOf, isNight } from '../time'
import { compose, readingsText } from '../report'
import { cageTier } from '../status'

const KEY = 'anomalvet.demo.v1', MIN = 6e4, HR = 36e5
const iso = (m) => new Date(m).toISOString()
const prng = (a) => () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296 }
const rnd = prng(Date.now())
const SIGNS = [['not_eating', 'Not eating'], ['low_activity', 'Low activity'], ['isolated', 'Isolated from the group'], ['huddling', 'Huddling'], ['coughing', 'Coughing'], ['limping', 'Limping'], ['skin', 'Skin redness or spots'], ['droppings', 'Unusual droppings'], ['other', 'Other']]
const TEMPLATE = 'ANOMALVET REPORT ({SEVERITY}) from {FARM}. Cage: {CAGE}. Pig: {PIG}. Observed signs: {SIGNS}. Details: {DETAILS}. Latest readings: {READINGS}. Created: {CREATED_AT}. This is an automated demo report, not a diagnosis.'

const curve = (ts, r) => {
  const h = hrOf(ts), d = !isNight(ts), w = Math.sin(((h - 9) / 24) * 6.283)
  const f = [7, 12, 17].reduce((a, x) => a + 22 * Math.exp(-((h - x) ** 2) / 1.2), 0)
  return { temperature_c: +(27.6 + 1.3 * w + (r() - 0.5) * 0.4).toFixed(1), humidity_pct: Math.round(67 - 6 * w + (r() - 0.5) * 4), activity_index: Math.round(d ? 62 + 10 * Math.sin(((h - 6) / 13) * 3.1416) + (r() - 0.5) * 8 : 32 + (r() - 0.5) * 6), feeding_index: Math.min(100, Math.round(68 + f + (r() - 0.5) * 5)) }
}

export function build(now) {
  const r = prng(20261026)
  const settings = { temp_watch_c: 30, temp_alert_c: 32, activity_watch: 35, activity_alert: 20, feeding_watch: 60, feeding_alert: 40, night_factor: 0.6, stale_multiplier: 3, heartbeat_limit_s: 600, is_confirmed: false }
  const cages = [1, 2, 3].map((i) => ({ id: 'c' + i, name: 'C' + i, pig_capacity: 10, expected_interval_s: 60, last_seen: iso(now - i * 8000), camera_ok: true, since: i === 2 ? now - 30 * MIN : null, followup: false, silent: null }))
  const pigs = []
  cages.forEach((c, ci) => { for (let k = 1; k <= 10; k++) { const age = 8 + Math.floor(r() * 17); pigs.push({ id: `${c.id}-p${k}`, cage_id: c.id, tag: `PIG-C${ci + 1}-${String(k).padStart(2, '0')}`, sex: r() < 0.5 ? 'F' : 'M', age_weeks: age, weight_kg: Math.round(20 + (age - 8) * 4.2 + r() * 6) }) } })
  const readings = {}
  cages.forEach((c, ci) => {
    readings[c.id] = []
    for (let n = 143; n >= 0; n--) {
      const ts = now - n * 10 * MIN, p = curve(ts, r)
      if ((ci === 0 && n >= 52 && n <= 57) || (ci === 2 && n >= 88 && n <= 93)) p.activity_index = Math.max(8, p.activity_index - 35)
      readings[c.id].push({ id: `${c.id}-${n}`, cage_id: c.id, recorded_at: iso(ts), ...p })
    }
  })
  const A = (id, c, pk, sign, conf, ago, status, note) => ({ id, cage_id: c, pig_id: pk ? `${c}-p${pk}` : null, detected_at: iso(now - ago), sign, confidence_pct: conf, status, note })
  const anomalies = [
    A('a1', 'c2', 4, 'low_activity', 72, 25 * MIN, 'open', 'Activity below the usual range for this time of day (demo).'),
    A('a2', 'c1', null, 'low_activity', 78, 9 * HR, 'resolved', 'Short drop in activity (demo).'),
    A('a3', 'c3', 7, 'not_eating', 66, 15 * HR, 'reported', 'Feeding index dipped (demo).'),
    A('a4', 'c1', 2, 'coughing', 58, 48 * HR, 'reported', 'Coughing noted by detection (demo).'),
    A('a5', 'c2', 9, 'limping', 83, 96 * HR, 'resolved', 'Uneven walking noted (demo).'),
    A('a6', 'c3', null, 'huddling', 61, 144 * HR, 'resolved', 'Group huddled together (demo).'),
  ]
  const farm = { name: 'Demo Farm' }
  const R = (id, ago, c, pk, sev, sg, details) => {
    const t = now - ago, rd = readings[c][143 - Math.floor(ago / (10 * MIN))] || readings[c][0]
    const pig = pk ? pigs.find((p) => p.id === `${c}-p${pk}`).tag : 'Whole cage'
    const body = compose(TEMPLATE, { FARM: farm.name, CAGE: c.toUpperCase(), PIG: pig, SEVERITY: sev === 'urgent' ? 'Urgent' : 'Routine', SIGNS: sg.map((x) => SIGNS.find((s) => s[0] === x)[1]).join(', '), DETAILS: details, READINGS: readingsText(rd, 30), CREATED_AT: new Date(t).toISOString() })
    return { id, created_at: iso(t), sent_at: iso(t + 3000), sent_by: 'Demo Caretaker', cage_id: c, pig_id: pk ? `${c}-p${pk}` : null, severity: sev, sign_ids: sg, details, vet_id: 'v1', attach_snapshot: false, body, status: 'delivered' }
  }
  const reports = [R('r1', 20 * HR, 'c3', 7, 'routine', ['not_eating'], 'Ate less than usual at the morning feed'), R('r2', 46 * HR, 'c1', 2, 'urgent', ['coughing'], 'Coughing since the morning, keeps apart from others'), R('r3', 94 * HR, 'c2', 9, 'urgent', ['limping'], 'Walks unevenly, slow to stand'), R('r4', 142 * HR, 'c3', null, 'routine', ['huddling'], 'Group huddled together in the corner')]
  return {
    farm, settings, cages, pigs, readings, anomalies, reports, signs: SIGNS.map(([id, label]) => ({ id, label })), template: TEMPLATE,
    vets: [{ id: 'v1', name: 'Dr. Demo Vet (placeholder)', clinic_name: 'Demo Veterinary Clinic (placeholder)', address: 'Street address (placeholder)', phone: '0000 000 0000 (placeholder)', hours: 'Mon to Sat, 8:00 AM to 5:00 PM (placeholder)', services: 'Farm animal check-ups, vaccination, consultation (placeholder)', is_placeholder: true }],
    stores: [{ id: 's1', name: 'Demo Feed and Vet Supply Store (placeholder)', address: 'Street address (placeholder)', phone: '0000 000 0000 (placeholder)', hours: 'Mon to Sat, 7:00 AM to 6:00 PM (placeholder)', carries: 'Feed, supplements, farm supplies (placeholder)', is_placeholder: true }],
    scen: {}, ui: { delay: 0, error: false },
  }
}

let S
const subs = new Set()
const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) } catch { return null } }
const save = () => { try { localStorage.setItem(KEY, JSON.stringify({ reports: S.reports, anomalies: S.anomalies })) } catch { /* storage blocked: keep running */ } }
function init() {
  S = build(Date.now())
  const p = load()
  if (p && Array.isArray(p.reports) && Array.isArray(p.anomalies)) { S.reports = p.reports; S.anomalies = p.anomalies }
}
function emit() { S = { ...S }; save(); subs.forEach((f) => f()) }
init()

function tick() {
  const now = Date.now()
  S.cages.forEach((c) => {
    if (c.silent) return
    c.last_seen = iso(now)
    const arr = S.readings[c.id], p = arr[arr.length - 1], sc = S.scen[c.id], tg = curve(now, rnd)
    if (sc === 'alert') tg.activity_index = 12
    const mv = (a, b) => a + (b - a) * (sc ? 0.45 : 0.3) + (rnd() - 0.5) * 1.2
    const n = { id: `${c.id}-${now}`, cage_id: c.id, recorded_at: iso(now), temperature_c: +mv(p.temperature_c, tg.temperature_c).toFixed(1), humidity_pct: Math.round(mv(p.humidity_pct, tg.humidity_pct)), activity_index: Math.max(0, Math.round(mv(p.activity_index, tg.activity_index))), feeding_index: Math.min(100, Math.round(mv(p.feeding_index, tg.feeding_index))) }
    arr.push(n); if (arr.length > 144) arr.shift()
    if (sc === 'alert' && n.activity_index < 25) S.anomalies.forEach((a) => { if (a.auto && a.cage_id === c.id && a.status === 'open' && a.confidence_pct < 80) a.confidence_pct = 85 })
  })
  S.cages.forEach((c) => {
    const tier = cageTier(S.readings[c.id].at(-1), S.anomalies.filter((a) => a.cage_id === c.id), S.settings, isNight(now))
    if (tier !== 'normal' && !c.since) c.since = now
    if (tier === 'normal' && c.since) { c.followup = S.reports.some((r) => r.cage_id === c.id && Date.parse(r.created_at) >= c.since); c.since = null }
  })
  emit()
}
setInterval(tick, 5000)

const cg = (id) => S.cages.find((c) => c.id === id)
export const subscribe = (f) => { subs.add(f); return () => subs.delete(f) }
export const useStore = () => useSyncExternalStore(subscribe, () => S)
export const getState = () => S
export const splashSeen = () => { try { return sessionStorage.getItem('anomalvet.splash') === '1' } catch { return false } }
export const markSplash = () => { try { sessionStorage.setItem('anomalvet.splash', '1') } catch { /* ignore */ } }
export const setUi = (u) => { S.ui = { ...S.ui, ...u }; emit() }
export const actions = {
  anomaly(id) {
    const pig = S.pigs.filter((p) => p.cage_id === id)[3]
    S.scen[id] = 'alert'
    S.anomalies.unshift({ id: 'a' + Date.now(), cage_id: id, pig_id: pig.id, detected_at: iso(Date.now()), sign: 'low_activity', confidence_pct: 60, status: 'open', note: 'Activity falling below the usual range (demo).', auto: true })
    emit()
  },
  normal(id) { delete S.scen[id]; S.anomalies.forEach((a) => { if (a.cage_id === id && a.status === 'open') a.status = 'resolved' }); emit() },
  silent(id, mode) { const c = cg(id), s = S.settings; c.silent = mode; c.last_seen = iso(Date.now() - (mode === 'offline' ? s.heartbeat_limit_s + 60 : s.stale_multiplier * c.expected_interval_s + 20) * 1000); emit() },
  restore(id) { const c = cg(id); c.silent = null; c.last_seen = iso(Date.now()); emit() },
  camera(id, ok) { cg(id).camera_ok = ok; emit() },
  sendReport(rep) {
    const id = 'r' + Date.now(), r = { ...rep, id, created_at: iso(Date.now()), sent_at: null, sent_by: 'Demo Caretaker', status: 'queued' }
    S.reports.unshift(r); cg(rep.cage_id).followup = false; emit()
    setTimeout(() => { r.status = 'sent'; r.sent_at = iso(Date.now()); emit() }, 800 + rnd() * 800)
    setTimeout(() => { r.status = 'delivered'; emit() }, 2400 + rnd() * 800)
    return id
  },
  reset() { try { localStorage.removeItem(KEY) } catch { /* ignore */ } S = build(Date.now()); emit() },
}
