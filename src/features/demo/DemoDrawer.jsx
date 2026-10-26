import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { t } from '../../strings/en'
import { useStore, actions, setUi } from '../../lib/data'
import { useNow, isNight } from '../../lib/time'
import { cageView } from '../../lib/status'
import { prepState } from '../../lib/report'
import { Drawer, Modal, StatusBadge, FreshBadge } from '../../components/ui'

export default function DemoDrawer({ onClose, onSplash }) {
  const s = useStore(), now = useNow(), nav = useNavigate(), [id, setId] = useState('c2'), [ask, setAsk] = useState(false), c = s.cages.find((x) => x.id === id)
  const B = ({ fn, children, p }) => <button className={`btn ${p ? 'primary' : ''}`} onClick={fn}>{children}</button>
  return <Drawer title={t.demo.title} onClose={onClose}>
    <div className="field"><label htmlFor="dc">{t.demo.cage}</label><select id="dc" value={id} onChange={(e) => setId(e.target.value)}>{s.cages.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select></div>
    <div className="flex">
      <B p fn={() => actions.anomaly(id)}>{t.demo.anomaly}</B>
      <B fn={() => { nav('/report', { state: prepState(s, id) }); onClose() }}>{t.demo.prep}</B>
      <B fn={() => actions.normal(id)}>{t.demo.normal}</B>
      <B fn={() => actions.silent(id, 'stale')}>{t.demo.stale}</B><B fn={() => actions.silent(id, 'offline')}>{t.demo.offline}</B><B fn={() => actions.restore(id)}>{t.demo.restore}</B>
      <B fn={() => actions.camera(id, !c.camera_ok)}>{c.camera_ok ? t.demo.camLost : t.demo.camRestore}</B>
      <B fn={() => { onClose(); onSplash() }}>{t.demo.splash}</B>
    </div>
    <div className="field" style={{ marginTop: 16 }}><label htmlFor="dl">{t.demo.delay}: {s.ui.delay}</label><input id="dl" type="range" min="0" max="5" value={s.ui.delay} onChange={(e) => setUi({ delay: +e.target.value })} /></div>
    <label className="check"><input type="checkbox" checked={s.ui.error} onChange={(e) => setUi({ error: e.target.checked })} />{t.demo.error}</label>
    <h2 style={{ marginTop: 16 }}>{t.demo.status}</h2>
    <ul className="list">{s.cages.map((x) => { const v = cageView(s, x, now, isNight); return <li className="li" key={x.id}><b>{x.name}</b><StatusBadge tier={v.tier} /><FreshBadge state={v.fresh.state} /></li> })}</ul>
    <p><button className="btn" onClick={() => setAsk(true)}>{t.demo.reset}</button></p>
    {ask && <Modal title={t.demo.reset} onClose={() => setAsk(false)}><p>{t.demo.resetQ}</p><div className="flex"><B p fn={() => { actions.reset(); setAsk(false); onClose() }}>{t.demo.reset}</B><B fn={() => setAsk(false)}>{t.cancel}</B></div></Modal>}
  </Drawer>
}
