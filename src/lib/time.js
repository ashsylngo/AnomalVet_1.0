import { useEffect, useState } from 'react'
import { t } from '../strings/en'
const tz = 'Asia/Manila'
export const hrOf = (ms) => { const d = new Date(ms + 288e5); return d.getUTCHours() + d.getUTCMinutes() / 60 }
export const isNight = (ms) => { const h = hrOf(ms); return h < 6 || h >= 19 }
export const fmtTime = (ms, sec) => new Intl.DateTimeFormat('en-PH', { timeZone: tz, hour: 'numeric', minute: '2-digit', ...(sec ? { second: '2-digit' } : {}), hour12: true }).format(ms)
export const fmtDate = (ms) => new Intl.DateTimeFormat('en-PH', { timeZone: tz, weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }).format(ms)
export const fmtDT = (ms) => `${fmtDate(ms)}, ${fmtTime(ms)}`
export const agoText = (sec) => sec < 90 ? `${Math.round(sec)} ${t.ago.s}` : sec < 5400 ? `${Math.round(sec / 60)} ${t.ago.m}` : `${Math.round(sec / 3600)} ${t.ago.h}`
export const useNow = () => { const [n, setN] = useState(Date.now()); useEffect(() => { const i = setInterval(() => setN(Date.now()), 1000); return () => clearInterval(i) }, []); return n }
