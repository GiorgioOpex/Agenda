"use client";
import { useState, useEffect, useCallback, useMemo } from "react";

var MESI = ["Gennaio","Febbraio","Marzo","Aprile","Maggio","Giugno","Luglio","Agosto","Settembre","Ottobre","Novembre","Dicembre"];
var GIORNI = ["Lun","Mar","Mer","Gio","Ven","Sab","Dom"];
var CL = { red: "#C41E2A", redDk: "#9B1520", grey: "#3C3C3C", greyDk: "#2A2A2A", greyMd: "#555", greyLt: "#F2F2F2" };
var STATI = { client: { bg: CL.red, text: "#fff", label: "Cliente OPEX" }, busy: { bg: CL.grey, text: "#fff", label: "Altro impegno" }, free: { bg: "#E8F5E9", text: "#2E7D32", label: "Libero" } };

function makeKey(y,m,d) { return y+"-"+String(m+1).padStart(2,"0")+"-"+String(d).padStart(2,"0"); }
function parseKey(k) { var p=k.split("-").map(Number); return {year:p[0],month:p[1]-1,day:p[2]}; }
function daysInMonth(y,m) { return new Date(y,m+1,0).getDate(); }
function firstDow(y,m) { var d=new Date(y,m,1).getDay(); return d===0?6:d-1; }
function hashPw(s) { var h=0; for(var i=0;i<s.length;i++){h=((h<<5)-h)+s.charCodeAt(i);h=h&h;} return "h_"+Math.abs(h).toString(36); }
function fmtNum(n) { return n%1===0?n:n.toFixed(1); }

var EMPTY = {consultants:[],clients:[],clientBudgets:{},entries:{},admins:[],targetMensile:0};

async function loadAll() {
  try { var res=await fetch("/api/data?t="+Date.now()); if(!res.ok) return Object.assign({},EMPTY); var d=await res.json(); return Object.assign({},EMPTY,d); }
  catch(e) { return Object.assign({},EMPTY); }
}

async function saveAll(fullData) {
  try { var res=await fetch("/api/data",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(fullData)}); var r=await res.json(); return r.ok; }
  catch(e) { return false; }
}

var FONT = "'DM Sans',sans-serif";
var sInput = {padding:"9px 12px",borderRadius:8,border:"1px solid #ddd",fontSize:14,fontFamily:FONT,flex:1,minWidth:0,boxSizing:"border-box"};
var sBtn = {padding:"9px 16px",borderRadius:8,border:"none",background:CL.red,color:"#fff",fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:FONT,whiteSpace:"nowrap"};
var sBtnOut = {padding:"9px 16px",borderRadius:8,border:"1px solid #ddd",background:"#fff",color:"#555",fontSize:14,cursor:"pointer",fontFamily:FONT};

function Logo(props) { return (<img src="/Logo_Opex.jpg" alt="OPEX" style={{height:props.h||36,objectFit:"contain"}} />); }

function calcActuals(entries,consultants,year,month) {
  var r={byClient:{},totalClient:0,totalBusy:0,totalFree:0};
  consultants.forEach(function(n){var cE=entries[n]||{};for(var d=1;d<=daysInMonth(year,month);d++){var e=cE[makeKey(year,month,d)];if(!e)continue;
    ["am","pm"].forEach(function(h){var x=e[h];if(!x||!x.status)return;if(x.status==="client"){r.totalClient+=0.5;if(x.client)r.byClient[x.client]=(r.byClient[x.client]||0)+0.5;}else if(x.status==="busy")r.totalBusy+=0.5;else r.totalFree+=0.5;});}});
  return r;
}

function LoginScreen(props) {
  var data=props.data,onLoginC=props.onLoginC,onLoginA=props.onLoginA,onDataChange=props.onDataChange;
  var mState=useState("consultant"),mode=mState[0],setMode=mState[1];
  var sState=useState(data.consultants[0]||""),sel=sState[0],setSel=sState[1];
  var anState=useState(""),adminName=anState[0],setAdminName=anState[1];
  var apState=useState(""),adminPw=apState[0],setAdminPw=apState[1];
  var eState=useState(""),err=eState[0],setErr=eState[1];
  function doAdminLogin(){var found=data.admins.find(function(a){return a.name.toLowerCase()===adminName.toLowerCase().trim();});if(!found){setErr("Amministratore non trovato");return;}if(hashPw(adminPw)!==found.passHash){setErr("Password errata");setAdminPw("");return;}onLoginA(found.name);}
  return (
    <div style={{minHeight:"100vh",fontFamily:FONT,display:"flex",alignItems:"center",justifyContent:"center",background:"linear-gradient(135deg,"+CL.greyDk+" 0%,"+CL.grey+" 50%,"+CL.redDk+" 100%)"}}>
      <div style={{background:"#fff",borderRadius:20,padding:"40px 36px",width:400,maxWidth:"92vw",boxShadow:"0 30px 80px rgba(0,0,0,.4)"}}>
        <div style={{textAlign:"center",marginBottom:24}}><Logo h={50} /><p style={{margin:"8px 0 0",fontSize:11,color:CL.greyMd,letterSpacing:2}}>AGENDA CONSULENTI</p></div>
        <div style={{display:"flex",borderRadius:10,overflow:"hidden",border:"2px solid "+CL.red,marginBottom:24}}>
          <button onClick={function(){setMode("consultant");setErr("");}} style={{flex:1,padding:"10px 0",border:"none",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:FONT,background:mode==="consultant"?CL.red:"#fff",color:mode==="consultant"?"#fff":CL.red}}>Consulente</button>
          <button onClick={function(){setMode("admin");setErr("");}} style={{flex:1,padding:"10px 0",border:"none",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:FONT,background:mode==="admin"?CL.red:"#fff",color:mode==="admin"?"#fff":CL.red}}>Admin</button>
        </div>
        {mode==="consultant"&&(data.consultants.length===0?<p style={{textAlign:"center",color:"#888",fontSize:14}}>Nessun consulente configurato.</p>:<div>
          <select value={sel} onChange={function(e){setSel(e.target.value);}} style={Object.assign({},sInput,{width:"100%",padding:"12px 14px",border:"2px solid "+CL.red,marginBottom:20,fontWeight:600})}>{data.consultants.map(function(c){return <option key={c} value={c}>{c}</option>;})}</select>
          <button onClick={function(){onLoginC(sel);}} style={Object.assign({},sBtn,{width:"100%",padding:"13px 0",fontSize:15})}>Accedi al mio calendario</button></div>)}
        {mode==="admin"&&(data.admins.length===0?<FirstAdmin data={data} onDone={onLoginA} onDataChange={onDataChange}/>:<div>
          <input value={adminName} onChange={function(e){setAdminName(e.target.value);setErr("");}} placeholder="Nome admin" style={Object.assign({},sInput,{width:"100%",marginBottom:12})}/>
          <input type="password" value={adminPw} onChange={function(e){setAdminPw(e.target.value);setErr("");}} onKeyDown={function(e){if(e.key==="Enter")doAdminLogin();}} placeholder="Password" style={Object.assign({},sInput,{width:"100%",marginBottom:4})}/>
          {err&&<p style={{margin:"8px 0 0",fontSize:13,color:CL.red,fontWeight:600}}>{err}</p>}
          <button onClick={doAdminLogin} style={Object.assign({},sBtn,{width:"100%",padding:"13px 0",fontSize:15,marginTop:16})}>Accedi come Admin</button></div>)}
      </div></div>);
}

function FirstAdmin(props) {
  var data=props.data,onDone=props.onDone,onDataChange=props.onDataChange;
  var ns=useState(""),n=ns[0],setN=ns[1];var ps=useState(""),p=ps[0],setP=ps[1];
  var p2s=useState(""),p2=p2s[0],setP2=p2s[1];var es=useState(""),e=es[0],setE=es[1];var svs=useState(false),saving=svs[0],setSaving=svs[1];
  async function go(){if(!n.trim()){setE("Inserisci un nome");return;}if(p.length<4){setE("Min 4 caratteri");return;}if(p!==p2){setE("Non coincidono");return;}
    setSaving(true);var nd=Object.assign({},data,{admins:[{name:n.trim(),passHash:hashPw(p)}]});var ok=await saveAll(nd);setSaving(false);if(ok){onDataChange(nd);onDone(n.trim());}else{setE("Errore salvataggio");}}
  return (<div>
    <div style={{background:"#FFF3F3",borderRadius:10,padding:"12px 16px",marginBottom:20,borderLeft:"4px solid "+CL.red}}><p style={{margin:0,fontSize:13,color:CL.redDk}}>Crea il primo amministratore.</p></div>
    <input value={n} onChange={function(x){setN(x.target.value);setE("");}} placeholder="Nome" style={Object.assign({},sInput,{width:"100%",marginBottom:10})}/>
    <input type="password" value={p} onChange={function(x){setP(x.target.value);setE("");}} placeholder="Password" style={Object.assign({},sInput,{width:"100%",marginBottom:10})}/>
    <input type="password" value={p2} onChange={function(x){setP2(x.target.value);setE("");}} onKeyDown={function(x){if(x.key==="Enter")go();}} placeholder="Conferma" style={Object.assign({},sInput,{width:"100%",marginBottom:4})}/>
    {e&&<p style={{margin:"8px 0 0",fontSize:13,color:CL.red,fontWeight:600}}>{e}</p>}
    <button onClick={go} disabled={saving} style={Object.assign({},sBtn,{width:"100%",padding:"13px 0",marginTop:16,opacity:saving?0.5:1})}>{saving?"Salvataggio...":"Crea admin e accedi"}</button></div>);
}

function Calendar(props) {
  var year=props.year,month=props.month,entries=props.entries,onDayClick=props.onDayClick;
  var days=daysInMonth(year,month),fd=firstDow(year,month),cells=[];
  for(var i=0;i<fd;i++)cells.push(null);for(var d=1;d<=days;d++)cells.push(d);
  var today=new Date();
  return (<div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2,marginBottom:4}}>{GIORNI.map(function(d){return <div key={d} style={{textAlign:"center",fontSize:11,fontWeight:600,color:"#888",padding:"4px 0"}}>{d}</div>;})}</div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3}}>{cells.map(function(d,i){
      if(!d)return <div key={"e"+i}/>;var key=makeKey(year,month,d),en=entries[key];
      var amSc=en&&en.am&&en.am.status?STATI[en.am.status]:null,pmSc=en&&en.pm&&en.pm.status?STATI[en.pm.status]:null;
      var isWe=(fd+d-1)%7>=5,has=amSc||pmSc,isT=d&&today.getFullYear()===year&&today.getMonth()===month&&today.getDate()===d;
      return (<div key={key} onClick={function(){if(!isWe)onDayClick(key);}} style={{position:"relative",aspectRatio:"1",display:"flex",alignItems:"center",justifyContent:"center",borderRadius:8,overflow:"hidden",cursor:isWe?"default":"pointer",border:isT?"2px solid "+CL.red:"1px solid #e8e8e8",background:isWe?"#f0f0f0":"#fafafa",transition:"all .15s",userSelect:"none"}}
        onMouseEnter={function(e){if(!isWe)e.currentTarget.style.transform="scale(1.08)";}} onMouseLeave={function(e){e.currentTarget.style.transform="scale(1)";}}>
        {has&&!isWe&&<div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column"}}><div style={{flex:1,background:amSc?amSc.bg:"transparent",opacity:0.88}}/><div style={{flex:1,background:pmSc?pmSc.bg:"transparent",opacity:0.88}}/></div>}
        <span style={{position:"relative",zIndex:1,fontSize:13,fontWeight:isT?700:500,color:has&&!isWe?"#fff":isWe?"#bbb":"#444",textShadow:has&&!isWe?"0 1px 2px rgba(0,0,0,.3)":"none"}}>{d}</span></div>);})}</div></div>);
}

function HalfEditor(props) {
  var label=props.label,status=props.status,setStatus=props.setStatus,client=props.client,setClient=props.setClient,note=props.note,setNote=props.setNote,clients=props.clients;
  var opts=[{k:"",l:"- Nessuno -"},{k:"client",l:"Cliente OPEX"},{k:"busy",l:"Altro impegno"},{k:"free",l:"Libero"}];
  return (<div style={{marginBottom:12}}>
    <h4 style={{margin:"0 0 8px",fontSize:14,color:CL.greyDk,fontWeight:700}}>{label}</h4>
    <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:8}}>{opts.map(function(o){return <button key={o.k} onClick={function(){setStatus(o.k);}} style={{padding:"6px 11px",borderRadius:8,fontSize:12,fontWeight:status===o.k?700:400,border:status===o.k?"2px solid "+CL.red:"1px solid #ddd",cursor:"pointer",fontFamily:FONT,background:status===o.k&&o.k?STATI[o.k].bg:"#f9f9f9",color:status===o.k&&o.k?STATI[o.k].text:"#555"}}>{o.l}</button>;})}</div>
    {status==="client"&&<select value={client} onChange={function(e){setClient(e.target.value);}} style={{width:"100%",padding:"8px 10px",borderRadius:8,border:"2px solid "+CL.red,fontSize:13,fontFamily:FONT,background:"#fff8f8",marginBottom:6,boxSizing:"border-box"}}><option value="">- Seleziona cliente -</option>{clients.map(function(c){return <option key={c} value={c}>{c}</option>;})}</select>}
    <input value={note} onChange={function(e){setNote(e.target.value);}} placeholder="Note" style={Object.assign({},sInput,{width:"100%",padding:"7px 10px",fontSize:13})}/></div>);
}

function DayModal(props) {
  var dk=props.dk,entry=props.entry,clients=props.clients,onSave=props.onSave,onClose=props.onClose;
  var a1=useState(entry&&entry.am?entry.am.status||"":""),as=a1[0],setAs=a1[1];
  var a2=useState(entry&&entry.am?entry.am.client||"":""),ac=a2[0],setAc=a2[1];
  var a3=useState(entry&&entry.am?entry.am.note||"":""),an=a3[0],setAn=a3[1];
  var p1=useState(entry&&entry.pm?entry.pm.status||"":""),ps=p1[0],setPs=p1[1];
  var p2=useState(entry&&entry.pm?entry.pm.client||"":""),pc=p2[0],setPc=p2[1];
  var p3=useState(entry&&entry.pm?entry.pm.note||"":""),pn=p3[0],setPn=p3[1];
  var sv=useState(false),saving=sv[0],setSaving=sv[1];var info=parseKey(dk);
  async function doSave(){if(as==="client"&&!ac){alert("Seleziona un cliente per la mattina");return;}if(ps==="client"&&!pc){alert("Seleziona un cliente per il pomeriggio");return;}
    setSaving(true);var data={};if(as)data.am={status:as,client:as==="client"?ac:"",note:an};if(ps)data.pm={status:ps,client:ps==="client"?pc:"",note:pn};
    await onSave(dk,Object.keys(data).length>0?data:null);setSaving(false);}
  return (<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.45)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000}} onClick={onClose}>
    <div onClick={function(e){e.stopPropagation();}} style={{background:"#fff",borderRadius:16,padding:28,width:400,maxWidth:"92vw",maxHeight:"88vh",overflowY:"auto",boxShadow:"0 20px 60px rgba(0,0,0,.2)",fontFamily:FONT}}>
      <h3 style={{margin:"0 0 18px",fontSize:18,color:CL.greyDk}}>{info.day} {MESI[info.month]} {info.year}</h3>
      <HalfEditor label="Mattina" status={as} setStatus={setAs} client={ac} setClient={setAc} note={an} setNote={setAn} clients={clients}/>
      <div style={{display:"flex",justifyContent:"center",margin:"4px 0 8px"}}><button onClick={function(){setPs(as);setPc(ac);setPn(an);}} disabled={!as} style={{padding:"7px 18px",borderRadius:20,fontSize:12,fontWeight:600,fontFamily:FONT,border:"1px solid "+(as?CL.red:"#ddd"),cursor:as?"pointer":"default",background:as?"#FFF3F3":"#f5f5f5",color:as?CL.red:"#bbb"}}>Copia mattina al pomeriggio</button></div>
      <HalfEditor label="Pomeriggio" status={ps} setStatus={setPs} client={pc} setClient={setPc} note={pn} setNote={setPn} clients={clients}/>
      <div style={{display:"flex",gap:10,marginTop:12}}>
        <button onClick={doSave} disabled={saving} style={Object.assign({},sBtn,{flex:1,padding:"11px 0",opacity:saving?0.5:1})}>{saving?"Salvataggio...":"Salva"}</button>
        <button onClick={function(){onSave(dk,null);}} style={Object.assign({},sBtnOut,{color:"#999"})}>Cancella</button>
        <button onClick={onClose} style={sBtnOut}>Chiudi</button></div></div></div>);
}

function Legenda(){return (<div style={{display:"flex",gap:14,flexWrap:"wrap",marginBottom:16,alignItems:"center"}}>
  {Object.values(STATI).map(function(s){return <div key={s.label} style={{display:"flex",alignItems:"center",gap:5}}><div style={{width:13,height:13,borderRadius:4,background:s.bg,border:s.bg==="#E8F5E9"?"1px solid #A5D6A7":"none"}}/><span style={{fontSize:12,color:CL.greyMd}}>{s.label}</span></div>;})}
  <div style={{display:"flex",alignItems:"center",gap:5,marginLeft:6}}><div style={{width:16,height:12,borderRadius:3,overflow:"hidden",display:"flex",flexDirection:"column",border:"1px solid #ccc"}}><div style={{flex:1,background:CL.red}}/><div style={{flex:1,background:CL.grey}}/></div><span style={{fontSize:11,color:"#888"}}>AM/PM</span></div></div>);}

function Panoramica(props) {
  var entries=props.entries,consultants=props.consultants,year=props.year,month=props.month;
  var days=daysInMonth(year,month),fd=firstDow(year,month);
  return (<div style={{overflowX:"auto"}}><table style={{borderCollapse:"collapse",width:"100%",fontSize:11,fontFamily:FONT}}>
    <thead><tr><th style={{position:"sticky",left:0,background:"#fff",padding:"7px 10px",borderBottom:"2px solid "+CL.red,textAlign:"left",minWidth:110,zIndex:2}}>Consulente</th>
      {Array.from({length:days},function(_,i){return <th key={i+1} style={{padding:"5px 2px",borderBottom:"2px solid "+CL.red,textAlign:"center",minWidth:24,color:(fd+i)%7>=5?"#ccc":CL.greyMd,fontSize:10}}>{i+1}</th>;})}<th style={{padding:"7px 5px",borderBottom:"2px solid "+CL.red,textAlign:"center",fontWeight:700,color:CL.red,fontSize:11}}>GG</th></tr></thead>
    <tbody>{consultants.map(function(name){var cE=entries[name]||{},tot=0;
      var tds=Array.from({length:days},function(_,i){var key=makeKey(year,month,i+1),e=cE[key],we=(fd+i)%7>=5;
        var amSc=e&&e.am&&e.am.status?STATI[e.am.status]:null,pmSc=e&&e.pm&&e.pm.status?STATI[e.pm.status]:null;
        if(e&&e.am&&e.am.status==="client")tot+=0.5;if(e&&e.pm&&e.pm.status==="client")tot+=0.5;
        return <td key={i+1} style={{padding:1,borderBottom:"1px solid #eee",textAlign:"center"}}><div style={{width:18,height:18,borderRadius:3,margin:"0 auto",overflow:"hidden",display:"flex",flexDirection:"column",background:we&&!amSc&&!pmSc?"#f5f5f5":"transparent"}}><div style={{flex:1,background:amSc?amSc.bg:"transparent"}}/><div style={{flex:1,background:pmSc?pmSc.bg:"transparent"}}/></div></td>;});
      return <tr key={name}><td style={{position:"sticky",left:0,background:"#fff",padding:"4px 10px",borderBottom:"1px solid #eee",fontWeight:600,color:CL.greyDk,fontSize:11,zIndex:1}}>{name}</td>{tds}<td style={{padding:"4px 5px",borderBottom:"1px solid #eee",textAlign:"center",fontWeight:700,color:CL.red,fontSize:12}}>{fmtNum(tot)}</td></tr>;})}</tbody></table></div>);
}

function VistaCliente(props) {
  var entries=props.entries,consultants=props.consultants,clients=props.clients,clientBudgets=props.clientBudgets||{},year=props.year,month=props.month;
  var ss=useState(clients[0]||""),sel=ss[0],setSel=ss[1];
  var budget=clientBudgets[sel]||0;var actuals=calcActuals(entries,consultants,year,month);var actual=actuals.byClient[sel]||0;var remaining=budget-actual;
  return (<div>
    <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16,flexWrap:"wrap"}}>
      <label style={{fontSize:14,fontWeight:600,color:CL.greyDk}}>Cliente:</label>
      <select value={sel} onChange={function(e){setSel(e.target.value);}} style={Object.assign({},sInput,{flex:"none",width:220,padding:"8px 12px",border:"2px solid "+CL.red,fontWeight:600})}>{clients.map(function(c){return <option key={c} value={c}>{c}</option>;})}</select></div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:12,marginBottom:20}}>
      <div style={{padding:"14px 18px",background:"#FFF3F3",borderRadius:12,border:"1px solid "+CL.red}}><div style={{fontSize:11,color:CL.greyMd}}>Previste/mese</div><div style={{fontSize:24,fontWeight:700,color:CL.red}}>{fmtNum(budget)}</div></div>
      <div style={{padding:"14px 18px",background:"#E8F5E9",borderRadius:12,border:"1px solid #A5D6A7"}}><div style={{fontSize:11,color:CL.greyMd}}>Impegnate</div><div style={{fontSize:24,fontWeight:700,color:"#2E7D32"}}>{fmtNum(actual)}</div></div>
      <div style={{padding:"14px 18px",background:remaining<0?"#FFF3F3":CL.greyLt,borderRadius:12,border:"1px solid "+(remaining<0?CL.red:"#ddd")}}><div style={{fontSize:11,color:CL.greyMd}}>Rimanenti</div><div style={{fontSize:24,fontWeight:700,color:remaining<0?CL.red:CL.greyDk}}>{fmtNum(remaining)}</div></div>
      {budget>0&&<div style={{padding:"14px 18px",background:CL.greyLt,borderRadius:12,border:"1px solid #ddd"}}><div style={{fontSize:11,color:CL.greyMd}}>Copertura</div><div style={{fontSize:24,fontWeight:700,color:actual>=budget?"#2E7D32":CL.red}}>{Math.round((actual/budget)*100)}%</div></div>}
    </div>
    {budget>0&&<div style={{marginBottom:20}}><div style={{height:12,background:CL.greyLt,borderRadius:6,overflow:"hidden"}}><div style={{height:"100%",width:Math.min(100,(actual/budget)*100)+"%",background:actual>=budget?"#2E7D32":CL.red,borderRadius:6}}/></div></div>}
    <p style={{fontSize:11,color:"#aaa"}}>Valori in giornate (0.5 = mezza giornata)</p></div>);
}

function Consuntivo(props) {
  var entries=props.entries,consultants=props.consultants,clients=props.clients,clientBudgets=props.clientBudgets||{},year=props.year,month=props.month;
  var report=useMemo(function(){var d={};consultants.forEach(function(n){d[n]={tc:0,tb:0,tf:0,bc:{}};clients.forEach(function(c){d[n].bc[c]=0;});
    var cE=entries[n]||{};for(var i=1;i<=daysInMonth(year,month);i++){var e=cE[makeKey(year,month,i)];if(!e)continue;
      ["am","pm"].forEach(function(h){var x=e[h];if(!x||!x.status)return;if(x.status==="client"){d[n].tc+=0.5;if(x.client)d[n].bc[x.client]=(d[n].bc[x.client]||0)+0.5;}else if(x.status==="busy")d[n].tb+=0.5;else d[n].tf+=0.5;});}});return d;},[entries,consultants,clients,year,month]);
  return (<div style={{overflowX:"auto"}}>
    <table style={{borderCollapse:"collapse",width:"100%",fontSize:13,fontFamily:FONT}}><thead><tr style={{background:"#FFF8F8"}}>
      <th style={{padding:"10px 14px",borderBottom:"2px solid "+CL.red,textAlign:"left"}}>Consulente</th><th style={{padding:"10px 8px",borderBottom:"2px solid "+CL.red}}>GG Cli.</th>
      {clients.map(function(c){return <th key={c} style={{padding:"10px 8px",borderBottom:"2px solid "+CL.red,maxWidth:90,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c}</th>;})}
      <th style={{padding:"10px 8px",borderBottom:"2px solid "+CL.red}}>Altro</th><th style={{padding:"10px 8px",borderBottom:"2px solid "+CL.red}}>Libero</th></tr></thead>
    <tbody>{consultants.map(function(n){var r=report[n];return (<tr key={n}><td style={{padding:"8px 14px",borderBottom:"1px solid #eee",fontWeight:600,color:CL.greyDk,textAlign:"left"}}>{n}</td>
      <td style={{padding:"8px",borderBottom:"1px solid #eee",textAlign:"center",fontWeight:700,color:CL.red,fontSize:16}}>{fmtNum(r.tc)}</td>
      {clients.map(function(c){return <td key={c} style={{padding:"8px",borderBottom:"1px solid #eee",textAlign:"center",color:r.bc[c]?CL.red:"#ccc"}}>{r.bc[c]?fmtNum(r.bc[c]):"-"}</td>;})}
      <td style={{padding:"8px",borderBottom:"1px solid #eee",textAlign:"center",color:CL.grey,fontWeight:600}}>{fmtNum(r.tb)}</td>
      <td style={{padding:"8px",borderBottom:"1px solid #eee",textAlign:"center",color:"#2E7D32"}}>{fmtNum(r.tf)}</td></tr>);})}</tbody></table>
    {clients.length>0&&<div style={{marginTop:16}}><h4 style={{margin:"0 0 8px",color:CL.red,fontSize:14}}>Budget vs Effettivo</h4>
      <table style={{borderCollapse:"collapse",width:"100%",fontSize:13}}><thead><tr style={{background:"#FFF8F8"}}><th style={{padding:"8px 14px",borderBottom:"2px solid "+CL.red,textAlign:"left"}}>Cliente</th><th style={{padding:"8px",borderBottom:"2px solid "+CL.red}}>Previste</th><th style={{padding:"8px",borderBottom:"2px solid "+CL.red}}>Effettive</th><th style={{padding:"8px",borderBottom:"2px solid "+CL.red}}>Diff</th></tr></thead>
      <tbody>{clients.map(function(c){var bud=clientBudgets[c]||0,eff=consultants.reduce(function(s,n){return s+((report[n]||{}).bc||{})[c]||0;},0),diff=eff-bud;
        return <tr key={c}><td style={{padding:"8px 14px",borderBottom:"1px solid #eee",fontWeight:600,color:CL.greyDk,textAlign:"left"}}>{c}</td><td style={{padding:"8px",borderBottom:"1px solid #eee",textAlign:"center"}}>{fmtNum(bud)}</td><td style={{padding:"8px",borderBottom:"1px solid #eee",textAlign:"center",fontWeight:700,color:CL.red}}>{fmtNum(eff)}</td><td style={{padding:"8px",borderBottom:"1px solid #eee",textAlign:"center",fontWeight:700,color:diff>=0?"#2E7D32":CL.red}}>{(diff>=0?"+":"")+fmtNum(diff)}</td></tr>;})}</tbody></table></div>}
    <p style={{marginTop:12,fontSize:11,color:"#aaa"}}>Valori in giornate (0.5 = mezza giornata)</p></div>);
}

function Dashboard(props) {
  var data=props.data,year=props.year,target=data.targetMensile||0;
  var planned=(data.clients||[]).reduce(function(s,c){return s+((data.clientBudgets||{})[c]||0);},0);
  var currentMonth=new Date().getMonth();
  var months=useMemo(function(){return MESI.map(function(nome,mi){var a=calcActuals(data.entries,data.consultants,year,mi);return {nome:nome.substring(0,3),actual:a.totalClient,planned:planned,target:target};});},[data,year,target,planned]);
  var maxVal=Math.max(target,planned,Math.max.apply(null,months.map(function(m){return m.actual;})))||1;
  return (<div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:12,marginBottom:24}}>
      <div style={{padding:"14px 18px",background:"#FFF3F3",borderRadius:12,border:"1px solid "+CL.red}}><div style={{fontSize:11,color:CL.greyMd}}>Target mensile</div><div style={{fontSize:28,fontWeight:700,color:CL.red}}>{fmtNum(target)}</div><div style={{fontSize:11,color:"#888"}}>giornate</div></div>
      <div style={{padding:"14px 18px",background:"#E8F5E9",borderRadius:12,border:"1px solid #A5D6A7"}}><div style={{fontSize:11,color:CL.greyMd}}>Richieste clienti</div><div style={{fontSize:28,fontWeight:700,color:"#2E7D32"}}>{fmtNum(planned)}</div><div style={{fontSize:11,color:"#888"}}>gg/mese</div></div>
      <div style={{padding:"14px 18px",background:CL.greyLt,borderRadius:12,border:"1px solid #ddd"}}><div style={{fontSize:11,color:CL.greyMd}}>Effettive {MESI[currentMonth]}</div><div style={{fontSize:28,fontWeight:700,color:CL.greyDk}}>{fmtNum(months[currentMonth].actual)}</div></div>
      <div style={{padding:"14px 18px",background:months[currentMonth].actual>=target?"#E8F5E9":"#FFF3F3",borderRadius:12,border:"1px solid "+(months[currentMonth].actual>=target?"#A5D6A7":CL.red)}}><div style={{fontSize:11,color:CL.greyMd}}>vs Target</div><div style={{fontSize:28,fontWeight:700,color:months[currentMonth].actual>=target?"#2E7D32":CL.red}}>{target>0?Math.round((months[currentMonth].actual/target)*100):0}%</div></div>
    </div>
    <div style={{background:"#fff",borderRadius:12,padding:20,border:"1px solid #eee"}}>
      <h4 style={{margin:"0 0 16px",color:CL.greyDk,fontSize:14}}>Andamento {year}</h4>
      <div style={{display:"flex",gap:16,marginBottom:16,fontSize:12}}>
        <div style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:12,height:12,background:CL.red,borderRadius:2}}/><span>Target</span></div>
        <div style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:12,height:12,background:"#2E7D32",borderRadius:2}}/><span>Richieste</span></div>
        <div style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:12,height:12,background:CL.grey,borderRadius:2}}/><span>Effettive</span></div></div>
      <div style={{display:"flex",alignItems:"flex-end",gap:4,height:210,overflowX:"auto"}}>{months.map(function(m,i){
        return (<div key={m.nome} style={{flex:1,minWidth:50,display:"flex",flexDirection:"column",alignItems:"center",opacity:i>currentMonth?0.4:1}}>
          <div style={{display:"flex",gap:2,alignItems:"flex-end",height:180}}>
            <div style={{width:10,height:Math.max(2,(target/maxVal)*180),background:CL.red,borderRadius:"2px 2px 0 0"}}/>
            <div style={{width:10,height:Math.max(2,(m.planned/maxVal)*180),background:"#2E7D32",borderRadius:"2px 2px 0 0"}}/>
            <div style={{width:10,height:Math.max(2,(m.actual/maxVal)*180),background:CL.grey,borderRadius:"2px 2px 0 0"}}/></div>
          <div style={{fontSize:10,color:i===currentMonth?CL.red:"#888",fontWeight:i===currentMonth?700:400,marginTop:4}}>{m.nome}</div></div>);})}</div>
      <p style={{marginTop:12,fontSize:11,color:"#aaa"}}>Mesi futuri in trasparenza (proiezione)</p></div></div>);
}

function Impostazioni(props) {
  var data=props.data,onSave=props.onSave,onClose=props.onClose;
  var c1=useState([].concat(data.consultants)),cl=c1[0],setCl=c1[1];var l1=useState([].concat(data.clients)),ll=l1[0],setLl=l1[1];
  var a1=useState([].concat(data.admins)),al=a1[0],setAl=a1[1];var b1=useState(Object.assign({},data.clientBudgets||{})),budgets=b1[0],setBudgets=b1[1];
  var t1=useState(data.targetMensile||0),targetM=t1[0],setTargetM=t1[1];
  var nc1=useState(""),nc=nc1[0],setNc=nc1[1];var nl1=useState(""),nl=nl1[0],setNl=nl1[1];
  var na1=useState(""),na=na1[0],setNa=na1[1];var np1=useState(""),np=np1[0],setNp=np1[1];
  var np2s=useState(""),np2=np2s[0],setNp2=np2s[1];var am1=useState(""),am=am1[0],setAm=am1[1];
  var tb1=useState("people"),tab=tb1[0],setTab=tb1[1];var sv1=useState(false),saving=sv1[0],setSaving=sv1[1];
  function addAdmin(){if(!na.trim()){setAm("Inserisci un nome");return;}if(np.length<4){setAm("Min 4 caratteri");return;}if(np!==np2){setAm("Non coincidono");return;}if(al.find(function(a){return a.name.toLowerCase()===na.trim().toLowerCase();})){setAm("Gia esistente");return;}
    setAl([].concat(al,[{name:na.trim(),passHash:hashPw(np)}]));setNa("");setNp("");setNp2("");setAm("Aggiunto!");setTimeout(function(){setAm("");},2000);}
  async function doSave(){setSaving(true);await onSave(cl,ll,al,budgets,targetM);setSaving(false);}
  return (<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.45)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000}} onClick={onClose}>
    <div onClick={function(e){e.stopPropagation();}} style={{background:"#fff",borderRadius:16,padding:28,width:520,maxWidth:"94vw",maxHeight:"88vh",overflowY:"auto",boxShadow:"0 20px 60px rgba(0,0,0,.2)",fontFamily:FONT}}>
      <h3 style={{margin:"0 0 16px",fontSize:20,color:CL.greyDk}}>Gestione</h3>
      <div style={{display:"flex",gap:4,marginBottom:20,flexWrap:"wrap"}}>{[["people","Consulenti"],["clients","Clienti e Budget"],["target","Target"],["admins","Admin"]].map(function(t){return <button key={t[0]} onClick={function(){setTab(t[0]);}} style={{padding:"8px 14px",borderRadius:8,border:"none",fontSize:12,fontWeight:tab===t[0]?700:400,cursor:"pointer",fontFamily:FONT,background:tab===t[0]?CL.red:"#f0f0f0",color:tab===t[0]?"#fff":CL.greyMd}}>{t[1]}</button>;})}</div>
      {tab==="people"&&<div><h4 style={{margin:"0 0 10px",color:CL.red}}>Consulenti</h4>
        {cl.map(function(c,i){return <div key={i} style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}><span style={{flex:1,padding:"6px 10px",background:CL.greyLt,borderRadius:6,fontSize:14}}>{c}</span><button onClick={function(){setCl(cl.filter(function(_,j){return j!==i;}));}} style={{background:"none",border:"none",color:CL.red,cursor:"pointer",fontSize:18}}>x</button></div>;})}
        <div style={{display:"flex",gap:8,marginTop:6}}><input value={nc} onChange={function(e){setNc(e.target.value);}} onKeyDown={function(e){if(e.key==="Enter"&&nc.trim()){setCl([].concat(cl,[nc.trim()]));setNc("");}}} placeholder="Nuovo consulente..." style={sInput}/><button onClick={function(){if(nc.trim()){setCl([].concat(cl,[nc.trim()]));setNc("");}}} style={sBtn}>+</button></div></div>}
      {tab==="clients"&&<div><h4 style={{margin:"0 0 10px",color:CL.red}}>Clienti e giornate previste/mese</h4>
        {ll.map(function(c,i){return <div key={i} style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}><span style={{flex:1,padding:"6px 10px",background:CL.greyLt,borderRadius:6,fontSize:14}}>{c}</span>
          <input type="number" min="0" step="0.5" value={budgets[c]||""} onChange={function(e){var nb=Object.assign({},budgets);nb[c]=parseFloat(e.target.value)||0;setBudgets(nb);}} placeholder="gg" style={Object.assign({},sInput,{flex:"none",width:80,textAlign:"center",padding:"6px 8px"})}/>
          <span style={{fontSize:11,color:"#888"}}>gg/m</span><button onClick={function(){setLl(ll.filter(function(_,j){return j!==i;}));var nb=Object.assign({},budgets);delete nb[c];setBudgets(nb);}} style={{background:"none",border:"none",color:CL.red,cursor:"pointer",fontSize:18}}>x</button></div>;})}
        <div style={{display:"flex",gap:8,marginTop:6}}><input value={nl} onChange={function(e){setNl(e.target.value);}} onKeyDown={function(e){if(e.key==="Enter"&&nl.trim()){setLl([].concat(ll,[nl.trim()]));setNl("");}}} placeholder="Nuovo cliente..." style={sInput}/><button onClick={function(){if(nl.trim()){setLl([].concat(ll,[nl.trim()]));setNl("");}}} style={sBtn}>+</button></div>
        <div style={{marginTop:12,padding:"10px 14px",background:CL.greyLt,borderRadius:8}}><span style={{fontSize:13,color:CL.greyMd}}>Totale richieste: </span><span style={{fontSize:16,fontWeight:700,color:CL.red}}>{fmtNum(ll.reduce(function(s,c){return s+(budgets[c]||0);},0))}</span><span style={{fontSize:12,color:"#888"}}> gg/mese</span></div></div>}
      {tab==="target"&&<div><h4 style={{margin:"0 0 10px",color:CL.red}}>Target mensile OPEX</h4><p style={{fontSize:13,color:CL.greyMd,marginBottom:12}}>Obiettivo giornate fatturabili al mese.</p>
        <div style={{display:"flex",alignItems:"center",gap:10}}><input type="number" min="0" step="1" value={targetM||""} onChange={function(e){setTargetM(parseFloat(e.target.value)||0);}} style={Object.assign({},sInput,{flex:"none",width:120,fontSize:20,textAlign:"center",padding:"12px",border:"2px solid "+CL.red,fontWeight:700})}/><span style={{fontSize:14,color:CL.greyMd}}>gg/mese</span></div></div>}
      {tab==="admins"&&<div><h4 style={{margin:"0 0 10px",color:CL.red}}>Admin attivi</h4>
        {al.map(function(a,i){return <div key={i} style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}><span style={{flex:1,padding:"6px 10px",background:CL.greyLt,borderRadius:6,fontSize:14,fontWeight:600}}>{a.name}</span>{al.length>1&&<button onClick={function(){setAl(al.filter(function(_,j){return j!==i;}));}} style={{background:"none",border:"none",color:CL.red,cursor:"pointer",fontSize:18}}>x</button>}</div>;})}
        <h4 style={{margin:"16px 0 10px",color:CL.red}}>Nuovo admin</h4>
        <input value={na} onChange={function(e){setNa(e.target.value);setAm("");}} placeholder="Nome" style={Object.assign({},sInput,{width:"100%",marginBottom:8})}/>
        <input type="password" value={np} onChange={function(e){setNp(e.target.value);setAm("");}} placeholder="Password" style={Object.assign({},sInput,{width:"100%",marginBottom:8})}/>
        <input type="password" value={np2} onChange={function(e){setNp2(e.target.value);setAm("");}} onKeyDown={function(e){if(e.key==="Enter")addAdmin();}} placeholder="Conferma" style={Object.assign({},sInput,{width:"100%",marginBottom:4})}/>
        {am&&<p style={{margin:"8px 0 0",fontSize:13,color:CL.red,fontWeight:600}}>{am}</p>}
        <button onClick={addAdmin} style={Object.assign({},sBtn,{width:"100%",padding:"10px 0",marginTop:12})}>+ Aggiungi</button></div>}
      <div style={{display:"flex",gap:10,marginTop:24,borderTop:"1px solid #eee",paddingTop:18}}>
        <button onClick={doSave} disabled={saving} style={Object.assign({},sBtn,{flex:1,padding:"12px 0",opacity:saving?0.5:1})}>{saving?"Salvataggio...":"Salva"}</button>
        <button onClick={onClose} style={sBtnOut}>Annulla</button></div></div></div>);
}

export default function App() {
  var ds=useState(null),data=ds[0],setData=ds[1];var ls=useState(true),loading=ls[0],setLoading=ls[1];
  var lgs=useState(false),logged=lgs[0],setLogged=lgs[1];var ias=useState(false),isAdmin=ias[0],setIsAdmin=ias[1];
  var us=useState(""),user=us[0],setUser=us[1];var vs=useState("personal"),view=vs[0],setView=vs[1];
  var yrs=useState(new Date().getFullYear()),yr=yrs[0],setYr=yrs[1];var mos=useState(new Date().getMonth()),mo=mos[0],setMo=mos[1];
  var eds=useState(null),editDay=eds[0],setEditDay=eds[1];var sss=useState(false),showSettings=sss[0],setShowSettings=sss[1];
  useEffect(function(){loadAll().then(function(d){setData(d);setLoading(false);});},[]);
  function loginC(n){setUser(n);setIsAdmin(false);setLogged(true);setView("personal");}
  function loginA(n){setUser(n);setIsAdmin(true);setLogged(true);setView("admin");}
  function logout(){setLogged(false);setIsAdmin(false);setUser("");setView("personal");setShowSettings(false);}
  var handleSaveDay=useCallback(async function(dk,val){var nd=Object.assign({},data);var entries=Object.assign({},nd.entries);if(!entries[user])entries[user]={};if(val)entries[user][dk]=val;else delete entries[user][dk];nd.entries=entries;setData(nd);setEditDay(null);await saveAll(nd);},[data,user]);
  var handleSaveSettings=useCallback(async function(cl,ll,al,budgets,targetM){var nd=Object.assign({},data,{consultants:cl,clients:ll,admins:al,clientBudgets:budgets,targetMensile:targetM});setData(nd);setShowSettings(false);await saveAll(nd);},[data]);
  function prevMonth(){if(mo===0){setMo(11);setYr(function(y){return y-1;});}else setMo(function(m){return m-1;});}
  function nextMonth(){if(mo===11){setMo(0);setYr(function(y){return y+1;});}else setMo(function(m){return m+1;});}
  if(loading||!data)return <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",fontFamily:FONT,color:CL.red,fontSize:18}}>Caricamento...</div>;
  if(!logged)return <LoginScreen data={data} onLoginC={loginC} onLoginA={loginA} onDataChange={setData}/>;
  var adminViews=[["admin","Panoramica"],["client","Per Cliente"],["report","Consuntivo"],["dashboard","Dashboard"]];
  return (<div style={{minHeight:"100vh",background:"linear-gradient(135deg,#f9f3f3 0%,"+CL.greyLt+" 100%)",fontFamily:FONT}}>
    <div style={{background:"linear-gradient(135deg,"+CL.greyDk+" 0%,"+CL.grey+" 40%,"+CL.redDk+" 100%)",padding:"14px 24px",color:"#fff"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10}}>
        <div style={{display:"flex",alignItems:"center",gap:14}}><div style={{background:"#fff",borderRadius:8,padding:"4px 8px"}}><Logo h={28}/></div><div><p style={{margin:0,fontSize:13,fontWeight:600}}>Agenda Consulenti</p><p style={{margin:0,fontSize:11,opacity:0.6}}>{isAdmin?"Admin: "+user:user}</p></div></div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
          {isAdmin&&adminViews.map(function(v){return <button key={v[0]} onClick={function(){setView(v[0]);}} style={{padding:"7px 14px",borderRadius:8,border:"none",fontSize:12,fontWeight:view===v[0]?700:400,background:view===v[0]?"rgba(255,255,255,.22)":"rgba(255,255,255,.08)",color:"#fff",cursor:"pointer",fontFamily:FONT}}>{v[1]}</button>;})}
          {isAdmin&&<button onClick={function(){setShowSettings(true);}} style={{padding:"7px 12px",borderRadius:8,border:"1px solid rgba(255,255,255,.25)",background:"transparent",color:"#fff",fontSize:12,cursor:"pointer",fontFamily:FONT}}>Impostazioni</button>}
          <button onClick={logout} style={{padding:"7px 14px",borderRadius:8,border:"1px solid rgba(255,255,255,.2)",background:"rgba(255,100,100,.15)",color:"#ffcccc",fontSize:11,cursor:"pointer",fontFamily:FONT}}>Esci</button></div></div></div>
    <div style={{maxWidth:960,margin:"0 auto",padding:"20px 16px 40px"}}>
      {view!=="dashboard"&&<div style={{display:"flex",alignItems:"center",justifyContent:"center",marginBottom:16,gap:12}}>
        <button onClick={prevMonth} style={{background:"#fff",border:"1px solid #ddd",borderRadius:8,padding:"6px 12px",cursor:"pointer",fontSize:18}}>&#8249;</button>
        <h2 style={{margin:0,fontSize:20,color:CL.greyDk,minWidth:200,textAlign:"center"}}>{MESI[mo]} {yr}</h2>
        <button onClick={nextMonth} style={{background:"#fff",border:"1px solid #ddd",borderRadius:8,padding:"6px 12px",cursor:"pointer",fontSize:18}}>&#8250;</button></div>}
      {view!=="dashboard"&&<Legenda/>}
      {!isAdmin&&<div style={{background:"#fff",borderRadius:16,padding:20,boxShadow:"0 4px 20px rgba(0,0,0,.06)"}}><Calendar year={yr} month={mo} entries={data.entries[user]||{}} onDayClick={setEditDay}/></div>}
      {isAdmin&&view==="admin"&&<div style={{background:"#fff",borderRadius:16,padding:20,boxShadow:"0 4px 20px rgba(0,0,0,.06)"}}><h3 style={{margin:"0 0 14px",color:CL.greyDk,fontSize:16}}>Panoramica - {MESI[mo]} {yr}</h3><Panoramica entries={data.entries} consultants={data.consultants} year={yr} month={mo}/></div>}
      {isAdmin&&view==="client"&&<div style={{background:"#fff",borderRadius:16,padding:20,boxShadow:"0 4px 20px rgba(0,0,0,.06)"}}><h3 style={{margin:"0 0 14px",color:CL.greyDk,fontSize:16}}>Per Cliente - {MESI[mo]} {yr}</h3><VistaCliente entries={data.entries} consultants={data.consultants} clients={data.clients} clientBudgets={data.clientBudgets} year={yr} month={mo}/></div>}
      {isAdmin&&view==="report"&&<div style={{background:"#fff",borderRadius:16,padding:20,boxShadow:"0 4px 20px rgba(0,0,0,.06)"}}><h3 style={{margin:"0 0 14px",color:CL.greyDk,fontSize:16}}>Consuntivo - {MESI[mo]} {yr}</h3><Consuntivo entries={data.entries} consultants={data.consultants} clients={data.clients} clientBudgets={data.clientBudgets} year={yr} month={mo}/></div>}
      {isAdmin&&view==="dashboard"&&<div style={{background:"#fff",borderRadius:16,padding:20,boxShadow:"0 4px 20px rgba(0,0,0,.06)"}}><h3 style={{margin:"0 0 14px",color:CL.greyDk,fontSize:16}}>Dashboard - {yr}</h3><Dashboard data={data} year={yr}/></div>}</div>
    {editDay&&<DayModal dk={editDay} entry={(data.entries[user]||{})[editDay]} clients={data.clients} onSave={handleSaveDay} onClose={function(){setEditDay(null);}}/>}
    {showSettings&&<Impostazioni data={data} onSave={handleSaveSettings} onClose={function(){setShowSettings(false);}}/>}</div>);
}
