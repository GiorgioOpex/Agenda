"use client";
import { useMemo } from "react";
import { MESI, CL, FONT, fmtNum, calcMonthActuals } from "./shared";

export function Dashboard(p){
  var data=p.data,year=p.year,target=data.targetMensile||0;
  var planned=(data.clients||[]).reduce(function(s,c){return s+((data.clientBudgets||{})[c]||0);},0);
  var cM=new Date().getMonth();
  var months=useMemo(function(){return MESI.map(function(nome,mi){var a=calcMonthActuals(data.entries,data.consultants,year,mi);return{nome:nome.substring(0,3),actual:a.totalClient,planned:planned,target:target};});},[data,year,target,planned]);
  var mx=Math.max(target,planned,Math.max.apply(null,months.map(function(m){return m.actual;})))||1;
  return(<div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:12,marginBottom:24}}>
      <div style={{padding:"14px 18px",background:"#FFF3F3",borderRadius:12,border:"1px solid "+CL.red}}><div style={{fontSize:11,color:CL.greyMd}}>Target mensile</div><div style={{fontSize:28,fontWeight:700,color:CL.red}}>{fmtNum(target)}</div><div style={{fontSize:11,color:"#888"}}>giornate</div></div>
      <div style={{padding:"14px 18px",background:"#E8F5E9",borderRadius:12,border:"1px solid #A5D6A7"}}><div style={{fontSize:11,color:CL.greyMd}}>Richieste clienti</div><div style={{fontSize:28,fontWeight:700,color:"#2E7D32"}}>{fmtNum(planned)}</div><div style={{fontSize:11,color:"#888"}}>gg/mese</div></div>
      <div style={{padding:"14px 18px",background:CL.greyLt,borderRadius:12,border:"1px solid #ddd"}}><div style={{fontSize:11,color:CL.greyMd}}>Effettive {MESI[cM]}</div><div style={{fontSize:28,fontWeight:700,color:CL.greyDk}}>{fmtNum(months[cM].actual)}</div></div>
      <div style={{padding:"14px 18px",background:months[cM].actual>=target?"#E8F5E9":"#FFF3F3",borderRadius:12,border:"1px solid "+(months[cM].actual>=target?"#A5D6A7":CL.red)}}><div style={{fontSize:11,color:CL.greyMd}}>vs Target</div><div style={{fontSize:28,fontWeight:700,color:months[cM].actual>=target?"#2E7D32":CL.red}}>{target>0?Math.round((months[cM].actual/target)*100):0}%</div></div></div>
    <div style={{background:"#fff",borderRadius:12,padding:20,border:"1px solid #eee"}}>
      <h4 style={{margin:"0 0 16px",color:CL.greyDk,fontSize:14}}>Andamento {year}</h4>
      <div style={{display:"flex",gap:16,marginBottom:16,fontSize:12}}>
        <div style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:12,height:12,background:CL.red,borderRadius:2}}/><span>Target</span></div>
        <div style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:12,height:12,background:"#2E7D32",borderRadius:2}}/><span>Richieste</span></div>
        <div style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:12,height:12,background:CL.grey,borderRadius:2}}/><span>Effettive</span></div></div>
      <div style={{display:"flex",alignItems:"flex-end",gap:4,height:210,overflowX:"auto"}}>{months.map(function(m,i){return(<div key={m.nome} style={{flex:1,minWidth:50,display:"flex",flexDirection:"column",alignItems:"center",opacity:i>cM?.4:1}}>
        <div style={{display:"flex",gap:2,alignItems:"flex-end",height:180}}>
          <div style={{width:10,height:Math.max(2,(target/mx)*180),background:CL.red,borderRadius:"2px 2px 0 0"}}/>
          <div style={{width:10,height:Math.max(2,(m.planned/mx)*180),background:"#2E7D32",borderRadius:"2px 2px 0 0"}}/>
          <div style={{width:10,height:Math.max(2,(m.actual/mx)*180),background:CL.grey,borderRadius:"2px 2px 0 0"}}/></div>
        <div style={{fontSize:10,color:i===cM?CL.red:"#888",fontWeight:i===cM?700:400,marginTop:4}}>{m.nome}</div></div>);})}</div>
      <p style={{marginTop:12,fontSize:11,color:"#aaa"}}>Mesi futuri in trasparenza (proiezione)</p></div></div>);
}
