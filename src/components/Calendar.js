"use client";
import { useState } from "react";
import { GIORNI, CL, FONT, makeKey, daysInMonth, firstDow, getHalfBg, getInitials } from "./shared";

export function Calendar(p){
  var year=p.year,month=p.month,entries=p.entries,clients=p.clients||[],oDC=p.onDayClick,onDrop=p.onDrop,onCopy=p.onCopy;
  var days=daysInMonth(year,month),fd=firstDow(year,month),cells=[];
  for(var i=0;i<fd;i++)cells.push(null);for(var dd=1;dd<=days;dd++)cells.push(dd);
  var today=new Date();
  var dgs=useState(null),dragInfo=dgs[0],sDragInfo=dgs[1];
  var dvs=useState(null),dragOver=dvs[0],sDragOver=dvs[1];
  var mms=useState(null),menu=mms[0],sMenu=mms[1];
  var cps=useState(null),copyData=cps[0],sCopyData=cps[1];

  function hasImpegno(en,h){if(!en)return false;if(h)return en[h]&&(en[h].status==="client"||en[h].status==="busy"||en[h].status==="commercial"||en[h].status==="training");
    return(en.am&&(en.am.status==="client"||en.am.status==="busy"||en.am.status==="commercial"||en.am.status==="training"))||(en.pm&&(en.pm.status==="client"||en.pm.status==="busy"||en.pm.status==="commercial"||en.pm.status==="training"));}
  function isSlotFree(en,half){if(!en)return true;if(half==="am")return!en.am||!en.am.status;if(half==="pm")return!en.pm||!en.pm.status;return(!en.am||!en.am.status)&&(!en.pm||!en.pm.status);}
  function canDrop(targetKey,di){if(!di)return false;var te=entries[targetKey];
    if(di.half==="full")return isSlotFree(te,"am")&&isSlotFree(te,"pm");
    return isSlotFree(te,di.half);}

  function startDrag(key,en,half){sDragInfo({key:key,entry:en,half:half});sMenu(null);}
  function cancelDrag(){sDragInfo(null);sDragOver(null);}
  function startCopy(en){sCopyData(JSON.parse(JSON.stringify(en)));sMenu(null);}
  function cancelCopy(){sCopyData(null);}

  function handleCellClick(key,en,e){
    if(dragInfo){return;}
    var p2=key.split("-").map(Number);var dd=p2[2];var we=(fd+dd-1)%7===6;
    if(we)return;
    if(copyData){
      if(!isSlotFree(en,"am")||!isSlotFree(en,"pm")){alert("La destinazione e' gia' occupata");return;}
      if(onCopy)onCopy(key,copyData);
      sCopyData(null);return;}
    if(!hasImpegno(en)){oDC(key);return;}
    var rect=e.currentTarget.getBoundingClientRect();
    sMenu({key:key,entry:en,x:rect.left,y:rect.bottom+4});
  }

  function handleTargetClick(key,d){
    if(!dragInfo)return;
    var we=(fd+d-1)%7===6;
    if(we||key===dragInfo.key){cancelDrag();return;}
    if(!canDrop(key,dragInfo)){alert("Lo slot di destinazione e' gia' occupato");return;}
    if(onDrop)onDrop(dragInfo.key,key,dragInfo.entry,dragInfo.half);
    cancelDrag();
  }

  return(<div style={{position:"relative"}}>
    <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2,marginBottom:4}}>{GIORNI.map(function(d){return<div key={d} style={{textAlign:"center",fontSize:11,fontWeight:600,color:"#888",padding:"4px 0"}}>{d}</div>;})}</div>
    {dragInfo&&<div style={{padding:"6px 12px",marginBottom:8,background:"#FFF8F0",borderRadius:8,border:"1px solid #F0C040",fontSize:12,color:CL.greyDk,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
      <span>Seleziona la casella di destinazione ({dragInfo.half==="full"?"giornata intera":dragInfo.half==="am"?"mattina":"pomeriggio"})</span>
      <button onClick={cancelDrag} style={{padding:"3px 10px",borderRadius:6,border:"1px solid #ccc",background:"#fff",fontSize:11,cursor:"pointer",fontFamily:FONT}}>Annulla</button>
    </div>}
    {copyData&&<div style={{padding:"6px 12px",marginBottom:8,background:"#E8F5E9",borderRadius:8,border:"1px solid #A5D6A7",fontSize:12,color:CL.greyDk,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
      <span>Giornata copiata — clicca su un giorno vuoto per incollare</span>
      <button onClick={cancelCopy} style={{padding:"3px 10px",borderRadius:6,border:"1px solid #ccc",background:"#fff",fontSize:11,cursor:"pointer",fontFamily:FONT}}>Annulla</button>
    </div>}
    <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3}}>{cells.map(function(d,i){
      if(!d)return<div key={"e"+i}/>;var key=makeKey(year,month,d),en=entries[key];
      var amBg=getHalfBg(en&&en.am?en.am:null,clients);
      var pmBg=getHalfBg(en&&en.pm?en.pm:null,clients);
      var we=(fd+d-1)%7===6,isSat=(fd+d-1)%7===5,has=amBg!=="transparent"||pmBg!=="transparent";
      var isT=d&&today.getFullYear()===year&&today.getMonth()===month&&today.getDate()===d;
      var isDragSrc=dragInfo&&dragInfo.key===key;
      var isDragTgt=dragOver===key;
      var canBeTarget=dragInfo&&!we&&key!==dragInfo.key&&canDrop(key,dragInfo);
      var isBlocked=dragInfo&&!we&&key!==dragInfo.key&&!canDrop(key,dragInfo);
      var canPaste=copyData&&!we&&isSlotFree(en,"am")&&isSlotFree(en,"pm");

      return(<div key={key}
        onClick={function(e){
          if(dragInfo){handleTargetClick(key,d);return;}
          handleCellClick(key,en,e);
        }}
        onMouseEnter={function(e){
          if(dragInfo&&canBeTarget)sDragOver(key);
          else if(!dragInfo&&!we)e.currentTarget.style.transform="scale(1.08)";
        }}
        onMouseLeave={function(e){
          if(dragOver===key)sDragOver(null);
          e.currentTarget.style.transform="scale(1)";
        }}
        style={{position:"relative",aspectRatio:"1",display:"flex",alignItems:"center",justifyContent:"center",borderRadius:8,overflow:"hidden",
          cursor:dragInfo?(canBeTarget?"pointer":isDragSrc?"default":"not-allowed"):copyData?(canPaste?"pointer":"not-allowed"):we?"default":"pointer",
          border:isDragTgt?"2px dashed #F0C040":canPaste?"2px dashed #A5D6A7":isT?"2px solid "+CL.red:"1px solid #e8e8e8",
          background:isDragSrc?"#FFE0B2":isDragTgt?"#FFF8E1":we?"#f0f0f0":canBeTarget?"#FFFDE7":isBlocked?"#f8f8f8":canPaste?"#E8F5E9":isSat?"#f7f5f0":"#fafafa",
          transition:"all .15s",userSelect:"none",opacity:isDragSrc?0.5:isBlocked?0.4:copyData&&!canPaste&&!has?0.4:1}}>
        {has&&!we&&!isDragSrc&&<div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column"}}><div style={{flex:1,background:amBg,opacity:.88,display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden"}}>{en&&en.am&&en.am.status==="client"&&en.am.client&&<span style={{fontSize:6,fontWeight:600,color:"#fff",textShadow:"0 1px 1px rgba(0,0,0,.5)",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",maxWidth:"100%",padding:"0 1px"}}>{en.am.client.toUpperCase()}</span>}{en&&en.am&&en.am.status==="commercial"&&<span style={{fontSize:5,fontWeight:700,color:"#fff",textShadow:"0 1px 1px rgba(0,0,0,.5)",letterSpacing:.3}}>COMMERCIALE</span>}{en&&en.am&&en.am.status==="training"&&<span style={{fontSize:5,fontWeight:700,color:"#fff",textShadow:"0 1px 1px rgba(0,0,0,.5)",letterSpacing:.3}}>FORMAZIONE</span>}</div><div style={{flex:1,background:pmBg,opacity:.88,display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden"}}>{en&&en.pm&&en.pm.status==="client"&&en.pm.client&&<span style={{fontSize:6,fontWeight:600,color:"#fff",textShadow:"0 1px 1px rgba(0,0,0,.5)",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",maxWidth:"100%",padding:"0 1px"}}>{en.pm.client.toUpperCase()}</span>}{en&&en.pm&&en.pm.status==="commercial"&&<span style={{fontSize:5,fontWeight:700,color:"#fff",textShadow:"0 1px 1px rgba(0,0,0,.5)",letterSpacing:.3}}>COMMERCIALE</span>}{en&&en.pm&&en.pm.status==="training"&&<span style={{fontSize:5,fontWeight:700,color:"#fff",textShadow:"0 1px 1px rgba(0,0,0,.5)",letterSpacing:.3}}>FORMAZIONE</span>}</div></div>}
        <span style={{position:"relative",zIndex:1,fontSize:13,fontWeight:isT?700:500,color:has&&!we&&!isDragSrc?"#fff":we?"#bbb":"#444",textShadow:has&&!we&&!isDragSrc?"0 1px 2px rgba(0,0,0,.3)":"none"}}>{d}</span>
      </div>);})}</div>

    {menu&&<div style={{position:"fixed",inset:0,zIndex:999}} onClick={function(){sMenu(null);}}>
      <div onClick={function(e){e.stopPropagation();}} style={{position:"fixed",left:Math.min(menu.x,window.innerWidth-180),top:Math.min(menu.y,window.innerHeight-200),background:"#fff",borderRadius:10,boxShadow:"0 8px 30px rgba(0,0,0,.2)",border:"1px solid #eee",padding:6,minWidth:160,fontFamily:FONT,zIndex:1000}}>
        <button onClick={function(){sMenu(null);oDC(menu.key);}} style={{display:"block",width:"100%",padding:"9px 12px",border:"none",background:"transparent",textAlign:"left",fontSize:13,cursor:"pointer",fontFamily:FONT,borderRadius:6,color:CL.greyDk,fontWeight:600}} onMouseEnter={function(e){e.target.style.background="#f5f5f5";}} onMouseLeave={function(e){e.target.style.background="transparent";}}>Modifica</button>
        <div style={{height:1,background:"#eee",margin:"4px 0"}}/>
        <div style={{padding:"4px 12px",fontSize:11,color:"#888"}}>Sposta...</div>
        {hasImpegno(menu.entry,"am")&&<button onClick={function(){startDrag(menu.key,menu.entry,"am");}} style={{display:"block",width:"100%",padding:"8px 12px",border:"none",background:"transparent",textAlign:"left",fontSize:13,cursor:"pointer",fontFamily:FONT,borderRadius:6,color:CL.greyDk}} onMouseEnter={function(e){e.target.style.background="#f5f5f5";}} onMouseLeave={function(e){e.target.style.background="transparent";}}>Mattina (AM)</button>}
        {hasImpegno(menu.entry,"pm")&&<button onClick={function(){startDrag(menu.key,menu.entry,"pm");}} style={{display:"block",width:"100%",padding:"8px 12px",border:"none",background:"transparent",textAlign:"left",fontSize:13,cursor:"pointer",fontFamily:FONT,borderRadius:6,color:CL.greyDk}} onMouseEnter={function(e){e.target.style.background="#f5f5f5";}} onMouseLeave={function(e){e.target.style.background="transparent";}}>Pomeriggio (PM)</button>}
        {hasImpegno(menu.entry,"am")&&hasImpegno(menu.entry,"pm")&&<button onClick={function(){startDrag(menu.key,menu.entry,"full");}} style={{display:"block",width:"100%",padding:"8px 12px",border:"none",background:"transparent",textAlign:"left",fontSize:13,cursor:"pointer",fontFamily:FONT,borderRadius:6,color:CL.red,fontWeight:600}} onMouseEnter={function(e){e.target.style.background="#FFF3F3";}} onMouseLeave={function(e){e.target.style.background="transparent";}}>Giornata intera</button>}
        <div style={{height:1,background:"#eee",margin:"4px 0"}}/>
        <button onClick={function(){startCopy(menu.entry);}} style={{display:"block",width:"100%",padding:"9px 12px",border:"none",background:"transparent",textAlign:"left",fontSize:13,cursor:"pointer",fontFamily:FONT,borderRadius:6,color:"#2E7D32",fontWeight:600}} onMouseEnter={function(e){e.target.style.background="#E8F5E9";}} onMouseLeave={function(e){e.target.style.background="transparent";}}>Copia giornata</button>
      </div>
    </div>}
  </div>);
}
