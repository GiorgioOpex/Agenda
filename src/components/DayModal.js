import { useState } from "react";
import { MESI, CL, STATI, FONT, sI, sB, sO, parseKey } from "./shared";

function HalfEditor(p){
  var opts=[{k:"",l:"- Nessuno -"},{k:"client",l:"Cliente OPEX"},{k:"busy",l:"Altro impegno"},{k:"free",l:"Libero"}];
  return(<div style={{marginBottom:12}}>
    <h4 style={{margin:"0 0 8px",fontSize:14,color:CL.greyDk,fontWeight:700}}>{p.label}</h4>
    <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:8}}>{opts.map(function(o){return<button key={o.k} onClick={function(){p.setStatus(o.k);}} style={{padding:"6px 11px",borderRadius:8,fontSize:12,fontWeight:p.status===o.k?700:400,border:p.status===o.k?"2px solid "+CL.red:"1px solid #ddd",cursor:"pointer",fontFamily:FONT,background:p.status===o.k&&o.k?STATI[o.k].bg:"#f9f9f9",color:p.status===o.k&&o.k?STATI[o.k].text:"#555"}}>{o.l}</button>;})}</div>
    {p.status==="client"&&<select value={p.client} onChange={function(e){p.setClient(e.target.value);}} style={{width:"100%",padding:"8px 10px",borderRadius:8,border:"2px solid "+CL.red,fontSize:13,fontFamily:FONT,background:"#fff8f8",marginBottom:6,boxSizing:"border-box"}}><option value="">- Seleziona cliente -</option>{p.clients.map(function(c){return<option key={c} value={c}>{c}</option>;})}</select>}
    <input value={p.note} onChange={function(e){p.setNote(e.target.value);}} placeholder="Note" style={Object.assign({},sI,{width:"100%",padding:"7px 10px",fontSize:13})}/></div>);
}

export function DayModal(p){
  var dk=p.dk,entry=p.entry,clients=p.clients,onSave=p.onSave,onClose=p.onClose;
  var a1=useState(entry&&entry.am?entry.am.status||"":""),as=a1[0],sAs=a1[1];
  var a2=useState(entry&&entry.am?entry.am.client||"":""),ac=a2[0],sAc=a2[1];
  var a3=useState(entry&&entry.am?entry.am.note||"":""),an=a3[0],sAn=a3[1];
  var p1=useState(entry&&entry.pm?entry.pm.status||"":""),ps=p1[0],sPs=p1[1];
  var p2=useState(entry&&entry.pm?entry.pm.client||"":""),pc=p2[0],sPc=p2[1];
  var p3=useState(entry&&entry.pm?entry.pm.note||"":""),pn=p3[0],sPn=p3[1];
  var sv=useState(false),saving=sv[0],sSv=sv[1];var info=parseKey(dk);
  async function doSave(){if(as==="client"&&!ac){alert("Seleziona un cliente (mattina)");return;}if(ps==="client"&&!pc){alert("Seleziona un cliente (pomeriggio)");return;}
    sSv(true);var data={};if(as)data.am={status:as,client:as==="client"?ac:"",note:an};if(ps)data.pm={status:ps,client:ps==="client"?pc:"",note:pn};
    await onSave(dk,Object.keys(data).length>0?data:null);sSv(false);}
  return(<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.45)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000}} onClick={onClose}>
    <div onClick={function(e){e.stopPropagation();}} style={{background:"#fff",borderRadius:16,padding:28,width:400,maxWidth:"92vw",maxHeight:"88vh",overflowY:"auto",boxShadow:"0 20px 60px rgba(0,0,0,.2)",fontFamily:FONT}}>
      <h3 style={{margin:"0 0 18px",fontSize:18,color:CL.greyDk}}>{info.day} {MESI[info.month]} {info.year}</h3>
      <HalfEditor label="Mattina" status={as} setStatus={sAs} client={ac} setClient={sAc} note={an} setNote={sAn} clients={clients}/>
      <div style={{display:"flex",justifyContent:"center",margin:"4px 0 8px"}}><button onClick={function(){sPs(as);sPc(ac);sPn(an);}} disabled={!as} style={{padding:"7px 18px",borderRadius:20,fontSize:12,fontWeight:600,fontFamily:FONT,border:"1px solid "+(as?CL.red:"#ddd"),cursor:as?"pointer":"default",background:as?"#FFF3F3":"#f5f5f5",color:as?CL.red:"#bbb"}}>Copia mattina al pomeriggio</button></div>
      <HalfEditor label="Pomeriggio" status={ps} setStatus={sPs} client={pc} setClient={sPc} note={pn} setNote={sPn} clients={clients}/>
      <div style={{display:"flex",gap:10,marginTop:12}}>
        <button onClick={doSave} disabled={saving} style={Object.assign({},sB,{flex:1,padding:"11px 0",opacity:saving?.5:1})}>{saving?"Salvataggio...":"Salva"}</button>
        <button onClick={function(){onSave(dk,null);}} style={Object.assign({},sO,{color:"#999"})}>Cancella</button>
        <button onClick={onClose} style={sO}>Chiudi</button></div></div></div>);
}
