"use client";
import { useState } from "react";
import { GIORNI, CL, STATI, FONT, makeKey, daysInMonth, firstDow } from "./shared";

export function Calendar(p){
  var year=p.year,month=p.month,entries=p.entries,oDC=p.onDayClick,onDrop=p.onDrop;
  var days=daysInMonth(year,month),fd=firstDow(year,month),cells=[];
  for(var i=0;i<fd;i++)cells.push(null);for(var dd=1;dd<=days;dd++)cells.push(dd);
  var today=new Date();
  var dgs=useState(null),dragInfo=dgs[0],sDragInfo=dgs[1];
  var dvs=useState(null),dragOver=dvs[0],sDragOver=dvs[1];

  function hasImpegno(en){return en&&((en.am&&(en.am.status==="client"||en.am.status==="busy"))||(en.pm&&(en.pm.status==="client"||en.pm.status==="busy")));}
  function isSlotFree(en,half){if(!en)return true;if(half==="am")return !en.am||!en.am.status;if(half==="pm")return !en.pm||!en.pm.status;return(!en.am||!en.am.status)&&(!en.pm||!en.pm.status);}
  function canDrop(targetKey,dragData){if(!dragData)return false;var te=entries[targetKey];
    if(dragData.half==="full")return isSlotFree(te,"am")&&isSlotFree(te,"pm");
    return isSlotFree(te,dragData.half);}

  function startDrag(key,en,e){
    if(!hasImpegno(en))return;
    var hasAm=en.am&&(en.am.status==="client"||en.am.status==="busy");
    var hasPm=en.pm&&(en.pm.status==="client"||en.pm.status==="busy");
    var half=hasAm&&hasPm?"full":hasAm?"am":"pm";
    sDragInfo({key:key,entry:en,half:half});
    e.dataTransfer.effectAllowed="move";
    e.dataTransfer.setData("text/plain",key);
  }

  function handleDragOver(key,d,e){
    e.preventDefault();
    var we=(fd+d-1)%7>=5;
    if(we||!dragInfo||key===dragInfo.key)return;
    if(canDrop(key,dragInfo)){e.dataTransfer.dropEffect="move";sDragOver(key);}
    else{e.dataTransfer.dropEffect="none";}
  }

  function handleDrop(key,d,e){
    e.preventDefault();sDragOver(null);
    var we=(fd+d-1)%7>=5;
    if(we||!dragInfo||key===dragInfo.key)return;
    if(!canDrop(key,dragInfo)){alert("La destinazione e' gia' occupata");return;}
    if(onDrop)onDrop(dragInfo.key,key,dragInfo.entry,dragInfo.half);
    sDragInfo(null);
  }

  return(<div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2,marginBottom:4}}>{GIORNI.map(function(d){return<div key={d} style={{textAlign:"center",fontSize:11,fontWeight:600,color:"#888",padding:"4px 0"}}>{d}</div>;})}</div>
    {dragInfo&&<div style={{padding:"6px 12px",marginBottom:8,background:"#FFF8F0",borderRadius:8,border:"1px solid #F0C040",fontSize:12,color:CL.greyDk,textAlign:"center"}}>
      Trascinando {dragInfo.half==="full"?"giornata intera":dragInfo.half==="am"?"mattina":"pomeriggio"} — rilascia su una casella libera
    </div>}
    <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3}}>{cells.map(function(d,i){
      if(!d)return<div key={"e"+i}/>;var key=makeKey(year,month,d),en=entries[key];
      var aS=en&&en.am&&en.am.status?STATI[en.am.status]:null,pS=en&&en.pm&&en.pm.status?STATI[en.pm.status]:null;
      var we=(fd+d-1)%7>=5,has=aS||pS,isT=d&&today.getFullYear()===year&&today.getMonth()===month&&today.getDate()===d;
      var isDragSrc=dragInfo&&dragInfo.key===key;
      var isDragTgt=dragOver===key;
      var canBeDropped=dragInfo&&!we&&key!==dragInfo.key&&canDrop(key,dragInfo);
      var draggable=!we&&hasImpegno(en);

      return(<div key={key}
        draggable={draggable}
        onDragStart={function(e){startDrag(key,en,e);}}
        onDragEnd={function(){sDragInfo(null);sDragOver(null);}}
        onDragOver={function(e){handleDragOver(key,d,e);}}
        onDragLeave={function(){sDragOver(null);}}
        onDrop={function(e){handleDrop(key,d,e);}}
        onClick={function(){if(!we&&!dragInfo)oDC(key);}}
        style={{position:"relative",aspectRatio:"1",display:"flex",alignItems:"center",justifyContent:"center",borderRadius:8,overflow:"hidden",
          cursor:draggable?"grab":we?"default":"pointer",
          border:isDragTgt?"2px dashed #F0C040":isT?"2px solid "+CL.red:"1px solid #e8e8e8",
          background:isDragSrc?"#FFE0B2":isDragTgt?"#FFF8E1":we?"#f0f0f0":canBeDropped&&dragInfo?"#FFFDE7":"#fafafa",
          transition:"all .15s",userSelect:"none",opacity:isDragSrc?0.5:1}}
        onMouseEnter={function(e){if(!we&&!dragInfo)e.currentTarget.style.transform="scale(1.08)";}}
        onMouseLeave={function(e){e.currentTarget.style.transform="scale(1)";}}>
        {has&&!we&&!isDragSrc&&<div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column"}}><div style={{flex:1,background:aS?aS.bg:"transparent",opacity:.88}}/><div style={{flex:1,background:pS?pS.bg:"transparent",opacity:.88}}/></div>}
        <span style={{position:"relative",zIndex:1,fontSize:13,fontWeight:isT?700:500,color:has&&!we&&!isDragSrc?"#fff":we?"#bbb":"#444",textShadow:has&&!we&&!isDragSrc?"0 1px 2px rgba(0,0,0,.3)":"none"}}>{d}</span>
      </div>);})}</div></div>);
}
