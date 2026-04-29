"use client";
import { useState } from "react";
import { CL, FONT, makeKey, daysInMonth, firstDow, fmtNum, getHalfBg, getClientColor, getUsedClients } from "./shared";

// Colore dedicato a "Altro impegno" e "Commerciale OPEX": nero pieno.
// Riservato a queste due categorie e MAI usato per i clienti (la palette
// CLIENT_COLORS in shared.js non contiene nero, quindi non serve filtrare).
var BUSY_COMM_BG="#000";

export function Panoramica(p){
  var entries=p.entries,cons=p.consultants,clients=p.clients||[],cBud=p.clientBudgets||{},year=p.year,month=p.month;
  var days=daysInMonth(year,month),fd=firstDow(year,month);
  var fs=useState(null),filter=fs[0],sFilter=fs[1];

  var allUsed={},hasBusy=false,hasComm=false,hasTrain=false,totCliAll=0,totBusyAll=0,totCommAll=0,totTrainAll=0;
  // Mappa nome consulente -> totale giornate consulenza (status="client") nel mese corrente
  // Usata per ordinare i consulenti dall'alto in basso in ordine decrescente.
  var totCliPerCons={};
  cons.forEach(function(name){var cE=entries[name]||{};var tCli=0;
    for(var d=1;d<=days;d++){var e=cE[makeKey(year,month,d)];if(!e)continue;
      ["am","pm"].forEach(function(h){var x=e[h];if(!x||!x.status)return;
        if(x.status==="client"&&x.client){allUsed[x.client]=true;totCliAll+=.5;tCli+=.5;}
        if(x.status==="busy"){hasBusy=true;totBusyAll+=.5;}
        if(x.status==="commercial"){hasComm=true;totCommAll+=.5;}
        if(x.status==="training"){hasTrain=true;totTrainAll+=.5;}});}
    totCliPerCons[name]=tCli;});
  var usedList=Object.keys(allUsed);

  // Consulenti ordinati per giornate consulenza decrescenti, alfabetico come tie-breaker
  var consSorted=cons.slice().sort(function(a,b){
    var diff=(totCliPerCons[b]||0)-(totCliPerCons[a]||0);
    if(diff!==0)return diff;
    return a.localeCompare(b,'it');
  });

  var workDays=0;
  for(var d=1;d<=days;d++){if((fd+d-1)%7<5)workDays++;}
  var totPreviste=clients.reduce(function(s,c){return s+(cBud[c]||0);},0);
  var totDisponibili=workDays*cons.length-totCliAll-totBusyAll-totCommAll-totTrainAll;

  function matchFilter(half){
    if(!filter)return true;
    if(!half||!half.status)return false;
    if(filter==="__busy")return half.status==="busy";
    if(filter==="__commercial")return half.status==="commercial";
    if(filter==="__training")return half.status==="training";
    return half.status==="client"&&half.client===filter;
  }

  // Override locale di getHalfBg: per busy/commercial restituisce nero pieno
  // (sostituisce il grigio CL.grey e l'arancione FF8F00 di shared.getHalfBg).
  function getHalfBgPanoramica(half){
    if(!half||!half.status)return "transparent";
    if(half.status==="busy"||half.status==="commercial")return BUSY_COMM_BG;
    return getHalfBg(half,clients);
  }

  function getFilteredBg(half){
    if(!half||!half.status)return "transparent";
    if(!filter)return getHalfBgPanoramica(half);
    if(matchFilter(half))return getHalfBgPanoramica(half);
    return "transparent";
  }

  // Lettera centrata bianca nella casella: X per "Altro impegno", C per "Commerciale OPEX".
  // Stringa vuota per gli altri stati (cliente/formazione) — vengono renderizzati come bg colorato puro.
  function getHalfLetter(half){
    if(!half||!half.status)return "";
    if(half.status==="busy")return "X";
    if(half.status==="commercial")return "C";
    return "";
  }

  // Stile della "metà" della casella: include allineamento centrato per lettera bianca grassetto.
  // fontSize 8 sta a malapena nei 9px di altezza disponibili (cella 18x18 divisa in due).
  var halfTextStyle={display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:8,fontWeight:700,lineHeight:1,fontFamily:FONT};

  return(<div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:10,marginBottom:20}}>
      <div style={{padding:"12px 16px",background:"#FFF3F3",borderRadius:12,border:"1px solid "+CL.red}}><div style={{fontSize:11,color:CL.greyMd}}>Previste clienti</div><div style={{fontSize:22,fontWeight:700,color:CL.red}}>{fmtNum(totPreviste)}</div><div style={{fontSize:11,color:"#888"}}>gg/mese</div></div>
      <div style={{padding:"12px 16px",background:CL.greyLt,borderRadius:12,border:"1px solid #ddd"}}><div style={{fontSize:11,color:CL.greyMd}}>Impegnate consulenza</div><div style={{fontSize:22,fontWeight:700,color:CL.greyDk}}>{fmtNum(totCliAll)}</div><div style={{fontSize:11,color:"#888"}}>gg cliente</div></div>
      <div style={{padding:"12px 16px",background:"#F3E5F5",borderRadius:12,border:"1px solid #CE93D8"}}><div style={{fontSize:11,color:CL.greyMd}}>Impegnate formazione</div><div style={{fontSize:22,fontWeight:700,color:"#7B1FA2"}}>{fmtNum(totTrainAll)}</div><div style={{fontSize:11,color:"#888"}}>gg team</div></div>
      <div style={{padding:"12px 16px",background:totCliAll>=totPreviste?"#E8F5E9":"#FFF3F3",borderRadius:12,border:"1px solid "+(totCliAll>=totPreviste?"#A5D6A7":CL.red)}}><div style={{fontSize:11,color:CL.greyMd}}>Delta consulenza</div><div style={{fontSize:22,fontWeight:700,color:totCliAll>=totPreviste?"#2E7D32":CL.red}}>{(totCliAll-totPreviste>=0?"+":"")+fmtNum(totCliAll-totPreviste)}</div></div>
      <div style={{padding:"12px 16px",background:"#E8F5E9",borderRadius:12,border:"1px solid #A5D6A7"}}><div style={{fontSize:11,color:CL.greyMd}}>Disponibili</div><div style={{fontSize:22,fontWeight:700,color:"#2E7D32"}}>{fmtNum(totDisponibili)}</div><div style={{fontSize:11,color:"#888"}}>gg team</div></div>
    </div>
    <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:14,alignItems:"center"}}>
      {filter&&<button onClick={function(){sFilter(null);}} style={{padding:"4px 10px",borderRadius:6,border:"1px solid #ddd",background:"#fff",fontSize:11,cursor:"pointer",fontFamily:FONT,color:"#888"}}>Mostra tutti</button>}
      {usedList.map(function(c){var isActive=filter===c;return<div key={c} onClick={function(){sFilter(isActive?null:c);}} style={{display:"flex",alignItems:"center",gap:4,cursor:"pointer",padding:"3px 8px",borderRadius:6,border:isActive?"2px solid "+getClientColor(clients,c):"2px solid transparent",background:isActive?"#fff":"transparent"}}>
        <div style={{width:13,height:13,borderRadius:4,background:getClientColor(clients,c)}}/><span style={{fontSize:11,color:CL.greyMd}}>{c}</span></div>;})}
      {hasBusy&&<div onClick={function(){sFilter(filter==="__busy"?null:"__busy");}} style={{display:"flex",alignItems:"center",gap:4,cursor:"pointer",padding:"3px 8px",borderRadius:6,border:filter==="__busy"?"2px solid "+BUSY_COMM_BG:"2px solid transparent",background:filter==="__busy"?"#fff":"transparent"}}>
        <div style={{width:13,height:13,borderRadius:4,background:BUSY_COMM_BG,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:9,fontWeight:700,fontFamily:FONT,lineHeight:1}}>X</div><span style={{fontSize:11,color:CL.greyMd}}>Altro impegno</span></div>}
      {hasComm&&<div onClick={function(){sFilter(filter==="__commercial"?null:"__commercial");}} style={{display:"flex",alignItems:"center",gap:4,cursor:"pointer",padding:"3px 8px",borderRadius:6,border:filter==="__commercial"?"2px solid "+BUSY_COMM_BG:"2px solid transparent",background:filter==="__commercial"?"#fff":"transparent"}}>
        <div style={{width:13,height:13,borderRadius:4,background:BUSY_COMM_BG,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:9,fontWeight:700,fontFamily:FONT,lineHeight:1}}>C</div><span style={{fontSize:11,color:CL.greyMd}}>Commerciale OPEX</span></div>}
      {hasTrain&&<div onClick={function(){sFilter(filter==="__training"?null:"__training");}} style={{display:"flex",alignItems:"center",gap:4,cursor:"pointer",padding:"3px 8px",borderRadius:6,border:filter==="__training"?"2px solid #7B1FA2":"2px solid transparent",background:filter==="__training"?"#fff":"transparent"}}>
        <div style={{width:13,height:13,borderRadius:4,background:"#7B1FA2"}}/><span style={{fontSize:11,color:CL.greyMd}}>Formazione</span></div>}
    </div>
    {filter&&<div style={{padding:"6px 12px",marginBottom:10,background:"#FFF8F0",borderRadius:8,border:"1px solid #F0C040",fontSize:12,color:CL.greyDk}}>Filtro attivo: <strong>{filter.startsWith("__")?filter.replace("__",""):filter}</strong> — clicca di nuovo per rimuovere</div>}
    <div style={{overflowX:"auto"}}><table style={{borderCollapse:"collapse",width:"100%",fontSize:11,fontFamily:FONT}}>
    <thead><tr>
      <th style={{position:"sticky",left:0,background:"#fff",padding:"7px 10px",borderBottom:"2px solid "+CL.red,textAlign:"left",minWidth:110,zIndex:2}}>Consulente</th>
      {Array.from({length:days},function(_,i){var isSun=(fd+i)%7===6;var isSat=(fd+i)%7===5;return<th key={i+1} style={{padding:"5px 2px",borderBottom:"2px solid "+CL.red,textAlign:"center",minWidth:24,color:isSun?"#ccc":isSat?"#bba":CL.greyMd,fontSize:10}}>{i+1}</th>;})}
      <th style={{padding:"7px 5px",borderBottom:"2px solid "+CL.red,textAlign:"center",fontWeight:700,color:CL.red,fontSize:11}}>GG Cli</th>
      <th style={{padding:"7px 5px",borderBottom:"2px solid "+CL.red,textAlign:"center",fontWeight:700,color:"#FF8F00",fontSize:11}}>Comm.</th>
      <th style={{padding:"7px 5px",borderBottom:"2px solid "+CL.red,textAlign:"center",fontWeight:700,color:"#7B1FA2",fontSize:11}}>Form.</th>
      <th style={{padding:"7px 5px",borderBottom:"2px solid "+CL.red,textAlign:"center",fontWeight:700,color:"#2E7D32",fontSize:11}}>Libere</th>
    </tr></thead>
    <tbody>{consSorted.map(function(name){var cE=entries[name]||{},totCli=0,totBusy=0,totComm=0,totTrain=0;
      var tds=Array.from({length:days},function(_,i){var key=makeKey(year,month,i+1),e=cE[key],isSun=(fd+i)%7===6,isSat=(fd+i)%7===5;
        var amHalf=e&&e.am?e.am:null;
        var pmHalf=e&&e.pm?e.pm:null;
        var amBg=getFilteredBg(amHalf);
        var pmBg=getFilteredBg(pmHalf);
        // Lettera mostrata SOLO se la metà è effettivamente visibile (bg non transparent),
        // cosi' un filtro attivo nasconde correttamente le X/C delle altre categorie.
        var amLetter=amBg==="transparent"?"":getHalfLetter(amHalf);
        var pmLetter=pmBg==="transparent"?"":getHalfLetter(pmHalf);
        if(e&&e.am&&e.am.status==="client")totCli+=.5;if(e&&e.pm&&e.pm.status==="client")totCli+=.5;
        if(e&&e.am&&e.am.status==="busy")totBusy+=.5;if(e&&e.pm&&e.pm.status==="busy")totBusy+=.5;
        if(e&&e.am&&e.am.status==="commercial")totComm+=.5;if(e&&e.pm&&e.pm.status==="commercial")totComm+=.5;
        if(e&&e.am&&e.am.status==="training")totTrain+=.5;if(e&&e.pm&&e.pm.status==="training")totTrain+=.5;
        return<td key={i+1} style={{padding:1,borderBottom:"1px solid #eee",textAlign:"center"}}><div style={{width:18,height:18,borderRadius:3,margin:"0 auto",overflow:"hidden",display:"flex",flexDirection:"column",background:isSun&&amBg==="transparent"&&pmBg==="transparent"?"#f0f0f0":isSat&&amBg==="transparent"&&pmBg==="transparent"?"#f7f5f0":"transparent"}}><div style={Object.assign({flex:1,background:amBg},halfTextStyle)}>{amLetter}</div><div style={Object.assign({flex:1,background:pmBg},halfTextStyle)}>{pmLetter}</div></div></td>;});
      var libere=workDays-totCli-totBusy-totComm-totTrain;
      return<tr key={name}>
        <td style={{position:"sticky",left:0,background:"#fff",padding:"4px 10px",borderBottom:"1px solid #eee",fontWeight:600,color:CL.greyDk,fontSize:11,zIndex:1}}>{name}</td>
        {tds}
        <td style={{padding:"4px 5px",borderBottom:"1px solid #eee",textAlign:"center",fontWeight:700,color:CL.red,fontSize:12}}>{fmtNum(totCli)}</td>
        <td style={{padding:"4px 5px",borderBottom:"1px solid #eee",textAlign:"center",fontWeight:700,color:"#FF8F00",fontSize:12}}>{totComm?fmtNum(totComm):"-"}</td>
        <td style={{padding:"4px 5px",borderBottom:"1px solid #eee",textAlign:"center",fontWeight:700,color:"#7B1FA2",fontSize:12}}>{totTrain?fmtNum(totTrain):"-"}</td>
        <td style={{padding:"4px 5px",borderBottom:"1px solid #eee",textAlign:"center",fontWeight:700,color:"#2E7D32",fontSize:12}}>{fmtNum(libere)}</td>
      </tr>;})}</tbody></table></div></div>);
}
