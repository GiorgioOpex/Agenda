import { useState } from "react";
import { CL, FONT, sI, sB, sO, fmtNum, hashPw } from "./shared";

  var a1=useState([].concat(data.admins)),al=a1[0],sAl=a1[1];var b1=useState(Object.assign({},data.clientBudgets||{})),bud=b1[0],sBud=b1[1];
  var ed1=useState(Object.assign({},data.clientEndDates||{})),endD=ed1[0],sEndD=ed1[1];
  var t1=useState(data.targetMensile||0),tM=t1[0],sTM=t1[1];
  var nc1=useState(""),nc=nc1[0],sNc=nc1[1];var nl1=useState(""),nl=nl1[0],sNl=nl1[1];
  var na1=useState(""),na=na1[0],sNa=na1[1];var np1=useState(""),np=np1[0],sNp=np1[1];
  var n21=useState(""),np2=n21[0],sN2=n21[1];var am1=useState(""),am=am1[0],sAm=am1[1];
  var tb1=useState("people"),tab=tb1[0],sTab=tb1[1];var sv1=useState(false),saving=sv1[0],sSv=sv1[1];
  function addA(){if(!na.trim()){sAm("Inserisci un nome");return;}if(np.length<4){sAm("Min 4 caratteri");return;}if(np!==np2){sAm("Non coincidono");return;}if(al.find(function(a){return a.name.toLowerCase()===na.trim().toLowerCase();})){sAm("Gia esistente");return;}
    sAl([].concat(al,[{name:na.trim(),passHash:hashPw(np)}]));sNa("");sNp("");sN2("");sAm("Aggiunto!");setTimeout(function(){sAm("");},2000);}
  async function doSave(){sSv(true);await onSave(cl,ll,al,bud,endD,tM);sSv(false);}
  return(<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.45)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000}} onClick={onClose}>
    <div onClick={function(e){e.stopPropagation();}} style={{background:"#fff",borderRadius:16,padding:28,width:520,maxWidth:"94vw",maxHeight:"88vh",overflowY:"auto",boxShadow:"0 20px 60px rgba(0,0,0,.2)",fontFamily:FONT}}>
      <h3 style={{margin:"0 0 16px",fontSize:20,color:CL.greyDk}}>Gestione</h3>
      <div style={{display:"flex",gap:4,marginBottom:20,flexWrap:"wrap"}}>{[["people","Consulenti"],["clients","Clienti e Budget"],["target","Target"],["admins","Admin"]].map(function(t){return<button key={t[0]} onClick={function(){sTab(t[0]);}} style={{padding:"8px 14px",borderRadius:8,border:"none",fontSize:12,fontWeight:tab===t[0]?700:400,cursor:"pointer",fontFamily:FONT,background:tab===t[0]?CL.red:"#f0f0f0",color:tab===t[0]?"#fff":CL.greyMd}}>{t[1]}</button>;})}</div>
      {tab==="people"&&<div><h4 style={{margin:"0 0 10px",color:CL.red}}>Consulenti</h4>
        {cl.map(function(c,i){return<div key={i} style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}><span style={{flex:1,padding:"6px 10px",background:CL.greyLt,borderRadius:6,fontSize:14}}>{c}</span><button onClick={function(){sCl(cl.filter(function(_,j){return j!==i;}));}} style={{background:"none",border:"none",color:CL.red,cursor:"pointer",fontSize:18}}>x</button></div>;})}
        <div style={{display:"flex",gap:8,marginTop:6}}><input value={nc} onChange={function(e){sNc(e.target.value);}} onKeyDown={function(e){if(e.key==="Enter"&&nc.trim()){sCl([].concat(cl,[nc.trim()]));sNc("");}}} placeholder="Nuovo consulente..." style={sI}/><button onClick={function(){if(nc.trim()){sCl([].concat(cl,[nc.trim()]));sNc("");}}} style={sB}>+</button></div></div>}
      {tab==="clients"&&<div><h4 style={{margin:"0 0 10px",color:CL.red}}>Clienti, giornate/mese e fine contratto</h4>
        {ll.map(function(c,i){return<div key={i} style={{display:"flex",alignItems:"center",gap:6,marginBottom:8,flexWrap:"wrap"}}>
          <span style={{flex:"1 1 120px",padding:"6px 10px",background:CL.greyLt,borderRadius:6,fontSize:14}}>{c}</span>
          <input type="number" min="0" step="0.5" value={bud[c]||""} onChange={function(e){var nb=Object.assign({},bud);nb[c]=parseFloat(e.target.value)||0;sBud(nb);}} placeholder="gg" style={Object.assign({},sI,{flex:"0 0 70px",textAlign:"center",padding:"6px"})}/>
          <span style={{fontSize:10,color:"#888"}}>gg/m</span>
          <input type="date" value={endD[c]||""} onChange={function(e){var ne=Object.assign({},endD);ne[c]=e.target.value;sEndD(ne);}} style={Object.assign({},sI,{flex:"0 0 130px",padding:"6px 8px",fontSize:12})}/>
          <button onClick={function(){sLl(ll.filter(function(_,j){return j!==i;}));var nb=Object.assign({},bud);delete nb[c];sBud(nb);var ne=Object.assign({},endD);delete ne[c];sEndD(ne);}} style={{background:"none",border:"none",color:CL.red,cursor:"pointer",fontSize:18}}>x</button></div>;})}
        <div style={{display:"flex",gap:8,marginTop:6}}><input value={nl} onChange={function(e){sNl(e.target.value);}} onKeyDown={function(e){if(e.key==="Enter"&&nl.trim()){sLl([].concat(ll,[nl.trim()]));sNl("");}}} placeholder="Nuovo cliente..." style={sI}/><button onClick={function(){if(nl.trim()){sLl([].concat(ll,[nl.trim()]));sNl("");}}} style={sB}>+</button></div>
        <div style={{marginTop:12,padding:"10px 14px",background:CL.greyLt,borderRadius:8}}><span style={{fontSize:13,color:CL.greyMd}}>Totale richieste: </span><span style={{fontSize:16,fontWeight:700,color:CL.red}}>{fmtNum(ll.reduce(function(s,c){return s+(bud[c]||0);},0))}</span><span style={{fontSize:12,color:"#888"}}> gg/mese</span></div></div>}
      {tab==="target"&&<div><h4 style={{margin:"0 0 10px",color:CL.red}}>Target mensile OPEX</h4><p style={{fontSize:13,color:CL.greyMd,marginBottom:12}}>Obiettivo giornate fatturabili al mese.</p>
        <div style={{display:"flex",alignItems:"center",gap:10}}><input type="number" min="0" step="1" value={tM||""} onChange={function(e){sTM(parseFloat(e.target.value)||0);}} style={Object.assign({},sI,{flex:"none",width:120,fontSize:20,textAlign:"center",padding:"12px",border:"2px solid "+CL.red,fontWeight:700})}/><span style={{fontSize:14,color:CL.greyMd}}>gg/mese</span></div></div>}
      {tab==="admins"&&<div><h4 style={{margin:"0 0 10px",color:CL.red}}>Admin attivi</h4>
        {al.map(function(a,i){return<div key={i} style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}><span style={{flex:1,padding:"6px 10px",background:CL.greyLt,borderRadius:6,fontSize:14,fontWeight:600}}>{a.name}</span>{al.length>1&&<button onClick={function(){sAl(al.filter(function(_,j){return j!==i;}));}} style={{background:"none",border:"none",color:CL.red,cursor:"pointer",fontSize:18}}>x</button>}</div>;})}
        <h4 style={{margin:"16px 0 10px",color:CL.red}}>Nuovo admin</h4>
        <input value={na} onChange={function(e){sNa(e.target.value);sAm("");}} placeholder="Nome" style={Object.assign({},sI,{width:"100%",marginBottom:8})}/>
        <input type="password" value={np} onChange={function(e){sNp(e.target.value);sAm("");}} placeholder="Password" style={Object.assign({},sI,{width:"100%",marginBottom:8})}/>
        <input type="password" value={np2} onChange={function(e){sN2(e.target.value);sAm("");}} onKeyDown={function(e){if(e.key==="Enter")addA();}} placeholder="Conferma" style={Object.assign({},sI,{width:"100%",marginBottom:4})}/>
        {am&&<p style={{margin:"8px 0 0",fontSize:13,color:CL.red,fontWeight:600}}>{am}</p>}
        <button onClick={addA} style={Object.assign({},sB,{width:"100%",padding:"10px 0",marginTop:12})}>+ Aggiungi</button></div>}
      <div style={{display:"flex",gap:10,marginTop:24,borderTop:"1px solid #eee",paddingTop:18}}>
        <button onClick={doSave} disabled={saving} style={Object.assign({},sB,{flex:1,padding:"12px 0",opacity:saving?.5:1})}>{saving?"Salvataggio...":"Salva"}</button>
        <button onClick={onClose} style={sO}>Annulla</button></div></div></div>);
}
