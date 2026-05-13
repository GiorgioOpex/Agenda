"use client";
import { useState, useEffect, useCallback } from "react";
import { MESI, CL, FONT, loadAll, saveAll, Logo, Legenda, makeKey, daysInMonth, firstDow, fmtNum, sIPw, sB, sO, validatePassword, passwordStrength } from "./shared";
import { LoginScreen } from "./Login";
import { FirstLogin } from "./FirstLogin";
import { supabase } from "../lib/supabase";
import { Calendar } from "./Calendar";
import { DayModal } from "./DayModal";
import { Panoramica } from "./Panoramica";
import { VistaCliente } from "./VistaCliente";
import { Consuntivo } from "./Consuntivo";
import { Dashboard } from "./Dashboard";
import { Impostazioni } from "./Impostazioni";

// Destinatario fisso del Report Consulente: l'amministrazione Opex Solutions.
var REPORT_RECIPIENT="amministrazione@opexsolutions.it";

export default function App(){
  var ds=useState(null),data=ds[0],sData=ds[1];var ls=useState(true),loading=ls[0],sLoad=ls[1];
  var gs=useState(false),logged=gs[0],sLog=gs[1];var ia=useState(false),isAdm=ia[0],sAdm=ia[1];
  var us=useState(""),user=us[0],sUser=us[1];var vs=useState("personal"),view=vs[0],sView=vs[1];
  var ys=useState(new Date().getFullYear()),yr=ys[0],sYr=ys[1];var ms=useState(new Date().getMonth()),mo=ms[0],sMo=ms[1];
  var es=useState(null),editDay=es[0],sED=es[1];var ss=useState(false),showS=ss[0],sSS=ss[1];
  var rs=useState(false),showReport=rs[0],sShowReport=rs[1];
  var cps=useState(false),showChPw=cps[0],sShowChPw=cps[1];
  var fl=useState(null),firstLogin=fl[0],sFirstLogin=fl[1];
 
  // Riallinea sempre lo stato di mese/anno al "qui e ora" del client.
  // Chiamata sia all'ingresso (loginC/loginA, PASSWORD_RECOVERY) sia all'uscita,
  // cosi' qualunque consulente o admin trova al login la schermata del mese in corso.
  function resetToCurrentMonth(){
    var now=new Date();
    sYr(now.getFullYear());
    sMo(now.getMonth());
  }

  useEffect(function(){
    // Caricamento iniziale
    loadAll().then(function(d){sData(d);sLoad(false);});
 
    // === Gestione PASSWORD_RECOVERY ===
    // Quando l'utente clicca il link "password dimenticata" ricevuto via mail,
    // Supabase apre una sessione temporanea e firea questo evento.
    // Forziamo il modale FirstLogin per farlo impostare una nuova password.
    var sub = supabase.auth.onAuthStateChange(function(event, session){
      if(event !== "PASSWORD_RECOVERY") return;
      if(!session || !session.user || !session.user.email) return;
      var email = session.user.email.toLowerCase();
      loadAll().then(function(d){
        sData(d);
        var foundName = null, foundIsAdm = false;
        var ce = d.consultantEmails || {};
        Object.keys(ce).forEach(function(name){
          if(ce[name] && String(ce[name]).toLowerCase() === email){ foundName = name; }
        });
        if(!foundName && d.admins){
          d.admins.forEach(function(a){
            if(a.email && String(a.email).toLowerCase() === email){ foundName = a.name; foundIsAdm = true; }
          });
        }
        if(foundName){
          var flags = (d.userFlags || {})[foundName] || {};
          sUser(foundName);
          sAdm(foundIsAdm);
          sLog(true);
          sView(foundIsAdm ? "admin" : "personal");
          resetToCurrentMonth();
          sFirstLogin({needsPw: true, needsPrivacy: !flags.privacyAccepted});
        }
      });
    });
 
    return function(){
      try{
        if(sub && sub.data && sub.data.subscription) sub.data.subscription.unsubscribe();
      }catch(e){}
    };
  },[]);
 
  function loginC(n,info){
    sUser(n);sAdm(false);sLog(true);sView("personal");resetToCurrentMonth();sShowReport(false);
    if(info && info.needsFirstLogin){sFirstLogin({needsPw:info.needsPw,needsPrivacy:info.needsPrivacy});}
  }
  function loginA(n,info){
    sUser(n);sAdm(true);sLog(true);sView("admin");resetToCurrentMonth();sShowReport(false);
    if(info && info.needsFirstLogin){sFirstLogin({needsPw:info.needsPw,needsPrivacy:info.needsPrivacy});}
  }
  function logout(){
    try{supabase.auth.signOut();}catch(e){}
    sLog(false);sAdm(false);sUser("");sView("personal");sSS(false);sFirstLogin(null);sShowReport(false);
    resetToCurrentMonth();
  }
  async function reloadDataAfterFirstLogin(){
    var fresh=await loadAll();sData(fresh);sFirstLogin(null);
  }
  var hSD=useCallback(async function(dk,val){var nd=Object.assign({},data);var ent=Object.assign({},nd.entries);if(!ent[user])ent[user]={};if(val)ent[user][dk]=val;else delete ent[user][dk];nd.entries=ent;sData(nd);sED(null);await saveAll(nd);},[data,user]);
  var hMV=useCallback(async function(fromDk,toDk,fromEntry,half){var nd=Object.assign({},data);var ent=Object.assign({},nd.entries);if(!ent[user])ent[user]={};
    var src=ent[user][fromDk];if(!src)return;var dst=ent[user][toDk]||{};
    if(half==="full"){ent[user][toDk]=src;delete ent[user][fromDk];}
    else if(half==="am"){dst.am=src.am;ent[user][toDk]=dst;var newSrc=Object.assign({},src);delete newSrc.am;if(newSrc.pm&&newSrc.pm.status)ent[user][fromDk]=newSrc;else delete ent[user][fromDk];}
    else if(half==="pm"){dst.pm=src.pm;ent[user][toDk]=dst;var newSrc2=Object.assign({},src);delete newSrc2.pm;if(newSrc2.am&&newSrc2.am.status)ent[user][fromDk]=newSrc2;else delete ent[user][fromDk];}
    nd.entries=ent;sData(nd);await saveAll(nd);},[data,user]);
  var hSS=useCallback(async function(cl,ll,al,budgets,endDates,targetM,emails,customHols){var nd=Object.assign({},data,{consultants:cl,clients:ll,admins:al,clientBudgets:budgets,clientEndDates:endDates,targetMensile:targetM,consultantEmails:emails||{},customHolidays:customHols||[]});sData(nd);sSS(false);await saveAll(nd);},[data]);
  var hSE=useCallback(async function(consultantName,dk,val){var nd=Object.assign({},data);var ent=Object.assign({},nd.entries);if(!ent[consultantName])ent[consultantName]={};if(val)ent[consultantName][dk]=val;else delete ent[consultantName][dk];nd.entries=ent;sData(nd);await saveAll(nd);},[data]);
  var hCP=useCallback(async function(dk,entryData){var nd=Object.assign({},data);var ent=Object.assign({},nd.entries);if(!ent[user])ent[user]={};ent[user][dk]=JSON.parse(JSON.stringify(entryData));nd.entries=ent;sData(nd);await saveAll(nd);},[data,user]);
  // Cambio mese: chiude sempre l'eventuale Report aperto, in modo che il consulente
  // debba riaprirlo esplicitamente nel nuovo mese (e solo se mese corrente o passato).
  function pM(){sShowReport(false);if(mo===0){sMo(11);sYr(function(y){return y-1;});}else sMo(function(m){return m-1;});}
  function nM(){sShowReport(false);if(mo===11){sMo(0);sYr(function(y){return y+1;});}else sMo(function(m){return m+1;});}
  if(loading||!data)return<div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",fontFamily:FONT,color:CL.red,fontSize:18}}>Caricamento...</div>;
  if(!logged)return<LoginScreen data={data} onLoginC={loginC} onLoginA={loginA} onDataChange={sData}/>;
  if(firstLogin)return(<><LoginScreen data={data} onLoginC={function(){}} onLoginA={function(){}} onDataChange={sData}/><FirstLogin user={user} needsPw={firstLogin.needsPw} needsPrivacy={firstLogin.needsPrivacy} onComplete={reloadDataAfterFirstLogin} onLogout={logout}/></>);
  var aV=[["admin","Panoramica"],["client","Per Cliente"],["report","Per Consulente"],["dashboard","Dashboard"]];
  return(<div style={{minHeight:"100vh",background:"linear-gradient(135deg,#f9f3f3 0%,"+CL.greyLt+" 100%)",fontFamily:FONT}}>
    <div style={{background:"linear-gradient(135deg,"+CL.greyDk+" 0%,"+CL.grey+" 40%,"+CL.redDk+" 100%)",padding:"14px 24px",color:"#fff"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10}}>
        <div style={{display:"flex",alignItems:"center",gap:14}}><div style={{background:"#fff",borderRadius:8,padding:"4px 8px"}}><Logo h={28}/></div><div><p style={{margin:0,fontSize:13,fontWeight:600}}>Agenda Consulenti</p><p style={{margin:0,fontSize:11,opacity:.6}}>{isAdm?"Admin: "+user:user}</p></div></div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
          {isAdm&&aV.map(function(v){return<button key={v[0]} onClick={function(){sView(v[0]);}} style={{padding:"7px 14px",borderRadius:8,border:"none",fontSize:12,fontWeight:view===v[0]?700:400,background:view===v[0]?"rgba(255,255,255,.22)":"rgba(255,255,255,.08)",color:"#fff",cursor:"pointer",fontFamily:FONT}}>{v[1]}</button>;})}
          {isAdm&&<button onClick={function(){sSS(true);}} style={{padding:"7px 12px",borderRadius:8,border:"1px solid rgba(255,255,255,.25)",background:"transparent",color:"#fff",fontSize:12,cursor:"pointer",fontFamily:FONT}}>Impostazioni</button>}
          {!isAdm&&<button onClick={function(){sShowChPw(true);}} style={{padding:"7px 12px",borderRadius:8,border:"1px solid rgba(255,255,255,.25)",background:"transparent",color:"#fff",fontSize:12,cursor:"pointer",fontFamily:FONT}}>Cambia Password</button>}
          <button onClick={logout} style={{padding:"7px 14px",borderRadius:8,border:"1px solid rgba(255,255,255,.2)",background:"rgba(255,100,100,.15)",color:"#ffcccc",fontSize:11,cursor:"pointer",fontFamily:FONT}}>Esci</button></div></div></div>
    <div style={{maxWidth:960,margin:"0 auto",padding:"20px 16px 40px"}}>
      {view!=="dashboard"&&<div style={{display:"flex",alignItems:"center",justifyContent:"center",marginBottom:16,gap:12}}>
        <button onClick={pM} style={{background:"#fff",border:"1px solid #ddd",borderRadius:8,padding:"6px 12px",cursor:"pointer",fontSize:18}}>&#8249;</button>
        <h2 style={{margin:0,fontSize:20,color:CL.greyDk,minWidth:200,textAlign:"center"}}>{MESI[mo]} {yr}</h2>
        <button onClick={nM} style={{background:"#fff",border:"1px solid #ddd",borderRadius:8,padding:"6px 12px",cursor:"pointer",fontSize:18}}>&#8250;</button></div>}
      {view!=="dashboard"&&!isAdm&&<Legenda clients={data.clients} entries={data.entries[user]||{}}/>}
      {!isAdm&&<div style={{background:"#fff",borderRadius:16,padding:20,boxShadow:"0 4px 20px rgba(0,0,0,.06)"}}><Calendar year={yr} month={mo} entries={data.entries[user]||{}} clients={data.clients} customHolidays={data.customHolidays||[]} onDayClick={sED} onDrop={hMV} onCopy={hCP}/></div>}
      {!isAdm&&!showReport&&(yr<new Date().getFullYear()||(yr===new Date().getFullYear()&&mo<=new Date().getMonth()))&&<div style={{textAlign:"center",marginTop:16}}><button onClick={function(){sShowReport(true);}} style={{padding:"10px 24px",borderRadius:8,border:"1px solid "+CL.red,background:"#fff",color:CL.red,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:FONT}}>Genera Report {MESI[mo]} {yr}</button></div>}
      {!isAdm&&showReport&&function(){
        var cE=data.entries[user]||{};var dayRows=[];var trainRows=[];
        for(var d=1;d<=daysInMonth(yr,mo);d++){var e=cE[makeKey(yr,mo,d)];if(!e)continue;
          var fd=firstDow(yr,mo);var isSun=(fd+d-1)%7===6;if(isSun)continue;
          var amC=e.am&&e.am.status==="client"&&e.am.client?e.am.client:null;
          var pmC=e.pm&&e.pm.status==="client"&&e.pm.client?e.pm.client:null;
          var amT=e.am&&e.am.status==="training";var pmT=e.pm&&e.pm.status==="training";
          if(amC&&pmC&&amC===pmC){dayRows.push({day:d,client:amC,presenza:"Intera giornata"});}
          else{if(amC)dayRows.push({day:d,client:amC,presenza:"Mattina"});if(pmC)dayRows.push({day:d,client:pmC,presenza:"Pomeriggio"});}
          if(amT&&pmT){trainRows.push({day:d,presenza:"Intera giornata"});}
          else{if(amT)trainRows.push({day:d,presenza:"Mattina"});if(pmT)trainRows.push({day:d,presenza:"Pomeriggio"});}}
        var totGG=dayRows.reduce(function(s,r){return s+(r.presenza==="Intera giornata"?1:0.5);},0);
        var totTrain=trainRows.reduce(function(s,r){return s+(r.presenza==="Intera giornata"?1:0.5);},0);
        function buildMailBody(){var userEmail=(data.consultantEmails||{})[user]||"";
          var lines=["REPORT ATTIVITA' "+user,"",MESI[mo]+" "+yr,"","--- CONSULENZA ---",""];
          dayRows.forEach(function(r){lines.push(r.day+" "+MESI[mo].substring(0,3)+" - "+r.client+" - "+r.presenza);});
          lines.push("");lines.push("TOTALE GIORNATE CONSULENZA: "+fmtNum(totGG));
          if(trainRows.length>0){lines.push("");lines.push("--- FORMAZIONE ---");lines.push("");
            trainRows.forEach(function(r){lines.push(r.day+" "+MESI[mo].substring(0,3)+" - FORMAZIONE - "+r.presenza);});
            lines.push("");lines.push("TOTALE GIORNATE FORMAZIONE: "+fmtNum(totTrain));}
          lines.push("");lines.push("---");lines.push(user);if(userEmail)lines.push(userEmail);
          return lines.join("%0D%0A");}
        // Destinatario fisso: amministrazione Opex Solutions.
        // L'eventuale email del consulente viene comunque inserita in chiusura body come firma.
        function openMail(){var subject="Report "+user+" - "+MESI[mo]+" "+yr;
          var mailto="mailto:"+encodeURIComponent(REPORT_RECIPIENT)+"?subject="+encodeURIComponent(subject)+"&body="+buildMailBody();
          window.location.href=mailto;}
        return(<div style={{background:"#fff",borderRadius:16,padding:20,boxShadow:"0 4px 20px rgba(0,0,0,.06)",marginTop:16}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
            <h3 style={{margin:0,fontSize:16,color:CL.greyDk}}>Report {MESI[mo]} {yr}</h3>
            <button onClick={function(){sShowReport(false);}} style={{padding:"4px 10px",borderRadius:6,border:"1px solid #ddd",background:"#fff",fontSize:11,cursor:"pointer",fontFamily:FONT,color:"#888"}}>Chiudi</button></div>
          {dayRows.length===0&&trainRows.length===0&&<p style={{textAlign:"center",color:"#ccc",padding:"20px 0"}}>Nessuna attivita' registrata</p>}
          {dayRows.length>0&&<div style={{overflowX:"auto",marginBottom:trainRows.length>0?16:0}}><h4 style={{margin:"0 0 8px",color:CL.greyDk,fontSize:14}}>Consulenza</h4><table style={{borderCollapse:"collapse",width:"100%",fontSize:13,fontFamily:FONT}}>
            <thead><tr style={{background:"#FFF8F8"}}>
              <th style={{padding:"8px 14px",borderBottom:"2px solid "+CL.red,textAlign:"left"}}>Data</th>
              <th style={{padding:"8px 14px",borderBottom:"2px solid "+CL.red,textAlign:"left"}}>Cliente</th>
              <th style={{padding:"8px 14px",borderBottom:"2px solid "+CL.red,textAlign:"left"}}>Presenza</th></tr></thead>
            <tbody>{dayRows.map(function(r,i){return<tr key={i}>
              <td style={{padding:"6px 14px",borderBottom:"1px solid #eee",fontWeight:600,color:CL.greyDk}}>{r.day} {MESI[mo].substring(0,3)}</td>
              <td style={{padding:"6px 14px",borderBottom:"1px solid #eee",fontWeight:600,color:CL.red}}>{r.client}</td>
              <td style={{padding:"6px 14px",borderBottom:"1px solid #eee",color:CL.greyMd}}>{r.presenza}</td></tr>;})}
            <tr style={{background:"#FFF8F8"}}><td style={{padding:"8px 14px",borderTop:"2px solid "+CL.red,fontWeight:700}} colSpan={2}>TOTALE CONSULENZA</td>
              <td style={{padding:"8px 14px",borderTop:"2px solid "+CL.red,fontWeight:700,color:CL.red}}>{fmtNum(totGG)} giornate</td></tr>
            </tbody></table></div>}
          {trainRows.length>0&&<div style={{overflowX:"auto"}}><h4 style={{margin:"0 0 8px",color:"#7B1FA2",fontSize:14}}>Formazione API</h4><table style={{borderCollapse:"collapse",width:"100%",fontSize:13,fontFamily:FONT}}>
            <thead><tr style={{background:"#F3E5F5"}}>
              <th style={{padding:"8px 14px",borderBottom:"2px solid #7B1FA2",textAlign:"left"}}>Data</th>
              <th style={{padding:"8px 14px",borderBottom:"2px solid #7B1FA2",textAlign:"left"}}>Presenza</th></tr></thead>
            <tbody>{trainRows.map(function(r,i){return<tr key={i}>
              <td style={{padding:"6px 14px",borderBottom:"1px solid #eee",fontWeight:600,color:CL.greyDk}}>{r.day} {MESI[mo].substring(0,3)}</td>
              <td style={{padding:"6px 14px",borderBottom:"1px solid #eee",color:CL.greyMd}}>{r.presenza}</td></tr>;})}
            <tr style={{background:"#F3E5F5"}}><td style={{padding:"8px 14px",borderTop:"2px solid #7B1FA2",fontWeight:700}}>TOTALE FORMAZIONE</td>
              <td style={{padding:"8px 14px",borderTop:"2px solid #7B1FA2",fontWeight:700,color:"#7B1FA2"}}>{fmtNum(totTrain)} giornate</td></tr>
            </tbody></table></div>}
          {(dayRows.length>0||trainRows.length>0)&&<div style={{textAlign:"center",marginTop:16}}>
            <button onClick={openMail} style={{padding:"12px 30px",borderRadius:8,border:"none",background:CL.red,color:"#fff",fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:FONT}}>Conferma Report e Invia Mail</button></div>}
        </div>);}()}
      {isAdm&&view==="admin"&&<div style={{background:"#fff",borderRadius:16,padding:20,boxShadow:"0 4px 20px rgba(0,0,0,.06)"}}><h3 style={{margin:"0 0 14px",color:CL.greyDk,fontSize:16}}>Panoramica - {MESI[mo]} {yr}</h3><Panoramica entries={data.entries} consultants={data.consultants} clients={data.clients} clientBudgets={data.clientBudgets} clientEndDates={data.clientEndDates} customHolidays={data.customHolidays||[]} year={yr} month={mo}/></div>}
      {isAdm&&view==="client"&&<div style={{background:"#fff",borderRadius:16,padding:20,boxShadow:"0 4px 20px rgba(0,0,0,.06)"}}><h3 style={{margin:"0 0 14px",color:CL.greyDk,fontSize:16}}>Per Cliente - {MESI[mo]} {yr}</h3><VistaCliente entries={data.entries} consultants={data.consultants} clients={data.clients} clientBudgets={data.clientBudgets} clientEndDates={data.clientEndDates} year={yr} month={mo}/></div>}
      {isAdm&&view==="report"&&<div style={{background:"#fff",borderRadius:16,padding:20,boxShadow:"0 4px 20px rgba(0,0,0,.06)"}}><h3 style={{margin:"0 0 14px",color:CL.greyDk,fontSize:16}}>Per Consulente - {MESI[mo]} {yr}</h3><Consuntivo entries={data.entries} consultants={data.consultants} clients={data.clients} clientBudgets={data.clientBudgets} clientEndDates={data.clientEndDates} customHolidays={data.customHolidays||[]} year={yr} month={mo} onSaveEntry={hSE}/></div>}
      {isAdm&&view==="dashboard"&&<div style={{background:"#fff",borderRadius:16,padding:20,boxShadow:"0 4px 20px rgba(0,0,0,.06)"}}><h3 style={{margin:"0 0 14px",color:CL.greyDk,fontSize:16}}>Dashboard - {yr}</h3><Dashboard data={data} year={yr}/></div>}</div>
    {editDay&&<DayModal dk={editDay} entry={(data.entries[user]||{})[editDay]} clients={data.clients} clientEndDates={data.clientEndDates} onSave={hSD} onClose={function(){sED(null);}}/>}
    {showS&&<Impostazioni data={data} onSave={hSS} onClose={function(){sSS(false);}}/>}
    {showChPw&&<ChangePassword user={user} consultantEmails={data.consultantEmails} onClose={function(){sShowChPw(false);}}/>}</div>);
}
 
function ChangePassword(p){
  var user=p.user,emails=p.consultantEmails||{},onClose=p.onClose;
  var os=useState(""),oldPw=os[0],sOldPw=os[1];
  var ns=useState(""),newPw=ns[0],sNewPw=ns[1];
  var cs=useState(""),confPw=cs[0],sConfPw=cs[1];
  var ms=useState(""),msg=ms[0],sMsg=ms[1];
  var ls=useState(false),loading=ls[0],sLoading=ls[1];
  var es=useState(false),isErr=es[0],sIsErr=es[1];
 
  async function doChange(){
    if(!oldPw.trim()){sMsg("Inserisci la password attuale");sIsErr(true);return;}
    var pwErr=validatePassword(newPw);
    if(pwErr){sMsg(pwErr);sIsErr(true);return;}
    if(newPw!==confPw){sMsg("Le password non coincidono");sIsErr(true);return;}
    if(newPw===oldPw){sMsg("La nuova password deve essere diversa da quella attuale");sIsErr(true);return;}
    sLoading(true);sMsg("");
    var email=emails[user]||"";
    if(!email){sMsg("Nessuna email associata");sIsErr(true);sLoading(false);return;}
    try{
      var res=await supabase.auth.signInWithPassword({email:email.toLowerCase(),password:oldPw});
      if(res.error){sMsg("Password attuale errata");sIsErr(true);sOldPw("");sLoading(false);return;}
      var upd=await supabase.auth.updateUser({password:newPw});
      if(upd.error){sMsg("Errore: "+upd.error.message);sIsErr(true);}
      else{sMsg("Password modificata con successo!");sIsErr(false);sOldPw("");sNewPw("");sConfPw("");}
    }catch(e){sMsg("Errore di connessione");sIsErr(true);}
    sLoading(false);
  }
 
  var strength=passwordStrength(newPw);
  var strengthColors=["#e53935","#ef6c00","#fbc02d","#7cb342","#2E7D32"];
  var strengthLabels=["Troppo debole","Debole","Sufficiente","Buona","Ottima"];
 
  return(<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.45)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000}} onClick={onClose}>
    <div onClick={function(e){e.stopPropagation();}} style={{background:"#fff",borderRadius:16,padding:28,width:400,maxWidth:"92vw",boxShadow:"0 20px 60px rgba(0,0,0,.2)",fontFamily:FONT}}>
      <h3 style={{margin:"0 0 20px",fontSize:18,color:CL.greyDk}}>Cambia Password</h3>
      <p style={{fontSize:13,color:CL.greyMd,marginBottom:16}}>{user}</p>
      <input type="password" value={oldPw} onChange={function(e){sOldPw(e.target.value);sMsg("");}} placeholder="Password attuale" style={Object.assign({},sIPw,{width:"100%",marginBottom:10})}/>
      <input type="password" value={newPw} onChange={function(e){sNewPw(e.target.value);sMsg("");}} placeholder="Nuova password (min. 8: maiusc/minusc/num/speciale)" style={Object.assign({},sIPw,{width:"100%",marginBottom:6})}/>
      {newPw && <div style={{marginBottom:8}}>
        <div style={{display:"flex",gap:3,marginBottom:4}}>
          {[0,1,2,3].map(function(i){return<div key={i} style={{flex:1,height:4,borderRadius:2,background:i<strength?strengthColors[strength]:"#eee"}}/>;})}
        </div>
        <p style={{margin:0,fontSize:11,color:strengthColors[strength],fontWeight:600}}>{strengthLabels[strength]}</p>
      </div>}
      <input type="password" value={confPw} onChange={function(e){sConfPw(e.target.value);sMsg("");}} onKeyDown={function(e){if(e.key==="Enter")doChange();}} placeholder="Conferma nuova password" style={Object.assign({},sIPw,{width:"100%",marginBottom:6,marginTop:4})}/>
      {msg&&<p style={{margin:"8px 0 0",fontSize:13,color:isErr?CL.red:"#2E7D32",fontWeight:600}}>{msg}</p>}
      <div style={{display:"flex",gap:10,marginTop:18}}>
        <button onClick={doChange} disabled={loading} style={Object.assign({},sB,{flex:1,padding:"12px 0",opacity:loading?0.5:1})}>{loading?"Salvataggio...":"Salva"}</button>
        <button onClick={onClose} style={sO}>Chiudi</button>
      </div>
    </div>
  </div>);
}
