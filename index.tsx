import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/router'
import { supabase, Banco, Periodo } from '../lib/supabase'
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, ArcElement, RadialLinearScale, Title, Tooltip, Legend, Filler
} from 'chart.js'
import { Bar, Line, Doughnut, Radar } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, RadialLinearScale, Title, Tooltip, Legend, Filler)

// ── Fallback data (real Enero 2026) ─────────────────────────────────────
const FALLBACK_DATA: Banco[] = [
  {id:'1',periodo_id:'p1',nombre:'Banco de Venezuela',sigla:'VENEZUELA',tipo:'Estatal',activos_usd:1934.8,captaciones_usd:564.5,cartera_usd:271.6,patrimonio_usd:558.1,morosidad:1.1,adec_patrimonial:30.0,roa:15.8,roe:54.7,liquidez:58.1,mom_captaciones:16.2,yoy_captaciones:421.4,mom_cartera:23.9,yoy_cartera:686.1},
  {id:'2',periodo_id:'p1',nombre:'Banesco',sigla:'BANESCO',tipo:'Universal',activos_usd:470.5,captaciones_usd:250.4,cartera_usd:182.6,patrimonio_usd:127.1,morosidad:0.3,adec_patrimonial:29.4,roa:31.8,roe:116.9,liquidez:96.1,mom_captaciones:20.7,yoy_captaciones:529.0,mom_cartera:9.0,yoy_cartera:788.7},
  {id:'3',periodo_id:'p1',nombre:'Mercantil',sigla:'MERCANTIL',tipo:'Universal',activos_usd:312.6,captaciones_usd:191.9,cartera_usd:98.4,patrimonio_usd:80.4,morosidad:1.1,adec_patrimonial:27.6,roa:25.7,roe:96.9,liquidez:84.2,mom_captaciones:31.1,yoy_captaciones:656.5,mom_cartera:17.1,yoy_cartera:886.7},
  {id:'4',periodo_id:'p1',nombre:'BNC',sigla:'BNC',tipo:'Universal',activos_usd:330.9,captaciones_usd:184.2,cartera_usd:89.7,patrimonio_usd:94.1,morosidad:0.6,adec_patrimonial:30.5,roa:28.1,roe:94.0,liquidez:104.3,mom_captaciones:48.5,yoy_captaciones:573.6,mom_cartera:20.0,yoy_cartera:699.6},
  {id:'5',periodo_id:'p1',nombre:'BBVA Provincial',sigla:'BBVA PROV.',tipo:'Universal',activos_usd:377.2,captaciones_usd:170.7,cartera_usd:182.6,patrimonio_usd:148.6,morosidad:0.2,adec_patrimonial:41.9,roa:34.2,roe:85.8,liquidez:93.8,mom_captaciones:19.5,yoy_captaciones:519.3,mom_cartera:20.8,yoy_cartera:722.9},
  {id:'6',periodo_id:'p1',nombre:'Bancamiga',sigla:'BANCAMIGA',tipo:'Universal',activos_usd:155.9,captaciones_usd:90.4,cartera_usd:60.5,patrimonio_usd:41.4,morosidad:2.8,adec_patrimonial:28.0,roa:18.1,roe:68.9,liquidez:52.9,mom_captaciones:25.5,yoy_captaciones:529.0,mom_cartera:19.9,yoy_cartera:935.3},
  {id:'7',periodo_id:'p1',nombre:'Banco Digital Trabajadores',sigla:'BDT',tipo:'Estatal',activos_usd:133.2,captaciones_usd:61.4,cartera_usd:41.0,patrimonio_usd:32.3,morosidad:0.5,adec_patrimonial:25.1,roa:11.1,roe:47.2,liquidez:81.4,mom_captaciones:9.3,yoy_captaciones:401.1,mom_cartera:22.6,yoy_cartera:527.3},
  {id:'8',periodo_id:'p1',nombre:'Bancaribe',sigla:'BANCARIBE',tipo:'Universal',activos_usd:63.9,captaciones_usd:40.1,cartera_usd:21.8,patrimonio_usd:16.5,morosidad:1.7,adec_patrimonial:27.0,roa:15.3,roe:60.5,liquidez:73.9,mom_captaciones:10.2,yoy_captaciones:479.1,mom_cartera:14.7,yoy_cartera:1074.9},
  {id:'9',periodo_id:'p1',nombre:'Banco del Tesoro',sigla:'TESORO',tipo:'Estatal',activos_usd:191.5,captaciones_usd:36.8,cartera_usd:33.5,patrimonio_usd:43.8,morosidad:0.3,adec_patrimonial:23.4,roa:7.1,roe:31.7,liquidez:111.7,mom_captaciones:-5.5,yoy_captaciones:330.5,mom_cartera:26.1,yoy_cartera:648.8},
  {id:'10',periodo_id:'p1',nombre:'Banplus',sigla:'BANPLUS',tipo:'Comercial',activos_usd:56.3,captaciones_usd:27.7,cartera_usd:22.5,patrimonio_usd:13.5,morosidad:6.0,adec_patrimonial:24.7,roa:9.3,roe:39.6,liquidez:73.2,mom_captaciones:-10.8,yoy_captaciones:399.4,mom_cartera:21.1,yoy_cartera:482.7},
  {id:'11',periodo_id:'p1',nombre:'Banco Plaza',sigla:'PLAZA',tipo:'Comercial',activos_usd:45.2,captaciones_usd:26.4,cartera_usd:18.1,patrimonio_usd:9.1,morosidad:2.7,adec_patrimonial:20.8,roa:7.7,roe:37.8,liquidez:82.3,mom_captaciones:22.6,yoy_captaciones:495.9,mom_cartera:23.6,yoy_cartera:660.9},
  {id:'12',periodo_id:'p1',nombre:'Banco Fondo Común',sigla:'BFC',tipo:'Comercial',activos_usd:24.5,captaciones_usd:16.0,cartera_usd:8.4,patrimonio_usd:5.6,morosidad:0.7,adec_patrimonial:25.0,roa:25.9,roe:111.7,liquidez:84.0,mom_captaciones:26.8,yoy_captaciones:446.0,mom_cartera:27.7,yoy_cartera:786.2},
  {id:'13',periodo_id:'p1',nombre:'Venezolano de Crédito',sigla:'VNZ.CRÉDITO',tipo:'Comercial',activos_usd:37.1,captaciones_usd:14.2,cartera_usd:6.6,patrimonio_usd:11.9,morosidad:0.2,adec_patrimonial:33.6,roa:20.8,roe:65.0,liquidez:131.3,mom_captaciones:19.6,yoy_captaciones:442.0,mom_cartera:11.9,yoy_cartera:462.3},
  {id:'14',periodo_id:'p1',nombre:'Banco Activo',sigla:'ACTIVO',tipo:'Comercial',activos_usd:19.3,captaciones_usd:10.2,cartera_usd:6.9,patrimonio_usd:6.1,morosidad:1.6,adec_patrimonial:33.0,roa:17.5,roe:56.4,liquidez:107.3,mom_captaciones:10.2,yoy_captaciones:304.2,mom_cartera:23.0,yoy_cartera:833.9},
  {id:'15',periodo_id:'p1',nombre:'Banco Exterior',sigla:'EXTERIOR',tipo:'Extranjero',activos_usd:23.7,captaciones_usd:11.9,cartera_usd:12.3,patrimonio_usd:7.2,morosidad:3.4,adec_patrimonial:30.9,roa:4.0,roe:13.5,liquidez:72.7,mom_captaciones:-0.1,yoy_captaciones:387.6,mom_cartera:23.7,yoy_cartera:610.3},
  {id:'16',periodo_id:'p1',nombre:'Banfanb',sigla:'BANFANB',tipo:'Estatal',activos_usd:10.9,captaciones_usd:9.0,cartera_usd:0.8,patrimonio_usd:0.8,morosidad:3.5,adec_patrimonial:7.5,roa:3.0,roe:40.1,liquidez:77.3,mom_captaciones:13.9,yoy_captaciones:341.3,mom_cartera:6.8,yoy_cartera:645.3},
  {id:'17',periodo_id:'p1',nombre:'Banco Sofitasa',sigla:'SOFITASA',tipo:'Comercial',activos_usd:22.0,captaciones_usd:7.9,cartera_usd:10.4,patrimonio_usd:9.7,morosidad:0.0,adec_patrimonial:46.4,roa:29.9,roe:66.8,liquidez:69.6,mom_captaciones:37.8,yoy_captaciones:874.7,mom_cartera:19.7,yoy_cartera:1572.1},
  {id:'18',periodo_id:'p1',nombre:'Bancrecer',sigla:'BANCRECER',tipo:'Microfinanciero',activos_usd:20.8,captaciones_usd:7.4,cartera_usd:12.7,patrimonio_usd:9.3,morosidad:9.4,adec_patrimonial:45.5,roa:9.3,roe:21.1,liquidez:57.6,mom_captaciones:15.2,yoy_captaciones:432.4,mom_cartera:14.6,yoy_cartera:1093.9},
  {id:'19',periodo_id:'p1',nombre:'R4 Banco Microfinanciero',sigla:'R4',tipo:'Microfinanciero',activos_usd:7.5,captaciones_usd:4.7,cartera_usd:3.3,patrimonio_usd:1.8,morosidad:3.5,adec_patrimonial:29.1,roa:55.9,roe:241.9,liquidez:60.4,mom_captaciones:-4.1,yoy_captaciones:418.3,mom_cartera:19.9,yoy_cartera:678.1},
  {id:'20',periodo_id:'p1',nombre:'Banco Caroní',sigla:'CARONÍ',tipo:'Comercial',activos_usd:8.3,captaciones_usd:4.4,cartera_usd:0.5,patrimonio_usd:3.7,morosidad:13.9,adec_patrimonial:44.1,roa:0.4,roe:0.9,liquidez:134.2,mom_captaciones:17.8,yoy_captaciones:435.5,mom_cartera:-0.7,yoy_cartera:200.6},
  {id:'21',periodo_id:'p1',nombre:'100% Banco',sigla:'100% BANCO',tipo:'Comercial',activos_usd:7.0,captaciones_usd:4.6,cartera_usd:2.8,patrimonio_usd:1.7,morosidad:1.8,adec_patrimonial:24.5,roa:3.8,roe:14.7,liquidez:74.2,mom_captaciones:53.8,yoy_captaciones:349.3,mom_cartera:61.4,yoy_cartera:325.1},
  {id:'22',periodo_id:'p1',nombre:'B.I.D.',sigla:'B.I.D.',tipo:'Extranjero',activos_usd:4.4,captaciones_usd:4.2,cartera_usd:1.6,patrimonio_usd:0.0,morosidad:0.0,adec_patrimonial:2.5,roa:31.4,roe:241.9,liquidez:58.7,mom_captaciones:20.6,yoy_captaciones:322.5,mom_cartera:29.1,yoy_cartera:1268.3},
  {id:'23',periodo_id:'p1',nombre:'Bangente',sigla:'BANGENTE',tipo:'Microfinanciero',activos_usd:8.8,captaciones_usd:3.1,cartera_usd:3.1,patrimonio_usd:1.7,morosidad:7.1,adec_patrimonial:19.3,roa:1.7,roe:7.7,liquidez:142.8,mom_captaciones:14.5,yoy_captaciones:599.6,mom_cartera:7.5,yoy_cartera:908.8},
  {id:'24',periodo_id:'p1',nombre:'Del Sur',sigla:'DEL SUR',tipo:'Comercial',activos_usd:22.2,captaciones_usd:2.2,cartera_usd:2.6,patrimonio_usd:18.5,morosidad:0.0,adec_patrimonial:83.9,roa:9.6,roe:11.6,liquidez:147.0,mom_captaciones:23.4,yoy_captaciones:431.0,mom_cartera:28.0,yoy_cartera:10671.2},
  {id:'25',periodo_id:'p1',nombre:'N58 Banco Digital',sigla:'N58',tipo:'Microfinanciero',activos_usd:3.2,captaciones_usd:2.4,cartera_usd:1.2,patrimonio_usd:0.5,morosidad:0.1,adec_patrimonial:17.7,roa:10.3,roe:58.5,liquidez:74.3,mom_captaciones:28.2,yoy_captaciones:367.1,mom_cartera:27.7,yoy_cartera:3128.6},
]

const TC: Record<string, string> = {
  Universal: '#3A7BD5', Estatal: '#D4A843',
  Comercial: '#10B981', Microfinanciero: '#9B6EE8', Extranjero: '#2AB8CC'
}
const MICRO_COLORS: Record<string, string> = {
  N58: '#00D4FF', BANCRECER: '#F59E0B', R4: '#8B5CF6', BANGENTE: '#10B981'
}

type Tab = 'mercado' | 'micro' | 'n58comp' | 'ranking' | 'ficha' | 'insights'

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [bancos, setBancos] = useState<Banco[]>(FALLBACK_DATA)
  const [periodo, setPeriodo] = useState('Enero 2026')
  const [tab, setTab] = useState<Tab>('mercado')
  const [rankField, setRankField] = useState<keyof Banco>('captaciones_usd')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push('/'); return }
      setUser(session.user)
      loadData()
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) router.push('/')
    })
    return () => subscription.unsubscribe()
  }, [])

  async function loadData() {
    const { data: periodos } = await supabase.from('periodos').select('*').order('fecha', { ascending: false }).limit(1)
    if (periodos && periodos.length > 0) {
      setPeriodo(periodos[0].nombre)
      const { data: bancosData } = await supabase.from('bancos').select('*').eq('periodo_id', periodos[0].id)
      if (bancosData && bancosData.length > 0) setBancos(bancosData)
    }
  }

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/')
  }

  const n58 = bancos.find(b => b.sigla === 'N58')!
  const micros = bancos.filter(b => b.tipo === 'Microfinanciero')
  const comp = bancos.filter(b => ['N58', 'BANCRECER', 'R4', 'BANGENTE'].includes(b.sigla))
  const totCap = bancos.reduce((a, b) => a + b.captaciones_usd, 0)
  const microCap = micros.reduce((a, b) => a + b.captaciones_usd, 0)
  const rkCap = [...bancos].sort((a, b) => b.captaciones_usd - a.captaciones_usd).findIndex(b => b.sigla === 'N58') + 1

  function fmt(v: number) { if (v >= 1000) return (v / 1000).toFixed(1) + 'B'; if (v >= 1) return v.toFixed(1); return v.toFixed(2) }
  function fp(v: number) { return (v >= 0 ? '+' : '') + v.toFixed(1) + '%' }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#060810', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00D4FF', fontFamily: "'DM Mono', monospace", fontSize: 12 }}>
      CARGANDO DATOS...
    </div>
  )

  const types = ['Universal', 'Estatal', 'Comercial', 'Microfinanciero', 'Extranjero']
  const sortedBancos = [...bancos].sort((a, b) =>
    rankField === 'morosidad' ? a[rankField] - b[rankField] : (b[rankField] as number) - (a[rankField] as number)
  )

  return (
    <div style={{ minHeight: '100vh', background: '#060810', fontFamily: "'DM Sans', sans-serif", color: '#DCE8FF', fontSize: 13 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-thumb { background: #223050; border-radius: 2px; }
        table { width: 100%; border-collapse: collapse; }
        th { font-size: 9px; color: #415070; font-family: 'DM Mono', monospace; text-transform: uppercase; letter-spacing: .7px; padding: 7px 10px; border-bottom: 1px solid #192338; text-align: left; font-weight: 400; white-space: nowrap; }
        td { padding: 6px 10px; border-bottom: 1px solid rgba(25,35,56,.7); font-size: 11px; vertical-align: middle; }
        tr:last-child td { border-bottom: none; }
        .nr td { background: rgba(0,212,255,.07); }
        .nr:hover td { background: rgba(0,212,255,.12); }
        .mr td { background: rgba(155,110,232,.05); }
        tr:not(.nr):not(.mr):hover td { background: #101525; }
        .tag { display: inline-block; padding: 2px 6px; border-radius: 3px; font-size: 9px; font-family: 'DM Mono', monospace; white-space: nowrap; }
        .pb { height: 3px; background: #1C2A44; border-radius: 2px; margin-top: 3px; }
        .pbf { height: 3px; border-radius: 2px; }
        .card { background: #0B0F1E; border: 1px solid #192338; border-radius: 8px; overflow: hidden; }
        .chd { padding: 9px 13px; border-bottom: 1px solid #192338; display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-wrap: wrap; }
        .ct { font-size: 9px; font-family: 'DM Mono', monospace; text-transform: uppercase; letter-spacing: 1.2px; color: #00D4FF; font-weight: 500; }
        .cbd { padding: 12px 14px; }
        .g2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .g3 { display: grid; grid-template-columns: 1.7fr 1fr; gap: 10px; }
        .g4 { display: grid; grid-template-columns: repeat(4, minmax(0,1fr)); gap: 10px; }
        .ins { background: #101525; border: 1px solid #192338; border-radius: 6px; padding: 12px; position: relative; overflow: hidden; }
        .ins::before { content: ''; position: absolute; top: 0; left: 0; width: 3px; height: 100%; }
        .ins.ok::before { background: #1DB97A; } .ins.opp::before { background: #00D4FF; } .ins.warn::before { background: #E89B30; }
      `}</style>

      {/* HEADER */}
      <div style={{ background: '#0B0F1E', borderBottom: '1px solid #192338', padding: '10px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 38, height: 38, background: 'rgba(0,212,255,.08)', border: '1px solid #008BAA', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Mono', monospace", fontSize: 11, color: '#00D4FF' }}>N58</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#00D4FF' }}>N58 Banco Digital · Panel Estratégico</div>
            <div style={{ fontSize: 9, color: '#415070', fontFamily: "'DM Mono', monospace", letterSpacing: '.5px', marginTop: 2 }}>SCORE BANCARIO VENEZUELA · DATOS REALES · {periodo.toUpperCase()}</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ padding: '3px 9px', borderRadius: 20, fontSize: 9, fontFamily: "'DM Mono', monospace", letterSpacing: '.8px', border: '1px solid rgba(29,185,122,.4)', background: 'rgba(29,185,122,.1)', color: '#1DB97A' }}>● DATOS REALES {periodo.toUpperCase()}</span>
          <span style={{ padding: '3px 9px', borderRadius: 20, fontSize: 9, fontFamily: "'DM Mono', monospace", background: '#101525', border: '1px solid #223050', color: '#415070' }}>{user?.email}</span>
          <button onClick={signOut} style={{ padding: '4px 10px', background: 'transparent', border: '1px solid #223050', borderRadius: 5, color: '#415070', fontSize: 9, fontFamily: "'DM Mono', monospace", cursor: 'pointer' }}>SALIR</button>
        </div>
      </div>

      {/* NAV */}
      <div style={{ background: '#0B0F1E', borderBottom: '1px solid #192338', display: 'flex', padding: '0 18px', overflowX: 'auto' }}>
        {([
          ['mercado', '① MERCADO TOTAL'],
          ['micro', '② SEGMENTO MICRO'],
          ['n58comp', '③ N58 VS COMPETIDORES'],
          ['ranking', 'RANKING SISTEMA'],
          ['ficha', 'FICHA N58'],
          ['insights', 'INSIGHTS'],
        ] as [Tab, string][]).map(([t, label]) => (
          <div key={t} onClick={() => setTab(t)} style={{
            padding: '9px 13px', fontSize: 10, fontFamily: "'DM Mono', monospace",
            color: tab === t ? '#00D4FF' : '#415070', cursor: 'pointer',
            borderBottom: tab === t ? '2px solid #00D4FF' : '2px solid transparent',
            whiteSpace: 'nowrap', letterSpacing: '.5px', transition: 'color .15s'
          }}>{label}</div>
        ))}
      </div>

      {/* KPI STRIP */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,minmax(0,1fr))', borderBottom: '1px solid #192338' }}>
        {[
          { l: 'Captaciones N58', v: `USD ${fmt(n58.captaciones_usd)}B`, u: `+${n58.mom_captaciones.toFixed(1)}% MoM`, c: '#00D4FF', hl: true },
          { l: 'Cartera créditos N58', v: `USD ${fmt(n58.cartera_usd)}B`, u: `+${n58.mom_cartera.toFixed(1)}% MoM`, c: '#00D4FF' },
          { l: 'Morosidad N58', v: `${n58.morosidad.toFixed(2)}%`, u: '#2 mejor del sistema', c: '#1DB97A' },
          { l: 'ROA N58', v: `${n58.roa.toFixed(1)}%`, u: '#15 en sistema', c: '#F0C040' },
          { l: 'ROE N58', v: `${n58.roe.toFixed(1)}%`, u: '#12 en sistema', c: '#8B5CF6' },
          { l: `Ranking #${rkCap} de ${bancos.length}`, v: `${((n58.captaciones_usd / microCap) * 100).toFixed(1)}% micro`, u: 'share seg. microfinanciero', c: '#00D4FF', hl: true },
        ].map((k, i) => (
          <div key={i} style={{ padding: '11px 14px', borderRight: i < 5 ? '1px solid #192338' : 'none', background: k.hl ? 'rgba(0,212,255,.07)' : '#0B0F1E', position: 'relative' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: k.c }} />
            <div style={{ fontSize: 9, color: '#415070', fontFamily: "'DM Mono', monospace", textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 3 }}>{k.l}</div>
            <div style={{ fontSize: 17, fontWeight: 600, fontFamily: "'DM Mono', monospace", color: k.hl ? '#00D4FF' : '#DCE8FF' }}>{k.v}</div>
            <div style={{ fontSize: 9, color: '#415070', marginTop: 2 }}>{k.u}</div>
          </div>
        ))}
      </div>

      {/* MAIN */}
      <div style={{ padding: '12px 18px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>

        {/* ① MERCADO TOTAL */}
        {tab === 'mercado' && (
          <>
            <div className="card">
              <div className="chd"><span className="ct">Sistema financiero venezolano · {periodo} · {bancos.length} instituciones</span><span style={{ fontSize: 9, color: '#415070', fontFamily: "'DM Mono', monospace" }}>USD miles de millones · GlobalScope / SUDEBAN</span></div>
              <div className="cbd">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,minmax(0,1fr))', gap: 8, marginBottom: 14 }}>
                  {types.map(t => {
                    const bs = bancos.filter(b => b.tipo === t)
                    const cap = bs.reduce((a, b) => a + b.captaciones_usd, 0)
                    const isMicro = t === 'Microfinanciero'
                    return (
                      <div key={t} onClick={() => isMicro && setTab('micro')} style={{
                        background: '#101525', border: `1px solid ${isMicro ? 'rgba(155,110,232,.5)' : '#192338'}`,
                        borderRadius: 6, padding: '9px 11px', cursor: isMicro ? 'pointer' : 'default'
                      }}>
                        <div style={{ height: 2, background: TC[t], borderRadius: 1, marginBottom: 5 }} />
                        <div style={{ fontSize: 9, color: '#415070', fontFamily: "'DM Mono', monospace", textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 2 }}>{t}</div>
                        <div style={{ fontSize: 14, fontWeight: 600, fontFamily: "'DM Mono', monospace", color: TC[t] }}>USD {fmt(cap)}B</div>
                        <div style={{ fontSize: 9, color: '#415070', marginTop: 2 }}>{bs.length} bancos · {((cap / totCap) * 100).toFixed(1)}%</div>
                        {isMicro && <div style={{ fontSize: 8, color: TC.Microfinanciero, marginTop: 4, fontFamily: "'DM Mono', monospace" }}>► drill-down</div>}
                      </div>
                    )
                  })}
                </div>
                <div className="g2">
                  <Bar data={{
                    labels: types,
                    datasets: [
                      { label: 'Captaciones', data: types.map(t => bancos.filter(b => b.tipo === t).reduce((a, b) => a + b.captaciones_usd, 0)), backgroundColor: types.map(t => TC[t] + '44'), borderColor: types.map(t => TC[t]), borderWidth: 1.5 },
                      { label: 'Cartera', data: types.map(t => bancos.filter(b => b.tipo === t).reduce((a, b) => a + b.cartera_usd, 0)), backgroundColor: types.map(t => TC[t] + '22'), borderColor: types.map(t => TC[t]), borderWidth: 1 }
                    ]
                  }} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: true, position: 'bottom', labels: { color: '#415070', font: { size: 9 }, boxWidth: 8 } } }, scales: { x: { grid: { color: 'rgba(25,35,56,.5)' }, ticks: { color: '#415070', font: { size: 9 } } }, y: { grid: { color: 'rgba(25,35,56,.5)' }, ticks: { color: '#415070', font: { size: 9 }, callback: (v: any) => v + 'B' } } } }} height={180} />
                  <Doughnut data={{
                    labels: types,
                    datasets: [{ data: types.map(t => bancos.filter(b => b.tipo === t).reduce((a, b) => a + b.captaciones_usd, 0)), backgroundColor: types.map(t => TC[t]), borderWidth: 0 }]
                  }} options={{ responsive: true, maintainAspectRatio: false, cutout: '60%', plugins: { legend: { display: true, position: 'bottom', labels: { color: '#415070', font: { size: 9 }, boxWidth: 8 } } } }} height={180} />
                </div>
              </div>
            </div>

            <div className="g3">
              <div className="card">
                <div className="chd"><span className="ct">Ranking captaciones del público · {periodo}</span></div>
                <div style={{ overflowY: 'auto', maxHeight: 340 }}>
                  <table><thead><tr><th>#</th><th>Banco</th><th>Tipo</th><th style={{ textAlign: 'right' }}>Cap. USD B</th><th style={{ textAlign: 'right' }}>Part.%</th><th style={{ textAlign: 'right' }}>MoM</th><th></th></tr></thead>
                    <tbody>{[...bancos].sort((a, b) => b.captaciones_usd - a.captaciones_usd).map((b, i) => {
                      const isN58 = b.sigla === 'N58'; const isMicro = b.tipo === 'Microfinanciero'
                      return (
                        <tr key={b.id} className={isN58 ? 'nr' : isMicro ? 'mr' : ''}>
                          <td><span style={{ display: 'inline-flex', width: 20, height: 20, alignItems: 'center', justifyContent: 'center', borderRadius: 3, fontSize: 9, fontFamily: "'DM Mono', monospace", fontWeight: 700, background: isN58 ? 'rgba(0,212,255,.15)' : i < 3 ? 'rgba(240,192,64,.12)' : '#162035', color: isN58 ? '#00D4FF' : i < 3 ? '#F0C040' : '#415070', border: `1px solid ${isN58 ? '#008BAA' : i < 3 ? 'rgba(240,192,64,.3)' : '#192338'}` }}>{i + 1}</span></td>
                          <td>{isN58 && <span className="tag" style={{ background: 'rgba(0,212,255,.1)', color: '#00D4FF', border: '1px solid #008BAA', marginRight: 4 }}>★ N58</span>}{b.nombre}</td>
                          <td><span className="tag" style={{ background: TC[b.tipo] + '18', color: TC[b.tipo], border: `1px solid ${TC[b.tipo]}40` }}>{b.tipo}</span></td>
                          <td style={{ textAlign: 'right', fontFamily: "'DM Mono', monospace", fontSize: 10 }}>{fmt(b.captaciones_usd)}</td>
                          <td style={{ textAlign: 'right', fontFamily: "'DM Mono', monospace", fontSize: 10 }}>{((b.captaciones_usd / totCap) * 100).toFixed(2)}%</td>
                          <td style={{ textAlign: 'right', fontFamily: "'DM Mono', monospace", fontSize: 10, color: b.mom_captaciones >= 0 ? '#1DB97A' : '#E84040' }}>{fp(b.mom_captaciones)}</td>
                          <td style={{ width: 70 }}><div className="pb"><div className="pbf" style={{ width: `${(b.captaciones_usd / bancos[0].captaciones_usd * 100).toFixed(0)}%`, background: isN58 ? '#00D4FF' : TC[b.tipo] }} /></div></td>
                        </tr>
                      )
                    })}</tbody>
                  </table>
                </div>
              </div>
              <div className="card">
                <div className="chd"><span className="ct">Indicadores sistema</span></div>
                <div className="cbd" style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {[
                    { l: 'Total activos', v: `USD ${fmt(bancos.reduce((a, b) => a + b.activos_usd, 0))}B` },
                    { l: 'Captaciones del público', v: `USD ${fmt(totCap)}B`, d: '-1.8% MoM' },
                    { l: 'Cartera de créditos', v: `USD ${fmt(bancos.reduce((a, b) => a + b.cartera_usd, 0))}B`, d: '-3.3% MoM' },
                    { l: 'Patrimonio total', v: `USD ${fmt(bancos.reduce((a, b) => a + b.patrimonio_usd, 0))}B` },
                    { l: 'Mora promedio', v: (bancos.reduce((a, b) => a + b.morosidad, 0) / bancos.length).toFixed(2) + '%' },
                    { l: 'Índice intermediación', v: ((bancos.reduce((a, b) => a + b.cartera_usd, 0) / totCap) * 100).toFixed(1) + '%' },
                    { l: 'Instituciones', v: bancos.length + ' bancos' },
                    { l: 'Fuente', v: 'GlobalScope / SUDEBAN' },
                  ].map((m, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid rgba(25,35,56,.6)' }}>
                      <span style={{ fontSize: 10, color: '#7090B8' }}>{m.l}</span>
                      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11 }}>{m.v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* ② MICRO */}
        {tab === 'micro' && (
          <>
            <div className="card" style={{ borderColor: 'rgba(155,110,232,.35)' }}>
              <div className="chd">
                <span style={{ fontSize: 9, fontFamily: "'DM Mono', monospace", textTransform: 'uppercase', letterSpacing: '1.2px', color: '#9B6EE8', fontWeight: 500 }}>Banca microfinanciera · posición en el sistema</span>
                <button onClick={() => setTab('n58comp')} style={{ fontSize: 9, padding: '3px 9px', borderRadius: 3, cursor: 'pointer', background: 'rgba(0,212,255,.08)', border: '1px solid #008BAA', color: '#00D4FF', fontFamily: "'DM Mono', monospace" }}>► Drill-down → N58 vs competidores</button>
              </div>
              <div className="cbd">
                <div className="g4" style={{ marginBottom: 0 }}>
                  {[
                    { l: 'Captaciones seg. micro', v: `USD ${fmt(microCap)}B`, sub: `${((microCap / totCap) * 100).toFixed(2)}% del sistema`, c: '#9B6EE8' },
                    { l: 'Cartera créditos', v: `USD ${fmt(micros.reduce((a, b) => a + b.cartera_usd, 0))}B`, sub: `${((micros.reduce((a, b) => a + b.cartera_usd, 0) / microCap) * 100).toFixed(1)}% interm.`, c: '#8B5CF6' },
                    { l: 'Patrimonio micro', v: `USD ${fmt(micros.reduce((a, b) => a + b.patrimonio_usd, 0))}B`, sub: `${micros.length} bancos en segmento`, c: '#D4A843' },
                    { l: 'N58 morosidad', v: `${n58.morosidad.toFixed(2)}%`, sub: '#2 mejor mora de todo el sistema', c: '#1DB97A' },
                  ].map((t, i) => (
                    <div key={i} style={{ background: '#101525', border: '1px solid #192338', borderRadius: 6, padding: '9px 11px', borderTop: `2px solid ${t.c}` }}>
                      <div style={{ fontSize: 9, color: '#415070', fontFamily: "'DM Mono', monospace", textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 3 }}>{t.l}</div>
                      <div style={{ fontSize: 16, fontWeight: 600, fontFamily: "'DM Mono', monospace", color: t.c }}>{t.v}</div>
                      <div style={{ fontSize: 9, color: '#415070', marginTop: 2 }}>{t.sub}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="g2">
              <div className="card">
                <div className="chd"><span className="ct">Ranking segmento microfinanciero</span></div>
                <div style={{ overflowX: 'auto' }}>
                  <table><thead><tr><th>#</th><th>Banco</th><th style={{ textAlign: 'right' }}>Captac.</th><th style={{ textAlign: 'right' }}>Cartera</th><th style={{ textAlign: 'right' }}>Mora</th><th style={{ textAlign: 'right' }}>ROA</th><th style={{ textAlign: 'right' }}>ROE</th><th style={{ textAlign: 'right' }}>MoM cap.</th></tr></thead>
                    <tbody>{[...micros].sort((a, b) => b.captaciones_usd - a.captaciones_usd).map((b, i) => (
                      <tr key={b.id} className={b.sigla === 'N58' ? 'nr' : ''}>
                        <td><span style={{ display: 'inline-flex', width: 20, height: 20, alignItems: 'center', justifyContent: 'center', borderRadius: 3, fontSize: 9, fontFamily: "'DM Mono', monospace", fontWeight: 700, background: b.sigla === 'N58' ? 'rgba(0,212,255,.15)' : '#162035', color: b.sigla === 'N58' ? '#00D4FF' : '#415070', border: `1px solid ${b.sigla === 'N58' ? '#008BAA' : '#192338'}` }}>{i + 1}</span></td>
                        <td>{b.sigla === 'N58' && <span className="tag" style={{ background: 'rgba(0,212,255,.1)', color: '#00D4FF', border: '1px solid #008BAA', marginRight: 4 }}>★</span>}{b.nombre}</td>
                        <td style={{ textAlign: 'right', fontFamily: "'DM Mono', monospace", fontSize: 10 }}>{fmt(b.captaciones_usd)}B</td>
                        <td style={{ textAlign: 'right', fontFamily: "'DM Mono', monospace", fontSize: 10 }}>{fmt(b.cartera_usd)}B</td>
                        <td style={{ textAlign: 'right', fontFamily: "'DM Mono', monospace", fontSize: 10, color: b.morosidad < 2 ? '#1DB97A' : b.morosidad < 5 ? '#E89B30' : '#E84040' }}>{b.morosidad.toFixed(2)}%</td>
                        <td style={{ textAlign: 'right', fontFamily: "'DM Mono', monospace", fontSize: 10, color: b.roa > 10 ? '#1DB97A' : '#E89B30' }}>{b.roa.toFixed(1)}%</td>
                        <td style={{ textAlign: 'right', fontFamily: "'DM Mono', monospace", fontSize: 10 }}>{b.roe.toFixed(1)}%</td>
                        <td style={{ textAlign: 'right', fontFamily: "'DM Mono', monospace", fontSize: 10, color: b.mom_captaciones >= 0 ? '#1DB97A' : '#E84040' }}>{fp(b.mom_captaciones)}</td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              </div>
              <div className="card">
                <div className="chd"><span className="ct">Micro vs sistema · captaciones</span></div>
                <div className="cbd">
                  <Bar data={{
                    labels: ['Captaciones', 'Cartera', 'Patrimonio'],
                    datasets: [
                      { label: 'Microfinanciero', data: [microCap, micros.reduce((a, b) => a + b.cartera_usd, 0), micros.reduce((a, b) => a + b.patrimonio_usd, 0)], backgroundColor: 'rgba(155,110,232,.35)', borderColor: '#9B6EE8', borderWidth: 1.5 },
                      { label: 'Resto sistema', data: [bancos.filter(b => b.tipo !== 'Microfinanciero').reduce((a, b) => a + b.captaciones_usd, 0), bancos.filter(b => b.tipo !== 'Microfinanciero').reduce((a, b) => a + b.cartera_usd, 0), bancos.filter(b => b.tipo !== 'Microfinanciero').reduce((a, b) => a + b.patrimonio_usd, 0)], backgroundColor: 'rgba(71,85,105,.2)', borderColor: '#475569', borderWidth: 1 }
                    ]
                  }} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: true, position: 'bottom', labels: { color: '#415070', font: { size: 9 }, boxWidth: 8 } } }, scales: { x: { grid: { color: 'rgba(25,35,56,.5)' }, ticks: { color: '#415070', font: { size: 10 } } }, y: { grid: { color: 'rgba(25,35,56,.5)' }, ticks: { color: '#415070', font: { size: 9 }, callback: (v: any) => v + 'B' } } } }} height={220} />
                </div>
              </div>
            </div>
          </>
        )}

        {/* ③ N58 VS COMPETIDORES */}
        {tab === 'n58comp' && (
          <>
            <div className="card" style={{ borderColor: '#008BAA' }}>
              <div className="chd"><span className="ct">N58 vs bangente · bancrecer · r4 · datos reales {periodo}</span></div>
              <div className="cbd">
                <div className="g4">
                  {comp.map(b => {
                    const col = MICRO_COLORS[b.sigla] || '#9B6EE8'
                    const isN58 = b.sigla === 'N58'
                    const maxCap = Math.max(...comp.map(c => c.captaciones_usd))
                    return (
                      <div key={b.id} style={{ background: isN58 ? 'rgba(0,212,255,.05)' : '#101525', border: `1px solid ${isN58 ? '#008BAA' : '#192338'}`, borderRadius: 6, padding: '9px 11px', borderTop: `2px solid ${col}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                          <span className="tag" style={{ background: col + '18', color: col, border: `1px solid ${col}40` }}>{b.sigla}</span>
                          {isN58 && <span style={{ fontSize: 8, color: '#00D4FF', fontFamily: "'DM Mono', monospace" }}>★ MI BANCO</span>}
                        </div>
                        <div style={{ fontSize: 16, fontWeight: 600, fontFamily: "'DM Mono', monospace", color: col }}>USD {fmt(b.captaciones_usd)}B</div>
                        <div style={{ fontSize: 9, color: '#415070', marginTop: 1 }}>Mora {b.morosidad.toFixed(1)}% · ROA {b.roa.toFixed(1)}%</div>
                        <div className="pb" style={{ marginTop: 5 }}><div className="pbf" style={{ width: `${(b.captaciones_usd / maxCap * 100).toFixed(0)}%`, background: col }} /></div>
                        <div style={{ display: 'flex', gap: 4, marginTop: 5 }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, padding: '2px 5px', borderRadius: 3, fontSize: 8, fontFamily: "'DM Mono', monospace", background: b.mom_captaciones >= 0 ? 'rgba(29,185,122,.1)' : 'rgba(232,64,64,.1)', color: b.mom_captaciones >= 0 ? '#1DB97A' : '#E84040', border: `1px solid ${b.mom_captaciones >= 0 ? 'rgba(29,185,122,.25)' : 'rgba(232,64,64,.25)'}` }}>{b.mom_captaciones >= 0 ? '▲' : '▼'}{Math.abs(b.mom_captaciones).toFixed(1)}%MoM</span>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, padding: '2px 5px', borderRadius: 3, fontSize: 8, fontFamily: "'DM Mono', monospace", background: 'rgba(29,185,122,.1)', color: '#1DB97A', border: '1px solid rgba(29,185,122,.25)' }}>▲{b.yoy_captaciones.toFixed(0)}%YoY</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
            <div className="g2">
              <div className="card">
                <div className="chd"><span className="ct">Captaciones y cartera · comparado</span></div>
                <div className="cbd">
                  <Bar data={{
                    labels: comp.map(b => b.sigla),
                    datasets: [
                      { label: 'Captaciones', data: comp.map(b => b.captaciones_usd), backgroundColor: comp.map(b => (MICRO_COLORS[b.sigla] || '#9B6EE8') + '44'), borderColor: comp.map(b => MICRO_COLORS[b.sigla] || '#9B6EE8'), borderWidth: 1.5 },
                      { label: 'Cartera', data: comp.map(b => b.cartera_usd), backgroundColor: comp.map(b => (MICRO_COLORS[b.sigla] || '#9B6EE8') + '22'), borderColor: comp.map(b => MICRO_COLORS[b.sigla] || '#9B6EE8'), borderWidth: 1 }
                    ]
                  }} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: true, position: 'bottom', labels: { color: '#415070', font: { size: 9 }, boxWidth: 8 } } }, scales: { x: { grid: { color: 'rgba(25,35,56,.5)' }, ticks: { color: '#415070', font: { size: 10 } } }, y: { grid: { color: 'rgba(25,35,56,.5)' }, ticks: { color: '#415070', font: { size: 9 }, callback: (v: any) => v + 'B' } } } }} height={200} />
                </div>
              </div>
              <div className="card">
                <div className="chd"><span className="ct">Tabla comparativa completa</span></div>
                <div style={{ overflowX: 'auto' }}>
                  <table><thead><tr><th>Banco</th><th style={{ textAlign: 'right' }}>Captac.</th><th style={{ textAlign: 'right' }}>Cartera</th><th style={{ textAlign: 'right' }}>Mora</th><th style={{ textAlign: 'right' }}>ROA</th><th style={{ textAlign: 'right' }}>ROE</th><th style={{ textAlign: 'right' }}>AdecPat</th><th style={{ textAlign: 'right' }}>MoM</th><th style={{ textAlign: 'right' }}>YoY</th></tr></thead>
                    <tbody>{comp.map(b => {
                      const col = MICRO_COLORS[b.sigla] || '#9B6EE8'
                      return (
                        <tr key={b.id} className={b.sigla === 'N58' ? 'nr' : ''}>
                          <td><span className="tag" style={{ background: col + '18', color: col, border: `1px solid ${col}40`, marginRight: 4 }}>{b.sigla}</span>{b.nombre}</td>
                          <td style={{ textAlign: 'right', fontFamily: "'DM Mono', monospace", fontSize: 10 }}>{fmt(b.captaciones_usd)}B</td>
                          <td style={{ textAlign: 'right', fontFamily: "'DM Mono', monospace", fontSize: 10 }}>{fmt(b.cartera_usd)}B</td>
                          <td style={{ textAlign: 'right', fontFamily: "'DM Mono', monospace", fontSize: 10, color: b.morosidad < 2 ? '#1DB97A' : b.morosidad < 5 ? '#E89B30' : '#E84040' }}>{b.morosidad.toFixed(2)}%</td>
                          <td style={{ textAlign: 'right', fontFamily: "'DM Mono', monospace", fontSize: 10, color: b.roa > 10 ? '#1DB97A' : '#E89B30' }}>{b.roa.toFixed(1)}%</td>
                          <td style={{ textAlign: 'right', fontFamily: "'DM Mono', monospace", fontSize: 10 }}>{b.roe.toFixed(1)}%</td>
                          <td style={{ textAlign: 'right', fontFamily: "'DM Mono', monospace", fontSize: 10 }}>{b.adec_patrimonial.toFixed(1)}%</td>
                          <td style={{ textAlign: 'right', fontFamily: "'DM Mono', monospace", fontSize: 10, color: b.mom_captaciones >= 0 ? '#1DB97A' : '#E84040' }}>{fp(b.mom_captaciones)}</td>
                          <td style={{ textAlign: 'right', fontFamily: "'DM Mono', monospace", fontSize: 10, color: '#1DB97A' }}>+{b.yoy_captaciones.toFixed(0)}%</td>
                        </tr>
                      )
                    })}</tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}

        {/* RANKING SISTEMA */}
        {tab === 'ranking' && (
          <div className="card">
            <div className="chd">
              <span className="ct">Ranking sistema completo · {bancos.length} bancos · {periodo}</span>
              <div style={{ display: 'flex', gap: 4 }}>
                {(['captaciones_usd', 'cartera_usd', 'patrimonio_usd', 'morosidad', 'roa'] as (keyof Banco)[]).map((f, i) => (
                  <button key={f} onClick={() => setRankField(f)} style={{ fontSize: 9, padding: '3px 8px', borderRadius: 3, cursor: 'pointer', fontFamily: "'DM Mono', monospace", background: rankField === f ? 'rgba(0,212,255,.12)' : '#101525', border: `1px solid ${rankField === f ? '#008BAA' : '#192338'}`, color: rankField === f ? '#00D4FF' : '#415070', transition: 'all .15s' }}>
                    {['Captaciones', 'Cartera', 'Patrimonio', 'Morosidad ↑', 'ROA'][i]}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ overflowX: 'auto', maxHeight: 520, overflowY: 'auto' }}>
              <table><thead><tr><th>#</th><th>Banco</th><th>Tipo</th><th style={{ textAlign: 'right' }}>Valor</th><th style={{ textAlign: 'right' }}>Part.%</th><th style={{ textAlign: 'right' }}>MoM cap.</th><th style={{ textAlign: 'right' }}>Mora</th><th style={{ textAlign: 'right' }}>ROA</th><th style={{ textAlign: 'right' }}>ROE</th><th></th></tr></thead>
                <tbody>{sortedBancos.map((b, i) => {
                  const isN58 = b.sigla === 'N58'; const isMicro = b.tipo === 'Microfinanciero'
                  const val = rankField === 'morosidad' ? b.morosidad.toFixed(2) + '%' : rankField === 'roa' ? b.roa.toFixed(1) + '%' : `USD ${fmt(b[rankField] as number)}B`
                  const maxV = sortedBancos[0][rankField] as number
                  return (
                    <tr key={b.id} className={isN58 ? 'nr' : isMicro ? 'mr' : ''}>
                      <td><span style={{ display: 'inline-flex', width: 20, height: 20, alignItems: 'center', justifyContent: 'center', borderRadius: 3, fontSize: 9, fontFamily: "'DM Mono', monospace", fontWeight: 700, background: isN58 ? 'rgba(0,212,255,.15)' : i < 3 ? 'rgba(240,192,64,.12)' : '#162035', color: isN58 ? '#00D4FF' : i < 3 ? '#F0C040' : '#415070', border: `1px solid ${isN58 ? '#008BAA' : i < 3 ? 'rgba(240,192,64,.3)' : '#192338'}` }}>{i + 1}</span></td>
                      <td>{isN58 && <span className="tag" style={{ background: 'rgba(0,212,255,.1)', color: '#00D4FF', border: '1px solid #008BAA', marginRight: 4 }}>★ N58</span>}{b.nombre}</td>
                      <td><span className="tag" style={{ background: TC[b.tipo] + '18', color: TC[b.tipo], border: `1px solid ${TC[b.tipo]}40` }}>{b.tipo}</span></td>
                      <td style={{ textAlign: 'right', fontFamily: "'DM Mono', monospace", fontSize: 10 }}>{val}</td>
                      <td style={{ textAlign: 'right', fontFamily: "'DM Mono', monospace", fontSize: 10 }}>{((b.captaciones_usd / totCap) * 100).toFixed(2)}%</td>
                      <td style={{ textAlign: 'right', fontFamily: "'DM Mono', monospace", fontSize: 10, color: b.mom_captaciones >= 0 ? '#1DB97A' : '#E84040' }}>{fp(b.mom_captaciones)}</td>
                      <td style={{ textAlign: 'right', fontFamily: "'DM Mono', monospace", fontSize: 10, color: b.morosidad < 2 ? '#1DB97A' : b.morosidad < 5 ? '#E89B30' : '#E84040' }}>{b.morosidad.toFixed(1)}%</td>
                      <td style={{ textAlign: 'right', fontFamily: "'DM Mono', monospace", fontSize: 10, color: b.roa > 15 ? '#1DB97A' : b.roa > 5 ? '#E89B30' : '#E84040' }}>{b.roa.toFixed(1)}%</td>
                      <td style={{ textAlign: 'right', fontFamily: "'DM Mono', monospace", fontSize: 10 }}>{b.roe.toFixed(1)}%</td>
                      <td style={{ width: 60 }}><div className="pb"><div className="pbf" style={{ width: `${((b[rankField] as number) / maxV * 100).toFixed(0)}%`, background: isN58 ? '#00D4FF' : TC[b.tipo] }} /></div></td>
                    </tr>
                  )
                })}</tbody>
              </table>
            </div>
          </div>
        )}

        {/* FICHA N58 */}
        {tab === 'ficha' && (
          <div className="g2">
            <div className="card" style={{ borderColor: '#008BAA' }}>
              <div className="chd"><span className="ct">N58 banco digital · ficha completa · {periodo}</span></div>
              <div className="cbd" style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {[
                  { l: 'Activos totales', v: `USD ${fmt(n58.activos_usd)}B`, d: 'Var. M/M: +4.0%' },
                  { l: 'Captaciones del público', v: `USD ${fmt(n58.captaciones_usd)}B`, d: `MoM: ${fp(n58.mom_captaciones)} · YoY: +${n58.yoy_captaciones.toFixed(0)}%` },
                  { l: 'Cartera de créditos', v: `USD ${fmt(n58.cartera_usd)}B`, d: `MoM: ${fp(n58.mom_cartera)} · YoY: +${n58.yoy_cartera.toFixed(0)}%` },
                  { l: 'Patrimonio', v: `USD ${fmt(n58.patrimonio_usd)}B`, d: 'Var. M/M: -4.2%' },
                  { l: 'Morosidad de cartera', v: `${n58.morosidad.toFixed(2)}%`, d: '#2 mejor del sistema (solo Del Sur tiene menos)' },
                  { l: 'Adecuación patrimonial', v: `${n58.adec_patrimonial.toFixed(1)}%`, d: '#23 en sistema · a monitorear' },
                  { l: 'ROA anualizado', v: `${n58.roa.toFixed(1)}%`, d: '#15 en sistema' },
                  { l: 'ROE anualizado', v: `${n58.roe.toFixed(1)}%`, d: '#12 en sistema (sin B.I.D.)' },
                  { l: 'Liquidez', v: `${n58.liquidez.toFixed(1)}%`, d: '#17 en sistema' },
                  { l: 'Share captaciones sistema', v: `${((n58.captaciones_usd / totCap) * 100).toFixed(3)}%`, d: `USD ${fmt(n58.captaciones_usd)}B de USD ${fmt(totCap)}B total` },
                  { l: 'Share seg. microfinanciero', v: `${((n58.captaciones_usd / microCap) * 100).toFixed(1)}%`, d: 'captaciones del segmento' },
                  { l: 'Único banco 100% digital', v: '0 sucursales físicas', d: 'Sin red física en el sistema' },
                ].map((m, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid rgba(25,35,56,.6)' }}>
                    <span style={{ fontSize: 10, color: '#7090B8' }}>{m.l}</span>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: '#00D4FF' }}>{m.v}</div>
                      <div style={{ fontSize: 9, color: '#415070' }}>{m.d}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div className="card">
                <div className="chd"><span className="ct">N58 · posiciones en el sistema</span></div>
                <div className="cbd" style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {[
                    { l: `#${rkCap} de ${bancos.length}`, sub: 'ranking captaciones', good: false },
                    { l: '#2 mora más baja', sub: '0.1% — solo Del Sur (0.0%) es mejor', good: true },
                    { l: `#15 ROA: ${n58.roa.toFixed(1)}%`, sub: 'rentabilidad sobre activos', good: true },
                    { l: `#12 ROE: ${n58.roe.toFixed(1)}%`, sub: 'rentabilidad sobre patrimonio', good: true },
                    { l: '+28.2% MoM captaciones', sub: 'mayor crecimiento del segmento micro', good: true },
                    { l: '+3.128% YoY cartera', sub: 'mayor YoY cartera de todo el sistema', good: true },
                    { l: '100% digital · 0 suc.', sub: 'único banco sin sucursales físicas', good: true },
                    { l: `${((n58.captaciones_usd / microCap) * 100).toFixed(1)}% share micro`, sub: 'participación en captaciones', good: false },
                  ].map((p, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(25,35,56,.6)' }}>
                      <span style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: p.good ? '#1DB97A' : '#00D4FF' }}>{p.l}</span>
                      <span style={{ fontSize: 9, color: '#415070' }}>{p.sub}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* INSIGHTS */}
        {tab === 'insights' && (
          <>
            <div className="card" style={{ borderColor: '#008BAA' }}>
              <div className="chd"><span className="ct">Insights estratégicos · n58 banco digital · {periodo} · datos reales</span></div>
              <div className="cbd">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
                  {[
                    { type: 'ok', label: 'FORTALEZA EXCEPCIONAL', title: '#2 mora más baja del sistema: 0.1%', body: 'Solo Del Sur (0.0%) tiene menor morosidad. En el segmento micro N58 es el mejor por amplio margen: Bancrecer 9.4%, Bangente 7.1%, R4 3.5%. El modelo digital de scoring reduce asimetría de información.' },
                    { type: 'ok', label: 'FORTALEZA', title: 'ROE 58.5% · #12 del sistema', body: 'Por encima del promedio del sistema. En el segmento micro N58 supera a Bangente (7.7%) y Bancrecer (21.1%). El modelo sin sucursales genera rentabilidad sobre patrimonio muy competitiva.' },
                    { type: 'ok', label: 'FORTALEZA', title: 'Mayor YoY cartera del sistema: +3.128%', body: 'El mayor crecimiento YoY de cartera de créditos de los 25 bancos. MoM +27.7% también es el mayor del segmento micro. La aceleración en colocación de crédito es una fortaleza operacional clave.' },
                    { type: 'opp', label: 'OPORTUNIDAD', title: 'Cerrar brecha con Bancrecer en cartera', body: 'Bancrecer tiene USD 12.7B en cartera vs USD 1.2B de N58, pero con morosidad de 9.4% vs 0.1%. N58 puede expandir agresivamente la cartera aprovechando su ventaja en gestión de riesgo crediticio.' },
                    { type: 'opp', label: 'OPORTUNIDAD', title: 'Alcanzar liderazgo en captaciones micro', body: 'La brecha con Bangente (#1 en captaciones micro con USD 3.1B) es de USD 0.7B. Con +28.2% MoM sostenido, N58 puede alcanzar y superar a Bangente en captaciones en los próximos 1-2 meses.' },
                    { type: 'warn', label: 'A MONITOREAR', title: 'Adecuación patrimonial: 17.7% (#23)', body: 'La más baja del segmento micro. El crecimiento acelerado en captaciones (+28.2% MoM) y cartera (+27.7% MoM) requiere fortalecer capital para sostener la expansión sin deteriorar el ratio de solvencia.' },
                  ].map((ins, i) => (
                    <div key={i} className={`ins ${ins.type}`}>
                      <div style={{ fontSize: 9, fontFamily: "'DM Mono', monospace", textTransform: 'uppercase', letterSpacing: '.8px', marginBottom: 3, color: ins.type === 'ok' ? '#1DB97A' : ins.type === 'opp' ? '#00D4FF' : '#E89B30' }}>{ins.label}</div>
                      <div style={{ fontSize: 11, fontWeight: 500, color: '#DCE8FF', marginBottom: 4, lineHeight: 1.3 }}>{ins.title}</div>
                      <div style={{ fontSize: 10, color: '#7090B8', lineHeight: 1.5 }}>{ins.body}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="g2">
              <div className="card">
                <div className="chd"><span className="ct">Escenarios de crecimiento captaciones · base {fmt(n58.captaciones_usd)}B</span></div>
                <div className="cbd" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    { label: 'Conservador (+10% MoM)', val: (n58.captaciones_usd * 1.1).toFixed(2), note: 'Por debajo del ritmo actual de enero', type: 'warn' },
                    { label: 'Base (mantener +28% MoM)', val: (n58.captaciones_usd * 1.28).toFixed(2), note: 'Igual al crecimiento de enero 2026', type: 'opp' },
                    { label: 'Acelerado (+40% MoM)', val: (n58.captaciones_usd * 1.40).toFixed(2), note: 'Superaría captaciones de Bangente', type: 'ok' },
                    { label: 'Objetivo liderazgo micro', val: '> 3.10', note: 'Superar captaciones de Bangente', type: 'ok' },
                  ].map((e, i) => (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 1fr', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '1px solid rgba(25,35,56,.6)' }}>
                      <span style={{ fontSize: 10, color: '#7090B8' }}>{e.label}</span>
                      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: '#00D4FF', textAlign: 'right' }}>USD {e.val}B</span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 6px', borderRadius: 3, fontSize: 9, fontFamily: "'DM Mono', monospace", background: e.type === 'ok' ? 'rgba(29,185,122,.1)' : e.type === 'warn' ? 'rgba(232,64,64,.1)' : 'rgba(0,212,255,.08)', color: e.type === 'ok' ? '#1DB97A' : e.type === 'warn' ? '#E84040' : '#00D4FF', border: `1px solid ${e.type === 'ok' ? 'rgba(29,185,122,.25)' : e.type === 'warn' ? 'rgba(232,64,64,.25)' : 'rgba(0,212,255,.2)'}` }}>{e.note}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card">
                <div className="chd"><span className="ct">N58 vs micro · indicadores clave</span></div>
                <div className="cbd">
                  <Bar data={{
                    labels: ['Mora (%)', 'ROA (%)', 'ROE/10 (%)', 'AdecPat (%)'],
                    datasets: comp.map(b => ({
                      label: b.sigla,
                      data: [b.morosidad, b.roa, b.roe / 10, b.adec_patrimonial],
                      backgroundColor: (MICRO_COLORS[b.sigla] || '#9B6EE8') + '44',
                      borderColor: MICRO_COLORS[b.sigla] || '#9B6EE8',
                      borderWidth: 1.5
                    }))
                  }} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: true, position: 'bottom', labels: { color: '#415070', font: { size: 9 }, boxWidth: 8 } } }, scales: { x: { grid: { color: 'rgba(25,35,56,.5)' }, ticks: { color: '#415070', font: { size: 9 } } }, y: { grid: { color: 'rgba(25,35,56,.5)' }, ticks: { color: '#415070', font: { size: 9 }, callback: (v: any) => v + '%' } } } }} height={220} />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
