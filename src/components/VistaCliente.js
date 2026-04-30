"use client";
import { useState } from "react";
import { MESI, CL, FONT, sI, sO, fmtNum, calcMonthActuals, calcAllActuals, calcContractTotal, isClientActiveInMonth, makeKey, daysInMonth } from "./shared";

var GIORNI_SETT=["Domenica","Lunedi'","Martedi'","Mercoledi'","Giovedi'","Venerdi'","Sabato"];

function formatDateExt(year,month,day){
  var d=new Date(year,month,day);var dow=d.getDay();
  return GIORNI_SETT[dow]+" "+day+" "+MESI[month];
}

export function VistaCliente(p){
  var entries=p.entries,cons=p.consultants,clients=p.clients,cBud=p.clientBudgets||{},cEnd=p.clientEndDates||{},year=p.year,month=p.month;
  var ss=useState(""),sel=ss[0],setSel=ss[1];
  // Stato di ordinamento della tabella riepilogo: chiave colonna + direzione (asc/desc).
  var sk=useState("name"),sortKey=sk[0],sSortKey=sk[1];
  var sd=useState("asc"),sortDir=sd[0],sSortDir=sd[1];
  var mAct=calcMonthActuals(entries,cons,year,month);
  var aAct=calcAllActuals(entries,cons);

  function onSort(key){
    if(sortKey===key){sSortDir(sortDir==="asc"?"desc":"asc");}
    else{sSortKey(key);sSortDir("asc");}
  }
  function arrow(key){
    if(sortKey!==key)return <span style={{marginLeft:4,fontSize:10,color:"#ccc"}}>⇅</span>;
    return <span style={{marginLeft:4,fontSize:10,color:CL.red}}>{sortDir==="asc"?"▲":"▼"}</span>;
  }
  var thBase={padding:"10px 8px",borderBottom:"2px solid "+CL.red,cursor:"pointer",userSelect:"none",whiteSpace:"nowrap"};
  var thLeft=Object.assign({},thBase,{padding:"10px 14px",textAlign:"left"});

  if(!sel){
    // Costruzione delle righe ordinate per il riepilogo clienti.
    var rows=clients.map(function(c){
      var bud=cBud[c]||0;
      var ed=cEnd[c]||"";
      var ct=calcContractTotal(bud,ed);
      var eTot=aAct[c]||0;
      var eMes=mAct.byClient[c]||0;
      var rim=ct-eTot;
      var pct=ct>0?Math.round((eTot/ct)*100):0;
      return {c:c,bud:bud,ed:ed,ct:ct,eTot:eTot,eMes:eMes,rim:rim,pct:pct};
    });
    rows.sort(function(a,b){
      var va,vb,isStr=false;
      switch(sortKey){
        case "name": va=a.c; vb=b.c; isStr=true; break;
        case "bud": va=a.bud; vb=b.bud; break;
        case "ed": va=a.ed||""; vb=b.ed||""; isStr=true; break;
        case "ct": va=a.ct; vb=b.ct; break;
        case "eTot": va=a.eTot; vb=b.eTot; break;
        case "eMes": va=a.eMes; vb=b.eMes; break;
        // Per "rimanenti" e "copertura" i clienti senza contratto vanno
        // sempre in coda, indipendentemente dalla direzione.
        case "rim": va=a.ct>0?a.rim:Number.POSITIVE_INFINITY; vb=b.ct>0?b.rim:Number.POSITIVE_INFINITY; break;
        case "pct": va=a.ct>0?a.pct:-1; vb=b.ct>0?b.pct:-1; break;
        default: va=a.c; vb=b.c; isStr=true;
      }
      var diff;
      if(isStr){diff=String(va).localeCompare(String(vb),'it');}
      else{diff=(va-vb);}
      if(diff===0)diff=a.c.localeCompare(b.c,'it'); // tie-breaker stabile
      return sortDir==="asc"?diff:-diff;
    });

    return(<div>
      <h4 style={{margin:"0 0 16px",color:CL.greyDk,fontSize:15}}>Riepilogo tutti i clienti</h4>
      <div style={{overflowX:"auto"}}><table style={{borderCollapse:"collapse",width:"100%",fontSize:13,fontFamily:FONT}}>
        <thead><tr style={{background:"#FFF8F8"}}>
          <th onClick={function(){onSort("name");}} style={thLeft}>Cliente{arrow("name")}</th>
          <th onClick={function(){onSort("bud");}} style={thBase}>gg/mese{arrow("bud")}</th>
          <th onClick={function(){onSort("ed");}} style={thBase}>Fine contratto{arrow("ed")}</th>
          <th onClick={function(){onSort("ct");}} style={thBase}>GG contratto{arrow("ct")}</th>
          <th onClick={function(){onSort("eTot");}} style={thBase}>Erogate tot.{arrow("eTot")}</th>
          <th onClick={function(){onSort("eMes");}} style={thBase}>Erogate {MESI[month].substring(0,3)}{arrow("eMes")}</th>
          <th onClick={function(){onSort("rim");}} style={thBase}>Rimanenti{arrow("rim")}</th>
          <th onClick={function(){onSort("pct");}} style={thBase}>Copertura{arrow("pct")}</th>
        </tr></thead>
        <tbody>{rows.map(function(r){
          return(<tr key={r.c} onClick={function(){setSel(r.c);}} style={{cursor:"pointer"}}>
            <td style={{padding:"10px 14px",borderBottom:"1px solid #eee",fontWeight:600,color:CL.red,textAlign:"left"}}>{r.c}</td>
            <td style={{padding:"8px",borderBottom:"1px solid #eee",textAlign:"center"}}>{fmtNum(r.bud)}</td>
            <td style={{padding:"8px",borderBottom:"1px solid #eee",textAlign:"center",fontSize:12}}>{r.ed||"-"}</td>
            <td style={{padding:"8px",borderBottom:"1px solid #eee",textAlign:"center",fontWeight:600}}>{r.ct>0?fmtNum(r.ct):"-"}</td>
            <td style={{padding:"8px",borderBottom:"1px solid #eee",textAlign:"center",fontWeight:700,color:CL.grey}}>{fmtNum(r.eTot)}</td>
            <td style={{padding:"8px",borderBottom:"1px solid #eee",textAlign:"center",fontWeight:700,color:CL.red}}>{fmtNum(r.eMes)}</td>
            <td style={{padding:"8px",borderBottom:"1px solid #eee",textAlign:"center",fontWeight:700,color:r.rim<0?CL.red:"#2E7D32"}}>{r.ct>0?fmtNum(r.rim):"-"}</td>
            <td style={{padding:"8px",borderBottom:"1px solid #eee",textAlign:"center"}}>{r.ct>0&&<div style={{display:"flex",alignItems:"center",gap:6,justifyContent:"center"}}><div style={{width:60,height:8,background:CL.greyLt,borderRadius:4,overflow:"hidden"}}><div style={{height:"100%",width:Math.min(100,r.pct)+"%",background:r.pct>=100?"#2E7D32":CL.red,borderRadius:4}}/></div><span style={{fontSize:11,fontWeight:600,color:r.pct>=100?"#2E7D32":CL.red}}>{r.pct}%</span></div>}</td>
          </tr>);})}</tbody></table></div>
      <p style={{marginTop:12,fontSize:11,color:"#aaa"}}>Clicca sull'intestazione di una colonna per ordinare. Clicca su una riga cliente per il dettaglio. Valori in giornate (0.5 = mezza giornata).</p></div>);
  }
  // Dettaglio cliente selezionato. Se il contratto e' scaduto rispetto al
  // mese visualizzato, "Previste/mese" diventa 0 (le altre KPI seguono di conseguenza).
  var fullBud=cBud[sel]||0,ed=cEnd[sel]||"",activeInMonth=isClientActiveInMonth(ed,year,month);
  var bud=activeInMonth?fullBud:0,ct=calcContractTotal(fullBud,ed),eTot=aAct[sel]||0,act=mAct.byClient[sel]||0,rem=bud-act,cRem=ct-eTot;
  return(<div>
    <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16,flexWrap:"wrap"}}>
      <button onClick={function(){setSel("");}} style={Object.assign({},sO,{padding:"6px 12px",fontSize:12})}>&#8249; Tutti i clienti</button>
      <span style={{fontSize:18,fontWeight:700,color:CL.red}}>{sel}</span>
      {ed&&<span style={{fontSize:12,color:CL.greyMd}}>Contratto fino al {ed}</span>}</div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:12,marginBottom:20}}>
      <div style={{padding:"14px 18px",background:"#FFF3F3",borderRadius:12,border:"1px solid "+CL.red}}><div style={{fontSize:11,color:CL.greyMd}}>Previste/mese{!activeInMonth&&<span style={{marginLeft:6,fontSize:10,color:CL.red,fontWeight:700}}>(scaduto)</span>}</div><div style={{fontSize:24,fontWeight:700,color:CL.red}}>{fmtNum(bud)}</div></div>
      <div style={{padding:"14px 18px",background:"#E8F5E9",borderRadius:12,border:"1px solid #A5D6A7"}}><div style={{fontSize:11,color:CL.greyMd}}>Impegnate {MESI[month].substring(0,3)}</div><div style={{fontSize:24,fontWeight:700,color:"#2E7D32"}}>{fmtNum(act)}</div></div>
      <div style={{padding:"14px 18px",background:rem<0?"#FFF3F3":CL.greyLt,borderRadius:12,border:"1px solid "+(rem<0?CL.red:"#ddd")}}><div style={{fontSize:11,color:CL.greyMd}}>Rimanenti mese</div><div style={{fontSize:24,fontWeight:700,color:rem<0?CL.red:CL.greyDk}}>{fmtNum(rem)}</div></div>
      {bud>0&&<div style={{padding:"14px 18px",background:CL.greyLt,borderRadius:12,border:"1px solid #ddd"}}><div style={{fontSize:11,color:CL.greyMd}}>Copertura mese</div><div style={{fontSize:24,fontWeight:700,color:act>=bud?"#2E7D32":CL.red}}>{Math.round((act/bud)*100)}%</div></div>}</div>
    {bud>0&&<div style={{marginBottom:16}}><div style={{fontSize:12,color:CL.greyMd,marginBottom:4}}>Avanzamento mese</div><div style={{height:12,background:CL.greyLt,borderRadius:6,overflow:"hidden"}}><div style={{height:"100%",width:Math.min(100,(act/bud)*100)+"%",background:act>=bud?"#2E7D32":CL.red,borderRadius:6}}/></div></div>}
    {ct>0&&<div style={{padding:"14px 18px",background:"#FFF8F0",borderRadius:12,border:"1px solid #F0C040",marginBottom:20}}>
      <div style={{fontSize:13,fontWeight:600,color:CL.greyDk,marginBottom:8}}>Situazione contrattuale</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))",gap:12}}>
        <div><div style={{fontSize:11,color:CL.greyMd}}>GG contratto</div><div style={{fontSize:20,fontWeight:700,color:CL.greyDk}}>{fmtNum(ct)}</div></div>
        <div><div style={{fontSize:11,color:CL.greyMd}}>Erogate</div><div style={{fontSize:20,fontWeight:700,color:CL.red}}>{fmtNum(eTot)}</div></div>
        <div><div style={{fontSize:11,color:CL.greyMd}}>Rimanenti</div><div style={{fontSize:20,fontWeight:700,color:cRem<0?CL.red:"#2E7D32"}}>{fmtNum(cRem)}</div></div>
        <div><div style={{fontSize:11,color:CL.greyMd}}>Avanzamento</div><div style={{fontSize:20,fontWeight:700,color:eTot>=ct?"#2E7D32":CL.red}}>{Math.round((eTot/ct)*100)}%</div></div></div>
      <div style={{marginTop:10}}><div style={{height:10,background:CL.greyLt,borderRadius:5,overflow:"hidden"}}><div style={{height:"100%",width:Math.min(100,(eTot/ct)*100)+"%",background:eTot>=ct?"#2E7D32":"#F0C040",borderRadius:5}}/></div></div></div>}
    {function(){var dayRows=[];
      cons.forEach(function(n){var cE=entries[n]||{};
        for(var d=1;d<=daysInMonth(year,month);d++){var e=cE[makeKey(year,month,d)];if(!e)continue;
          var halves=[];["am","pm"].forEach(function(h){var x=e[h];if(x&&x.status==="client"&&x.client===sel)halves.push(h);});
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
            <td style={{padding:"6px 14px",borderBottom:"1px solid #eee",fontWeight:600,color:CL.greyDk}}>{formatDateExt(year,month,r.day)}</td>
            <td style={{padding:"6px 14px",borderBottom:"1px solid #eee",color:CL.greyMd}}>{r.presenza}</td>
            <td style={{padding:"6px 14px",borderBottom:"1px solid #eee",fontWeight:600,color:CL.red}}>{r.name}</td></tr>;})}</tbody>
        </table></div></div>);}()}
    <p style={{fontSize:11,color:"#aaa",marginTop:16}}>Valori in giornate (0.5 = mezza giornata)</p></div>);
}
