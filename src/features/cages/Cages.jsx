import { useNavigate, useSearchParams } from 'react-router-dom'
import { LineChart, Line, XAxis, YAxis, ReferenceLine, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts'
import { t } from '../../strings/en'
import { useStore } from '../../lib/data'
import { useNow, isNight, fmtDT, fmtTime, agoText } from '../../lib/time'
import { cageView } from '../../lib/status'
import { prepState } from '../../lib/report'
import { StatusBadge, FreshBadge, CameraPlaceholder } from '../../components/ui'

export default function Cages() {
  const s = useStore(), now = useNow(), nav = useNavigate(), [sp, setSp] = useSearchParams()
  const id = s.cages.some((c) => c.id === sp.get('cage')) ? sp.get('cage') : s.cages[0].id
  const c = s.cages.find((x) => x.id === id), v = cageView(s, c, now, isNight), off = v.fresh.state === 'offline'
  const data = s.readings[id].map((r) => ({ label: fmtTime(Date.parse(r.recorded_at)), activity: r.activity_index }))
  const sign = (k) => s.signs.find((x) => x.id === k)?.label
  return <>
    <div className="field" style={{ maxWidth: 320 }}><label htmlFor="cs">{t.cages.pick}</label>
      <select id="cs" value={id} onChange={(e) => setSp({ cage: e.target.value })}>{s.cages.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select></div>
    <div className="cols">
      <div className="stack"><CameraPlaceholder cage={c.name} ok={c.camera_ok} />
        <div className="card"><h2>{t.cages.trend}</h2>
          <div style={{ height: 240 }} role="img" aria-label={t.cages.trend}><ResponsiveContainer><LineChart data={[...data]} margin={{ left: -16, right: 8 }}>
            <CartesianGrid stroke="#F0CBD8" /><XAxis dataKey="label" interval={23} tick={{ fontSize: 11 }} /><YAxis domain={[0, 100]} tick={{ fontSize: 11 }} /><Tooltip />
            <ReferenceLine y={s.settings.activity_watch} stroke="#7A5C00" strokeDasharray="4 3" label={{ value: t.cages.watch, fontSize: 11, position: 'insideTopRight' }} />
            <ReferenceLine y={s.settings.activity_alert} stroke="#B3261E" strokeDasharray="4 3" label={{ value: t.cages.alert, fontSize: 11, position: 'insideBottomRight' }} />
            <Line type="monotone" dataKey="activity" stroke="#B82A5A" dot={false} strokeWidth={2} isAnimationActive={false} /></LineChart></ResponsiveContainer></div></div></div>
      <div className="stack">
        <div className="card"><h2>{t.cages.read}</h2>
          <div className="flex"><StatusBadge tier={v.tier} /><FreshBadge state={v.fresh.state} /></div><p className="cap">{t.statusCap} · {t.cages.reading}: {agoText(v.fresh.age)}</p>
          {off ? <p>{t.noData}</p> : <div className={`grid4 ${v.fresh.state === 'stale' ? 'dim' : ''}`} style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div className="val"><span className="cap">{t.home.temp}</span><b>{v.last.temperature_c} °C</b></div><div className="val"><span className="cap">{t.home.hum}</span><b>{v.last.humidity_pct} %</b></div>
            <div className="val"><span className="cap">{t.home.act}</span><b>{v.last.activity_index}</b></div><div className="val"><span className="cap">{t.home.feed}</span><b>{v.last.feeding_index}</b></div></div>}</div>
        <div className="card"><h2>{t.cages.anoms}</h2>
          {v.open.length === 0 ? <p>{t.cages.none}</p> : <ul className="list">{v.open.map((a) => <li className="li" key={a.id} style={{ display: 'block' }}>
            <b>{sign(a.sign)}</b> · {fmtDT(Date.parse(a.detected_at))}<br /><span className="cap">{a.pig_id ? s.pigs.find((p) => p.id === a.pig_id).tag + ' · ' : ''}{a.confidence_pct}% {t.cages.conf}</span><br /><span className="cap">{t.flag}</span><br />
            <button className="btn primary" style={{ marginTop: 8 }} onClick={() => nav('/report', { state: prepState(s, id) })}>{t.home.prep}</button></li>)}</ul>}</div>
      </div></div>
  </>
}
