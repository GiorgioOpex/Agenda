"use client";
import { useState } from "react";
import { CL, FONT, sI, sIPw, sB, Logo } from "./shared";
import { supabase } from "../lib/supabase";

export function LoginScreen(p){
  var d=p.data,oC=p.onLoginC,oA=p.onLoginA;
  var ms=useState("consultant"),mode=ms[0],setMode=ms[1];
  var ss=useState(d.consultants[0]||""),selCons=ss[0],setSelCons=ss[1];
  var sa=useState(d.admins&&d.admins[0]?d.admins[0].name:""),selAdm=sa[0],setSelAdm=sa[1];
  var ps=useState(""),pw=ps[0],setPw=ps[1];
  var es=useState(""),err=es[0],setErr=es[1];
  var ls=useState(false),loading=ls[0],setLoading=ls[1];
  var fs=useState(false),forgot=fs[0],setForgot=fs[1];
  var fms=useState(""),forgotMsg=fms[0],setForgotMsg=fms[1];

  function getEmail(){
    if(mode==="consultant"){
      var em=d.consultantEmails||{};
      return em[selCons]||"";
    }else{
      var adm=d.admins.find(function(a){return a.name===selAdm;});
      return adm?adm.email||"":"";
    }
  }

  function getFlags(){
    var name=mode==="consultant"?selCons:selAdm;
    var flags=(d.userFlags||{})[name]||{};
    return {
      mustChangePassword: flags.mustChangePassword===true,
      privacyAccepted: flags.privacyAccepted===true
    };
  }

  async function doLogin(){
    var email=getEmail();
    if(!email){setErr("Nessuna email associata a questo utente");return;}
    if(!pw.trim()){setErr("Inserisci la password");return;}
    setLoading(true);setErr("");
    try{
      var res=await supabase.auth.signInWithPassword({email:email.toLowerCase(),password:pw});
      if(res.error){setErr("Password errata");setPw("");setLoading(false);return;}
      var flags=getFlags();
      var needsFirstLogin = flags.mustChangePassword || !flags.privacyAccepted;
      var loginInfo = {
        needsFirstLogin: needsFirstLogin,
        needsPw: flags.mustChangePassword,
        needsPrivacy: !flags.privacyAccepted
      };
      if(mode==="consultant"){oC(selCons, loginInfo);}
      else{oA(selAdm, loginInfo);}
    }catch(e){setErr("Errore di connessione");console.error(e);}
    setLoading(false);
  }

  async function doReset(){
    var email=getEmail();
    if(!email){setForgotMsg("Nessuna email associata a questo utente");return;}
    setLoading(true);setForgotMsg("");
    try{
      var res=await supabase.auth.resetPasswordForEmail(email.toLowerCase());
      if(res.error){setForgotMsg("Errore: "+res.error.message);}
      else{setForgotMsg("Email di reset inviata a "+email);}
    }catch(e){setForgotMsg("Errore di connessione");}
    setLoading(false);
  }

  var footerLinks=function(){return(<div style={{textAlign:"center",marginTop:20,paddingTop:16,borderTop:"1px solid #f0f0f0"}}>
    <div style={{display:"flex",justifyContent:"center",gap:16,flexWrap:"wrap"}}>
      <a href="/privacy" target="_blank" style={{color:CL.greyMd,fontSize:11,textDecoration:"none",fontFamily:FONT}}>Privacy Policy</a>
      <a href="/cookie" target="_blank" style={{color:CL.greyMd,fontSize:11,textDecoration:"none",fontFamily:FONT}}>Cookie Policy</a>
      <a href="/termini" target="_blank" style={{color:CL.greyMd,fontSize:11,textDecoration:"none",fontFamily:FONT}}>Termini di Servizio</a>
    </div>
    <p style={{margin:"8px 0 0",fontSize:10,color:"#bbb"}}>Opex Solutions S.r.l. — P.IVA 04154460135</p>
  </div>);};

  if(forgot){return(
    <div style={{minHeight:"100vh",fontFamily:FONT,display:"flex",alignItems:"center",justifyContent:"center",background:"linear-gradient(135deg,"+CL.greyDk+" 0%,"+CL.grey+" 50%,"+CL.redDk+" 100%)"}}>
    <div style={{background:"#fff",borderRadius:20,padding:"40px 36px",width:400,maxWidth:"92vw",boxShadow:"0 30px 80px rgba(0,0,0,.4)"}}>
      <div style={{textAlign:"center",marginBottom:24}}><Logo h={50}/><p style={{margin:"8px 0 0",fontSize:11,color:CL.greyMd,letterSpacing:2}}>RECUPERO PASSWORD</p></div>
      <p style={{fontSize:13,color:CL.greyMd,marginBottom:16}}>Seleziona il tuo nome e clicca "Invia". Riceverai un'email per reimpostare la password.</p>
      <label style={{fontSize:12,fontWeight:600,color:CL.greyMd,display:"block",marginBottom:6}}>Seleziona il tuo nome</label>
      <select value={mode==="consultant"?selCons:selAdm} onChange={function(e){if(mode==="consultant")setSelCons(e.target.value);else setSelAdm(e.target.value);setForgotMsg("");}} style={Object.assign({},sI,{width:"100%",padding:"12px 14px",border:"2px solid "+CL.red,marginBottom:14,fontWeight:600})}>
        {d.consultants.map(function(c){return<option key={c} value={c}>{c}</option>;})}
        {d.admins.map(function(a){return<option key={"a_"+a.name} value={a.name}>{a.name} (Admin)</option>;})}
      </select>
      {forgotMsg&&<p style={{margin:"0 0 12px",fontSize:13,color:forgotMsg.startsWith("Email")?"#2E7D32":CL.red,fontWeight:600}}>{forgotMsg}</p>}
      <button onClick={doReset} disabled={loading} style={Object.assign({},sB,{width:"100%",padding:"13px 0",fontSize:15,opacity:loading?0.5:1})}>{loading?"Invio in corso...":"Invia email di reset"}</button>
      <div style={{textAlign:"center",marginTop:16}}><button onClick={function(){setForgot(false);setForgotMsg("");}} style={{background:"none",border:"none",color:CL.red,fontSize:13,cursor:"pointer",fontFamily:FONT,textDecoration:"underline"}}>Torna al login</button></div>
      {footerLinks()}
    </div></div>);}

  return(
    <div style={{minHeight:"100vh",fontFamily:FONT,display:"flex",alignItems:"center",justifyContent:"center",background:"linear-gradient(135deg,"+CL.greyDk+" 0%,"+CL.grey+" 50%,"+CL.redDk+" 100%)"}}>
    <div style={{background:"#fff",borderRadius:20,padding:"40px 36px",width:400,maxWidth:"92vw",boxShadow:"0 30px 80px rgba(0,0,0,.4)"}}>
      <div style={{textAlign:"center",marginBottom:24}}><Logo h={50}/><p style={{margin:"8px 0 0",fontSize:11,color:CL.greyMd,letterSpacing:2}}>AGENDA CONSULENTI</p></div>
      <div style={{display:"flex",borderRadius:10,overflow:"hidden",border:"2px solid "+CL.red,marginBottom:24}}>
        <button onClick={function(){setMode("consultant");setErr("");setPw("");}} style={{flex:1,padding:"10px 0",border:"none",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:FONT,background:mode==="consultant"?CL.red:"#fff",color:mode==="consultant"?"#fff":CL.red}}>Consulente</button>
        <button onClick={function(){setMode("admin");setErr("");setPw("");}} style={{flex:1,padding:"10px 0",border:"none",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:FONT,background:mode==="admin"?CL.red:"#fff",color:mode==="admin"?"#fff":CL.red}}>Admin</button>
      </div>
      {mode==="consultant"&&(d.consultants.length===0?<p style={{textAlign:"center",color:"#888",fontSize:14}}>Nessun consulente configurato.</p>:<div>
        <label style={{fontSize:12,fontWeight:600,color:CL.greyMd,display:"block",marginBottom:6}}>Seleziona consulente</label>
        <select value={selCons} onChange={function(e){setSelCons(e.target.value);setErr("");}} style={Object.assign({},sI,{width:"100%",padding:"12px 14px",border:"2px solid "+CL.red,marginBottom:14,fontWeight:600})}>{d.consultants.map(function(c){return<option key={c} value={c}>{c}</option>;})}</select>
        <input type="password" value={pw} onChange={function(e){setPw(e.target.value);setErr("");}} onKeyDown={function(e){if(e.key==="Enter")doLogin();}} placeholder="Password" style={Object.assign({},sIPw,{width:"100%",marginBottom:10})}/>
        {err&&<p style={{margin:"8px 0 0",fontSize:13,color:CL.red,fontWeight:600}}>{err}</p>}
        <button onClick={doLogin} disabled={loading} style={Object.assign({},sB,{width:"100%",padding:"13px 0",fontSize:15,marginTop:12,opacity:loading?0.5:1})}>{loading?"Accesso in corso...":"Accedi al mio calendario"}</button>
        <div style={{textAlign:"center",marginTop:10}}><button onClick={function(){setForgot(true);}} style={{background:"none",border:"none",color:CL.greyMd,fontSize:12,cursor:"pointer",fontFamily:FONT,textDecoration:"underline"}}>Password dimenticata?</button></div></div>)}
      {mode==="admin"&&(!d.admins||d.admins.length===0?<p style={{textAlign:"center",color:"#888",fontSize:14}}>Nessun admin configurato.</p>:<div>
        <label style={{fontSize:12,fontWeight:600,color:CL.greyMd,display:"block",marginBottom:6}}>Seleziona amministratore</label>
        <select value={selAdm} onChange={function(e){setSelAdm(e.target.value);setErr("");}} style={Object.assign({},sI,{width:"100%",padding:"12px 14px",border:"2px solid "+CL.red,marginBottom:14,fontWeight:600})}>{d.admins.map(function(a){return<option key={a.name} value={a.name}>{a.name}</option>;})}</select>
        <input type="password" value={pw} onChange={function(e){setPw(e.target.value);setErr("");}} onKeyDown={function(e){if(e.key==="Enter")doLogin();}} placeholder="Password" style={Object.assign({},sIPw,{width:"100%",marginBottom:10})}/>
        {err&&<p style={{margin:"8px 0 0",fontSize:13,color:CL.red,fontWeight:600}}>{err}</p>}
        <button onClick={doLogin} disabled={loading} style={Object.assign({},sB,{width:"100%",padding:"13px 0",fontSize:15,marginTop:12,opacity:loading?0.5:1})}>{loading?"Accesso in corso...":"Accedi"}</button>
        <div style={{textAlign:"center",marginTop:10}}><button onClick={function(){setForgot(true);}} style={{background:"none",border:"none",color:CL.greyMd,fontSize:12,cursor:"pointer",fontFamily:FONT,textDecoration:"underline"}}>Password dimenticata?</button></div>
      </div>)}
      {footerLinks()}
    </div></div>);
}
