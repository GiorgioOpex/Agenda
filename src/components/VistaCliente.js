import { useState } from "react";
import { MESI, CL, FONT, sI, sO, fmtNum, calcMonthActuals, calcAllActuals, calcContractTotal } from "./shared";

export function VistaCliente(p){
  var entries=p.entries,cons=p.consultants,clients=p.clients,cBud=p.clientBudgets||{},cEnd=p.clientEndDates||{},year=p.year,month=p.month;
  var ss=useState(""),sel=ss[0],setSel=ss[1];
  var mAct=calcMonthActuals(entries,cons,year,month);
  var aAct=calcAllActuals(entries,cons);
  if(!sel){return(<div>
    <h4 style={{margin:"0 0 16px",color:CL.greyDk,fontSize:15}}>Riepilogo tutti i clienti</h4>
    <div style={{overflowX:"auto"}}><table style={{borderCollapse:"collapse",width:"100%",fontSize:13,fontFamily:FONT}}>
      <thead><tr style={{background:"#FFF8F8"}}>
        <th style={{padding:"10px 14px",borderBottom:"2px solid "+CL.red,textAlign:"left"}}>Cliente</th>
        <th style={{padding:"10px 8px",borderBottom:"2px solid "+CL.red}}>gg/mese</th>
        <th style={{padding:"10px 8px",borderBottom:"2px solid "+CL.red}}>Fine contratto</th>
        <th style={{padding:"10px 8px",borderBottom:"2px solid "+CL.red}}>GG contratto</th>
        <th style={{padding:"10px 8px",borderBottom:"2px solid "+CL.red}}>Erogate tot.</th>
        <th style={{padding:"10px 8px",borderBottom:"2px solid "+CL.red}}>Erogate {MESI[month].substring(0,3)}</th>
        <th style={{padding:"10px 8px",borderBottom:"2px solid "+CL.red}}>Rimanenti</th>
        <th style={{padding:"10px 8px",borderBottom:"2px solid "+CL.red}}>Copertura</th>
      </tr></thead>
      <tbody>{clients.map(function(c){var bud=cBud[c]||0,ed=cEnd[c]||"",ct=calcContractTotal(bud,ed),eTot=aAct[c]||0,eMes=mAct.byClient[c]||0,rim=ct-eTot,pct=ct>0?Math.round((eTot/ct)*100):0;
        return(<tr key={c} onClick={function(){setSel(c);}} style={{cursor:"pointer"}}>
          <td style={{padding:"10px 14px",borderBottom:"1px solid #eee",fontWeight:600,color:CL.red,textAlign:"left"}}>{c}</td>
          <td style={{padding:"8px",borderBottom:"1px solid #eee",textAlign:"center"}}>{fmtNum(bud)}</td>
          <td style={{padding:"8px",borderBottom:"1px solid #eee",textAlign:"center",fontSize:12}}>{ed||"-"}</td>
          <td style={{padding:"8px",borderBottom:"1px solid #eee",textAlign:"center",fontWeight:600}}>{ct>0?fmtNum(ct):"-"}</td>
          <td style={{padding:"8px",borderBottom:"1px solid #eee",textAlign:"center",fontWeight:700,color:CL.grey}}>{fmtNum(eTot)}</td>
          <td style={{padding:"8px",borderBottom:"1px solid #eee",textAlign:"center",fontWeight:700,color:CL.red}}>{fmtNum(eMes)}</td>
          <td style={{padding:"8px",borderBottom:"1px solid #eee",textAlign:"center",fontWeight:700,color:rim<0?CL.red:"#2E7D32"}}>{ct>0?fmtNum(rim):"-"}</td>
          <td style={{padding:"8px",borderBottom:"1px solid #eee",textAlign:"center"}}>{ct>0&&<div style={{display:"flex",alignItems:"center",gap:6,justifyContent:"center"}}><div style={{width:60,height:8,background:CL.greyLt,borderRadius:4,overflow:"hidden"}}><div style={{height:"100%",width:Math.min(100,pct)+"%",background:pct>=100?"#2E7D32":CL.red,borderRadius:4}}/></div><span style={{fontSize:11,fontWeight:600,color:pct>=100?"#2E7D32":CL.red}}>{pct}%</span></div>}</td>
        </tr>);})}</tbody></table></div>
    <p style={{marginTop:12,fontSize:11,color:"#aaa"}}>Clicca su un cliente per il dettaglio. Valori in giornate (0.5 = mezza giornata).</p></div>);}
  var bud=cBud[sel]||0,ed=cEnd[sel]||"",ct=calcContractTotal(bud,ed),eTot=aAct[sel]||0,act=mAct.byClient[sel]||0,rem=bud-act,cRem=ct-eTot;
  return(<div>
    <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16,flexWrap:"wrap"}}>
      <button onClick={function(){setSel("");}} style={Object.assign({},sO,{padding:"6px 12px",fontSize:12})}>&#8249; Tutti i clienti</button>
      <span style={{fontSize:18,fontWeight:700,color:CL.red}}>{sel}</span>
      {ed&&<span style={{fontSize:12,color:CL.greyMd}}>Contratto fino al {ed}</span>}</div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:12,marginBottom:20}}>
      <div style={{padding:"14px 18px",background:"#FFF3F3",borderRadius:12,border:"1px solid "+CL.red}}><div style={{fontSize:11,color:CL.greyMd}}>Previste/mese</div><div style={{fontSize:24,fontWeight:700,color:CL.red}}>{fmtNum(bud)}</div></div>
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
    <p style={{fontSize:11,color:"#aaa"}}>Valori in giornate (0.5 = mezza giornata)</p></div>);
}
