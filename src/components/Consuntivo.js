"use client";
import { useState, useMemo } from "react";
import { MESI, GIORNI, CL, FONT, sI, sB, sO, fmtNum, makeKey, parseKey, daysInMonth, firstDow, STATI, getHalfBg, getClientColor } from "./shared";

function MiniCalendar(p){
  var name=p.name,entries=p.entries,clients=p.clients,year=p.year,month=p.month,onSave=p.onSave,onBack=p.onBack;
  var days=daysInMonth(year,month),fd=firstDow(year,month),cells=[];
  for(var i=0;i<fd;i++)cells.push(null);for(var dd=1;dd<=days;dd++)cells.push(dd);
  var today=new Date();var cE=entries[name]||{};
  var es=useState(null),editKey=es[0],sEditKey=es[1];
  var a1=useState(""),as=a1[0],sAs=a1[1];var a2=useState(""),ac=a2[0],sAc=a2[1];
  var p1=useState(""),ps=p1[0],sPs=p1[1];var p2=useState(""),pc=p2[0],sPc=p2[1];
  var sv=useState(false),saving=sv[0],sSv=sv[1];
  function openDay(key){var en=cE[key];sEditKey(key);sAs(en&&en.am?en.am.status||"":"");sAc(en&&en.am?en.am.client||"":"");sPs(en&&en.pm?en.pm.status||"":"");sPc(en&&en.pm?en.pm.client||"":"");}
  async function doSave(){sSv(true);var data={};if(as)data.am={status:as,client:as==="client"?ac:"",note:""};if(ps)data.pm={status:ps,client:ps==="client"?pc:"",note:""};
    await onSave(name,editKey,Object.keys(data).length>0?data:null);sSv(false);sEditKey(null);}
  function halfLabel(h){if(!h||!h.status)return "";if(h.status==="client"&&h.client)return h.client.toUpperCase();if(h.status==="commercial")return "COMMERCIALE";return "";}
  var opts=[{k:"",l:"Libero"},{k:"client",l:"Cliente"},{k:"commercial",l:"Comm."},{k:"busy",l:"Altro"}];
  return(<div>
    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}><button onClick={onBack} style={Object.assign({},sO,{padding:"6px 12px",fontSize:12})}>&#8249; Indietro</button><span style={{fontSize:16,fontWeight:700,color:CL.red}}>{name}</span><span style={{fontSize:12,color:CL.greyMd}}>{MESI[month]} {year}</span></div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2,marginBottom:4}}>{GIORNI.map(function(d){return<div key={d} style={{textAlign:"center",fontSize:10,fontWeight:600,color:"#888",padding:"3px 0"}}>{d}</div>;})}</div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3}}>{cells.map(function(d,i){
      if(!d)return<div key={"e"+i}/>;var key=makeKey(year,month,d),en=cE[key];
      var amBg=getHalfBg(en&&en.am?en.am:null,clients);var pmBg=getHalfBg(en&&en.pm?en.pm:null,clients);
      var amLbl=halfLabel(en&&en.am?en.am:null);var pmLbl=halfLabel(en&&en.pm?en.pm:null);
      var isSun=(fd+d-1)%7===6,has=amBg!=="transparent"||pmBg!=="transparent";
      var isT=d&&today.getFullYear()===year&&today.getMonth()===month&&today.getDate()===d;
      return(<div key={key} onClick={function(){if(!isSun)openDay(key);}} style={{position:"relative",aspectRatio:"1",display:"flex",alignItems:"center",justifyContent:"center",borderRadius:6,overflow:"hidden",cursor:isSun?"default":"pointer",border:isT?"2px solid "+CL.red:editKey===key?"2px solid #F0C040":"1px solid #e8e8e8",background:isSun?"#f0f0f0":"#fafafa",userSelect:"none"}}>
        {has&&!isSun&&<div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column"}}><div style={{flex:1,background:amBg,opacity:.85,display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden"}}>{amLbl&&<span style={{fontSize:5,fontWeight:600,color:"#fff",textShadow:"0 1px 1px rgba(0,0,0,.5)",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",maxWidth:"100%",padding:"0 1px"}}>{amLbl}</span>}</div><div style={{flex:1,background:pmBg,opacity:.85,display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden"}}>{pmLbl&&<span style={{fontSize:5,fontWeight:600,color:"#fff",textShadow:"0 1px 1px rgba(0,0,0,.5)",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",maxWidth:"100%",padding:"0 1px"}}>{pmLbl}</span>}</div></div>}
        <span style={{position:"relative",zIndex:1,fontSize:12,fontWeight:isT?700:500,color:has&&!isSun?"#fff":isSun?"#ccc":"#444"}}>{d}</span></div>);})}</div>
    {editKey&&<div style={{marginTop:12,padding:14,background:"#FFF8F0",borderRadius:10,border:"1px solid #F0C040"}}>
      <div style={{fontSize:13,fontWeight:600,color:CL.greyDk,marginBottom:8}}>{parseKey(editKey).day} {MESI[month]}</div>
      <div style={{marginBottom:8}}><div style={{fontSize:11,color:CL.greyMd,marginBottom:4}}>Mattina</div><div style={{display:"flex",gap:4,flexWrap:"wrap"}}>{opts.map(function(o){return<button key={o.k} onClick={function(){sAs(o.k);}} style={{padding:"4px 8px",borderRadius:6,fontSize:11,border:as===o.k?"2px solid "+CL.red:"1px solid #ddd",background:as===o.k&&o.k?STATI[o.k]?STATI[o.k].bg:o.k==="commercial"?"#FF8F00":"#f9f9f9":"#f9f9f9",color:as===o.k&&o.k?"#fff":"#555",cursor:"pointer",fontFamily:FONT}}>{o.l}</button>;})}</div>
        {as==="client"&&<select value={ac} onChange={function(e){sAc(e.target.value);}} style={{width:"100%",padding:"5px 8px",borderRadius:6,border:"1px solid "+CL.red,fontSize:11,marginTop:4}}><option value="">- Cliente -</option>{clients.map(function(c){return<option key={c} value={c}>{c}</option>;})}</select>}</div>
      <div style={{marginBottom:8}}><div style={{fontSize:11,color:CL.greyMd,marginBottom:4}}>Pomeriggio</div><div style={{display:"flex",gap:4,flexWrap:"wrap"}}>{opts.map(function(o){return<button key={o.k} onClick={function(){sPs(o.k);}} style={{padding:"4px 8px",borderRadius:6,fontSize:11,border:ps===o.k?"2px solid "+CL.red:"1px solid #ddd",background:ps===o.k&&o.k?STATI[o.k]?STATI[o.k].bg:o.k==="commercial"?"#FF8F00":"#f9f9f9":"#f9f9f9",color:ps===o.k&&o.k?"#fff":"#555",cursor:"pointer",fontFamily:FONT}}>{o.l}</button>;})}</div>
        {ps==="client"&&<select value={pc} onChange={function(e){sPc(e.target.value);}} style={{width:"100%",padding:"5px 8px",borderRadius:6,border:"1px solid "+CL.red,fontSize:11,marginTop:4}}><option value="">- Cliente -</option>{clients.map(function(c){return<option key={c} value={c}>{c}</option>;})}</select>}</div>
      <div style={{display:"flex",gap:6}}><button onClick={doSave} disabled={saving} style={Object.assign({},sB,{padding:"6px 14px",fontSize:12,opacity:saving?.5:1})}>{saving?"...":"Salva"}</button><button onClick={function(){sEditKey(null);}} style={Object.assign({},sO,{padding:"6px 14px",fontSize:12})}>Chiudi</button></div>
    </div>}
  </div>);
}

function ClientDetail(p){
  var clientName=p.clientName,entries=p.entries,cons=p.consultants,cBud=p.clientBudgets||{},year=p.year,month=p.month,onBack=p.onBack;
  var bud=cBud[clientName]||0;
  var detail=useMemo(function(){var rows=[];var totEff=0;
    cons.forEach(function(n){var cE=entries[n]||{};var gg=0;var giorni=[];
      for(var d=1;d<=daysInMonth(year,month);d++){var e=cE[makeKey(year,month,d)];if(!e)continue;
        ["am","pm"].forEach(function(h){var x=e[h];if(x&&x.status==="client"&&x.client===clientName){gg+=0.5;giorni.push(d+(h==="am"?"AM":"PM"));}});}
      if(gg>0){rows.push({name:n,gg:gg,giorni:giorni});totEff+=gg;}});
    return{rows:rows,totEff:totEff};},[entries,cons,clientName,year,month]);
  return(<div>
    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}><button onClick={onBack} style={Object.assign({},sO,{padding:"6px 12px",fontSize:12})}>&#8249; Tutti i clienti</button><span style={{fontSize:16,fontWeight:700,color:CL.red}}>{clientName}</span></div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:12,marginBottom:16}}>
      <div style={{padding:"12px 16px",background:"#FFF3F3",borderRadius:10,border:"1px solid "+CL.red}}><div style={{fontSize:11,color:CL.greyMd}}>Previste</div><div style={{fontSize:22,fontWeight:700,color:CL.red}}>{fmtNum(bud)}</div></div>
      <div style={{padding:"12px 16px",background:CL.greyLt,borderRadius:10,border:"1px solid #ddd"}}><div style={{fontSize:11,color:CL.greyMd}}>Effettive</div><div style={{fontSize:22,fontWeight:700,color:CL.greyDk}}>{fmtNum(detail.totEff)}</div></div>
      <div style={{padding:"12px 16px",background:detail.totEff>=bud?"#E8F5E9":"#FFF3F3",borderRadius:10,border:"1px solid "+(detail.totEff>=bud?"#A5D6A7":CL.red)}}><div style={{fontSize:11,color:CL.greyMd}}>Delta</div><div style={{fontSize:22,fontWeight:700,color:detail.totEff>=bud?"#2E7D32":CL.red}}>{(detail.totEff-bud>=0?"+":"")+fmtNum(detail.totEff-bud)}</div></div></div>
    <div style={{overflowX:"auto"}}><table style={{borderCollapse:"collapse",width:"100%",fontSize:13,fontFamily:FONT}}>
      <thead><tr style={{background:"#FFF8F8"}}>
        <th style={{padding:"8px 14px",borderBottom:"2px solid "+CL.red,textAlign:"left"}}>Consulente</th>
        <th style={{padding:"8px",borderBottom:"2px solid "+CL.red,textAlign:"center"}}>GG</th>
        <th style={{padding:"8px 14px",borderBottom:"2px solid "+CL.red,textAlign:"left"}}>Dettaglio giorni</th></tr></thead>
      <tbody>{detail.rows.map(function(r){return<tr key={r.name}>
        <td style={{padding:"8px 14px",borderBottom:"1px solid #eee",fontWeight:600,color:CL.greyDk}}>{r.name}</td>
        <td style={{padding:"8px",borderBottom:"1px solid #eee",textAlign:"center",fontWeight:700,color:CL.red,fontSize:15}}>{fmtNum(r.gg)}</td>
        <td style={{padding:"8px 14px",borderBottom:"1px solid #eee",fontSize:11,color:CL.greyMd}}>{r.giorni.join(", ")}</td></tr>;})}
      {detail.rows.length===0&&<tr><td colSpan={3} style={{padding:"12px 14px",textAlign:"center",color:"#ccc"}}>Nessuna giornata registrata</td></tr>}
      {detail.rows.length>0&&<tr style={{background:"#FFF8F8"}}><td style={{padding:"8px 14px",borderTop:"2px solid "+CL.red,fontWeight:700}}>TOTALE</td><td style={{padding:"8px",borderTop:"2px solid "+CL.red,textAlign:"center",fontWeight:700,color:CL.red,fontSize:15}}>{fmtNum(detail.totEff)}</td><td style={{borderTop:"2px solid "+CL.red}}/></tr>}
      </tbody></table></div></div>);
}

export function Consuntivo(p){
  var entries=p.entries,cons=p.consultants,clients=p.clients,cBud=p.clientBudgets||{},year=p.year,month=p.month,onSaveEntry=p.onSaveEntry;
  var vs=useState("consultants"),viewMode=vs[0],sViewMode=vs[1];
  var cs=useState(null),selCons=cs[0],sSelCons=cs[1];
  var cls=useState(null),selClient=cls[0],sSelClient=cls[1];
  var report=useMemo(function(){var d={};cons.forEach(function(n){d[n]={tc:0,tb:0,tcom:0,bc:{}};clients.forEach(function(c){d[n].bc[c]=0;});
    var cE=entries[n]||{};for(var i=1;i<=daysInMonth(year,month);i++){var e=cE[makeKey(year,month,i)];if(!e)continue;
      ["am","pm"].forEach(function(h){var x=e[h];if(!x||!x.status)return;if(x.status==="client"){d[n].tc+=.5;if(x.client)d[n].bc[x.client]=(d[n].bc[x.client]||0)+.5;}else if(x.status==="busy")d[n].tb+=.5;else if(x.status==="commercial")d[n].tcom+=.5;});}});return d;},[entries,cons,clients,year,month]);

  if(selCons)return<MiniCalendar name={selCons} entries={entries} clients={clients} year={year} month={month} onSave={onSaveEntry} onBack={function(){sSelCons(null);}}/>;
  if(selClient)return<ClientDetail clientName={selClient} entries={entries} consultants={cons} clientBudgets={cBud} year={year} month={month} onBack={function(){sSelClient(null);}}/>;

  return(<div>
    <div style={{display:"flex",gap:8,marginBottom:16}}>
      <button onClick={function(){sViewMode("consultants");}} style={{padding:"8px 16px",borderRadius:8,border:"none",fontSize:13,fontWeight:viewMode==="consultants"?700:400,cursor:"pointer",fontFamily:FONT,background:viewMode==="consultants"?CL.red:"#f0f0f0",color:viewMode==="consultants"?"#fff":CL.greyMd}}>Per Consulente</button>
      <button onClick={function(){sViewMode("clients");}} style={{padding:"8px 16px",borderRadius:8,border:"none",fontSize:13,fontWeight:viewMode==="clients"?700:400,cursor:"pointer",fontFamily:FONT,background:viewMode==="clients"?CL.red:"#f0f0f0",color:viewMode==="clients"?"#fff":CL.greyMd}}>Per Cliente</button>
    </div>

    {viewMode==="consultants"&&<div style={{overflowX:"auto"}}>
      <table style={{borderCollapse:"collapse",width:"100%",fontSize:13,fontFamily:FONT}}><thead><tr style={{background:"#FFF8F8"}}>
        <th style={{padding:"10px 14px",borderBottom:"2px solid "+CL.red,textAlign:"left"}}>Consulente</th><th style={{padding:"10px 8px",borderBottom:"2px solid "+CL.red}}>GG Cli.</th>
        {clients.map(function(c){return<th key={c} style={{padding:"10px 8px",borderBottom:"2px solid "+CL.red,maxWidth:90,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c}</th>;})}
        <th style={{padding:"10px 8px",borderBottom:"2px solid "+CL.red}}>Altro</th>
        <th style={{padding:"10px 8px",borderBottom:"2px solid "+CL.red,color:"#FF8F00"}}>Comm.</th></tr></thead>
      <tbody>{cons.map(function(n){var r=report[n];return(<tr key={n} onClick={function(){sSelCons(n);}} style={{cursor:"pointer"}}>
        <td style={{padding:"8px 14px",borderBottom:"1px solid #eee",fontWeight:600,color:CL.red,textAlign:"left"}}>{n}</td>
        <td style={{padding:"8px",borderBottom:"1px solid #eee",textAlign:"center",fontWeight:700,color:CL.greyDk,fontSize:16}}>{fmtNum(r.tc)}</td>
        {clients.map(function(c){return<td key={c} style={{padding:"8px",borderBottom:"1px solid #eee",textAlign:"center",color:r.bc[c]?CL.red:"#ccc"}}>{r.bc[c]?fmtNum(r.bc[c]):"-"}</td>;})}
        <td style={{padding:"8px",borderBottom:"1px solid #eee",textAlign:"center",color:CL.grey,fontWeight:600}}>{fmtNum(r.tb)}</td>
        <td style={{padding:"8px",borderBottom:"1px solid #eee",textAlign:"center",color:"#FF8F00",fontWeight:600}}>{r.tcom?fmtNum(r.tcom):"-"}</td></tr>);})}</tbody></table>
      <p style={{marginTop:8,fontSize:11,color:"#aaa"}}>Clicca su un consulente per visualizzare e modificare la sua agenda</p>
    </div>}

    {viewMode==="clients"&&<div style={{overflowX:"auto"}}>
      <table style={{borderCollapse:"collapse",width:"100%",fontSize:13,fontFamily:FONT}}><thead><tr style={{background:"#FFF8F8"}}>
        <th style={{padding:"10px 14px",borderBottom:"2px solid "+CL.red,textAlign:"left"}}>Cliente</th>
        <th style={{padding:"10px 8px",borderBottom:"2px solid "+CL.red}}>Previste</th>
        <th style={{padding:"10px 8px",borderBottom:"2px solid "+CL.red}}>Effettive</th>
        <th style={{padding:"10px 8px",borderBottom:"2px solid "+CL.red}}>Delta</th></tr></thead>
      <tbody>{clients.map(function(c){var bud=cBud[c]||0,eff=cons.reduce(function(s,n){return s+((report[n]||{}).bc||{})[c]||0;},0),diff=eff-bud;
        return<tr key={c} onClick={function(){sSelClient(c);}} style={{cursor:"pointer"}}>
          <td style={{padding:"8px 14px",borderBottom:"1px solid #eee",fontWeight:600,color:CL.red,textAlign:"left"}}>{c}</td>
          <td style={{padding:"8px",borderBottom:"1px solid #eee",textAlign:"center"}}>{fmtNum(bud)}</td>
          <td style={{padding:"8px",borderBottom:"1px solid #eee",textAlign:"center",fontWeight:700,color:CL.greyDk}}>{fmtNum(eff)}</td>
          <td style={{padding:"8px",borderBottom:"1px solid #eee",textAlign:"center",fontWeight:700,color:diff>=0?"#2E7D32":CL.red}}>{(diff>=0?"+":"")+fmtNum(diff)}</td></tr>;})}</tbody></table>
      <p style={{marginTop:8,fontSize:11,color:"#aaa"}}>Clicca su un cliente per il dettaglio giornate per consulente</p>
    </div>}
    <p style={{marginTop:12,fontSize:11,color:"#aaa"}}>Valori in giornate (0.5 = mezza giornata)</p></div>);
}
