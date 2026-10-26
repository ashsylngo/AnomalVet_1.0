import { useEffect, useState } from 'react'
import { t } from '../strings/en'
const P = {
  camera: <><path d="M4 8h3l2-3h6l2 3h3v11H4z" /><circle cx="12" cy="13" r="3.5" /></>,
  cameraOff: <><path d="M4 8h3l2-3h6l2 3h3v11H4z" /><circle cx="12" cy="13" r="3.5" /><path d="M3 3l18 18" /></>,
  check: <><circle cx="12" cy="12" r="9" /><path d="M8 12l3 3 5-6" /></>,
  eye: <><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></>,
  alert: <><path d="M12 3l10 18H2z" /><path d="M12 10v5M12 18v.5" /></>,
  home: <path d="M3 11l9-8 9 8v10H3z" />,
  cages: <><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></>,
  report: <><path d="M6 3h9l4 4v14H6z" /><path d="M9 12h7M9 16h7" /></>,
  vet: <path d="M10 4h4v6h6v4h-6v6h-4v-6H4v-4h6z" />,
  tools: <><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  off: <><circle cx="12" cy="12" r="9" /><path d="M5 5l14 14" /></>,
  live: <circle cx="12" cy="12" r="5" />,
}
export const Icon = ({ n, size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{P[n]}</svg>
const TI = { normal: 'check', watch: 'eye', alert: 'alert' }, FI = { live: 'live', stale: 'clock', offline: 'off' }
export const StatusBadge = ({ tier }) => <span className={`chip ${tier}`}><Icon n={TI[tier]} size={16} />{t.tier[tier]}</span>
export const FreshBadge = ({ state }) => <span className={`chip ${state}`}><Icon n={FI[state]} size={16} />{t.fresh[state]}</span>
export function Logo({ kind }) {
  const [bad, setBad] = useState(false)
  if (bad) return <span className="wordmark">{t.app} <small>TEMP</small></span> /* TEMP wordmark: logo file missing */
  return <img src={`${import.meta.env.BASE_URL}brand/${kind === 'logo' ? 'anomalvet-logo.png' : 'anomalvet-mark.png'}`} alt={t.app} onError={() => setBad(true)} />
}
export function CameraPlaceholder({ cage, ok = true, size = 'lg' }) {
  if (size === 'sm') return <div className="cam sm" role="img" aria-label={ok ? t.cam.small : t.cam.none}><Icon n={ok ? 'camera' : 'cameraOff'} size={28} /></div>
  const lg = size === 'lg'
  return <div className={`cam ${size}`} role="img" aria-label={lg ? t.cam.title(cage) : t.cam.snapTitle}>
    <Icon n={ok ? 'camera' : 'cameraOff'} size={lg ? 56 : 40} />
    <strong>{lg ? t.cam.title(cage) : t.cam.snapTitle}</strong>
    <span>{ok ? (lg ? t.cam.lg : t.cam.snap) : t.cam.none}</span>
    {lg && <span className="state"><Icon n={ok ? 'camera' : 'cameraOff'} size={16} />{ok ? t.cam.online : t.cam.offline}</span>}
  </div>
}
export function Modal({ title, onClose, children }) {
  useEffect(() => { const k = (e) => e.key === 'Escape' && onClose(); window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k) }, [onClose])
  return <div className="scrim" onClick={onClose}><div className="dlg" role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}><h2>{title}</h2>{children}</div></div>
}
export function Drawer({ title, onClose, children }) {
  useEffect(() => { const k = (e) => e.key === 'Escape' && onClose(); window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k) }, [onClose])
  return <aside className="drawer" role="dialog" aria-label={title}><div className="flex" style={{ justifyContent: 'space-between' }}><h2>{title}</h2><button className="btn" onClick={onClose}>{t.close}</button></div>{children}</aside>
}
export const Spinner = () => <div className="center" role="status"><div className="spin" />{t.loading}</div>
export const EmptyState = ({ text }) => <div className="center">{text}</div>
export const ErrorState = ({ retry }) => <div className="center" role="alert"><Icon n="alert" size={32} />{t.err}<button className="btn primary" onClick={retry}>{t.retry}</button></div>
