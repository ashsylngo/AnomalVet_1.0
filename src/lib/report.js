import { agoText } from './time'
export const compose = (tpl, v) => tpl.replace(/\{(\w+)\}/g, (_, k) => (k in v ? v[k] : ''))
export const readingsText = (r, ageS) => `temperature ${r.temperature_c} °C, humidity ${r.humidity_pct} %, activity ${r.activity_index}, feeding ${r.feeding_index} (${agoText(ageS)})`
export function prepState(s, cageId) {
  const a = s.anomalies.find((x) => x.cage_id === cageId && x.status === 'open')
  return a ? { cage: cageId, pig: a.pig_id || '', sign: a.sign, details: a.note } : { cage: cageId }
}
