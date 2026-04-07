"use client";
import { useMemo } from "react";
import { CL, FONT, fmtNum, makeKey, daysInMonth } from "./shared";

export function Consuntivo(p){
  var entries=p.entries,cons=p.consultants,clients=p.clients,cBud=p.clientBudgets||{},year=p.year,month=p.month;
  var report=useMemo(function(){var d={};cons.forEach(function(n){d[n]={tc:0,tb:0,tf:0,bc:{}};clients.forEach(function(c){d[n].bc[c]=0;});
    var cE=entries[n]||{};for(var i=1;i<=daysInMonth(year,month);i++){var e=cE[makeKey(year,month,i)];if(!e)continue;
      ["am","pm"].forEach(function(h){var x=e[h];if(!x||!x.status)return;if(x.status==="client"){d[n].tc+=.5;if(x.client)d[n].bc[x.client]=(d[n].bc[x.client]||0)+.5;}else if(x.status==="busy")d[n].tb+=.5;else d[n].tf+=.5;});}});return d;},[entries,cons,clients,year,month]);
  return(<div style={{overflowX:"auto"}}>
    <table style={{borderCollapse:"collapse",width:"100%",fontSize:13,fontFamily:FONT}}><thead><tr style={{background:"#FFF8F8"}}>
      <th style={{padding:"10px 14px",borderBottom:"2px solid "+CL.red,textAlign:"left"}}>Consulente</th><th style={{padding:"10px 8px",borderBottom:"2px solid "+CL.red}}>GG Cli.</th>
      {clients.map(function(c){return<th key={c} style={{padding:"10px 8px",borderBottom:"2px solid "+CL.red,maxWidth:90,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c}</th>;})}
      <th style={{padding:"10px 8px",borderBottom:"2px solid "+CL.red}}>Altro</th><th style={{padding:"10px 8px",borderBottom:"2px solid "+CL.red}}>Libero</th></tr></thead>
    <tbody>{cons.map(function(n){var r=report[n];return(<tr key={n}><td style={{padding:"8px 14px",borderBottom:"1px solid #eee",fontWeight:600,color:CL.greyDk,textAlign:"left"}}>{n}</td>
      <td style={{padding:"8px",borderBottom:"1px solid #eee",textAlign:"center",fontWeight:700,color:CL.red,fontSize:16}}>{fmtNum(r.tc)}</td>
      {clients.map(function(c){return<td key={c} style={{padding:"8px",borderBottom:"1px solid #eee",textAlign:"center",color:r.bc[c]?CL.red:"#ccc"}}>{r.bc[c]?fmtNum(r.bc[c]):"-"}</td>;})}
      <td style={{padding:"8px",borderBottom:"1px solid #eee",textAlign:"center",color:CL.grey,fontWeight:600}}>{fmtNum(r.tb)}</td>
      <td style={{padding:"8px",borderBottom:"1px solid #eee",textAlign:"center",color:"#2E7D32"}}>{fmtNum(r.tf)}</td></tr>);})}</tbody></table>
    {clients.length>0&&<div style={{marginTop:16}}><h4 style={{margin:"0 0 8px",color:CL.red,fontSize:14}}>Budget vs Effettivo</h4>
      <table style={{borderCollapse:"collapse",width:"100%",fontSize:13}}><thead><tr style={{background:"#FFF8F8"}}><th style={{padding:"8px 14px",borderBottom:"2px solid "+CL.red,textAlign:"left"}}>Cliente</th><th style={{padding:"8px",borderBottom:"2px solid "+CL.red}}>Previste</th><th style={{padding:"8px",borderBottom:"2px solid "+CL.red}}>Effettive</th><th style={{padding:"8px",borderBottom:"2px solid "+CL.red}}>Diff</th></tr></thead>
      <tbody>{clients.map(function(c){var bud=cBud[c]||0,eff=cons.reduce(function(s,n){return s+((report[n]||{}).bc||{})[c]||0;},0),diff=eff-bud;
        return<tr key={c}><td style={{padding:"8px 14px",borderBottom:"1px solid #eee",fontWeight:600,color:CL.greyDk,textAlign:"left"}}>{c}</td><td style={{padding:"8px",borderBottom:"1px solid #eee",textAlign:"center"}}>{fmtNum(bud)}</td><td style={{padding:"8px",borderBottom:"1px solid #eee",textAlign:"center",fontWeight:700,color:CL.red}}>{fmtNum(eff)}</td><td style={{padding:"8px",borderBottom:"1px solid #eee",textAlign:"center",fontWeight:700,color:diff>=0?"#2E7D32":CL.red}}>{(diff>=0?"+":"")+fmtNum(diff)}</td></tr>;})}</tbody></table></div>}
    <p style={{marginTop:12,fontSize:11,color:"#aaa"}}>Valori in giornate (0.5 = mezza giornata)</p></div>);
}
