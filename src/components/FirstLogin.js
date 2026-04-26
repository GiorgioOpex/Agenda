"use client";
import { useState } from "react";
import { CL, FONT, sIPw, sB, Logo, validatePassword, passwordStrength } from "./shared";
import { supabase } from "../lib/supabase";

export function FirstLogin(p){
  var user=p.user, needsPw=p.needsPw, needsPrivacy=p.needsPrivacy, onComplete=p.onComplete, onLogout=p.onLogout;
  var ns=useState(""),newPw=ns[0],sNewPw=ns[1];
  var cs=useState(""),confPw=cs[0],sConfPw=cs[1];
  var as=useState(false),accepted=as[0],sAccepted=as[1];
  var ms=useState(""),msg=ms[0],sMsg=ms[1];
  var ls=useState(false),loading=ls[0],sLoading=ls[1];

  var titolo;
  var sottotitolo;
  if(needsPw && needsPrivacy){
    titolo="PRIMO ACCESSO";
    sottotitolo="Per la sicurezza del tuo account devi impostare una nuova password e accettare i nostri termini.";
  } else if(needsPw){
    titolo="AGGIORNA PASSWORD";
    sottotitolo="L'amministratore ha richiesto un cambio password. Imposta una nuova password sicura per continuare.";
  } else {
    titolo="CONFERMA TERMINI";
    sottotitolo="Per continuare devi confermare l'accettazione dei termini di servizio.";
  }

  async function doSubmit(){
    if(needsPw){
      var err=validatePassword(newPw);
      if(err){sMsg(err);return;}
      if(newPw!==confPw){sMsg("Le password non coincidono");return;}
    }
    if(needsPrivacy && !accepted){
      sMsg("Devi accettare la Privacy Policy e i Termini di Servizio");
      return;
    }
    sLoading(true);sMsg("");
    try{
      if(needsPw){
        var upd=await supabase.auth.updateUser({password:newPw});
        if(upd.error){sMsg("Errore cambio password: "+upd.error.message);sLoading(false);return;}
      }
      var ur=await supabase.auth.getUser();
      var authId=ur && ur.data && ur.data.user ? ur.data.user.id : null;
      if(!authId){sMsg("Errore di sessione, ripeti il login");sLoading(false);return;}
      var res=await fetch("/api/first-login",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({authId:authId,acceptedPrivacy:needsPrivacy?accepted:false})
      });
      var json=await res.json();
      if(!res.ok || !json.ok){sMsg("Errore salvataggio: "+(json.error||"sconosciuto"));sLoading(false);return;}
      onComplete();
    }catch(e){sMsg("Errore di connessione");sLoading(false);}
  }

  var strength=passwordStrength(newPw);
  var strengthColors=["#e53935","#ef6c00","#fbc02d","#7cb342","#2E7D32"];
  var strengthLabels=["Troppo debole","Debole","Sufficiente","Buona","Ottima"];

  return(<div style={{position:"fixed",inset:0,background:"linear-gradient(135deg,"+CL.greyDk+" 0%,"+CL.grey+" 50%,"+CL.redDk+" 100%)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:2000,fontFamily:FONT,padding:20}}>
    <div style={{background:"#fff",borderRadius:20,padding:"36px 32px",width:460,maxWidth:"95vw",boxShadow:"0 30px 80px rgba(0,0,0,.4)",maxHeight:"95vh",overflowY:"auto"}}>
      <div style={{textAlign:"center",marginBottom:18}}>
        <Logo h={44}/>
        <p style={{margin:"8px 0 0",fontSize:11,color:CL.greyMd,letterSpacing:2}}>{titolo}</p>
      </div>
      <div style={{background:"#FFF8E1",border:"1px solid #FFD54F",borderRadius:8,padding:"10px 12px",marginBottom:18}}>
        <p style={{margin:0,fontSize:12,color:"#5D4037",lineHeight:1.5}}>
          <b>Benvenuto, {user}.</b><br/>{sottotitolo}
        </p>
      </div>

      {needsPw && <div>
        <label style={{fontSize:12,fontWeight:600,color:CL.greyMd,display:"block",marginBottom:6}}>Nuova password</label>
        <input type="password" value={newPw} onChange={function(e){sNewPw(e.target.value);sMsg("");}} placeholder="Min 8: maiusc, minusc, num, speciale" style={Object.assign({},sIPw,{width:"100%",marginBottom:6})}/>
        {newPw && <div style={{marginBottom:10}}>
          <div style={{display:"flex",gap:3,marginBottom:4}}>
            {[0,1,2,3].map(function(i){return<div key={i} style={{flex:1,height:4,borderRadius:2,background:i<strength?strengthColors[strength]:"#eee"}}/>;})}
          </div>
          <p style={{margin:0,fontSize:11,color:strengthColors[strength],fontWeight:600}}>{strengthLabels[strength]}</p>
        </div>}
        <label style={{fontSize:12,fontWeight:600,color:CL.greyMd,display:"block",marginBottom:6,marginTop:10}}>Conferma password</label>
        <input type="password" value={confPw} onChange={function(e){sConfPw(e.target.value);sMsg("");}} onKeyDown={function(e){if(e.key==="Enter")doSubmit();}} placeholder="Ripeti la nuova password" style={Object.assign({},sIPw,{width:"100%",marginBottom:14})}/>
      </div>}

      {needsPrivacy && <label style={{display:"flex",alignItems:"flex-start",gap:8,cursor:"pointer",fontSize:12,color:CL.greyDk,marginBottom:4,padding:"10px",background:"#fafafa",borderRadius:8,border:"1px solid #eee"}}>
        <input type="checkbox" checked={accepted} onChange={function(e){sAccepted(e.target.checked);sMsg("");}} style={{marginTop:2,accentColor:CL.red}}/>
        <span>Ho letto e accetto la <a href="/privacy" target="_blank" style={{color:CL.red,fontWeight:600}}>Privacy Policy</a>, la <a href="/cookie" target="_blank" style={{color:CL.red,fontWeight:600}}>Cookie Policy</a> e i <a href="/termini" target="_blank" style={{color:CL.red,fontWeight:600}}>Termini di Servizio</a> di Opex Solutions S.r.l.</span>
      </label>}

      {msg && <p style={{margin:"10px 0 0",fontSize:13,color:CL.red,fontWeight:600}}>{msg}</p>}

      <button onClick={doSubmit} disabled={loading} style={Object.assign({},sB,{width:"100%",padding:"13px 0",fontSize:15,marginTop:16,opacity:loading?0.5:1})}>
        {loading?"Configurazione in corso...":"Completa e accedi"}
      </button>

      <div style={{textAlign:"center",marginTop:12}}>
        <button onClick={onLogout} style={{background:"none",border:"none",color:CL.greyMd,fontSize:12,cursor:"pointer",fontFamily:FONT,textDecoration:"underline"}}>Annulla ed esci</button>
      </div>
    </div>
  </div>);
}
