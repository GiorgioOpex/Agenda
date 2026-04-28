"use client";
import { useState } from "react";
import { CL, FONT, sI, sIPw, sB, sO, fmtNum, hashPw } from "./shared";

export function Impostazioni(p){
  var data=p.data,onSave=p.onSave,onClose=p.onClose;
  var c1=useState([].concat(data.consultants)),cl=c1[0],sCl=c1[1];var l1=useState([].concat(data.clients)),ll=l1[0],sLl=l1[1];
  var a1=useState([].concat(data.admins)),al=a1[0],sAl=a1[1];var b1=useState(Object.assign({},data.clientBudgets||{})),bud=b1[0],sBud=b1[1];
  var ed1=useState(Object.assign({},data.clientEndDates||{})),endD=ed1[0],sEndD=ed1[1];
  var ce1=useState(Object.assign({},data.consultantEmails||{})),cEmails=ce1[0],sCEmails=ce1[1];
  var t1=useState(data.targetMensile||0),tM=t1[0],sTM=t1[1];
  var nc1=useState(""),nc=nc1[0],sNc=nc1[1];var ne1=useState(""),nce=ne1[0],sNce=ne1[1];var nl1=useState(""),nl=nl1[0],sNl=nl1[1];
  var na1=useState(""),na=na1[0],sNa=na1[1];var np1=useState(""),np=np1[0],sNp=np1[1];
  var n21=useState(""),np2=n21[0],sN2=n21[1];var am1=useState(""),am=am1[0],sAm=am1[1];
  var tb1=useState("people"),tab=tb1[0],sTab=tb1[1];var sv1=useState(false),saving=sv1[0],sSv=sv1[1];
  var er1=useState(""),saveErr=er1[0],sSaveErr=er1[1];
  var rs1=useState(""),resetMsg=rs1[0],sResetMsg=rs1[1];
  var rs2=useState(""),resetting=rs2[0],sResetting=rs2[1];
  // Stato di ordinamento per la tab "Clienti e Budget" — solo visualizzazione,
  // non modifica l'ordine salvato in DB.
  var sk1=useState("name"),clSortKey=sk1[0],sClSortKey=sk1[1];
  var sd1=useState("asc"),clSortDir=sd1[0],sClSortDir=sd1[1];
  // Stato di ordinamento per la tab "Consulenti".
  var sk2=useState("name"),pSortKey=sk2[0],sPSortKey=sk2[1];
  var sd2=useState("asc"),pSortDir=sd2[0],sPSortDir=sd2[1];

  function addA(){if(!na.trim()){sAm("Inserisci un nome");return;}if(np.length<4){sAm("Min 4 caratteri");return;}if(np!==np2){sAm("Non coincidono");return;}if(al.find(function(a){return a.name.toLowerCase()===na.trim().toLowerCase();})){sAm("Gia esistente");return;}
    sAl([].concat(al,[{name:na.trim().toUpperCase(),passHash:hashPw(np)}]));sNa("");sNp("");sN2("");sAm("Aggiunto!");setTimeout(function(){sAm("");},2000);}
  function validateClients(){
    for(var i=0;i<ll.length;i++){var c=ll[i];
      if(!bud[c]||bud[c]<=0)return "Il cliente \""+c+"\" non ha le giornate previste/mese";
      if(!endD[c])return "Il cliente \""+c+"\" non ha la data fine contratto";}
    return null;}
  function validateConsultants(){
    for(var i=0;i<cl.length;i++){var c=cl[i];
      if(!cEmails[c]||!cEmails[c].trim())return "Il consulente \""+c+"\" non ha la mail";
      if(cEmails[c].indexOf("@")<1)return "La mail di \""+c+"\" non e' valida";}
    return null;}
  async function doSave(){
    var err=validateClients();if(!err)err=validateConsultants();
    if(err){sSaveErr(err);return;}
    sSaveErr("");sSv(true);await onSave(cl,ll,al,bud,endD,tM,cEmails);sSv(false);}
  function missingBud(c){return !bud[c]||bud[c]<=0;}
  function missingEnd(c){return !endD[c];}

  async function resetPwd(name){
    if(!confirm("Vuoi resettare la password di \""+name+"\" al valore di default \"Opex2026\"?\n\nL'utente dovra' impostarne una nuova al prossimo accesso."))return;
    sResetting(name);sResetMsg("");
    try{
      var res=await fetch("/api/admin-reset-password",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({userName:name})
      });
      var json=await res.json();
      if(res.ok && json.ok){
        sResetMsg("Password di \""+name+"\" resettata. Comunicagli la password temporanea: "+json.defaultPassword);
      } else {
        sResetMsg("Errore: "+(json.error||"sconosciuto"));
      }
    }catch(e){sResetMsg("Errore di connessione");}
    sResetting("");
    setTimeout(function(){sResetMsg("");},10000);
  }

  // Helpers ordinamento (tab Clienti e tab Consulenti)
  function onClSort(key){
    if(clSortKey===key){sClSortDir(clSortDir==="asc"?"desc":"asc");}
    else{sClSortKey(key);sClSortDir("asc");}
  }
  function clArrow(key){
    if(clSortKey!==key)return <span style={{marginLeft:4,fontSize:9,color:"#bbb"}}>⇅</span>;
    return <span style={{marginLeft:4,fontSize:9,color:CL.red}}>{clSortDir==="asc"?"▲":"▼"}</span>;
  }
  function onPSort(key){
    if(pSortKey===key){sPSortDir(pSortDir==="asc"?"desc":"asc");}
    else{sPSortKey(key);sPSortDir("asc");}
  }
  function pArrow(key){
    if(pSortKey!==key)return <span style={{marginLeft:4,fontSize:9,color:"#bbb"}}>⇅</span>;
    return <span style={{marginLeft:4,fontSize:9,color:CL.red}}>{pSortDir==="asc"?"▲":"▼"}</span>;
  }

  // Lista clienti ordinata per la sola visualizzazione
  function getSortedClients(){
    return ll.slice().sort(function(a,b){
      var va,vb,isStr=false;
      switch(clSortKey){
        case "name": va=a; vb=b; isStr=true; break;
        case "bud": va=bud[a]||0; vb=bud[b]||0; break;
        case "end": va=endD[a]||""; vb=endD[b]||""; isStr=true; break;
        default: va=a; vb=b; isStr=true;
      }
      var diff;
      if(isStr){diff=String(va).localeCompare(String(vb),'it');}
      else{diff=(va-vb);}
      if(diff===0)diff=a.localeCompare(b,'it');
      return clSortDir==="asc"?diff:-diff;
    });
  }
  function getSortedConsultants(){
    return cl.slice().sort(function(a,b){
      var va,vb;
      switch(pSortKey){
        case "name": va=a; vb=b; break;
        case "email": va=(cEmails[a]||"").toLowerCase(); vb=(cEmails[b]||"").toLowerCase(); break;
        default: va=a; vb=b;
      }
      var diff=String(va).localeCompare(String(vb),'it');
      if(diff===0)diff=a.localeCompare(b,'it');
      return pSortDir==="asc"?diff:-diff;
    });
  }

  var sReset={padding:"4px 8px",borderRadius:6,border:"1px solid "+CL.red,background:"#fff",color:CL.red,fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:FONT,whiteSpace:"nowrap"};
  var sortBtn={padding:"4px 10px",borderRadius:6,border:"1px solid #ddd",background:"#fff",fontSize:11,cursor:"pointer",fontFamily:FONT,color:CL.greyDk,fontWeight:600};

  return(<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.45)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000}} onClick={onClose}>
    <div onClick={function(e){e.stopPropagation();}} style={{background:"#fff",borderRadius:16,padding:28,width:560,maxWidth:"94vw",maxHeight:"88vh",overflowY:"auto",boxShadow:"0 20px 60px rgba(0,0,0,.2)",fontFamily:FONT}}>
      <h3 style={{margin:"0 0 16px",fontSize:20,color:CL.greyDk}}>Gestione</h3>
      <div style={{display:"flex",gap:4,marginBottom:20,flexWrap:"wrap"}}>{[["people","Consulenti"],["clients","Clienti e Budget"],["target","Target"],["admins","Admin"]].map(function(t){return<button key={t[0]} onClick={function(){sTab(t[0]);sSaveErr("");sResetMsg("");}} style={{padding:"8px 14px",borderRadius:8,border:"none",fontSize:12,fontWeight:tab===t[0]?700:400,cursor:"pointer",fontFamily:FONT,background:tab===t[0]?CL.red:"#f0f0f0",color:tab===t[0]?"#fff":CL.greyMd}}>{t[1]}</button>;})}</div>

      {resetMsg&&<div style={{marginBottom:14,padding:"10px 14px",background:resetMsg.indexOf("Errore")===0?"#FFF3F3":"#E8F5E9",borderRadius:8,border:"1px solid "+(resetMsg.indexOf("Errore")===0?"#e53935":"#2E7D32")}}>
        <span style={{fontSize:12,color:resetMsg.indexOf("Errore")===0?"#e53935":"#2E7D32",fontWeight:600}}>{resetMsg}</span>
      </div>}

      {tab==="people"&&<div><h4 style={{margin:"0 0 10px",color:CL.red}}>Consulenti</h4>
        <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:10,flexWrap:"wrap",fontSize:11,color:CL.greyMd}}>
          <span>Ordina:</span>
          <button onClick={function(){onPSort("name");}} style={Object.assign({},sortBtn,{borderColor:pSortKey==="name"?CL.red:"#ddd"})}>Nome{pArrow("name")}</button>
          <button onClick={function(){onPSort("email");}} style={Object.assign({},sortBtn,{borderColor:pSortKey==="email"?CL.red:"#ddd"})}>Email{pArrow("email")}</button>
        </div>
        {getSortedConsultants().map(function(c){return<div key={c} style={{display:"flex",alignItems:"center",gap:6,marginBottom:8,flexWrap:"wrap"}}>
          <span style={{flex:"1 1 140px",padding:"6px 10px",background:CL.greyLt,borderRadius:6,fontSize:14}}>{c}</span>
          <input value={cEmails[c]||""} onChange={function(e){var ne=Object.assign({},cEmails);ne[c]=e.target.value;sCEmails(ne);sSaveErr("");}} placeholder="email@..." style={Object.assign({},sI,{flex:"1 1 180px",padding:"6px 10px",fontSize:12,border:(!cEmails[c]||!cEmails[c].trim())?"2px solid #e53935":"1px solid #ddd"})}/>
          <button onClick={function(){resetPwd(c);}} disabled={resetting===c||!cEmails[c]} title={!cEmails[c]?"Email mancante":"Reset password"} style={Object.assign({},sReset,{opacity:(resetting===c||!cEmails[c])?0.5:1})}>{resetting===c?"...":"🔑 Reset"}</button>
          <button onClick={function(){sCl(cl.filter(function(x){return x!==c;}));var ne=Object.assign({},cEmails);delete ne[c];sCEmails(ne);}} style={{background:"none",border:"none",color:CL.red,cursor:"pointer",fontSize:18}}>x</button></div>;})}
        <div style={{display:"flex",gap:6,marginTop:6,flexWrap:"wrap"}}>
          <input value={nc} onChange={function(e){sNc(e.target.value);}} placeholder="Nome consulente..." style={Object.assign({},sI,{flex:"1 1 140px"})}/>
          <input value={nce} onChange={function(e){sNce(e.target.value);}} placeholder="email@..." style={Object.assign({},sI,{flex:"1 1 180px",fontSize:12})}/>
          <button onClick={function(){if(nc.trim()&&nce.trim()){var nome=nc.trim().toUpperCase();sCl([].concat(cl,[nome]));var ne=Object.assign({},cEmails);ne[nome]=nce.trim().toLowerCase();sCEmails(ne);sNc("");sNce("");}}} style={sB}>+</button></div></div>}

      {tab==="clients"&&<div><h4 style={{margin:"0 0 10px",color:CL.red}}>Clienti, giornate/mese e fine contratto</h4>
        <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:10,flexWrap:"wrap",fontSize:11,color:CL.greyMd}}>
          <span>Ordina:</span>
          <button onClick={function(){onClSort("name");}} style={Object.assign({},sortBtn,{borderColor:clSortKey==="name"?CL.red:"#ddd"})}>Nome{clArrow("name")}</button>
          <button onClick={function(){onClSort("bud");}} style={Object.assign({},sortBtn,{borderColor:clSortKey==="bud"?CL.red:"#ddd"})}>gg/mese{clArrow("bud")}</button>
          <button onClick={function(){onClSort("end");}} style={Object.assign({},sortBtn,{borderColor:clSortKey==="end"?CL.red:"#ddd"})}>Fine contratto{clArrow("end")}</button>
        </div>
        {getSortedClients().map(function(c){return<div key={c} style={{marginBottom:10}}>
          <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
            <span style={{flex:"1 1 120px",padding:"6px 10px",background:CL.greyLt,borderRadius:6,fontSize:14}}>{c}</span>
            <input type="number" min="0" step="0.5" value={bud[c]||""} onChange={function(e){var nb=Object.assign({},bud);nb[c]=parseFloat(e.target.value)||0;sBud(nb);sSaveErr("");}} placeholder="gg" style={Object.assign({},sI,{flex:"0 0 70px",textAlign:"center",padding:"6px",border:missingBud(c)?"2px solid #e53935":"1px solid #ddd"})}/>
            <span style={{fontSize:10,color:"#888"}}>gg/m</span>
            <input type="date" value={endD[c]||""} onChange={function(e){var ne=Object.assign({},endD);ne[c]=e.target.value;sEndD(ne);sSaveErr("");}} style={Object.assign({},sI,{flex:"0 0 130px",padding:"6px 8px",fontSize:12,border:missingEnd(c)?"2px solid #e53935":"1px solid #ddd"})}/>
            <button onClick={function(){sLl(ll.filter(function(x){return x!==c;}));var nb=Object.assign({},bud);delete nb[c];sBud(nb);var ne=Object.assign({},endD);delete ne[c];sEndD(ne);}} style={{background:"none",border:"none",color:CL.red,cursor:"pointer",fontSize:18}}>x</button></div>
          {(missingBud(c)||missingEnd(c))&&<div style={{fontSize:11,color:"#e53935",marginTop:3,paddingLeft:4}}>
            {missingBud(c)&&<span>Inserisci giornate/mese </span>}
            {missingEnd(c)&&<span>Inserisci data fine contratto</span>}
          </div>}
        </div>;})}
        <div style={{display:"flex",gap:8,marginTop:6}}><input value={nl} onChange={function(e){sNl(e.target.value);}} onKeyDown={function(e){if(e.key==="Enter"&&nl.trim()){sLl([].concat(ll,[nl.trim().toUpperCase()]));sNl("");}}} placeholder="Nuovo cliente..." style={sI}/><button onClick={function(){if(nl.trim()){sLl([].concat(ll,[nl.trim().toUpperCase()]));sNl("");}}} style={sB}>+</button></div>
        <div style={{marginTop:12,padding:"10px 14px",background:CL.greyLt,borderRadius:8}}><span style={{fontSize:13,color:CL.greyMd}}>Totale richieste: </span><span style={{fontSize:16,fontWeight:700,color:CL.red}}>{fmtNum(ll.reduce(function(s,c){return s+(bud[c]||0);},0))}</span><span style={{fontSize:12,color:"#888"}}> gg/mese</span></div></div>}

      {tab==="target"&&<div><h4 style={{margin:"0 0 10px",color:CL.red}}>Target mensile OPEX</h4><p style={{fontSize:13,color:CL.greyMd,marginBottom:12}}>Obiettivo giornate fatturabili al mese.</p>
        <div style={{display:"flex",alignItems:"center",gap:10}}><input type="number" min="0" step="1" value={tM||""} onChange={function(e){sTM(parseFloat(e.target.value)||0);}} style={Object.assign({},sI,{flex:"none",width:120,fontSize:20,textAlign:"center",padding:"12px",border:"2px solid "+CL.red,fontWeight:700})}/><span style={{fontSize:14,color:CL.greyMd}}>gg/mese</span></div></div>}

      {tab==="admins"&&<div><h4 style={{margin:"0 0 10px",color:CL.red}}>Admin attivi</h4>
        {al.slice().sort(function(a,b){return a.name.localeCompare(b.name,'it');}).map(function(a){return<div key={a.name} style={{display:"flex",alignItems:"center",gap:8,marginBottom:6,flexWrap:"wrap"}}>
          <span style={{flex:"1 1 140px",padding:"6px 10px",background:CL.greyLt,borderRadius:6,fontSize:14,fontWeight:600}}>{a.name}</span>
          {a.email&&<button onClick={function(){resetPwd(a.name);}} disabled={resetting===a.name} title="Reset password" style={Object.assign({},sReset,{opacity:resetting===a.name?0.5:1})}>{resetting===a.name?"...":"🔑 Reset"}</button>}
          {al.length>1&&<button onClick={function(){sAl(al.filter(function(x){return x.name!==a.name;}));}} style={{background:"none",border:"none",color:CL.red,cursor:"pointer",fontSize:18}}>x</button>}
        </div>;})}
        <h4 style={{margin:"16px 0 10px",color:CL.red}}>Nuovo admin</h4>
        <input value={na} onChange={function(e){sNa(e.target.value);sAm("");}} placeholder="Nome" style={Object.assign({},sI,{width:"100%",marginBottom:8})}/>
        <input type="password" value={np} onChange={function(e){sNp(e.target.value);sAm("");}} placeholder="Password" style={Object.assign({},sIPw,{width:"100%",marginBottom:8})}/>
        <input type="password" value={np2} onChange={function(e){sN2(e.target.value);sAm("");}} onKeyDown={function(e){if(e.key==="Enter")addA();}} placeholder="Conferma" style={Object.assign({},sIPw,{width:"100%",marginBottom:4})}/>
        {am&&<p style={{margin:"8px 0 0",fontSize:13,color:CL.red,fontWeight:600}}>{am}</p>}
        <button onClick={addA} style={Object.assign({},sB,{width:"100%",padding:"10px 0",marginTop:12})}>+ Aggiungi</button></div>}

      {saveErr&&<div style={{marginTop:12,padding:"10px 14px",background:"#FFF3F3",borderRadius:8,border:"1px solid #e53935"}}><span style={{fontSize:13,color:"#e53935",fontWeight:600}}>{saveErr}</span></div>}
      <div style={{display:"flex",gap:10,marginTop:24,borderTop:"1px solid #eee",paddingTop:18}}>
        <button onClick={doSave} disabled={saving} style={Object.assign({},sB,{flex:1,padding:"12px 0",opacity:saving?.5:1})}>{saving?"Salvataggio...":"Salva"}</button>
        <button onClick={onClose} style={sO}>Annulla</button></div></div></div>);
}
