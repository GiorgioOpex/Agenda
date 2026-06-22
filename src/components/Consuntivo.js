"use client";
import { useState, useMemo } from "react";
import { MESI, GIORNI, CL, FONT, sI, sB, sO, fmtNum, makeKey, parseKey, daysInMonth, firstDow, STATI, getHalfBg, getClientColor, isHoliday, HOLIDAY_BG, HOLIDAY_LETTER } from "./shared";
import { DayModal } from "./DayModal";

function MiniCalendar(p){
  var name=p.name,entries=p.entries,clients=p.clients,clientEndDates=p.clientEndDates||{},year=p.year,month=p.month,onSave=p.onSave,onBack=p.onBack,customHolidays=p.customHolidays||[];
  var days=daysInMonth(year,month),fd=firstDow(year,month),cells=[];
  for(var i=0;i<fd;i++)cells.push(null);for(var dd=1;dd<=days;dd++)cells.push(dd);
  var today=new Date();var cE=entries[name]||{};
  var es=useState(null),editKey=es[0],sEditKey=es[1];
  var mms=useState(null),menu=mms[0],sMenu=mms[1];
  var cps=useState(null),copyData=cps[0],sCopyData=cps[1];

  function hasImpegno(en){
    if(!en)return false;
    return (en.am&&(en.am.status==="client"||en.am.status==="busy"||en.am.status==="commercial"||en.am.status==="training"))
      ||(en.pm&&(en.pm.status==="client"||en.pm.status==="busy"||en.pm.status==="commercial"||en.pm.status==="training"));
  }
  function isSlotFree(en,half){
    if(!en)return true;
    if(half==="am")return!en.am||!en.am.status;
    if(half==="pm")return!en.pm||!en.pm.status;
    return(!en.am||!en.am.status)&&(!en.pm||!en.pm.status);
  }
  function startCopy(en){sCopyData(JSON.parse(JSON.stringify(en)));sMenu(null);}
  function cancelCopy(){sCopyData(null);}

  function handleCellClick(key,en,e){
    var parts=key.split("-").map(Number);var dd=parts[2];
    var isSun=(fd+dd-1)%7===6;
    var isHol=isHoliday(year,month,dd,customHolidays);
    if(isSun||isHol)return;
    if(copyData){
      if(!isSlotFree(en,"am")||!isSlotFree(en,"pm")){alert("La destinazione e' gia' occupata");return;}
      onSave(name,key,JSON.parse(JSON.stringify(copyData)));
      return;
    }
    if(!hasImpegno(en)){sEditKey(key);return;}
    var rect=e.currentTarget.getBoundingClientRect();
    sMenu({key:key,entry:en,x:rect.left,y:rect.bottom+4});
  }

  async function saveDay(dk,val){
    sEditKey(null);
    await onSave(name,dk,val);
  }

  function halfLabel(h){
    if(!h||!h.status)return"";
    if(h.status==="client"&&h.client)return h.client.toUpperCase();
    if(h.status==="commercial")return"COMMERCIALE";
    if(h.status==="training")return"FORMAZIONE";
    return"";
  }

  return(<div>
    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}><button onClick={onBack} style={Object.assign({},sO,{padding:"6px 12px",fontSize:12})}>&#8249; Indietro</button><span style={{fontSize:16,fontWeight:700,color:CL.red}}>{name}</span><span style={{fontSize:12,color:CL.greyMd}}>{MESI[month]} {year}</span></div>
    {copyData&&<div style={{padding:"6px 12px",marginBottom:8,background:"#E8F5E9",borderRadius:8,border:"1px solid #A5D6A7",fontSize:12,color:CL.greyDk,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
      <span>Giornata copiata — clicca sui giorni vuoti per incollare (multiplo)</span>
      <button onClick={cancelCopy} style={{padding:"3px 10px",borderRadius:6,border:"1px solid #ccc",background:"#fff",fontSize:11,cursor:"pointer",fontFamily:FONT}}>Fine</button>
    </div>}
    <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2,marginBottom:4}}>{GIORNI.map(function(d){return<div key={d} style={{textAlign:"center",fontSize:10,fontWeight:600,color:"#888",padding:"3px 0"}}>{d}</div>;})}</div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3}}>{cells.map(function(d,i){
      if(!d)return<div key={"e"+i}/>;
      var key=makeKey(year,month,d),en=cE[key];
      var isHol=isHoliday(year,month,d,customHolidays);
      var amBg=getHalfBg(en&&en.am?en.am:null,clients);
      var pmBg=getHalfBg(en&&en.pm?en.pm:null,clients);
      var amLbl=halfLabel(en&&en.am?en.am:null);
      var pmLbl=halfLabel(en&&en.pm?en.pm:null);
      var isSun=(fd+d-1)%7===6;
      var has=amBg!=="transparent"||pmBg!=="transparent";
      var isT=d&&today.getFullYear()===year&&today.getMonth()===month&&today.getDate()===d;
      var canPaste=copyData&&!isSun&&!isHol&&isSlotFree(en,"am")&&isSlotFree(en,"pm");
      return(<div key={key} onClick={function(e){if(!isSun&&!isHol)handleCellClick(key,en,e);}} style={{
        position:"relative",aspectRatio:"1",display:"flex",alignItems:"center",justifyContent:"center",
        borderRadius:6,overflow:"hidden",
        cursor:isHol?"default":isSun?"default":(copyData?(canPaste?"pointer":"not-allowed"):"pointer"),
        border:canPaste?"2px dashed #A5D6A7":isT?"2px solid "+CL.red:"1px solid #e8e8e8",
        background:isHol?HOLIDAY_BG:isSun?"#f0f0f0":(canPaste?"#E8F5E9":"#fafafa"),
        userSelect:"none",
        opacity:copyData&&!canPaste&&!has&&!isHol?0.4:1
      }}>
        {isHol&&<span style={{fontSize:13,fontWeight:700,color:"#fff",userSelect:"none"}}>{HOLIDAY_LETTER}</span>}
        {!isHol&&has&&!isSun&&<div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column"}}>
          <div style={{flex:1,background:amBg,opacity:.85,display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden"}}>{amLbl&&<span style={{fontSize:5,fontWeight:600,color:"#fff",textShadow:"0 1px 1px rgba(0,0,0,.5)",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",maxWidth:"100%",padding:"0 1px"}}>{amLbl}</span>}</div>
          <div style={{flex:1,background:pmBg,opacity:.85,display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden"}}>{pmLbl&&<span style={{fontSize:5,fontWeight:600,color:"#fff",textShadow:"0 1px 1px rgba(0,0,0,.5)",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",maxWidth:"100%",padding:"0 1px"}}>{pmLbl}</span>}</div>
        </div>}
        {!isHol&&<span style={{position:"relative",zIndex:1,fontSize:12,fontWeight:isT?700:500,color:has&&!isSun?"#fff":isSun?"#ccc":"#444"}}>{d}</span>}
      </div>);
    })}</div>

    {menu&&<div style={{position:"fixed",inset:0,zIndex:999}} onClick={function(){sMenu(null);}}>
      <div onClick={function(e){e.stopPropagation();}} style={{position:"fixed",left:Math.min(menu.x,window.innerWidth-180),top:Math.min(menu.y,window.innerHeight-160),background:"#fff",borderRadius:10,boxShadow:"0 8px 30px rgba(0,0,0,.2)",border:"1px solid #eee",padding:6,minWidth:160,fontFamily:FONT,zIndex:1000}}>
        <button onClick={function(){var k=menu.key;sMenu(null);sEditKey(k);}} style={{display:"block",width:"100%",padding:"9px 12px",border:"none",background:"transparent",textAlign:"left",fontSize:13,cursor:"pointer",fontFamily:FONT,borderRadius:6,color:CL.greyDk,fontWeight:600}} onMouseEnter={function(e){e.target.style.background="#f5f5f5";}} onMouseLeave={function(e){e.target.style.background="transparent";}}>Modifica</button>
        <div style={{height:1,background:"#eee",margin:"4px 0"}}/>
        <button onClick={function(){startCopy(menu.entry);}} style={{display:"block",width:"100%",padding:"9px 12px",border:"none",background:"transparent",textAlign:"left",fontSize:13,cursor:"pointer",fontFamily:FONT,borderRadius:6,color:"#2E7D32",fontWeight:600}} onMouseEnter={function(e){e.target.style.background="#E8F5E9";}} onMouseLeave={function(e){e.target.style.background="transparent";}}>Copia giornata</button>
      </div>
    </div>}

    {editKey&&<DayModal dk={editKey} entry={cE[editKey]} clients={clients} clientEndDates={clientEndDates} onSave={saveDay} onClose={function(){sEditKey(null);}}/>}
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
      </tbody></table></div>
    {function(){var dayRows=[];
      cons.forEach(function(n){var cE=entries[n]||{};
        for(var d=1;d<=daysInMonth(year,month);d++){var e=cE[makeKey(year,month,d)];if(!e)continue;
          var halves=[];["am","pm"].forEach(function(h){var x=e[h];if(x&&x.status==="client"&&x.client===clientName)halves.push(h);});
          if(halves.length>0)dayRows.push({day:d,name:n,presenza:halves.length===2?"Intera giornata":halves[0]==="am"?"Mattina":"Pomeriggio"});}});
      dayRows.sort(function(a,b){return a.day===b.day?a.name.localeCompare(b.name):a.day-b.day;});
      if(dayRows.length===0)return null;
      return(<div style={{marginTop:20}}>
        <h4 style={{margin:"0 0 10px",color:CL.greyDk,fontSize:14}}>Dettaglio giornaliero</h4>
        <div style={{overflowX:"auto"}}><table style={{borderCollapse:"collapse",width:"100%",fontSize:13,fontFamily:FONT}}>
          <thead><tr style={{background:"#FFF8F8"}}>
            <th style={{padding:"8px 14px",borderBottom:"2px solid "+CL.red,textAlign:"left"}}>Data</th>
            <th style={{padding:"8px 14px",borderBottom:"2px solid "+CL.red,textAlign:"left"}}>Presenza</th>
            <th style={{padding:"8px 14px",borderBottom:"2px solid "+CL.red,textAlign:"left"}}>Consulente</th></tr></thead>
          <tbody>{dayRows.map(function(r,i){return<tr key={i}>
            <td style={{padding:"6px 14px",borderBottom:"1px solid #eee",fontWeight:600,color:CL.greyDk}}>{r.day} {MESI[month].substring(0,3)}</td>
            <td style={{padding:"6px 14px",borderBottom:"1px solid #eee",color:CL.greyMd}}>{r.presenza}</td>
            <td style={{padding:"6px 14px",borderBottom:"1px solid #eee",fontWeight:600,color:CL.red}}>{r.name}</td></tr>;})}</tbody>
        </table></div></div>);}()}
    </div>);
}

function ConsDetail(p){
  var name=p.name,entries=p.entries,clients=p.clients,year=p.year,month=p.month,onBack=p.onBack;
  var cE=entries[name]||{};
  var detail=useMemo(function(){var byClient={};var commDays=[];var busyDays=[];var trainDays=[];
    for(var d=1;d<=daysInMonth(year,month);d++){var e=cE[makeKey(year,month,d)];if(!e)continue;
      ["am","pm"].forEach(function(h){var x=e[h];if(!x||!x.status)return;
        if(x.status==="client"&&x.client){if(!byClient[x.client])byClient[x.client]=[];byClient[x.client].push({day:d,half:h});}
        if(x.status==="commercial")commDays.push({day:d,half:h});
        if(x.status==="busy")busyDays.push({day:d,half:h});
        if(x.status==="training")trainDays.push({day:d,half:h});});}
    var rows=[];
    Object.keys(byClient).forEach(function(c){var items=byClient[c];var grouped={};
      items.forEach(function(it){if(!grouped[it.day])grouped[it.day]=[];grouped[it.day].push(it.half);});
      var gg=items.length*0.5;var giorni=[];
      Object.keys(grouped).sort(function(a,b){return Number(a)-Number(b);}).forEach(function(d){var hh=grouped[d];
        if(hh.length===2)giorni.push(d+" (intera)");
        else if(hh[0]==="am")giorni.push(d+" (mattina)");
        else giorni.push(d+" (pomeriggio)");});
      rows.push({type:"client",label:c,gg:gg,giorni:giorni});});
    if(commDays.length>0){var cGrouped={};commDays.forEach(function(it){if(!cGrouped[it.day])cGrouped[it.day]=[];cGrouped[it.day].push(it.half);});
      var cGiorni=[];Object.keys(cGrouped).sort(function(a,b){return Number(a)-Number(b);}).forEach(function(d){var hh=cGrouped[d];
        if(hh.length===2)cGiorni.push(d+" (intera)");else if(hh[0]==="am")cGiorni.push(d+" (mattina)");else cGiorni.push(d+" (pomeriggio)");});
      rows.push({type:"commercial",label:"COMMERCIALE OPEX",gg:commDays.length*0.5,giorni:cGiorni});}
    if(trainDays.length>0){var tGrouped={};trainDays.forEach(function(it){if(!tGrouped[it.day])tGrouped[it.day]=[];tGrouped[it.day].push(it.half);});
      var tGiorni=[];Object.keys(tGrouped).sort(function(a,b){return Number(a)-Number(b);}).forEach(function(d){var hh=tGrouped[d];
        if(hh.length===2)tGiorni.push(d+" (intera)");else if(hh[0]==="am")tGiorni.push(d+" (mattina)");else tGiorni.push(d+" (pomeriggio)");});
      rows.push({type:"training",label:"FORMAZIONE API",gg:trainDays.length*0.5,giorni:tGiorni});}
    if(busyDays.length>0){var bGrouped={};busyDays.forEach(function(it){if(!bGrouped[it.day])bGrouped[it.day]=[];bGrouped[it.day].push(it.half);});
      var bGiorni=[];Object.keys(bGrouped).sort(function(a,b){return Number(a)-Number(b);}).forEach(function(d){var hh=bGrouped[d];
        if(hh.length===2)bGiorni.push(d+" (intera)");else if(hh[0]==="am")bGiorni.push(d+" (mattina)");else bGiorni.push(d+" (pomeriggio)");});
      rows.push({type:"busy",label:"ALTRO IMPEGNO",gg:busyDays.length*0.5,giorni:bGiorni});}
    return rows;},[cE,year,month]);
  var totCli=detail.reduce(function(s,r){return r.type==="client"?s+r.gg:s;},0);
  return(<div>
    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}><button onClick={onBack} style={Object.assign({},sO,{padding:"6px 12px",fontSize:12})}>&#8249; Indietro</button><span style={{fontSize:16,fontWeight:700,color:CL.red}}>{name}</span><span style={{fontSize:12,color:CL.greyMd}}>Consuntivo {MESI[month]} {year}</span></div>
    <div style={{overflowX:"auto"}}><table style={{borderCollapse:"collapse",width:"100%",fontSize:13,fontFamily:FONT}}>
      <thead><tr style={{background:"#FFF8F8"}}>
        <th style={{padding:"8px 14px",borderBottom:"2px solid "+CL.red,textAlign:"left"}}>Attivita</th>
        <th style={{padding:"8px",borderBottom:"2px solid "+CL.red,textAlign:"center"}}>GG</th>
        <th style={{padding:"8px 14px",borderBottom:"2px solid "+CL.red,textAlign:"left"}}>Dettaglio</th></tr></thead>
      <tbody>{detail.map(function(r,i){var clr=r.type==="client"?CL.red:r.type==="commercial"?"#FF8F00":r.type==="training"?"#7B1FA2":CL.grey;
        return<tr key={i}><td style={{padding:"8px 14px",borderBottom:"1px solid #eee",fontWeight:600,color:clr}}>{r.label}</td>
          <td style={{padding:"8px",borderBottom:"1px solid #eee",textAlign:"center",fontWeight:700,color:clr,fontSize:15}}>{fmtNum(r.gg)}</td>
          <td style={{padding:"8px 14px",borderBottom:"1px solid #eee",fontSize:11,color:CL.greyMd}}>{r.giorni.join(", ")}</td></tr>;})}
      {detail.length===0&&<tr><td colSpan={3} style={{padding:"12px",textAlign:"center",color:"#ccc"}}>Nessuna attivita registrata</td></tr>}
      <tr style={{background:"#FFF8F8"}}><td style={{padding:"8px 14px",borderTop:"2px solid "+CL.red,fontWeight:700}}>TOTALE CLIENTE</td>
        <td style={{padding:"8px",borderTop:"2px solid "+CL.red,textAlign:"center",fontWeight:700,color:CL.red,fontSize:15}}>{fmtNum(totCli)}</td>
        <td style={{borderTop:"2px solid "+CL.red}}/></tr>
    </tbody></table></div>
    {function(){var allDays=[];
      for(var d=1;d<=daysInMonth(year,month);d++){var e=cE[makeKey(year,month,d)];if(!e)continue;
        ["am","pm"].forEach(function(h){var x=e[h];if(!x||!x.status)return;
          var lbl=x.status==="client"&&x.client?x.client:x.status==="commercial"?"COMMERCIALE OPEX":x.status==="training"?"FORMAZIONE":x.status==="busy"?"ALTRO IMPEGNO":"";
          var clr=x.status==="client"?CL.red:x.status==="commercial"?"#FF8F00":x.status==="training"?"#7B1FA2":CL.grey;
          allDays.push({day:d,half:h,label:lbl,color:clr,status:x.status});});}
      var grouped={};allDays.forEach(function(it){var k=it.day+"|"+it.label;if(!grouped[k])grouped[k]={day:it.day,label:it.label,color:it.color,halves:[]};grouped[k].halves.push(it.half);});
      var rows=Object.values(grouped).sort(function(a,b){return a.day-b.day;});
      rows.forEach(function(r){r.presenza=r.halves.length===2?"Intera giornata":r.halves[0]==="am"?"Mattina":"Pomeriggio";});
      if(rows.length===0)return null;
      return(<div style={{marginTop:20}}>
        <h4 style={{margin:"0 0 10px",color:CL.greyDk,fontSize:14}}>Dettaglio giornaliero</h4>
        <div style={{overflowX:"auto"}}><table style={{borderCollapse:"collapse",width:"100%",fontSize:13,fontFamily:FONT}}>
          <thead><tr style={{background:"#FFF8F8"}}>
            <th style={{padding:"8px 14px",borderBottom:"2px solid "+CL.red,textAlign:"left"}}>Data</th>
            <th style={{padding:"8px 14px",borderBottom:"2px solid "+CL.red,textAlign:"left"}}>Attivita</th>
            <th style={{padding:"8px 14px",borderBottom:"2px solid "+CL.red,textAlign:"left"}}>Presenza</th></tr></thead>
          <tbody>{rows.map(function(r,i){return<tr key={i}>
            <td style={{padding:"6px 14px",borderBottom:"1px solid #eee",fontWeight:600,color:CL.greyDk}}>{r.day} {MESI[month].substring(0,3)}</td>
            <td style={{padding:"6px 14px",borderBottom:"1px solid #eee",fontWeight:600,color:r.color}}>{r.label}</td>
            <td style={{padding:"6px 14px",borderBottom:"1px solid #eee",color:CL.greyMd}}>{r.presenza}</td></tr>;})}</tbody>
        </table></div></div>);}()}
    </div>);
}

function getWeeksInMonth(year,month){
  var fd=firstDow(year,month),days=daysInMonth(year,month),weeks=[],d=1;
  while(d<=days){var dow=(fd+d-1)%7;var start=d;var end=Math.min(d+(6-dow),days);weeks.push({start:start,end:end});d=end+1;}
  return weeks;}

export function Consuntivo(p){
  var entries=p.entries,cons=p.consultants,clients=p.clients,cBud=p.clientBudgets||{},clientEndDates=p.clientEndDates||{},year=p.year,month=p.month,onSaveEntry=p.onSaveEntry,customHolidays=p.customHolidays||[];
  var cs=useState(null),selCons=cs[0],sSelCons=cs[1];
  var ms=useState(null),selMode=ms[0],sSelMode=ms[1];
  var vm=useState("mensile"),viewMode=vm[0],sViewMode=vm[1];
  var sw=useState(0),selWeek=sw[0],sSelWeek=sw[1];
  var report=useMemo(function(){var d={};cons.forEach(function(n){d[n]={tc:0,tb:0,tcom:0,ttrain:0,bc:{}};clients.forEach(function(c){d[n].bc[c]=0;});
    var cE=entries[n]||{};for(var i=1;i<=daysInMonth(year,month);i++){var e=cE[makeKey(year,month,i)];if(!e)continue;
      ["am","pm"].forEach(function(h){var x=e[h];if(!x||!x.status)return;if(x.status==="client"){d[n].tc+=.5;if(x.client)d[n].bc[x.client]=(d[n].bc[x.client]||0)+.5;}else if(x.status==="busy")d[n].tb+=.5;else if(x.status==="commercial")d[n].tcom+=.5;else if(x.status==="training")d[n].ttrain+=.5;});}});return d;},[entries,cons,clients,year,month]);

  var weekReport=useMemo(function(){var allWeeks=getWeeksInMonth(year,month);if(!allWeeks.length)return{};
    var wi=Math.min(selWeek,allWeeks.length-1);var w=allWeeks[wi];var d={};
    cons.forEach(function(n){d[n]={tc:0,tb:0,tcom:0,ttrain:0,bc:{}};clients.forEach(function(c){d[n].bc[c]=0;});
      var cE=entries[n]||{};for(var i=w.start;i<=w.end;i++){var e=cE[makeKey(year,month,i)];if(!e)continue;
        ["am","pm"].forEach(function(h){var x=e[h];if(!x||!x.status)return;
          if(x.status==="client"){d[n].tc+=.5;if(x.client)d[n].bc[x.client]=(d[n].bc[x.client]||0)+.5;}
          else if(x.status==="busy")d[n].tb+=.5;else if(x.status==="commercial")d[n].tcom+=.5;else if(x.status==="training")d[n].ttrain+=.5;});}});
    return d;},[entries,cons,clients,year,month,selWeek]);

  var mc=useState(null),menuCons=mc[0],sMenuCons=mc[1];
  var mr=useState(null),menuRect=mr[0],sMenuRect=mr[1];

  if(selCons&&selMode==="agenda")return<MiniCalendar name={selCons} entries={entries} clients={clients} clientEndDates={clientEndDates} customHolidays={customHolidays} year={year} month={month} onSave={onSaveEntry} onBack={function(){sSelCons(null);sSelMode(null);}}/>;
  if(selCons&&selMode==="detail")return<ConsDetail name={selCons} entries={entries} clients={clients} year={year} month={month} onBack={function(){sSelCons(null);sSelMode(null);}}/>;

  var weeks=getWeeksInMonth(year,month);
  var safeWeek=Math.min(selWeek,weeks.length-1);
  var curReport=viewMode==="settimanale"?weekReport:report;
  var mon3=MESI[month].substring(0,3);

  return(<div>
    <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:14,alignItems:"center"}}>
      <button onClick={function(){sViewMode("mensile");}} style={{padding:"5px 14px",borderRadius:6,border:"1px solid "+(viewMode==="mensile"?CL.red:"#ddd"),background:viewMode==="mensile"?CL.red:"#fff",color:viewMode==="mensile"?"#fff":CL.greyDk,fontSize:13,cursor:"pointer",fontFamily:FONT,fontWeight:600}}>Mensile</button>
      <button onClick={function(){sViewMode("settimanale");}} style={{padding:"5px 14px",borderRadius:6,border:"1px solid "+(viewMode==="settimanale"?CL.red:"#ddd"),background:viewMode==="settimanale"?CL.red:"#fff",color:viewMode==="settimanale"?"#fff":CL.greyDk,fontSize:13,cursor:"pointer",fontFamily:FONT,fontWeight:600}}>Settimanale</button>
      {viewMode==="settimanale"&&<span style={{color:"#ddd",margin:"0 2px"}}>|</span>}
      {viewMode==="settimanale"&&weeks.map(function(w,i){var isAct=i===safeWeek;return<button key={i} onClick={function(){sSelWeek(i);}} style={{padding:"4px 10px",borderRadius:6,border:"1px solid "+(isAct?CL.red:"#ddd"),background:isAct?"#FFF3F3":"#fff",color:isAct?CL.red:CL.greyMd,fontSize:12,cursor:"pointer",fontFamily:FONT,fontWeight:isAct?600:400}}>Sett.&nbsp;{i+1}&nbsp;({w.start}&ndash;{w.end}&nbsp;{mon3})</button>;})}
    </div>
    <div style={{overflowX:"auto"}}>
      <table style={{borderCollapse:"collapse",width:"100%",fontSize:13,fontFamily:FONT}}><thead><tr style={{background:"#FFF8F8"}}>
        <th style={{padding:"10px 14px",borderBottom:"2px solid "+CL.red,textAlign:"left"}}>Consulente</th><th style={{padding:"10px 8px",borderBottom:"2px solid "+CL.red}}>GG Cli.</th>
        {clients.map(function(c){return<th key={c} style={{padding:"10px 8px",borderBottom:"2px solid "+CL.red,maxWidth:90,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c}</th>;})}
        <th style={{padding:"10px 8px",borderBottom:"2px solid "+CL.red}}>Altro</th>
        <th style={{padding:"10px 8px",borderBottom:"2px solid "+CL.red,color:"#FF8F00"}}>Comm.</th>
        <th style={{padding:"10px 8px",borderBottom:"2px solid "+CL.red,color:"#7B1FA2"}}>Form.</th></tr></thead>
      <tbody>{cons.map(function(n){var r=curReport[n]||{tc:0,tb:0,tcom:0,ttrain:0,bc:{}};return(<tr key={n}>
        <td onClick={function(e){var rect=e.currentTarget.getBoundingClientRect();sMenuCons(n);sMenuRect({x:rect.left,y:rect.bottom+4});}} style={{padding:"8px 14px",borderBottom:"1px solid #eee",fontWeight:600,color:CL.red,textAlign:"left",cursor:"pointer"}}>{n}</td>
        <td style={{padding:"8px",borderBottom:"1px solid #eee",textAlign:"center",fontWeight:700,color:CL.greyDk,fontSize:16}}>{fmtNum(r.tc)}</td>
        {clients.map(function(c){return<td key={c} style={{padding:"8px",borderBottom:"1px solid #eee",textAlign:"center",color:(r.bc&&r.bc[c])?CL.red:"#ccc"}}>{(r.bc&&r.bc[c])?fmtNum(r.bc[c]):"-"}</td>;})}
        <td style={{padding:"8px",borderBottom:"1px solid #eee",textAlign:"center",color:CL.grey,fontWeight:600}}>{fmtNum(r.tb)}</td>
        <td style={{padding:"8px",borderBottom:"1px solid #eee",textAlign:"center",color:"#FF8F00",fontWeight:600}}>{r.tcom?fmtNum(r.tcom):"-"}</td>
        <td style={{padding:"8px",borderBottom:"1px solid #eee",textAlign:"center",color:"#7B1FA2",fontWeight:600}}>{r.ttrain?fmtNum(r.ttrain):"-"}</td></tr>);})}</tbody></table>
      <p style={{marginTop:8,fontSize:11,color:"#aaa"}}>Clicca sul nome consulente per consuntivo o agenda</p>
    </div>
    {menuCons&&<div style={{position:"fixed",inset:0,zIndex:999}} onClick={function(){sMenuCons(null);}}>
      <div onClick={function(e){e.stopPropagation();}} style={{position:"fixed",left:menuRect?Math.min(menuRect.x,window.innerWidth-200):0,top:menuRect?Math.min(menuRect.y,window.innerHeight-120):0,background:"#fff",borderRadius:10,boxShadow:"0 8px 30px rgba(0,0,0,.2)",border:"1px solid #eee",padding:6,minWidth:180,fontFamily:FONT,zIndex:1000}}>
        <div style={{padding:"6px 12px",fontSize:12,fontWeight:700,color:CL.greyDk}}>{menuCons}</div>
        <div style={{height:1,background:"#eee",margin:"4px 0"}}/>
        <button onClick={function(){var n=menuCons;sMenuCons(null);sSelCons(n);sSelMode("detail");}} style={{display:"block",width:"100%",padding:"9px 12px",border:"none",background:"transparent",textAlign:"left",fontSize:13,cursor:"pointer",fontFamily:FONT,borderRadius:6,color:CL.red,fontWeight:600}} onMouseEnter={function(e){e.target.style.background="#FFF3F3";}} onMouseLeave={function(e){e.target.style.background="transparent";}}>Consuntivo</button>
        <button onClick={function(){var n=menuCons;sMenuCons(null);sSelCons(n);sSelMode("agenda");}} style={{display:"block",width:"100%",padding:"9px 12px",border:"none",background:"transparent",textAlign:"left",fontSize:13,cursor:"pointer",fontFamily:FONT,borderRadius:6,color:CL.greyDk}} onMouseEnter={function(e){e.target.style.background="#f5f5f5";}} onMouseLeave={function(e){e.target.style.background="transparent";}}>Modifica Agenda</button>
      </div>
    </div>}
  </div>);
}
