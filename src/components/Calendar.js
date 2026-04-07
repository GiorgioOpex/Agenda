import { useState } from "react";
import { GIORNI, CL, STATI, FONT, makeKey, daysInMonth, firstDow } from "./shared";

export function Calendar(p){
  var year=p.year,month=p.month,entries=p.entries,oDC=p.onDayClick;
  var days=daysInMonth(year,month),fd=firstDow(year,month),cells=[];
  for(var i=0;i<fd;i++)cells.push(null);for(var dd=1;dd<=days;dd++)cells.push(dd);var today=new Date();
  return(<div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2,marginBottom:4}}>{GIORNI.map(function(d){return<div key={d} style={{textAlign:"center",fontSize:11,fontWeight:600,color:"#888",padding:"4px 0"}}>{d}</div>;})}</div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3}}>{cells.map(function(d,i){
      if(!d)return<div key={"e"+i}/>;var key=makeKey(year,month,d),en=entries[key];
      var aS=en&&en.am&&en.am.status?STATI[en.am.status]:null,pS=en&&en.pm&&en.pm.status?STATI[en.pm.status]:null;
      var we=(fd+d-1)%7>=5,has=aS||pS,isT=d&&today.getFullYear()===year&&today.getMonth()===month&&today.getDate()===d;
      return(<div key={key} onClick={function(){if(!we)oDC(key);}} style={{position:"relative",aspectRatio:"1",display:"flex",alignItems:"center",justifyContent:"center",borderRadius:8,overflow:"hidden",cursor:we?"default":"pointer",border:isT?"2px solid "+CL.red:"1px solid #e8e8e8",background:we?"#f0f0f0":"#fafafa",transition:"all .15s",userSelect:"none"}}
        onMouseEnter={function(e){if(!we)e.currentTarget.style.transform="scale(1.08)";}} onMouseLeave={function(e){e.currentTarget.style.transform="scale(1)";}}>
        {has&&!we&&<div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column"}}><div style={{flex:1,background:aS?aS.bg:"transparent",opacity:.88}}/><div style={{flex:1,background:pS?pS.bg:"transparent",opacity:.88}}/></div>}
        <span style={{position:"relative",zIndex:1,fontSize:13,fontWeight:isT?700:500,color:has&&!we?"#fff":we?"#bbb":"#444",textShadow:has&&!we?"0 1px 2px rgba(0,0,0,.3)":"none"}}>{d}</span></div>);})}</div></div>);
}
