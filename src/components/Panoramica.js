"use client";
import { CL, FONT, makeKey, daysInMonth, firstDow, fmtNum, getHalfBg, getClientColor, getUsedClients } from "./shared";

export function Panoramica(p){
  var entries=p.entries,cons=p.consultants,clients=p.clients||[],year=p.year,month=p.month;
  var days=daysInMonth(year,month),fd=firstDow(year,month);

  var allUsed={},hasBusy=false,hasComm=false;
  cons.forEach(function(name){var cE=entries[name]||{};
    for(var d=1;d<=days;d++){var e=cE[makeKey(year,month,d)];if(!e)continue;
      ["am","pm"].forEach(function(h){var x=e[h];if(!x||!x.status)return;
        if(x.status==="client"&&x.client)allUsed[x.client]=true;
        if(x.status==="busy")hasBusy=true;
        if(x.status==="commercial")hasComm=true;});}});
  var usedList=Object.keys(allUsed);

  var workDays=0;
  for(var d=1;d<=days;d++){if((fd+d-1)%7<5)workDays++;}

  return(<div>
    <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:14,alignItems:"center"}}>
      {usedList.map(function(c){return<div key={c} style={{display:"flex",alignItems:"center",gap:4}}>
        <div style={{width:13,height:13,borderRadius:4,background:getClientColor(clients,c)}}/><span style={{fontSize:11,color:CL.greyMd}}>{c}</span></div>;})}
      {hasBusy&&<div style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:13,height:13,borderRadius:4,background:CL.grey}}/><span style={{fontSize:11,color:CL.greyMd}}>Altro impegno</span></div>}
      {hasComm&&<div style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:13,height:13,borderRadius:4,background:"#FF8F00"}}/><span style={{fontSize:11,color:CL.greyMd}}>Commerciale OPEX</span></div>}
    </div>
    <div style={{overflowX:"auto"}}><table style={{borderCollapse:"collapse",width:"100%",fontSize:11,fontFamily:FONT}}>
    <thead><tr>
      <th style={{position:"sticky",left:0,background:"#fff",padding:"7px 10px",borderBottom:"2px solid "+CL.red,textAlign:"left",minWidth:110,zIndex:2}}>Consulente</th>
      {Array.from({length:days},function(_,i){var isSun=(fd+i)%7===6;var isSat=(fd+i)%7===5;return<th key={i+1} style={{padding:"5px 2px",borderBottom:"2px solid "+CL.red,textAlign:"center",minWidth:24,color:isSun?"#ccc":isSat?"#bba":CL.greyMd,fontSize:10}}>{i+1}</th>;})}
      <th style={{padding:"7px 5px",borderBottom:"2px solid "+CL.red,textAlign:"center",fontWeight:700,color:CL.red,fontSize:11}}>GG Cli</th>
      <th style={{padding:"7px 5px",borderBottom:"2px solid "+CL.red,textAlign:"center",fontWeight:700,color:"#FF8F00",fontSize:11}}>Comm.</th>
      <th style={{padding:"7px 5px",borderBottom:"2px solid "+CL.red,textAlign:"center",fontWeight:700,color:"#2E7D32",fontSize:11}}>Libere</th>
    </tr></thead>
    <tbody>{cons.map(function(name){var cE=entries[name]||{},totCli=0,totBusy=0,totComm=0;
      var tds=Array.from({length:days},function(_,i){var key=makeKey(year,month,i+1),e=cE[key],isSun=(fd+i)%7===6,isSat=(fd+i)%7===5;
        var amBg=getHalfBg(e&&e.am?e.am:null,clients);
        var pmBg=getHalfBg(e&&e.pm?e.pm:null,clients);
        if(e&&e.am&&e.am.status==="client")totCli+=.5;
        if(e&&e.pm&&e.pm.status==="client")totCli+=.5;
        if(e&&e.am&&e.am.status==="busy")totBusy+=.5;
        if(e&&e.pm&&e.pm.status==="busy")totBusy+=.5;
        if(e&&e.am&&e.am.status==="commercial")totComm+=.5;
        if(e&&e.pm&&e.pm.status==="commercial")totComm+=.5;
        return<td key={i+1} style={{padding:1,borderBottom:"1px solid #eee",textAlign:"center"}}><div style={{width:18,height:18,borderRadius:3,margin:"0 auto",overflow:"hidden",display:"flex",flexDirection:"column",background:isSun&&amBg==="transparent"&&pmBg==="transparent"?"#f0f0f0":isSat&&amBg==="transparent"&&pmBg==="transparent"?"#f7f5f0":"transparent"}}><div style={{flex:1,background:amBg}}/><div style={{flex:1,background:pmBg}}/></div></td>;});
      var libere=workDays-totCli-totBusy-totComm;
      return<tr key={name}>
        <td style={{position:"sticky",left:0,background:"#fff",padding:"4px 10px",borderBottom:"1px solid #eee",fontWeight:600,color:CL.greyDk,fontSize:11,zIndex:1}}>{name}</td>
        {tds}
        <td style={{padding:"4px 5px",borderBottom:"1px solid #eee",textAlign:"center",fontWeight:700,color:CL.red,fontSize:12}}>{fmtNum(totCli)}</td>
        <td style={{padding:"4px 5px",borderBottom:"1px solid #eee",textAlign:"center",fontWeight:700,color:"#FF8F00",fontSize:12}}>{totComm?fmtNum(totComm):"-"}</td>
        <td style={{padding:"4px 5px",borderBottom:"1px solid #eee",textAlign:"center",fontWeight:700,color:"#2E7D32",fontSize:12}}>{fmtNum(libere)}</td>
      </tr>;})}</tbody></table></div></div>);
}
