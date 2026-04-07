"use client";
import { useState } from "react";
import { CL, FONT, sI, sB, Logo, hashPw, saveAll } from "./shared";

export function LoginScreen(p){
  var d=p.data,oC=p.onLoginC,oA=p.onLoginA,oDC=p.onDataChange;
  var ms=useState("consultant"),mode=ms[0],setMode=ms[1];
  var ss=useState(d.consultants[0]||""),sel=ss[0],setSel=ss[1];
  var ns=useState(""),an=ns[0],setAn=ns[1];var ps=useState(""),ap=ps[0],setAp=ps[1];
  var es=useState(""),err=es[0],setErr=es[1];
  function doLogin(){var f=d.admins.find(function(a){return a.name.toLowerCase()===an.toLowerCase().trim();});
    if(!f){setErr("Amministratore non trovato");return;}if(hashPw(ap)!==f.passHash){setErr("Password errata");setAp("");return;}oA(f.name);}
  return(
    <div style={{minHeight:"100vh",fontFamily:FONT,display:"flex",alignItems:"center",justifyContent:"center",background:"linear-gradient(135deg,"+CL.greyDk+" 0%,"+CL.grey+" 50%,"+CL.redDk+" 100%)"}}>
    <div style={{background:"#fff",borderRadius:20,padding:"40px 36px",width:400,maxWidth:"92vw",boxShadow:"0 30px 80px rgba(0,0,0,.4)"}}>
      <div style={{textAlign:"center",marginBottom:24}}><Logo h={50}/><p style={{margin:"8px 0 0",fontSize:11,color:CL.greyMd,letterSpacing:2}}>AGENDA CONSULENTI</p></div>
      <div style={{display:"flex",borderRadius:10,overflow:"hidden",border:"2px solid "+CL.red,marginBottom:24}}>
        <button onClick={function(){setMode("consultant");setErr("");}} style={{flex:1,padding:"10px 0",border:"none",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:FONT,background:mode==="consultant"?CL.red:"#fff",color:mode==="consultant"?"#fff":CL.red}}>Consulente</button>
        <button onClick={function(){setMode("admin");setErr("");}} style={{flex:1,padding:"10px 0",border:"none",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:FONT,background:mode==="admin"?CL.red:"#fff",color:mode==="admin"?"#fff":CL.red}}>Admin</button></div>
      {mode==="consultant"&&(d.consultants.length===0?<p style={{textAlign:"center",color:"#888",fontSize:14}}>Nessun consulente configurato.</p>:<div>
        <select value={sel} onChange={function(e){setSel(e.target.value);}} style={Object.assign({},sI,{width:"100%",padding:"12px 14px",border:"2px solid "+CL.red,marginBottom:20,fontWeight:600})}>{d.consultants.map(function(c){return<option key={c} value={c}>{c}</option>;})}</select>
        <button onClick={function(){oC(sel);}} style={Object.assign({},sB,{width:"100%",padding:"13px 0",fontSize:15})}>Accedi al mio calendario</button></div>)}
      {mode==="admin"&&(d.admins.length===0?<FirstAdmin data={d} onDone={oA} onDataChange={oDC}/>:<div>
        <input value={an} onChange={function(e){setAn(e.target.value);setErr("");}} placeholder="Nome admin" style={Object.assign({},sI,{width:"100%",marginBottom:12})}/>
        <input type="password" value={ap} onChange={function(e){setAp(e.target.value);setErr("");}} onKeyDown={function(e){if(e.key==="Enter")doLogin();}} placeholder="Password" style={Object.assign({},sI,{width:"100%",marginBottom:4})}/>
        {err&&<p style={{margin:"8px 0 0",fontSize:13,color:CL.red,fontWeight:600}}>{err}</p>}
        <button onClick={doLogin} style={Object.assign({},sB,{width:"100%",padding:"13px 0",fontSize:15,marginTop:16})}>Accedi come Admin</button></div>)}
    </div></div>);
}

function FirstAdmin(p){
  var d=p.data,oD=p.onDone,oDC=p.onDataChange;
  var n1=useState(""),n=n1[0],sN=n1[1];var p1=useState(""),pw=p1[0],sP=p1[1];
  var p2=useState(""),pw2=p2[0],sP2=p2[1];var e1=useState(""),e=e1[0],sE=e1[1];var sv=useState(false),saving=sv[0],sSv=sv[1];
  async function go(){if(!n.trim()){sE("Inserisci un nome");return;}if(pw.length<4){sE("Min 4 caratteri");return;}if(pw!==pw2){sE("Non coincidono");return;}
    sSv(true);var nd=Object.assign({},d,{admins:[{name:n.trim(),passHash:hashPw(pw)}]});var ok=await saveAll(nd);sSv(false);if(ok){oDC(nd);oD(n.trim());}else{sE("Errore salvataggio");}}
  return(<div>
    <div style={{background:"#FFF3F3",borderRadius:10,padding:"12px 16px",marginBottom:20,borderLeft:"4px solid "+CL.red}}><p style={{margin:0,fontSize:13,color:CL.redDk}}>Crea il primo amministratore.</p></div>
    <input value={n} onChange={function(x){sN(x.target.value);sE("");}} placeholder="Nome" style={Object.assign({},sI,{width:"100%",marginBottom:10})}/>
    <input type="password" value={pw} onChange={function(x){sP(x.target.value);sE("");}} placeholder="Password" style={Object.assign({},sI,{width:"100%",marginBottom:10})}/>
    <input type="password" value={pw2} onChange={function(x){sP2(x.target.value);sE("");}} onKeyDown={function(x){if(x.key==="Enter")go();}} placeholder="Conferma" style={Object.assign({},sI,{width:"100%",marginBottom:4})}/>
    {e&&<p style={{margin:"8px 0 0",fontSize:13,color:CL.red,fontWeight:600}}>{e}</p>}
    <button onClick={go} disabled={saving} style={Object.assign({},sB,{width:"100%",padding:"13px 0",marginTop:16,opacity:saving?0.5:1})}>{saving?"Salvataggio...":"Crea admin e accedi"}</button></div>);
}
