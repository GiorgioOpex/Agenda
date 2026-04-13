"use client";
import { useState } from "react";
import { GIORNI, CL, FONT, makeKey, daysInMonth, firstDow, getHalfBg } from "./shared";

export function Calendar(p){
  var year=p.year,month=p.month,entries=p.entries,clients=p.clients||[],oDC=p.onDayClick,onDrop=p.onDrop;
  var days=daysInMonth(year,month),fd=firstDow(year,month),cells=[];
  for(var i=0;i<fd;i++)cells.push(null);for(var dd=1;dd<=days;dd++)cells.push(dd);
  var today=new Date();
  var dgs=useState(null),dragInfo=dgs[0],sDragInfo=dgs[1];
  var dvs=useState(null),dragOver=dvs[0],sDragOver=dvs[1];
  var mms=useState(null),menu=mms[0],sMenu=mms[1];

  function hasImpegno(en,h){if(!en)return false;if(h)return en[h]&&(en[h].status==="client"||en[h].status==="busy");
    return(en.am&&(en.am.status==="client"||en.am.status==="busy"))||(en.pm&&(en.pm.status==="client"||en.pm.status==="busy"));}
  function isSlotFree(en,half){if(!en)return true;if(half==="am")return!en.am||!en.am.status;if(half==="pm")return!en.pm||!en.pm.status;return(!en.am||!en.am.status)&&(!en.pm||!en.pm.status);}
  function canDrop(targetKey,di){if(!di)return false;var te=entries[targetKey];
    if(di.half==="full")return isSlotFree(te,"am")&&isSlotFree(te,"pm");
    return isSlotFree(te,di.half);}

  function doStartDrag(key,en,half){
    sDragInfo({key:key,entry:en,half:half});sMenu(null);}

  function handleDragOver(key,d,e){e.preventDefault();var we=(fd+d-1)%7>=5;
    if(we||!dragInfo||key===dragInfo.key){e.dataTransfer.dropEffect="none";return;}
    if(canDrop(key,dragInfo)){e.dataTransfer.dropEffect="move";sDragOver(key);}
    else{e.dataTransfer.dropEffect="none";}}

  function handleDrop(key,d,e){e.preventDefault();sDragOver(null);var we=(fd+d-1)%7>=5;
    if(we||!dragInfo||key===dragInfo.key)return;
    if(!canDrop(key,dragInfo)){alert("Lo slot di destinazione e' gia' occupato");return;}
    if(onDrop)onDrop(dragInfo.key,key,dragInfo.entry,dragInfo.half);
    sDragInfo(null);}

  function handleDblClick(key,en,e){
    e.preventDefault();e.stopPropagation();
    if(!hasImpegno(en))return;
    var hAm=hasImpegno(en,"am"),hPm=hasImpegno(en,"pm");
    var rect=e.currentTarget.getBoundingClientRect();
    sMenu({key:key,entry:en,hasAm:hAm,hasPm:hPm,x:rect.left,y:rect.bottom+4});}

  return(<div style={{position:"relative"}}>
    <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2,marginBottom:4}}>{GIORNI.map(function(d){return<div key={d} style={{textAlign:"center",fontSize:11,fontWeight:600,color:"#888",padding:"4px 0"}}>{d}</div>;})}</div>
    {dragInfo&&<div style={{padding:"6px 12px",marginBottom:8,background:"#FFF8F0",borderRadius:8,border:"1px solid #F0C040",fontSize:12,color:CL.greyDk,textAlign:"center"}}>
      Trascinando {dragInfo.half==="full"?"giornata intera":dragInfo.half==="am"?"mattina":"pomeriggio"} — rilascia su uno slot libero
    </div>}
    <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3}}>{cells.map(function(d,i){
      if(!d)return<div key={"e"+i}/>;var key=makeKey(year,month,d),en=entries[key];
      var amBg=getHalfBg(en&&en.am?en.am:null,clients);
      var pmBg=getHalfBg(en&&en.pm?en.pm:null,clients);
      var we=(fd+d-1)%7>=5,has=amBg!=="transparent"||pmBg!=="transparent";
      var isT=d&&today.getFullYear()===year&&today.getMonth()===month&&today.getDate()===d;
      var isDragSrc=dragInfo&&dragInfo.key===key;
      var isDragTgt=dragOver===key;
      var canBeTarget=dragInfo&&!we&&key!==dragInfo.key&&canDrop(key,dragInfo);
      var draggable=!!dragInfo&&dragInfo.key===key;

      return(<div key={key}
        draggable={draggable}
        onDragStart={function(e){e.dataTransfer.effectAllowed="move";e.dataTransfer.setData("text/plain",key);}}
        onDragEnd={function(){sDragInfo(null);sDragOver(null);}}
        onDragOver={function(e){handleDragOver(key,d,e);}}
        onDragLeave={function(){if(dragOver===key)sDragOver(null);}}
        onDrop={function(e){handleDrop(key,d,e);}}
        onClick={function(e){if(!we&&!dragInfo){sMenu(null);oDC(key);}}}
        onDoubleClick={function(e){if(!we)handleDblClick(key,en,e);}}
        style={{position:"relative",aspectRatio:"1",display:"flex",alignItems:"center",justifyContent:"center",borderRadius:8,overflow:"hidden",
          cursor:isDragSrc?"grabbing":has&&!we?"grab":we?"default":"pointer",
          border:isDragTgt?"2px dashed #F0C040":isT?"2px solid "+CL.red:"1px solid #e8e8e8",
          background:isDragSrc?"#FFE0B2":isDragTgt?"#FFF8E1":we?"#f0f0f0":canBeTarget&&dragInfo?"#FFFDE7":"#fafafa",
          transition:"all .15s",userSelect:"none",opacity:isDragSrc?0.5:1}}
        onMouseEnter={function(e){if(!we&&!dragInfo)e.currentTarget.style.transform="scale(1.08)";}}
        onMouseLeave={function(e){e.currentTarget.style.transform="scale(1)";}}>
        {has&&!we&&!isDragSrc&&<div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column"}}><div style={{flex:1,background:amBg,opacity:.88}}/><div style={{flex:1,background:pmBg,opacity:.88}}/></div>}
        <span style={{position:"relative",zIndex:1,fontSize:13,fontWeight:isT?700:500,color:has&&!we&&!isDragSrc?"#fff":we?"#bbb":"#444",textShadow:has&&!we&&!isDragSrc?"0 1px 2px rgba(0,0,0,.3)":"none"}}>{d}</span>
      </div>);})}</div>

    {menu&&<div style={{position:"fixed",inset:0,zIndex:999}} onClick={function(){sMenu(null);}}>
      <div onClick={function(e){e.stopPropagation();}} style={{position:"fixed",left:Math.min(menu.x,window.innerWidth-180),top:menu.y,background:"#fff",borderRadius:10,boxShadow:"0 8px 30px rgba(0,0,0,.2)",border:"1px solid #eee",padding:6,minWidth:160,fontFamily:FONT,zIndex:1000}}>
        <div style={{padding:"6px 10px",fontSize:12,color:"#888",fontWeight:600}}>Sposta impegno</div>
        {menu.hasAm&&<button onClick={function(){doStartDrag(menu.key,menu.entry,"am");}} style={{display:"block",width:"100%",padding:"8px 12px",border:"none",background:"transparent",textAlign:"left",fontSize:13,cursor:"pointer",fontFamily:FONT,borderRadius:6,color:CL.greyDk}} onMouseEnter={function(e){e.target.style.background="#f5f5f5";}} onMouseLeave={function(e){e.target.style.background="transparent";}}>Sposta Mattina (AM)</button>}
        {menu.hasPm&&<button onClick={function(){doStartDrag(menu.key,menu.entry,"pm");}} style={{display:"block",width:"100%",padding:"8px 12px",border:"none",background:"transparent",textAlign:"left",fontSize:13,cursor:"pointer",fontFamily:FONT,borderRadius:6,color:CL.greyDk}} onMouseEnter={function(e){e.target.style.background="#f5f5f5";}} onMouseLeave={function(e){e.target.style.background="transparent";}}>Sposta Pomeriggio (PM)</button>}
        {menu.hasAm&&menu.hasPm&&<button onClick={function(){doStartDrag(menu.key,menu.entry,"full");}} style={{display:"block",width:"100%",padding:"8px 12px",border:"none",background:"transparent",textAlign:"left",fontSize:13,cursor:"pointer",fontFamily:FONT,borderRadius:6,color:CL.red,fontWeight:600}} onMouseEnter={function(e){e.target.style.background="#FFF3F3";}} onMouseLeave={function(e){e.target.style.background="transparent";}}>Sposta Giornata Intera</button>}
      </div>
    </div>}
  </div>);
}
