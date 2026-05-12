"use client";
import { useState } from "react";

export var MESI=["Gennaio","Febbraio","Marzo","Aprile","Maggio","Giugno","Luglio","Agosto","Settembre","Ottobre","Novembre","Dicembre"];
export var GIORNI=["Lun","Mar","Mer","Gio","Ven","Sab","Dom"];
export var CL={red:"#C41E2A",redDk:"#9B1520",grey:"#3C3C3C",greyDk:"#2A2A2A",greyMd:"#555",greyLt:"#F2F2F2"};
export var STATI={client:{bg:CL.red,text:"#fff",label:"Cliente OPEX"},busy:{bg:CL.grey,text:"#fff",label:"Altro impegno"},commercial:{bg:"#FF8F00",text:"#fff",label:"Commerciale OPEX"},training:{bg:"#7B1FA2",text:"#fff",label:"Formazione"}};
export var CLIENT_COLORS=["#E53935","#1E88E5","#43A047","#FB8C00","#8E24AA","#00ACC1","#D81B60","#FFB300","#5E35B1","#00897B","#F4511E","#3949AB","#7CB342","#C62828","#0288D1","#6D4C41","#26A69A","#EC407A","#5C6BC0","#2E7D32","#EF6C00","#AB47BC","#00838F","#FDD835","#AD1457","#1565C0","#4CAF50","#FF7043","#7B1FA2","#009688","#E91E63","#2196F3"];
export var FONT="'DM Sans',sans-serif";
export var sI={padding:"9px 12px",borderRadius:8,border:"1px solid #ddd",fontSize:14,fontFamily:FONT,flex:1,minWidth:0,boxSizing:"border-box",textTransform:"uppercase"};
export var sIPw={padding:"9px 12px",borderRadius:8,border:"1px solid #ddd",fontSize:14,fontFamily:FONT,flex:1,minWidth:0,boxSizing:"border-box",textTransform:"none"};
export var sB={padding:"9px 16px",borderRadius:8,border:"none",background:CL.red,color:"#fff",fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:FONT,whiteSpace:"nowrap"};
export var sO={padding:"9px 16px",borderRadius:8,border:"1px solid #ddd",background:"#fff",color:"#555",fontSize:14,cursor:"pointer",fontFamily:FONT};

// Stile delle celle festive: sfondo nero pieno con lettera F bianca centrata.
// Usato in tutte le viste (Calendar, MiniCalendar, Panoramica) per coerenza.
export var HOLIDAY_BG="#000";
export var HOLIDAY_LETTER="F";

// === Password policy (sicurezza/NIS2) ===
export var DEFAULT_PASSWORD="Opex2026";

export function validatePassword(pw){
  if(!pw||pw.length<8)return"La password deve avere almeno 8 caratteri";
  if(pw.length>72)return"La password non puo' superare 72 caratteri";
  if(!/[A-Z]/.test(pw))return"Serve almeno una lettera maiuscola";
  if(!/[a-z]/.test(pw))return"Serve almeno una lettera minuscola";
  if(!/[0-9]/.test(pw))return"Serve almeno un numero";
  if(!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(pw))return"Serve almeno un carattere speciale (!@#$% ecc.)";
  if(pw===DEFAULT_PASSWORD)return"Non puoi usare la password di default";
  return"";
}

export function passwordStrength(pw){
  if(!pw)return 0;
  var s=0;
  if(pw.length>=8)s++;
  if(pw.length>=12)s++;
  if(/[A-Z]/.test(pw)&&/[a-z]/.test(pw))s++;
  if(/[0-9]/.test(pw)&&/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(pw))s++;
  return s;
}

export function getClientColor(clients,clientName){
  if(!clientName||!clients)return CL.grey;
  var idx=clients.indexOf(clientName);if(idx<0)return CL.red;
  return CLIENT_COLORS[idx%CLIENT_COLORS.length];}

export function getHalfBg(half,clients){
  if(!half||!half.status)return "transparent";
  if(half.status==="busy")return CL.grey;
  if(half.status==="commercial")return "#FF8F00";
  if(half.status==="training")return "#7B1FA2";
  if(half.status==="client"&&half.client)return getClientColor(clients,half.client);
  return CL.red;}

export function getInitials(half){
  if(!half||!half.status)return "";
  if(half.status==="busy")return "AI";
  if(half.status==="client"&&half.client){
    var words=half.client.trim().split(/\s+/);
    if(words.length>=2)return (words[0][0]+words[1][0]).toUpperCase();
    return half.client.substring(0,2).toUpperCase();}
  return "";}

export function getUsedClients(entries){
  var used={};if(!entries)return[];
  Object.keys(entries).forEach(function(key){var e=entries[key];if(!e)return;
    ["am","pm"].forEach(function(h){var x=e[h];if(x&&x.status==="client"&&x.client)used[x.client]=true;});});
  return Object.keys(used);}

export function makeKey(y,m,d){return y+"-"+String(m+1).padStart(2,"0")+"-"+String(d).padStart(2,"0");}
export function parseKey(k){var p=k.split("-").map(Number);return{year:p[0],month:p[1]-1,day:p[2]};}
export function daysInMonth(y,m){return new Date(y,m+1,0).getDate();}
export function firstDow(y,m){var d=new Date(y,m,1).getDay();return d===0?6:d-1;}
export function hashPw(s){var h=0;for(var i=0;i<s.length;i++){h=((h<<5)-h)+s.charCodeAt(i);h=h&h;}return"h_"+Math.abs(h).toString(36);}
export function fmtNum(n){return n%1===0?n:n.toFixed(1);}

// ===== Festività =====
// Algoritmo di Gauss/Meeus per il calcolo della Domenica di Pasqua nel
// calendario gregoriano. Restituisce un oggetto {month:0-11, day:1-31}.
function easterSunday(year){
  var a=year%19;
  var b=Math.floor(year/100);
  var c=year%100;
  var d=Math.floor(b/4);
  var e=b%4;
  var f=Math.floor((b+8)/25);
  var g=Math.floor((b-f+1)/3);
  var h=(19*a+b-d-g+15)%30;
  var i=Math.floor(c/4);
  var k=c%4;
  var L=(32+2*e+2*i-h-k)%7;
  var m=Math.floor((a+11*h+22*L)/451);
  var mo=Math.floor((h+L-7*m+114)/31);
  var da=((h+L-7*m+114)%31)+1;
  return {month:mo-1,day:da};
}

// Festivita' nazionali italiane fisse: [month0,day,label].
// Pasqua e Pasquetta sono variabili e gestite a parte in getHolidayName.
var FIXED_NATIONAL_HOLIDAYS=[
  [0,1,"Capodanno"],
  [0,6,"Epifania"],
  [3,25,"Festa della Liberazione"],
  [4,1,"Festa dei Lavoratori"],
  [5,2,"Festa della Repubblica"],
  [7,15,"Ferragosto"],
  [10,1,"Ognissanti"],
  [11,8,"Immacolata Concezione"],
  [11,25,"Natale"],
  [11,26,"Santo Stefano"]
];

// Estrae il campo "date" da un elemento di customHolidays.
// Accetta sia stringa "YYYY-MM-DD" sia oggetto {date:"YYYY-MM-DD",label:"..."}.
function customDate(h){
  if(typeof h==="string")return h;
  if(h&&typeof h==="object"&&h.date)return h.date;
  return "";
}
function customLabel(h){
  if(h&&typeof h==="object"&&h.label)return h.label;
  return "";
}

// Nome leggibile della festivita' (se la data e' festiva), altrimenti "".
// Ordine di precedenza: nazionale fissa > Pasqua/Pasquetta > personalizzata.
export function getHolidayName(year,month,day,customHolidays){
  for(var i=0;i<FIXED_NATIONAL_HOLIDAYS.length;i++){
    var h=FIXED_NATIONAL_HOLIDAYS[i];
    if(h[0]===month&&h[1]===day)return h[2];
  }
  var es=easterSunday(year);
  if(es.month===month&&es.day===day)return "Pasqua";
  // Lunedi' dell'Angelo = Pasqua + 1 giorno
  var dt=new Date(year,es.month,es.day);dt.setDate(dt.getDate()+1);
  if(dt.getFullYear()===year&&dt.getMonth()===month&&dt.getDate()===day)return "Lunedi' dell'Angelo";
  if(customHolidays&&customHolidays.length){
    var key=makeKey(year,month,day);
    for(var j=0;j<customHolidays.length;j++){
      if(customDate(customHolidays[j])===key)return customLabel(customHolidays[j])||"Festivita' personalizzata";
    }
  }
  return "";
}

// True se la data e' festiva (nazionale fissa, Pasqua/Pasquetta o personalizzata).
export function isHoliday(year,month,day,customHolidays){
  return getHolidayName(year,month,day,customHolidays)!=="";
}

// Giorni lavorativi del mese: lun-ven, esclusi i festivi.
// Sabato e domenica non sono mai contati; i festivi che cadono in giorni feriali
// riducono il conteggio.
export function countWorkDays(year,month,customHolidays){
  var days=daysInMonth(year,month);
  var fd=firstDow(year,month);
  var count=0;
  for(var d=1;d<=days;d++){
    var dow=(fd+d-1)%7;
    if(dow>=5)continue;
    if(isHoliday(year,month,d,customHolidays))continue;
    count++;
  }
  return count;
}

// Giorni lavorativi in un intervallo [startDay..endDay] dello stesso mese.
// Stessa regola di countWorkDays: solo lun-ven non festivi.
export function countWorkDaysInRange(year,month,startDay,endDay,customHolidays){
  var fd=firstDow(year,month);
  var count=0;
  for(var d=startDay;d<=endDay;d++){
    var dow=(fd+d-1)%7;
    if(dow>=5)continue;
    if(isHoliday(year,month,d,customHolidays))continue;
    count++;
  }
  return count;
}

// Elenco di tutte le festivita' (nazionali + personalizzate) di un dato anno,
// ordinate per data crescente. Ogni voce: {date,label,isCustom}. Usato dal
// pannello informativo in Impostazioni.
export function listHolidaysForYear(year,customHolidays){
  var out=[];
  for(var m=0;m<12;m++){
    for(var d=1;d<=daysInMonth(year,m);d++){
      var name=getHolidayName(year,m,d,[]);
      if(name)out.push({date:makeKey(year,m,d),label:name,isCustom:false});
    }
  }
  if(customHolidays&&customHolidays.length){
    customHolidays.forEach(function(h){
      var dt=customDate(h);if(!dt)return;
      if(dt.substring(0,4)!==String(year))return;
      var p=parseKey(dt);
      // Se la data e' gia' coperta da una nazionale non duplichiamo
      if(getHolidayName(p.year,p.month,p.day,[]))return;
      out.push({date:dt,label:customLabel(h)||"Festivita' personalizzata",isCustom:true});
    });
  }
  out.sort(function(a,b){return a.date<b.date?-1:a.date>b.date?1:0;});
  return out;
}

export function calcAllActuals(entries,consultants){
  var r={};consultants.forEach(function(n){var cE=entries[n]||{};Object.keys(cE).forEach(function(key){
    var e=cE[key];if(!e)return;["am","pm"].forEach(function(h){var x=e[h];if(!x||!x.status||x.status!=="client"||!x.client)return;
    if(!r[x.client])r[x.client]=0;r[x.client]+=0.5;});});});return r;}

export function calcMonthActuals(entries,consultants,year,month){
  var r={byClient:{},totalClient:0,totalBusy:0,totalCommercial:0,totalTraining:0};
  consultants.forEach(function(n){var cE=entries[n]||{};for(var d=1;d<=daysInMonth(year,month);d++){var e=cE[makeKey(year,month,d)];if(!e)continue;
    ["am","pm"].forEach(function(h){var x=e[h];if(!x||!x.status)return;if(x.status==="client"){r.totalClient+=0.5;if(x.client)r.byClient[x.client]=(r.byClient[x.client]||0)+0.5;}else if(x.status==="busy")r.totalBusy+=0.5;else if(x.status==="commercial")r.totalCommercial+=0.5;else if(x.status==="training")r.totalTraining+=0.5;});}});return r;}

// Restituisce la Date della prima giornata in agenda per il cliente indicato
// (mezza giornata o intera, su qualsiasi consulente). Null se non esistono giornate.
// Usato da calcContractTotal per ancorare l'inizio del conteggio al primo
// impegno reale invece che al mese corrente.
export function findClientFirstEntry(clientName,entries,consultants){
  if(!clientName||!entries||!consultants)return null;
  var earliest=null;
  consultants.forEach(function(n){
    var cE=entries[n]||{};
    Object.keys(cE).forEach(function(key){
      var e=cE[key];if(!e)return;
      var hit=false;
      ["am","pm"].forEach(function(h){
        var x=e[h];
        if(x&&x.status==="client"&&x.client===clientName)hit=true;
      });
      if(hit){
        var info=parseKey(key);
        var dt=new Date(info.year,info.month,info.day);
        if(!earliest||dt<earliest)earliest=dt;
      }
    });
  });
  return earliest;
}

// GG contratto = budget * mesi tra il mese di inizio conteggio e la data fine.
// Mese di inizio conteggio:
//   - mese della prima giornata in agenda per il cliente (firstEntryDate),
//   - oppure mese corrente se non esistono giornate (firstEntryDate null).
// Niente filtro sui contratti scaduti: anche per i contratti gia' chiusi viene
// mostrato il totale storico dimensionato sulla durata effettiva del contratto.
export function calcContractTotal(budget,endDate,firstEntryDate){
  if(!budget||!endDate)return 0;
  var end=new Date(endDate);
  var startBase=firstEntryDate?firstEntryDate:new Date();
  var d=new Date(startBase.getFullYear(),startBase.getMonth(),1);
  if(end<d)return 0;
  var months=0;
  while(d<=end){months++;d.setMonth(d.getMonth()+1);}
  return budget*months;
}

// Cliente attivo nel mese M dell'anno Y se la data fine contratto e' >= primo giorno di M.
// Contratto a meta' mese: il mese e' considerato attivo a budget pieno (gg/mese intere).
// Senza data fine contratto: trattato come sempre attivo (retro-compatibilita').
export function isClientActiveInMonth(endDate,year,month){
  if(!endDate)return true;var end=new Date(endDate);if(isNaN(end.getTime()))return true;
  var firstOfMonth=new Date(year,month,1);return end>=firstOfMonth;}

// Somma dei gg/mese dei soli clienti attivi nel mese M dell'anno Y.
// Clienti con contratto gia' scaduto al mese M non contribuiscono.
export function calcMonthlyPlanned(clients,clientBudgets,clientEndDates,year,month){
  var bud=clientBudgets||{},ends=clientEndDates||{};
  return (clients||[]).reduce(function(s,c){
    if(!isClientActiveInMonth(ends[c],year,month))return s;
    return s+(bud[c]||0);},0);}

export var EMPTY={consultants:[],clients:[],clientBudgets:{},clientEndDates:{},consultantEmails:{},entries:{},admins:[],targetMensile:0,userFlags:{},customHolidays:[]};

export async function loadAll(){try{var res=await fetch("/api/data?t="+Date.now());if(!res.ok)return Object.assign({},EMPTY);var d=await res.json();return Object.assign({},EMPTY,d);}catch(e){return Object.assign({},EMPTY);}}
export async function saveAll(fd){try{var res=await fetch("/api/data",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(fd)});var r=await res.json();return r.ok;}catch(e){return false;}}

export function Logo(p){return(<img src="/Logo_Opex.jpg" alt="OPEX" style={{height:p.h||36,objectFit:"contain"}}/>);}

export function Legenda(p){
  var clients=p.clients||[],entries=p.entries||{};
  var used=getUsedClients(entries);
  var hasBusy=false,hasComm=false,hasTrain=false;
  Object.keys(entries).forEach(function(key){var e=entries[key];if(!e)return;
    ["am","pm"].forEach(function(h){if(e[h]&&e[h].status==="busy")hasBusy=true;if(e[h]&&e[h].status==="commercial")hasComm=true;if(e[h]&&e[h].status==="training")hasTrain=true;});});
  return(<div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:16,alignItems:"center"}}>
    {used.map(function(c){return<div key={c} style={{display:"flex",alignItems:"center",gap:4}}>
      <div style={{width:13,height:13,borderRadius:4,background:getClientColor(clients,c)}}/><span style={{fontSize:11,color:CL.greyMd}}>{c}</span></div>;})}
    {hasBusy&&<div style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:13,height:13,borderRadius:4,background:CL.grey}}/><span style={{fontSize:11,color:CL.greyMd}}>Altro impegno</span></div>}
    {hasComm&&<div style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:13,height:13,borderRadius:4,background:"#FF8F00"}}/><span style={{fontSize:11,color:CL.greyMd}}>Commerciale OPEX</span></div>}
    {hasTrain&&<div style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:13,height:13,borderRadius:4,background:"#7B1FA2"}}/><span style={{fontSize:11,color:CL.greyMd}}>Formazione</span></div>}
    <div style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:13,height:13,borderRadius:4,background:HOLIDAY_BG,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:9,fontWeight:700,fontFamily:FONT,lineHeight:1}}>{HOLIDAY_LETTER}</div><span style={{fontSize:11,color:CL.greyMd}}>Festivo</span></div>
  </div>);
}
