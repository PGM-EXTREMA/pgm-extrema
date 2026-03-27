import { useState, useEffect } from 'react'
import { useAuth } from '../App'
import { listarProtocolos, atualizarStatusProtocolo, responderProtocolo, listarDemandas, criarDemanda, atualizarDemanda, excluirDemanda, listar, inserir, atualizar, excluir, listarUsuariosPGM } from '../lib/supabase'

const fmtDate = (d) => { if(!d) return '\u2014'; const [y,m,da]=(d.split('T')[0]).split('-'); return `${da}/${m}/${y}` }
const daysLeft = (d) => { if(!d) return null; return Math.ceil((new Date(d.split('T')[0])-new Date(new Date().toISOString().split('T')[0]))/86400000) }
const fmtCurrency = (v) => { if(!v) return '\u2014'; return 'R$ '+parseFloat(v).toLocaleString('pt-BR',{minimumFractionDigits:2}) }
const initials = (n) => (n||'?').split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2)
const COLORS = ['#e05c5c','#4caf82','#4a90d9','#c9a84c','#9b59b6','#e09440','#1abc9c']
const getColor = (n) => { let h=0; for(let c of (n||'?')) h=(h*31+c.charCodeAt(0))%COLORS.length; return COLORS[h] }

export default function PainelPGM() {
  const { perfil, logout } = useAuth()
  const usuario = perfil?.dados
  const [view, setView] = useState('dashboard')
  const [data, setData] = useState({ protocolos:[], demandas:[], usuarios:[], judiciais:[], licitacoes:[], contratos:[], pareceres:[], oficios:[], pae:[], projetos:[] })
  const [loading, setLoading] = useState(true)
  const [notify, setNotify] = useState(null)

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    setLoading(true)
    const [p,d,u,j,l,c,par,o,pa,pl] = await Promise.all([
      listarProtocolos(), listarDemandas(), listarUsuariosPGM(),
      listar('processos_judiciais','*,responsavel:usuarios_pgm(nome)'),
      listar('licitacoes','*,responsavel:usuarios_pgm(nome)'),
      listar('contratos','*,responsavel:usuarios_pgm(nome)'),
      listar('pareceres','*,emissor:usuarios_pgm(nome)'),
      listar('oficios','*,responsavel:usuarios_pgm(nome)'),
      listar('pae','*,responsavel:usuarios_pgm(nome)'),
      listar('projetos_lei'),
    ])
    setData({ protocolos:p.data||[], demandas:d.data||[], usuarios:u.data||[], judiciais:j.data||[], licitacoes:l.data||[], contratos:c.data||[], pareceres:par.data||[], oficios:o.data||[], pae:pa.data||[], projetos:pl.data||[] })
    setLoading(false)
  }

  function showNotify(msg) { setNotify(msg); setTimeout(()=>setNotify(null),3000) }

  const protPend = data.protocolos.filter(p=>p.status==='recebido'||p.status==='em_analise').length
  const demVenc = data.demandas.filter(d=>{ if(d.status==='concluida') return false; const dl=daysLeft(d.prazo); return dl!==null&&dl<0 }).length
  const ctVenc = data.contratos.filter(c=>{ const dl=daysLeft(c.fim); return c.status==='vigente'&&dl!==null&&dl<=60 }).length

  const nav = [
    {id:'dashboard',icon:'\u{1F4CA}',label:'Dashboard'},
    {id:'protocolos',icon:'\u{1F4E8}',label:'Protocolos',badge:protPend},
    {id:'demandas',icon:'\u{1F4CB}',label:'Demandas',badge:demVenc},
    {id:'judiciais',icon:'\u{1F3DB}',label:'Judiciais'},
    {id:'licitacoes',icon:'\u{1F4D1}',label:'Licitacoes'},
    {id:'contratos',icon:'\u{1F4C3}',label:'Contratos',badge:ctVenc?'!':0},
    {id:'pareceres',icon:'\u{1F4DD}',label:'Pareceres'},
    {id:'oficios',icon:'\u{1F4EC}',label:'Oficios'},
    {id:'pae',icon:'\u{1F4C2}',label:'PAE'},
    {id:'projetos',icon:'\u2696',label:'Proj. de Lei'},
  ]

  const st = {topbar:{padding:'16px 28px',borderBottom:'1px solid rgba(255,255,255,0.06)',display:'flex',alignItems:'center',justifyContent:'space-between',background:'rgba(13,27,42,0.9)',position:'sticky',top:0,zIndex:10},h2:{fontFamily:"'Playfair Display',serif",fontSize:18,margin:0,color:'#f0ece3'},sub:{fontSize:11,color:'#8a9bb0',margin:'2px 0 0'},field:{width:'100%',padding:'8px 12px',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:7,fontSize:12,color:'#f0ece3',fontFamily:"'DM Sans',sans-serif",outline:'none',boxSizing:'border-box'},label:{display:'block',fontSize:10,color:'#8a9bb0',textTransform:'uppercase',letterSpacing:0.8,marginBottom:5},btnP:{background:'#c9a84c',color:'#0d1b2a',border:'none',padding:'8px 18px',borderRadius:7,cursor:'pointer',fontSize:12,fontWeight:600},btnG:{background:'rgba(255,255,255,0.06)',color:'#8a9bb0',border:'1px solid rgba(255,255,255,0.1)',padding:'8px 16px',borderRadius:7,cursor:'pointer',fontSize:12},btnS:{padding:'4px 8px',borderRadius:5,cursor:'pointer',fontSize:11},th:{textAlign:'left',padding:'8px 12px',fontSize:10,fontWeight:600,color:'#8a9bb0',textTransform:'uppercase',letterSpacing:1,borderBottom:'1px solid rgba(255,255,255,0.06)'},td:{padding:'10px 12px',fontSize:12,color:'#f0ece3',borderBottom:'1px solid rgba(255,255,255,0.04)',verticalAlign:'middle'},overlay:{position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',backdropFilter:'blur(6px)',zIndex:200,display:'flex',alignItems:'center',justifyContent:'center'},modal:{background:'#162032',border:'1px solid rgba(201,168,76,0.3)',borderRadius:14,width:560,maxWidth:'95vw',maxHeight:'90vh',overflow:'auto'},mH:{padding:'18px 22px 14px',borderBottom:'1px solid rgba(255,255,255,0.08)',display:'flex',alignItems:'center',justifyContent:'space-between'},mF:{padding:'14px 22px',borderTop:'1px solid rgba(255,255,255,0.06)',display:'flex',gap:10,justifyContent:'flex-end'}}

  return (
    <div style={{display:'flex',minHeight:'100vh',background:'#0d1b2a',fontFamily:"'DM Sans',sans-serif",color:'#f0ece3'}}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet"/>
      {notify && <div style={{position:'fixed',top:18,right:18,zIndex:300,background:'#162032',border:'1px solid #c9a84c',borderRadius:10,padding:'12px 18px',fontSize:13}}>{notify}</div>}
      <aside style={{width:220,background:'#162032',borderRight:'1px solid rgba(201,168,76,0.2)',display:'flex',flexDirection:'column',flexShrink:0}}>
        <div style={{padding:'18px 20px 14px',borderBottom:'1px solid rgba(201,168,76,0.15)'}}>
          <div style={{fontSize:22,marginBottom:8}}>\u2696\uFE0F</div>
          <div style={{fontFamily:"'Playfair Display',serif",color:'#c9a84c',fontSize:11,fontWeight:600,textTransform:'uppercase',lineHeight:1.4}}>Procuradoria-Geral<br/>do Municipio</div>
          <div style={{fontSize:10,color:'#8a9bb0',marginTop:2,letterSpacing:1,textTransform:'uppercase'}}>Extrema - MG</div>
        </div>
        <nav style={{flex:1,padding:'10px 0',overflowY:'auto'}}>
          {nav.map(item=>(
            <button key={item.id} onClick={()=>setView(item.id)} style={{display:'flex',alignItems:'center',gap:9,width:'100%',padding:'9px 20px',background:view===item.id?'rgba(201,168,76,0.15)':'transparent',border:'none',borderLeft:'3px solid '+(view===item.id?'#c9a84c':'transparent'),color:view===item.id?'#c9a84c':'#8a9bb0',cursor:'pointer',fontSize:12,fontFamily:"'DM Sans',sans-serif",fontWeight:view===item.id?500:400,textAlign:'left'}}>
              <span style={{fontSize:13}}>{item.icon}</span>
              <span style={{flex:1}}>{item.label}</span>
              {!!item.badge && <span style={{background:'#e05c5c',color:'white',fontSize:10,fontWeight:600,padding:'1px 6px',borderRadius:20}}>{item.badge}</span>}
            </button>
          ))}
        </nav>
        <div style={{padding:'12px 20px',borderTop:'1px solid rgba(201,168,76,0.1)'}}>
          <div style={{display:'flex',alignItems:'center',gap:9,marginBottom:10}}>
            <div style={{width:30,height:30,borderRadius:'50%',background:getColor(usuario?.nome),display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,color:'white'}}>{initials(usuario?.nome)}</div>
            <div><div style={{fontSize:11,fontWeight:500}}>{usuario?.nome}</div><div style={{fontSize:10,color:'#8a9bb0'}}>{usuario?.cargo}</div></div>
          </div>
          <button onClick={logout} style={{width:'100%',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.08)',color:'#8a9bb0',padding:'6px 0',borderRadius:6,cursor:'pointer',fontSize:11}}>Sair</button>
        </div>
      </aside>
      <main style={{flex:1,overflow:'auto'}}>
        {loading ? <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',color:'#8a9bb0'}}>Carregando...</div> : <>
          {view==='dashboard' && <Dashboard data={data} setView={setView} st={st}/>}
          {view==='protocolos' && <Protocolos data={data} onUpdate={loadAll} showNotify={showNotify} perfil={perfil} st={st}/>}
          {view==='demandas' && <Demandas data={data} onUpdate={loadAll} showNotify={showNotify} st={st}/>}
          {view!=='dashboard'&&view!=='protocolos'&&view!=='demandas' && <TabelaView view={view} data={data} onUpdate={loadAll} showNotify={showNotify} st={st}/>}
        </>}
      </main>
    </div>
  )
}

function Dashboard({data,setView,st}) {
  const stats=[
    {l:'Protocolos Pendentes',v:data.protocolos.filter(p=>p.status==='recebido'||p.status==='em_analise').length,c:'#c9a84c',i:'\u{1F4E8}',view:'protocolos'},
    {l:'Demandas Ativas',v:data.demandas.filter(d=>d.status!=='concluida').length,c:'#4a90d9',i:'\u{1F4CB}',view:'demandas'},
    {l:'Processos Judiciais',v:data.judiciais.filter(j=>j.fase!=='encerrado').length,c:'#9b59b6',i:'\u{1F3DB}',view:'judiciais'},
    {l:'Contratos Vigentes',v:data.contratos.filter(c=>c.status==='vigente').length,c:'#4caf82',i:'\u{1F4C3}',view:'contratos'},
    {l:'Pareceres Emitidos',v:data.pareceres.length,c:'#e09440',i:'\u{1F4DD}',view:'pareceres'},
    {l:'Contratos Vencendo 30d',v:data.contratos.filter(c=>{const dl=daysLeft(c.fim);return c.status==='vigente'&&dl!==null&&dl<=30}).length,c:'#e05c5c',i:'\u26A0',view:'contratos'},
  ]
  return (
    <div>
      <div style={st.topbar}><div><h2 style={st.h2}>Painel de Controle</h2><p style={st.sub}>{new Date().toLocaleDateString('pt-BR',{weekday:'long',day:'2-digit',month:'long',year:'numeric'})}</p></div></div>
      <div style={{padding:'22px 28px'}}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14,marginBottom:22}}>
          {stats.map(s=><div key={s.l} onClick={()=>setView(s.view)} style={{background:'#1e2d40',border:'1px solid rgba(255,255,255,0.06)',borderRadius:10,padding:'16px 18px',borderTop:'3px solid '+s.c,cursor:'pointer'}}>
            <div style={{fontSize:10,color:'#8a9bb0',textTransform:'uppercase',letterSpacing:0.8,marginBottom:8}}>{s.i} {s.l}</div>
            <div style={{fontSize:28,fontWeight:600,color:s.c}}>{s.v}</div>
          </div>)}
        </div>
        <div style={{background:'#1e2d40',border:'1px solid rgba(255,255,255,0.06)',borderRadius:10}}>
          <div style={{padding:'14px 18px 10px',borderBottom:'1px solid rgba(255,255,255,0.06)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:14,margin:0}}>\u{1F4E8} Protocolos Recentes</h3>
            <button onClick={()=>setView('protocolos')} style={{background:'none',border:'1px solid rgba(255,255,255,0.1)',color:'#8a9bb0',padding:'4px 10px',borderRadius:5,cursor:'pointer',fontSize:11}}>Ver todos</button>
          </div>
          <div style={{padding:'8px 0'}}>
            {data.protocolos.length===0 ? <div style={{textAlign:'center',padding:24,color:'#8a9bb0',fontSize:12}}>Nenhum protocolo</div> : data.protocolos.slice(0,6).map(p=>{
              const c={recebido:'#c9a84c',em_analise:'#4a90d9',respondido:'#4caf82',arquivado:'#8a9bb0',em_andamento:'#e09440'}[p.status]||'#c9a84c'
              return <div key={p.id} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 18px',borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
                <div style={{width:6,height:6,borderRadius:'50%',background:c,flexShrink:0}}></div>
                <div style={{flex:1}}><div style={{fontSize:12,fontWeight:500}}>{(p.titulo||'').slice(0,40)}</div><div style={{fontSize:10,color:'#8a9bb0'}}>{p.secretaria?.nome} #{p.numero}</div></div>
              </div>
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

function Protocolos({data,onUpdate,showNotify,perfil,st}) {
  const [filtro,setFiltro]=useState('todos')
  const [sel,setSel]=useState(null)
  const [resp,setResp]=useState('')
  const [saving,setSaving]=useState(false)
  const sMap={recebido:{l:'Recebido',c:'#c9a84c'},em_analise:{l:'Em Analise',c:'#4a90d9'},em_andamento:{l:'Em Andamento',c:'#e09440'},respondido:{l:'Respondido',c:'#4caf82'},arquivado:{l:'Arquivado',c:'#8a9bb0'}}
  const lista=filtro==='todos'?data.protocolos:data.protocolos.filter(p=>p.status===filtro)
  async function doResp(){if(!resp.trim())return;setSaving(true);await responderProtocolo(sel.id,resp,perfil?.dados?.nome);setSaving(false);showNotify('Resposta enviada!');setSel(null);setResp('');onUpdate()}
  async function doStatus(id,s){await atualizarStatusProtocolo(id,s,perfil?.dados?.nome);showNotify('Status atualizado!');onUpdate()}
  return (
    <div>
      <div style={st.topbar}><div><h2 style={st.h2}>\u{1F4E8} Protocolos das Secretarias</h2></div></div>
      <div style={{padding:'20px 28px'}}>
        <div style={{display:'flex',gap:0,borderBottom:'1px solid rgba(255,255,255,0.06)',marginBottom:18}}>
          {['todos','recebido','em_analise','em_andamento','respondido','arquivado'].map(f=><button key={f} onClick={()=>setFiltro(f)} style={{padding:'9px 14px',background:'none',border:'none',cursor:'pointer',fontSize:12,color:filtro===f?'#c9a84c':'#8a9bb0',borderBottom:filtro===f?'2px solid #c9a84c':'2px solid transparent',marginBottom:-1}}>
            {f==='todos'?'Todos':sMap[f]?.l} <span style={{fontSize:10,background:'rgba(255,255,255,0.08)',padding:'1px 5px',borderRadius:10}}>{f==='todos'?data.protocolos.length:data.protocolos.filter(p=>p.status===f).length}</span>
          </button>)}
        </div>
        {lista.length===0?<div style={{textAlign:'center',padding:40,color:'#8a9bb0'}}>Nenhum protocolo</div>:<div style={{display:'flex',flexDirection:'column',gap:10}}>
          {lista.map(p=>{const s=sMap[p.status]||sMap.recebido;return(
            <div key={p.id} style={{background:'#1e2d40',border:'1px solid rgba(255,255,255,0.06)',borderRadius:10,padding:'16px 20px',borderLeft:'4px solid '+s.c}}>
              <div style={{display:'flex',alignItems:'flex-start',gap:12}}>
                <div style={{flex:1}}>
                  <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:5}}>
                    <span style={{fontFamily:'monospace',fontSize:11,color:'#c9a84c',fontWeight:700}}>#{p.numero}</span>
                    <span style={{fontSize:10,background:s.c+'22',color:s.c,padding:'2px 8px',borderRadius:20}}>{s.l}</span>
                    <span style={{fontSize:10,background:'rgba(255,255,255,0.06)',color:'#8a9bb0',padding:'2px 8px',borderRadius:20}}>{p.secretaria?.sigla}</span>
                    {p.prioridade==='urgente'&&<span style={{fontSize:10,background:'rgba(224,92,92,0.15)',color:'#e05c5c',padding:'2px 8px',borderRadius:20}}>Urgente</span>}
                  </div>
                  <div style={{fontSize:14,fontWeight:600,marginBottom:3}}>{p.titulo}</div>
                  <div style={{fontSize:11,color:'#8a9bb0'}}>{p.secretaria?.nome} - {p.tipo} - {new Date(p.created_at).toLocaleDateString('pt-BR')}</div>
                  {p.status==='respondido'&&p.resposta&&<div style={{marginTop:10,background:'rgba(76,175,130,0.1)',border:'1px solid rgba(76,175,130,0.2)',borderRadius:7,padding:'10px 12px'}}><div style={{fontSize:10,color:'#4caf82',fontWeight:600,marginBottom:4}}>Resposta da Procuradoria</div><div style={{fontSize:13}}>{p.resposta}</div></div>}
                </div>
                {p.status!=='respondido'&&p.status!=='arquivado'&&<div style={{display:'flex',flexDirection:'column',gap:5,flexShrink:0}}>
                  {p.status==='recebido'&&<button onClick={()=>doStatus(p.id,'em_analise')} style={{...st.btnS,background:'rgba(74,144,217,0.15)',color:'#4a90d9',border:'1px solid rgba(74,144,217,0.3)'}}>Em Analise</button>}
                  {p.status==='em_analise'&&<button onClick={()=>doStatus(p.id,'em_andamento')} style={{...st.btnS,background:'rgba(224,148,64,0.15)',color:'#e09440',border:'1px solid rgba(224,148,64,0.3)'}}>Em Andamento</button>}
                  <button onClick={()=>{setSel(p);setResp('')}} style={{...st.btnS,background:'rgba(76,175,130,0.15)',color:'#4caf82',border:'1px solid rgba(76,175,130,0.3)'}}>Responder</button>
                  <button onClick={()=>doStatus(p.id,'arquivado')} style={{...st.btnS,background:'rgba(255,255,255,0.05)',color:'#8a9bb0',border:'1px solid rgba(255,255,255,0.1)'}}>Arquivar</button>
                </div>}
              </div>
            </div>
          )})}
        </div>}
      </div>
      {sel&&<div style={st.overlay}><div style={st.modal}><div style={st.mH}><h3 style={{fontFamily:"'Playfair Display',serif",fontSize:16,margin:0}}>Responder #{sel.numero}</h3><button onClick={()=>setSel(null)} style={{background:'none',border:'none',cursor:'pointer',color:'#8a9bb0',fontSize:18}}>x</button></div><div style={{padding:'18px 22px'}}><div style={{background:'rgba(255,255,255,0.04)',borderRadius:8,padding:'12px',marginBottom:16}}><div style={{fontSize:13,fontWeight:600}}>{sel.titulo}</div><div style={{fontSize:11,color:'#8a9bb0'}}>{sel.secretaria?.nome}</div></div><label style={st.label}>Resposta *</label><textarea value={resp} onChange={e=>setResp(e.target.value)} rows={6} style={{...st.field,resize:'vertical'}}/></div><div style={st.mF}><button onClick={()=>setSel(null)} style={st.btnG}>Cancelar</button><button onClick={doResp} disabled={saving} style={{...st.btnP,opacity:saving?0.6:1}}>{saving?'Enviando...':'Enviar Resposta'}</button></div></div></div>}
    </div>
  )
}

function Demandas({data,onUpdate,showNotify,st}) {
  const [filtro,setFiltro]=useState('todas')
  const [modal,setModal]=useState(null)
  const [form,setForm]=useState({})
  const stD=(d)=>{if(d.status==='concluida')return 'concluida';const dl=daysLeft(d.prazo);if(dl!==null&&dl<0)return 'vencida';return d.status||'pendente'}
  const sMap={pendente:{l:'Pendente',c:'#c9a84c'},andamento:{l:'Em Andamento',c:'#4a90d9'},concluida:{l:'Concluida',c:'#4caf82'},vencida:{l:'Vencida',c:'#e05c5c'}}
  const lista=filtro==='todas'?data.demandas:data.demandas.filter(d=>stD(d)===filtro)
  async function save(){if(!form.titulo?.trim())return;if(form.id)await atualizarDemanda(form.id,form);else await criarDemanda({...form,status:'pendente'});showNotify('Salvo!');setModal(null);onUpdate()}
  async function del(id){if(!window.confirm('Excluir?'))return;await excluirDemanda(id);showNotify('Excluido');onUpdate()}
  async function ok(d){await atualizarDemanda(d.id,{status:'concluida',concluida_em:new Date().toISOString()});showNotify('Concluida!');onUpdate()}
  return (
    <div>
      <div style={st.topbar}><div><h2 style={st.h2}>\u{1F4CB} Demandas Internas</h2></div><button onClick={()=>{setForm({});setModal('f')}} style={st.btnP}>+ Nova</button></div>
      <div style={{padding:'20px 28px'}}>
        <div style={{display:'flex',gap:0,borderBottom:'1px solid rgba(255,255,255,0.06)',marginBottom:18}}>
          {['todas','pendente','andamento','concluida','vencida'].map(f=><button key={f} onClick={()=>setFiltro(f)} style={{padding:'9px 14px',background:'none',border:'none',cursor:'pointer',fontSize:12,color:filtro===f?'#c9a84c':'#8a9bb0',borderBottom:filtro===f?'2px solid #c9a84c':'2px solid transparent',marginBottom:-1}}>{f==='todas'?'Todas':sMap[f]?.l}</button>)}
        </div>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead><tr>{['Titulo','Assessor','Prazo','Status','Acoes'].map(h=><th key={h} style={st.th}>{h}</th>)}</tr></thead>
          <tbody>
            {lista.length===0?<tr><td colSpan={5} style={{...st.td,textAlign:'center',padding:40,color:'#8a9bb0'}}>Nenhuma demanda</td></tr>:lista.map(d=>{
              const s=sMap[stD(d)];const dl=daysLeft(d.prazo);const ass=data.usuarios.find(u=>u.id===d.assessor_id)
              return <tr key={d.id}><td style={st.td}><div style={{fontSize:13,fontWeight:500}}>{d.titulo}</div></td>
                <td style={st.td}>{ass?<div style={{display:'flex',alignItems:'center',gap:7}}><div style={{width:24,height:24,borderRadius:'50%',background:getColor(ass.nome),display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700,color:'white'}}>{initials(ass.nome)}</div><span style={{fontSize:12}}>{ass.nome}</span></div>:<span style={{color:'#8a9bb0',fontSize:12}}>-</span>}</td>
                <td style={st.td}><div style={{fontSize:11}}>{fmtDate(d.prazo)}</div>{dl!==null&&stD(d)!=='concluida'&&<div style={{fontSize:10,color:dl<0?'#e05c5c':dl<=3?'#e09440':'#8a9bb0'}}>{dl<0?Math.abs(dl)+'d atraso':dl===0?'Hoje':dl+'d'}</div>}</td>
                <td style={st.td}><span style={{fontSize:11,background:s?.c+'22',color:s?.c,padding:'2px 9px',borderRadius:20}}>{s?.l}</span></td>
                <td style={st.td}><div style={{display:'flex',gap:4}}>
                  {stD(d)!=='concluida'&&<button onClick={()=>ok(d)} style={{...st.btnS,background:'rgba(76,175,130,0.15)',color:'#4caf82',border:'1px solid rgba(76,175,130,0.3)'}}>OK</button>}
                  <button onClick={()=>{setForm({...d});setModal('f')}} style={{...st.btnS,background:'rgba(255,255,255,0.05)',color:'#8a9bb0',border:'1px solid rgba(255,255,255,0.1)'}}>Edit</button>
                  <button onClick={()=>del(d.id)} style={{...st.btnS,background:'rgba(224,92,92,0.1)',color:'#e05c5c',border:'1px solid rgba(224,92,92,0.2)'}}>Del</button>
                </div></td>
              </tr>
            })}
          </tbody>
        </table>
      </div>
      {modal==='f'&&<div style={st.overlay}><div style={st.modal}><div style={st.mH}><h3 style={{fontFamily:"'Playfair Display',serif",fontSize:16,margin:0}}>{form.id?'Editar':'Nova Demanda'}</h3><button onClick={()=>setModal(null)} style={{background:'none',border:'none',cursor:'pointer',color:'#8a9bb0',fontSize:18}}>x</button></div><div style={{padding:'18px 22px'}}><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
        <div style={{gridColumn:'1/-1'}}><label style={st.label}>Titulo *</label><input value={form.titulo||''} onChange={e=>setForm({...form,titulo:e.target.value})} style={st.field}/></div>
        <div><label style={st.label}>Assessor</label><select value={form.assessor_id||''} onChange={e=>setForm({...form,assessor_id:e.target.value})} style={st.field}><option value="">-</option>{data.usuarios.map(u=><option key={u.id} value={u.id}>{u.nome}</option>)}</select></div>
        <div><label style={st.label}>Prazo</label><input type="date" value={form.prazo||''} onChange={e=>setForm({...form,prazo:e.target.value})} style={st.field}/></div>
        <div><label style={st.label}>Tipo</label><select value={form.tipo||''} onChange={e=>setForm({...form,tipo:e.target.value})} style={st.field}><option value="">-</option>{['Parecer Juridico','Contrato','Licitacao','Judicial','Consultoria','Administrativo','Outro'].map(t=><option key={t}>{t}</option>)}</select></div>
        <div><label style={st.label}>Prioridade</label><select value={form.prioridade||'normal'} onChange={e=>setForm({...form,prioridade:e.target.value})} style={st.field}><option value="normal">Normal</option><option value="alta">Alta</option><option value="urgente">Urgente</option></select></div>
        <div style={{gridColumn:'1/-1'}}><label style={st.label}>Observacoes</label><textarea value={form.obs||''} onChange={e=>setForm({...form,obs:e.target.value})} rows={3} style={{...st.field,resize:'vertical'}}/></div>
      </div></div><div style={st.mF}><button onClick={()=>setModal(null)} style={st.btnG}>Cancelar</button><button onClick={save} style={st.btnP}>Salvar</button></div></div></div>}
    </div>
  )
}

function TabelaView({view,data,onUpdate,showNotify,st}) {
  const [modal,setModal]=useState(null)
  const [form,setForm]=useState({})
  const configs = {
    judiciais:{t:'Processos Judiciais',tb:'processos_judiciais',cols:[{k:'numero',l:'Numero'},{k:'assunto',l:'Assunto'},{k:'vara',l:'Vara'},{k:'fase',l:'Fase'},{k:'prazo',l:'Prazo',d:true}],fields:[{k:'numero',l:'Numero',req:true},{k:'assunto',l:'Assunto',req:true,full:true},{k:'vara',l:'Vara'},{k:'fase',l:'Fase',sel:['conhecimento','recurso','execucao','encerrado']},{k:'prazo',l:'Prazo',date:true},{k:'responsavel_id',l:'Responsavel',usr:true},{k:'polo',l:'Polo',sel:['reu','autor']},{k:'obs',l:'Obs',ta:true,full:true}]},
    licitacoes:{t:'Licitacoes',tb:'licitacoes',cols:[{k:'numero',l:'Numero'},{k:'modalidade',l:'Modalidade'},{k:'objeto',l:'Objeto'},{k:'status',l:'Status'}],fields:[{k:'numero',l:'Numero',req:true},{k:'modalidade',l:'Modalidade',sel:['Pregao Eletronico','Pregao Presencial','Concorrencia','Tomada de Precos','Convite','Dispensa','Inexigibilidade']},{k:'objeto',l:'Objeto',req:true,full:true,ta:true},{k:'prazo',l:'Prazo',date:true},{k:'responsavel_id',l:'Responsavel',usr:true},{k:'status',l:'Status',sel:['analise','aprovado','ressalva','impugnado']},{k:'valor',l:'Valor',type:'number'},{k:'obs',l:'Obs',ta:true,full:true}]},
    contratos:{t:'Contratos',tb:'contratos',cols:[{k:'numero',l:'Numero'},{k:'fornecedor',l:'Fornecedor'},{k:'valor',l:'Valor',curr:true},{k:'fim',l:'Vencimento',d:true},{k:'status',l:'Status'}],fields:[{k:'numero',l:'Numero',req:true},{k:'fornecedor',l:'Fornecedor',req:true},{k:'objeto',l:'Objeto',ta:true,full:true},{k:'valor',l:'Valor',type:'number'},{k:'inicio',l:'Inicio',date:true},{k:'fim',l:'Vencimento',req:true,date:true},{k:'responsavel_id',l:'Responsavel',usr:true},{k:'status',l:'Status',sel:['vigente','encerrado']},{k:'obs',l:'Obs',ta:true,full:true}]},
    pareceres:{t:'Pareceres',tb:'pareceres',cols:[{k:'tipo',l:'Tipo'},{k:'assunto',l:'Assunto'},{k:'solicitante',l:'Solicitante'},{k:'conclusao',l:'Conclusao'},{k:'data',l:'Data',d:true}],fields:[{k:'numero',l:'Numero',req:true},{k:'tipo',l:'Tipo',sel:['Juridico','Licitatorio','Ambiental','Contratual','Legislativo','Outro']},{k:'assunto',l:'Assunto',req:true,full:true},{k:'solicitante',l:'Solicitante'},{k:'emissor_id',l:'Emissor',usr:true},{k:'data',l:'Data',date:true},{k:'conclusao',l:'Conclusao',sel:['favoravel','desfavoravel','ressalva']},{k:'sintese',l:'Sintese',ta:true,full:true}]},
    oficios:{t:'Oficios',tb:'oficios',cols:[{k:'numero',l:'Numero'},{k:'assunto',l:'Assunto'},{k:'origem',l:'Origem'},{k:'prazo',l:'Prazo',d:true},{k:'status',l:'Status'}],fields:[{k:'numero',l:'Numero'},{k:'assunto',l:'Assunto',req:true,full:true},{k:'origem',l:'Origem',sel:['MP','Camara']},{k:'recebido',l:'Recebido',date:true},{k:'prazo',l:'Prazo',date:true},{k:'responsavel_id',l:'Responsavel',usr:true},{k:'status',l:'Status',sel:['pendente','respondido']},{k:'obs',l:'Obs',ta:true,full:true}]},
    pae:{t:'PAE',tb:'pae',cols:[{k:'numero',l:'Numero'},{k:'interessado',l:'Interessado'},{k:'tipo',l:'Tipo'},{k:'status',l:'Status'}],fields:[{k:'numero',l:'Numero',req:true},{k:'interessado',l:'Interessado',req:true},{k:'tipo',l:'Tipo',sel:['Sindicancia','PAD','Impugnacao','Recurso Administrativo','Tomada de Contas','Outro']},{k:'assunto',l:'Assunto',req:true,full:true,ta:true},{k:'prazo',l:'Prazo',date:true},{k:'responsavel_id',l:'Responsavel',usr:true},{k:'status',l:'Status',sel:['analise','instrucao','julgado','arquivado']},{k:'obs',l:'Obs',ta:true,full:true}]},
    projetos:{t:'Projetos de Lei',tb:'projetos_lei',cols:[{k:'numero',l:'Numero'},{k:'autor',l:'Autor'},{k:'ementa',l:'Ementa'},{k:'status',l:'Status'},{k:'aprovado',l:'Aprovado',d:true}],fields:[{k:'numero',l:'Numero',req:true},{k:'autor',l:'Autor'},{k:'ementa',l:'Ementa',req:true,full:true,ta:true},{k:'aprovado',l:'Aprovado',req:true,date:true},{k:'prazo',l:'Prazo Sancao',date:true},{k:'status',l:'Status',sel:['aguardando','sancionado','vetado']},{k:'obs',l:'Obs',ta:true,full:true}]},
  }
  const cfg=configs[view]; if(!cfg) return null
  const dados=data[view]||[]
  async function save(){const ob=cfg.fields.find(f=>f.req&&!form[f.k]);if(ob){showNotify('Preencha: '+ob.l);return};if(form.id)await atualizar(cfg.tb,form.id,form);else await inserir(cfg.tb,form);showNotify('Salvo!');setModal(null);onUpdate()}
  async function del(id){if(!window.confirm('Excluir?'))return;await excluir(cfg.tb,id);showNotify('Excluido');onUpdate()}
  return (
    <div>
      <div style={st.topbar}><div><h2 style={st.h2}>{cfg.t}</h2></div><button onClick={()=>{setForm({});setModal('f')}} style={st.btnP}>+ Novo</button></div>
      <div style={{padding:'20px 28px'}}>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead><tr>{[...cfg.cols.map(c=>c.l),'Acoes'].map(h=><th key={h} style={st.th}>{h}</th>)}</tr></thead>
          <tbody>
            {dados.length===0?<tr><td colSpan={cfg.cols.length+1} style={{...st.td,textAlign:'center',padding:40,color:'#8a9bb0'}}>Nenhum registro</td></tr>:dados.map(row=>(
              <tr key={row.id}>
                {cfg.cols.map(c=><td key={c.k} style={st.td}>{c.d?<span style={{fontSize:11}}>{fmtDate(row[c.k])}</span>:c.curr?<span style={{color:'#c9a84c',fontSize:12}}>{fmtCurrency(row[c.k])}</span>:<span style={{fontSize:12}}>{row[c.k]||'-'}</span>}</td>)}
                <td style={st.td}><div style={{display:'flex',gap:4}}>
                  <button onClick={()=>{setForm({...row});setModal('f')}} style={{...st.btnS,background:'rgba(255,255,255,0.05)',color:'#8a9bb0',border:'1px solid rgba(255,255,255,0.1)'}}>Edit</button>
                  <button onClick={()=>del(row.id)} style={{...st.btnS,background:'rgba(224,92,92,0.1)',color:'#e05c5c',border:'1px solid rgba(224,92,92,0.2)'}}>Del</button>
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {modal==='f'&&<div style={st.overlay}><div style={st.modal}><div style={st.mH}><h3 style={{fontFamily:"'Playfair Display',serif",fontSize:16,margin:0}}>{form.id?'Editar':'Novo - '+cfg.t}</h3><button onClick={()=>setModal(null)} style={{background:'none',border:'none',cursor:'pointer',color:'#8a9bb0',fontSize:18}}>x</button></div><div style={{padding:'18px 22px'}}><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
        {cfg.fields.map(f=><div key={f.k} style={{gridColumn:f.full?'1/-1':'auto'}}>
          <label style={st.label}>{f.l}{f.req?' *':''}</label>
          {f.sel?<select value={form[f.k]||''} onChange={e=>setForm({...form,[f.k]:e.target.value})} style={st.field}><option value="">-</option>{f.sel.map(o=><option key={o}>{o}</option>)}</select>:f.usr?<select value={form[f.k]||''} onChange={e=>setForm({...form,[f.k]:e.target.value})} style={st.field}><option value="">PG</option>{data.usuarios.map(u=><option key={u.id} value={u.id}>{u.nome}</option>)}</select>:f.ta?<textarea value={form[f.k]||''} onChange={e=>setForm({...form,[f.k]:e.target.value})} rows={3} style={{...st.field,resize:'vertical'}}/>:f.date?<input type="date" value={form[f.k]||''} onChange={e=>setForm({...form,[f.k]:e.target.value})} style={st.field}/>:<input type={f.type||'text'} value={form[f.k]||''} onChange={e=>setForm({...form,[f.k]:e.target.value})} style={st.field}/>}
        </div>)}
      </div></div><div style={st.mF}><button onClick={()=>setModal(null)} style={st.btnG}>Cancelar</button><button onClick={save} style={st.btnP}>Salvar</button></div></div></div>}
    </div>
  )
}