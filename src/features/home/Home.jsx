import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { t } from '../../strings/en'
import { useStore } from '../../lib/data'
import { useNow, isNight, fmtDT, agoText } from '../../lib/time'
import { cageView, suggestion } from '../../lib/status'
import { prepState } from '../../lib/report'
import { StatusBadge, FreshBadge, CameraPlaceholder, Drawer, EmptyState, Icon } from '../../components/ui'

function PigDrawer({ cage, v, onClose }) {
  const open = new Set(v.open.map((a) => a.pig_id))
  return <Drawer title={t.home.pigDrawer(cage.name)} onClose={onClose}><ul className="list">{v.pigs.map((p) => <li className="li" key={p.id}>
    <span><b>{p.tag}</b><br /><span className="cap">{p.sex} · {p.age_weeks} {t.home.wk} · {p.weight_kg} kg</span></span>
    <span className={`chip ${open.has(p.id) ? 'watch' : 'normal'}`}><Icon n={open.has(p.id) ? 'eye' : 'check'} size={16} />{open.has(p.id) ? t.home.check : t.home.ok}</span></li>)}</ul></Drawer>
}
export default function Home() {
  const s = useStore(), now = useNow(), nav = useNavigate(), [dr, setDr] = useState(null)
  if (!s.cages.length) return <EmptyState text={t.home.empty} />
  const vs = s.cages.map((c) => [c, cageView(s, c, now, isNight)])
  const pigs = vs.reduce((n, [, v]) => n + v.pigs.length, 0), open = vs.reduce((n, [, v]) => n + v.open.length, 0)
  const prep = (id) => nav('/report', { state: prepState(s, id) })
  return <>
    <div><h1>{t.home.title}</h1><p className="sub">{t.home.summary(vs.length, pigs, open)}</p></div>
    {vs.map(([c, v]) => { const sg = suggestion(c, v.tier, s.reports); return sg && <div key={'s' + c.id} className="card" role="status" style={{ borderColor: 'var(--pink-600)' }}><div className="flex" style={{ justifyContent: 'space-between' }}><span>{sg === 'new' ? t.home.sugNew(c.name, t.tier[v.tier]) : t.home.sugFollow(c.name)}</span><button className="btn primary" onClick={() => prep(c.id)}>{t.home.prep}</button></div></div> })}
    {vs.map(([c, v]) => { const off = v.fresh.state === 'offline', w = v.pigs.length ? Math.round(v.pigs.reduce((a, p) => a + p.weight_kg, 0) / v.pigs.length) : 0, ag = v.pigs.map((p) => p.age_weeks)
      return <div className="row" key={c.id}>
        <Link className="rowlabel" to={`/cages?cage=${c.id}`} aria-label={`${t.home.openCam} ${c.name}`}>{c.name}</Link>
        <div className="card">
          <div className="flex"><StatusBadge tier={v.tier} /><span className="cap">{t.statusCap}</span><FreshBadge state={v.fresh.state} /><span className="cap">{agoText(v.fresh.age)}</span></div>
          <div className={`grid4 ${v.fresh.state === 'stale' ? 'dim' : ''}`}>{off ? <span>{t.noData}</span> : <>
            <div className="val"><span className="cap">{t.home.temp}</span><b>{v.last.temperature_c} °C</b></div><div className="val"><span className="cap">{t.home.hum}</span><b>{v.last.humidity_pct} %</b></div>
            <div className="val"><span className="cap">{t.home.act}</span><b>{v.last.activity_index}</b></div><div className="val"><span className="cap">{t.home.feed}</span><b>{v.last.feeding_index}</b></div></>}</div>
          <div className="flex"><CameraPlaceholder size="sm" ok={c.camera_ok} />
            <div><div><b>{t.home.camState}:</b> <Icon n={c.camera_ok ? 'camera' : 'cameraOff'} size={14} /> {c.camera_ok ? t.cam.online : t.cam.offline}</div><div><b>{t.home.open}:</b> {v.open.length}</div>
              <div><b>{t.home.pigs}:</b> {v.pigs.length} · {t.home.avgW} {w} kg · {t.home.ages} {Math.min(...ag)}–{Math.max(...ag)} {t.home.wk}</div></div></div>
          {v.open.length > 0 && <p className="cap">{t.flag}</p>}
          <div className="flex" style={{ marginTop: 12 }}><button className="btn" onClick={() => setDr(c.id)}>{t.home.viewPigs}</button><button className="btn" onClick={() => nav(`/cages?cage=${c.id}`)}>{t.home.openCam}</button><button className="btn primary" onClick={() => prep(c.id)}>{t.home.prep}</button></div>
        </div></div> })}
    {dr && <PigDrawer cage={s.cages.find((c) => c.id === dr)} v={vs.find(([c]) => c.id === dr)[1]} onClose={() => setDr(null)} />}
  </>
}
