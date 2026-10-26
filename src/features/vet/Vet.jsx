import { t } from '../../strings/en'
import { useStore } from '../../lib/data'
const Row = ({ k, v }) => <p style={{ margin: '0 0 8px' }}><b>{k}:</b> {v}</p>
export default function Vet() {
  const s = useStore(), v = s.vets[0], st = s.stores[0]
  return <>
    <div className="cols2">
      <div className="card"><h2>{t.vet.clinic}</h2><Row k={t.vet.name} v={v.clinic_name} /><Row k={t.vet.vet} v={v.name} /><Row k={t.vet.addr} v={v.address} /><Row k={t.vet.phone} v={v.phone} /><Row k={t.vet.hours} v={v.hours} /><Row k={t.vet.services} v={v.services} /><p className="cap">{t.vet.emergency}</p></div>
      <div className="card"><h2>{t.vet.store}</h2><Row k={t.vet.name} v={st.name} /><Row k={t.vet.addr} v={st.address} /><Row k={t.vet.phone} v={st.phone} /><Row k={t.vet.hours} v={st.hours} /><Row k={t.vet.carries} v={st.carries} /></div>
    </div>
    <p className="cap">{t.vet.note}</p>
  </>
}
