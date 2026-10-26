import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { t } from '../../strings/en'
import { useStore, actions } from '../../lib/data'
import { useNow, isNight, fmtDT } from '../../lib/time'
import { cageView } from '../../lib/status'
import { compose, readingsText } from '../../lib/report'
import { CameraPlaceholder, Modal, Icon } from '../../components/ui'

export default function Report() {
  const s = useStore(), now = useNow(), loc = useLocation(), st = loc.state || {}
  const [f, setF] = useState({ cage: st.cage || s.cages[0].id, pig: st.pig || '', sev: 'routine', signs: st.sign ? [st.sign] : [], details: st.details || '', vet: s.vets[0].id, attach: false })
  const [confirm, setConfirm] = useState(false), [last, setLast] = useState(null), [view, setView] = useState(null)
  useEffect(() => { if (loc.state) setF((p) => ({ ...p, cage: loc.state.cage || p.cage, pig: loc.state.pig || '', signs: loc.state.sign ? [loc.state.sign] : [], details: loc.state.details || '' })) }, [loc.key]) // eslint-disable-line
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }))
  const cage = s.cages.find((c) => c.id === f.cage), v = cageView(s, cage, now, isNight), pigs = v.pigs
  const vet = s.vets.find((x) => x.id === f.vet), pig = pigs.find((p) => p.id === f.pig)
  const body = compose(s.template, { FARM: s.farm.name, CAGE: cage.name, PIG: pig ? pig.tag : t.report.whole, SEVERITY: f.sev === 'urgent' ? t.report.urgent : t.report.routine, SIGNS: f.signs.map((i) => s.signs.find((x) => x.id === i).label).join(', ') || t.report.none, DETAILS: f.details || t.report.noDetails, READINGS: readingsText(v.last, v.fresh.age), CREATED_AT: fmtDT(now) })
  const send = () => { setLast(actions.sendReport({ cage_id: f.cage, pig_id: f.pig || null, severity: f.sev, sign_ids: f.signs, details: f.details, vet_id: f.vet, attach_snapshot: f.attach, body, readings_text: readingsText(v.last, v.fresh.age) })); setConfirm(false) }
  const lr = last && s.reports.find((r) => r.id === last), steps = ['queued', 'sent', 'delivered'], at = lr ? steps.indexOf(lr.status) : -1
  return <>
    <h1>{t.report.title}</h1>
    <div className="cols2">
      <div className="card">
        <div className="field"><label htmlFor="rc">{t.report.cage}</label><select id="rc" value={f.cage} onChange={(e) => setF((p) => ({ ...p, cage: e.target.value, pig: '' }))}>{s.cages.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
        <div className="field"><label htmlFor="rp">{t.report.pig}</label><select id="rp" value={f.pig} onChange={(e) => set('pig', e.target.value)}><option value="">{t.report.whole}</option>{pigs.map((p) => <option key={p.id} value={p.id}>{p.tag}</option>)}</select></div>
        <fieldset className="field"><legend>{t.report.sev}</legend><div className="flex">{['routine', 'urgent'].map((k) => <label className="check" key={k}><input type="radio" name="sev" checked={f.sev === k} onChange={() => set('sev', k)} />{t.report[k]}</label>)}</div></fieldset>
        <fieldset className="field"><legend>{t.report.signs}</legend><div className="checks">{s.signs.map((x) => <label className="check" key={x.id}><input type="checkbox" checked={f.signs.includes(x.id)} onChange={(e) => set('signs', e.target.checked ? [...f.signs, x.id] : f.signs.filter((i) => i !== x.id))} />{x.label}</label>)}</div></fieldset>
        <div className="field"><label htmlFor="rd">{t.report.details}</label><textarea id="rd" rows={4} placeholder={t.report.detailsHint} value={f.details} onChange={(e) => set('details', e.target.value)} /></div>
        <div className="field"><label htmlFor="rv">{t.report.vet}</label><select id="rv" value={f.vet} onChange={(e) => set('vet', e.target.value)}>{s.vets.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select></div>
        <label className="check"><input type="checkbox" checked={f.attach} onChange={(e) => set('attach', e.target.checked)} />{t.report.attach}</label>
        <div className={f.attach ? '' : 'dim'}><CameraPlaceholder size="md" /></div>
      </div>
      <div className="stack">
        <div className="card"><h2>{t.report.preview}</h2><pre className="prev">{body}</pre>
          <p><button className="btn primary" onClick={() => setConfirm(true)}>{t.report.send}</button></p></div>
        {lr && <div className="card" role="status"><h2>{t.report.delivery} <span className="chip normal" style={{ color: 'var(--ink-soft)', background: '#fff' }}>{t.report.sim}</span></h2>
          <ul className="list">{steps.map((k, i) => <li className="li" key={k}><span><Icon n={i <= at ? 'check' : 'clock'} size={16} /> {t.report[k]}</span><span className="cap">{t.report.sim}</span></li>)}</ul></div>}
      </div></div>
    <div className="card"><h2>{t.report.sentList}</h2>
      {s.reports.length === 0 ? <p>{t.report.empty}</p> : <ul className="list">{s.reports.map((r) => <li key={r.id}><button className="btn li" style={{ width: '100%', justifyContent: 'space-between', textAlign: 'left', color: 'var(--ink)', borderColor: 'var(--line)' }} onClick={() => setView(r)}>
        <span>{fmtDT(Date.parse(r.created_at))} · {s.cages.find((c) => c.id === r.cage_id).name} · {t.report[r.severity]}<br /><span className="cap">{r.sign_ids.map((i) => s.signs.find((x) => x.id === i).label).join(', ')}</span></span>
        <span className="cap">{t.report[r.status]} · {t.report.sim}</span></button></li>)}</ul>}</div>
    {confirm && <Modal title={t.report.confirmTitle} onClose={() => setConfirm(false)}><p><b>{t.report.to}:</b> {vet.name}<br /><b>{t.report.sev}:</b> {f.sev === 'urgent' ? t.report.urgent : t.report.routine} · {t.report.sim}</p><pre className="prev">{body}</pre>
      <div className="flex" style={{ marginTop: 12 }}><button className="btn primary" onClick={send}>{t.report.confirm}</button><button className="btn" onClick={() => setConfirm(false)}>{t.cancel}</button></div></Modal>}
    {view && <Modal title={t.report.sentList} onClose={() => setView(null)}><pre className="prev">{view.body}</pre><p className="cap">{t.report[view.status]} · {t.report.sim}</p><button className="btn" onClick={() => setView(null)}>{t.close}</button></Modal>}
  </>
}
