import { useEffect, useState } from 'react'
import { NavLink, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { t } from '../strings/en'
import { useStore, setUi, splashSeen, markSplash } from '../lib/data'
import { useNow, fmtTime, fmtDate } from '../lib/time'
import { Icon, Logo, Spinner, ErrorState } from '../components/ui'
import Home from '../features/home/Home'
import Cages from '../features/cages/Cages'
import Report from '../features/report/Report'
import Vet from '../features/vet/Vet'
import DemoDrawer from '../features/demo/DemoDrawer'

function Splash({ done }) {
  useEffect(() => { const o = setTimeout(done, 2500); const k = () => done(); window.addEventListener('keydown', k); return () => { clearTimeout(o); window.removeEventListener('keydown', k) } }, [done])
  return <div className="splash" onClick={done} role="button" tabIndex={0} aria-label={t.splash.skip}><Logo kind="logo" /></div>
}
function Gate({ children }) {
  const s = useStore(), loc = useLocation(), [load, setLoad] = useState(false)
  useEffect(() => { if (!s.ui.delay) return; setLoad(true); const i = setTimeout(() => setLoad(false), s.ui.delay * 1000); return () => clearTimeout(i) }, [loc.pathname]) // eslint-disable-line
  if (s.ui.error) return <ErrorState retry={() => setUi({ error: false })} />
  return load ? <Spinner /> : children
}
export default function App() {
  const now = useNow(), nav = useNavigate(), [splash, setSplash] = useState(!splashSeen()), [tools, setTools] = useState(false)
  const done = () => { markSplash(); setSplash(false); nav('/home', { replace: true }) }
  const tabs = [['home', 'home'], ['cages', 'cages'], ['report', 'report'], ['vet', 'vet']]
  const DemoBtn = ({ c }) => import.meta.env.VITE_DEMO_TOOLS === 'false' ? null : <button className={`btn ${c}`} onClick={() => setTools(true)}><Icon n="tools" size={18} />{t.demoTools}</button>
  return <>
    {splash && <Splash done={done} />}
    <div className="shell">
      <aside className="side">
        <div className="logobox pc-only"><Logo kind="mark" /></div>
        <nav aria-label="Main">{tabs.map(([p, i]) => <NavLink key={p} to={'/' + p} className={({ isActive }) => 'tab' + (isActive ? ' active' : '')}><Icon n={i} />{t.nav[p]}</NavLink>)}</nav>
        <div className="pc-only"><DemoBtn c="" /></div>
      </aside>
      <header className="top">
        <div className="flex"><div className="logobox phone-only"><Logo kind="mark" /></div><b>{t.farm}</b></div>
        <div className="flex"><div className="clock"><b>{fmtTime(now, true)}</b><small>{fmtDate(now)}</small></div><span className="phone-only"><DemoBtn c="" /></span></div>
      </header>
      <main><Gate><Routes><Route path="/home" element={<Home />} /><Route path="/cages" element={<Cages />} /><Route path="/report" element={<Report />} /><Route path="/vet" element={<Vet />} /><Route path="*" element={<Navigate to="/home" replace />} /></Routes></Gate></main>
    </div>
    {tools && <DemoDrawer onClose={() => setTools(false)} onSplash={() => setSplash(true)} />}
  </>
}
