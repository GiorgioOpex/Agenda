"use client";
import { useState, useMemo } from "react";
import { MESI, CL, FONT, sI, sO, fmtNum, calcMonthActuals, calcMonthlyPlanned, isClientActiveInMonth, makeKey, daysInMonth, firstDow, isHoliday } from "./shared";

function getWeeksOfMonth(year,month){
  var days=daysInMonth(year,month),fd=firstDow(year,month),weeks=[];
  var wStart=1,wNum=1;
  for(var d=1;d<=days;d++){var dow=(fd+d-1)%7;if(dow===0&&d>1){weeks.push({num:wNum,start:wStart,end:d-1});wNum++;wStart=d;}}
  weeks.push({num:wNum,start:wStart,end:days});return weeks;}

function isoWeek(year,month,day){
  var jan1=new Date(year,0,1);
  var dt=new Date(year,month,day);
  var jan1dow=jan1.getDay()||7;
  var dayOfYear=Math.round((dt-jan1)/86400000)+1;
  var firstMonday=jan1dow===1?1:(9-jan1dow);
  var wk=Math.floor((dayOfYear-firstMonday)/7)+1;
  return wk<1?1:wk;}

// workDays: lun-ven esclusi festivi.
// actual (effettive): lun-sab esclusi festivi (sabato incluso nelle effettive).
function calcWeekActuals(entries,consultants,year,month,startDay,endDay,customHolidays){
  var fd=firstDow(year,month),tot=0,workHalves=0,totTrain=0;
  for(var d=startDay;d<=endDay;d++){
    var dow=(fd+d-1)%7;
    var isSun=dow===6;
    var isHol=isHoliday(year,month,d,customHolidays||[]);
    if(dow<5&&!isHol)workHalves+=2;
    if(!isSun&&!isHol){
      consultants.forEach(function(n){var cE=entries[n]||{};var e=cE[makeKey(year,month,d)];if(!e)return;
        ["am","pm"].forEach(function(h){var x=e[h];
          if(x&&x.status==="client")tot+=0.5;
          if(x&&x.status==="training")totTrain+=0.5;});});}}
  return{actual:tot,workDays:workHalves/2,training:totTrain};}

// monthlyPlanned: array di 12 elementi, una "previste" per ciascun mese
// gia' filtrata sui contratti attivi in quel mese.
function calcYTD(entries,consultants,year,upToMonth,upToWeekEnd,monthlyPlanned,target,customHolidays){
  var totActual=0,totPlanned=0,totTarget=0;
  for(var mi=0;mi<=upToMonth;mi++){var planned=monthlyPlanned[mi]||0;
    if(mi<upToMonth){var a=calcMonthActuals(entries,consultants,year,mi);totActual+=a.totalClient;totPlanned+=planned;totTarget+=target;}
    else{var fd=firstDow(year,mi),days=daysInMonth(year,mi),wdM=0;for(var d=1;d<=days;d++){if((fd+d-1)%7<5&&!isHoliday(year,mi,d,customHolidays||[]))wdM++;}
      var wdU=0;for(var d2=1;d2<=upToWeekEnd;d2++){if((fd+d2-1)%7<5&&!isHoliday(year,mi,d2,customHolidays||[]))wdU++;}
      var ratio=wdM>0?wdU/wdM:0;totPlanned+=planned*ratio;totTarget+=target*ratio;
      var a2=calcWeekActuals(entries,consultants,year,mi,1,upToWeekEnd,customHolidays);totActual+=a2.actual;}}
  return{actual:totActual,planned:totPlanned,target:totTarget};}

function CumulativeChart(p){
  var months=p.months,target=p.target,monthlyPlanned=p.monthlyPlanned,cM=p.cM,year=p.year;
  var cumT=[],cumP=[],cumA=[],ct=0,cp=0,ca=0;
  for(var i=0;i<12;i++){ct+=target;cp+=(monthlyPlanned[i]||0);ca+=months[i].actual;cumT.push(ct);cumP.push(cp);cumA.push(ca);}
  var maxC=Math.max(cumT[11]||1,cumP[11]||1,cumA[cM]||1);
  var W=680,H=200,pL=45,pR=10,pT=10,pB=30,gW=W-pL-pR,gH=H-pT-pB;
  function xP(i){return pL+i*(gW/11);}function yP(v){return pT+gH-((v/maxC)*gH);}
  function pts(arr,upTo){var r=[];for(var i=0;i<=upTo;i++)r.push(xP(i)+","+yP(arr[i]));return r.join(" ");}
  var gridEls=[];var steps=5;
  for(var g=0;g<=steps;g++){var gy=pT+(gH/steps)*g;var gv=Math.round(maxC-((maxC/steps)*g));
    gridEls.push(<line key={"gl"+g} x1={pL} y1={gy} x2={W-pR} y2={gy} stroke="#eee" strokeWidth={1}/>);
    gridEls.push(<text key={"gt"+g} x={pL-6} y={gy+4} textAnchor="end" fontSize={9} fill="#999">{fmtNum(gv)}</text>);}
  var lbls=[];for(var j=0;j<12;j++)lbls.push(<text key={"lb"+j} x={xP(j)} y={H-8} textAnchor="middle" fontSize={9} fill={j===cM?CL.red:"#999"} fontWeight={j===cM?700:400}>{MESI[j].substring(0,3)}</text>);
  var dotsA=[];for(var k=0;k<=cM;k++)dotsA.push(<circle key={"da"+k} cx={xP(k)} cy={yP(cumA[k])} r={3} fill={CL.grey}/>);
  return(<div style={{background:"#fff",borderRadius:12,padding:20,border:"1px solid #eee",marginBottom:16}}>
    <h4 style={{margin:"0 0 16px",color:CL.greyDk,fontSize:14}}>Progressivo cumulato {year}</h4>
    <div style={{display:"flex",gap:16,marginBottom:12,fontSize:12}}>
      <div style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:20,height:3,background:CL.red,borderRadius:2}}/><span>Target</span></div>
      <div style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:20,height:3,background:"#2E7D32",borderRadius:2}}/><span>Previste</span></div>
      <div style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:20,height:3,background:CL.grey,borderRadius:2}}/><span>Effettive</span></div></div>
    <svg viewBox={"0 0 "+W+" "+H} style={{width:"100%",height:"auto",maxHeight:220}}>
      {gridEls}{lbls}
      <polyline points={pts(cumT,11)} fill="none" stroke={CL.red} strokeWidth={2.5} strokeDasharray="6,4" strokeLinecap="round" strokeLinejoin="round"/>
      <polyline points={pts(cumP,11)} fill="none" stroke="#2E7D32" strokeWidth={2.5} strokeDasharray="6,4" strokeLinecap="round" strokeLinejoin="round"/>
      <polyline points={pts(cumA,cM)} fill="none" stroke={CL.grey} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"/>
      {dotsA}<circle cx={xP(cM)} cy={yP(cumA[cM])} r={5} fill={CL.grey} stroke="#fff" strokeWidth={2}/>
    </svg>
    <p style={{marginTop:8,fontSize:11,color:"#aaa"}}>Tratteggiate = proiezione. Continua = effettivo fino a {MESI[cM]}</p></div>);}

function generateWeeklyMail(data,year,wMo,weeks,monthlyPlanned,target,months,cM){
  var today=new Date();var todayD=today.getDate();var todayM=today.getMonth();
  var prevWeek=null;
  for(var wi=weeks.length-1;wi>=0;wi--){if(wMo<todayM||(wMo===todayM&&weeks[wi].end<todayD)){prevWeek=weeks[wi];break;}}
  if(!prevWeek)prevWeek=weeks[weeks.length-1];
  var yr2=String(year).substring(2);
  var ytdActual=months.reduce(function(s,m,i){return i<=cM?s+m.actual:s;},0);
  var ytdPlanned=monthlyPlanned.reduce(function(s,p,i){return i<=cM?s+p:s;},0);
  var ytdTarget=target*(cM+1);
  var ytdPct=ytdTarget>0?Math.round((ytdActual/ytdTarget)*100):0;
  var delta=prevWeek.actual-prevWeek.target;
  var lines=[];
  lines.push("REPORT SETTIMANALE OPEX");
  lines.push(MESI[wMo]+" "+year);
  lines.push("Generato il "+today.toLocaleDateString("it-IT"));
  lines.push("");
  lines.push("=== SITUAZIONE YTD (Gennaio - "+MESI[cM]+") ===");
  lines.push("");
  lines.push("Target YTD: "+fmtNum(ytdTarget)+" gg");
  lines.push("Previste YTD: "+fmtNum(ytdPlanned)+" gg");
  lines.push("Effettive YTD: "+fmtNum(ytdActual)+" gg");
  lines.push("Raggiungimento: "+ytdPct+"%");
  lines.push("");
  lines.push("=== SETTIMANA PRECEDENTE: Sett. "+prevWeek.isoW+"/"+yr2+" ("+prevWeek.start+"-"+prevWeek.end+" "+MESI[wMo].substring(0,3)+") ===");
  lines.push("");
  lines.push("Giorni lavorativi: "+fmtNum(prevWeek.workDays)+" gg");
  lines.push("Target: "+fmtNum(prevWeek.target)+" gg");
  lines.push("Previste: "+fmtNum(prevWeek.planned)+" gg");
  lines.push("Effettive: "+fmtNum(prevWeek.actual)+" gg");
  lines.push("Formazione API: "+fmtNum(prevWeek.training||0)+" gg");
  lines.push("Delta: "+(delta>=0?"+":"")+fmtNum(delta)+" gg");
  lines.push("");
  lines.push("=== DETTAGLIO SETTIMANE "+MESI[wMo].toUpperCase()+" "+year+" ===");
  lines.push("");
  weeks.forEach(function(w){var d=w.actual-w.target;
    lines.push("Sett. "+w.isoW+"/"+yr2+" ("+w.start+"-"+w.end+") | GG lav: "+fmtNum(w.workDays)+" | Target: "+fmtNum(w.target)+" | Prev: "+fmtNum(w.planned)+" | Eff: "+fmtNum(w.actual)+" | Form. API: "+fmtNum(w.training||0)+" | Delta: "+(d>=0?"+":"")+fmtNum(d));});
  lines.push("");
  lines.push("---");
  lines.push("OPEX Solutions - Report generato automaticamente");
  var subject="Report Settimanale OPEX - Sett. "+prevWeek.isoW+"/"+yr2+" - "+MESI[wMo]+" "+year;
  window.location.href="mailto:?subject="+encodeURIComponent(subject)+"&body="+lines.join("%0D%0A");
}

export function Dashboard(p){
  var data=p.data,year=p.year,target=data.targetMensile||0;
  var clients=data.clients||[];
  var clientBudgets=data.clientBudgets||{};
  var clientEndDates=data.clientEndDates||{};
  var customHolidays=data.customHolidays||[];
  var cM=new Date().getMonth();
  var vs=useState("monthly"),viewMode=vs[0],sViewMode=vs[1];
  var ws=useState(null),selWeek=ws[0],sSelWeek=ws[1];
  var sms=useState(null),selMonth=sms[0],sSelMonth=sms[1];
  var wms=useState(cM),wMo=wms[0],sWMo=wms[1];

  // Array delle giornate previste per ciascuno dei 12 mesi: somma dei gg/mese
  // dei soli clienti il cui contratto e' ancora attivo nel mese specifico.
  // I clienti con contratto scaduto prima del primo giorno del mese contano 0.
  var monthlyPlanned=useMemo(function(){var arr=[];for(var mi=0;mi<12;mi++){arr.push(calcMonthlyPlanned(clients,clientBudgets,clientEndDates,year,mi));}return arr;},[clients,clientBudgets,clientEndDates,year]);

  var months=useMemo(function(){return MESI.map(function(nome,mi){var a=calcMonthActuals(data.entries,data.consultants,year,mi);return{nome:nome.substring(0,3),actual:a.totalClient,planned:monthlyPlanned[mi]||0,target:target,byClient:a.byClient};});},[data,year,target,monthlyPlanned]);

  var weeks=useMemo(function(){var wks=getWeeksOfMonth(year,wMo);var pWMo=monthlyPlanned[wMo]||0;return wks.map(function(w){var wa=calcWeekActuals(data.entries,data.consultants,year,wMo,w.start,w.end,customHolidays);
    var pR=wa.workDays>0?pWMo*(wa.workDays/20):0;var tR=wa.workDays>0?target*(wa.workDays/20):0;
    var iw=isoWeek(year,wMo,w.start);
    return{num:w.num,start:w.start,end:w.end,actual:wa.actual,planned:pR,target:tR,workDays:wa.workDays,training:wa.training,isoW:iw};});},[data,year,wMo,monthlyPlanned,target,customHolidays]);

  var ytdData=useMemo(function(){if(selWeek===null)return null;var w=weeks[selWeek];if(!w)return null;
    return calcYTD(data.entries,data.consultants,year,wMo,w.end,monthlyPlanned,target,customHolidays);},[selWeek,data,year,wMo,weeks,monthlyPlanned,target,customHolidays]);

  var maxPlanned=monthlyPlanned.length>0?Math.max.apply(null,monthlyPlanned):0;
  var mxM=Math.max(target,maxPlanned,Math.max.apply(null,months.map(function(m){return m.actual;})))||1;
  var mxW=weeks.length>0?Math.max(Math.max.apply(null,weeks.map(function(w){return Math.max(w.actual,w.planned,w.target);})),1):1;
  var ytdActual=months.reduce(function(s,m,i){return i<=cM?s+m.actual:s;},0);
  var ytdPlanned=monthlyPlanned.reduce(function(s,p,i){return i<=cM?s+p:s;},0);
  var ytdTarget=target*(cM+1);

  return(<div>
    <div style={{display:"flex",gap:8,marginBottom:20}}>
      <button onClick={function(){sViewMode("monthly");sSelWeek(null);sSelMonth(null);}} style={{padding:"8px 18px",borderRadius:8,border:"none",fontSize:13,fontWeight:viewMode==="monthly"?700:400,cursor:"pointer",fontFamily:FONT,background:viewMode==="monthly"?CL.red:"#f0f0f0",color:viewMode==="monthly"?"#fff":CL.greyMd}}>Mensile</button>
      <button onClick={function(){sViewMode("weekly");sSelWeek(null);sSelMonth(null);}} style={{padding:"8px 18px",borderRadius:8,border:"none",fontSize:13,fontWeight:viewMode==="weekly"?700:400,cursor:"pointer",fontFamily:FONT,background:viewMode==="weekly"?CL.red:"#f0f0f0",color:viewMode==="weekly"?"#fff":CL.greyMd}}>Settimanale</button></div>

    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:12,marginBottom:20}}>
      <div style={{padding:"12px 16px",background:"#FFF3F3",borderRadius:10,border:"1px solid "+CL.red}}><div style={{fontSize:11,color:CL.greyMd}}>Target YTD</div><div style={{fontSize:22,fontWeight:700,color:CL.red}}>{fmtNum(ytdTarget)}</div></div>
      <div style={{padding:"12px 16px",background:"#E8F5E9",borderRadius:10,border:"1px solid #A5D6A7"}}><div style={{fontSize:11,color:CL.greyMd}}>Previste YTD</div><div style={{fontSize:22,fontWeight:700,color:"#2E7D32"}}>{fmtNum(ytdPlanned)}</div></div>
      <div style={{padding:"12px 16px",background:CL.greyLt,borderRadius:10,border:"1px solid #ddd"}}><div style={{fontSize:11,color:CL.greyMd}}>Effettive YTD</div><div style={{fontSize:22,fontWeight:700,color:CL.greyDk}}>{fmtNum(ytdActual)}</div></div>
      <div style={{padding:"12px 16px",background:ytdActual>=ytdTarget?"#E8F5E9":"#FFF3F3",borderRadius:10,border:"1px solid "+(ytdActual>=ytdTarget?"#A5D6A7":CL.red)}}><div style={{fontSize:11,color:CL.greyMd}}>Raggiungimento YTD</div><div style={{fontSize:22,fontWeight:700,color:ytdActual>=ytdTarget?"#2E7D32":CL.red}}>{ytdTarget>0?Math.round((ytdActual/ytdTarget)*100):0}%</div></div></div>

    {viewMode==="monthly"&&<CumulativeChart months={months} target={target} monthlyPlanned={monthlyPlanned} cM={cM} year={year}/>}

    {viewMode==="monthly"&&<div>
      {function(){var mi=selMonth!==null?selMonth:cM;var m=months[mi];var lbl=selMonth!==null?MESI[selMonth]:MESI[cM];
        return<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:12,marginBottom:20}}>
          <div style={{padding:"14px 18px",background:"#FFF3F3",borderRadius:12,border:"1px solid "+CL.red}}><div style={{fontSize:11,color:CL.greyMd}}>Target {lbl}</div><div style={{fontSize:28,fontWeight:700,color:CL.red}}>{fmtNum(target)}</div></div>
          <div style={{padding:"14px 18px",background:"#E8F5E9",borderRadius:12,border:"1px solid #A5D6A7"}}><div style={{fontSize:11,color:CL.greyMd}}>Richieste {lbl}</div><div style={{fontSize:28,fontWeight:700,color:"#2E7D32"}}>{fmtNum(m.planned)}</div></div>
          <div style={{padding:"14px 18px",background:CL.greyLt,borderRadius:12,border:"1px solid #ddd"}}><div style={{fontSize:11,color:CL.greyMd}}>Effettive {lbl}</div><div style={{fontSize:28,fontWeight:700,color:CL.greyDk}}>{fmtNum(m.actual)}</div></div>
          <div style={{padding:"14px 18px",background:m.actual>=target?"#E8F5E9":"#FFF3F3",borderRadius:12,border:"1px solid "+(m.actual>=target?"#A5D6A7":CL.red)}}><div style={{fontSize:11,color:CL.greyMd}}>vs Target</div><div style={{fontSize:28,fontWeight:700,color:m.actual>=target?"#2E7D32":CL.red}}>{target>0?Math.round((m.actual/target)*100):0}%</div></div></div>;}()}
      <div style={{background:"#fff",borderRadius:12,padding:20,border:"1px solid #eee",marginBottom:16}}>
        <h4 style={{margin:"0 0 16px",color:CL.greyDk,fontSize:14}}>Andamento mensile {year}</h4>
        <div style={{display:"flex",gap:16,marginBottom:16,fontSize:12}}>
          <div style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:12,height:12,background:CL.red,borderRadius:2}}/><span>Target</span></div>
          <div style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:12,height:12,background:"#2E7D32",borderRadius:2}}/><span>Richieste</span></div>
          <div style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:12,height:12,background:CL.grey,borderRadius:2}}/><span>Effettive</span></div></div>
        <div style={{display:"flex",alignItems:"flex-end",gap:4,height:210,overflowX:"auto"}}>{months.map(function(m,i){return(<div key={m.nome} onClick={function(){sSelMonth(selMonth===i?null:i);}} style={{flex:1,minWidth:50,display:"flex",flexDirection:"column",alignItems:"center",opacity:i>cM?.4:1,cursor:i<=cM?"pointer":"default",padding:"2px",borderRadius:6,background:selMonth===i?"#FFF8F0":"transparent",border:selMonth===i?"1px solid #F0C040":"1px solid transparent"}}>
          <div style={{display:"flex",gap:2,alignItems:"flex-end",height:180}}>
            <div style={{width:10,height:Math.max(2,(target/mxM)*180),background:CL.red,borderRadius:"2px 2px 0 0"}}/>
            <div style={{width:10,height:Math.max(2,(m.planned/mxM)*180),background:"#2E7D32",borderRadius:"2px 2px 0 0"}}/>
            <div style={{width:10,height:Math.max(2,(m.actual/mxM)*180),background:CL.grey,borderRadius:"2px 2px 0 0"}}/></div>
          <div style={{fontSize:10,color:i===cM?CL.red:selMonth===i?"#FF8F00":"#888",fontWeight:i===cM||selMonth===i?700:400,marginTop:4}}>{m.nome}</div></div>);})}</div>
        <p style={{marginTop:12,fontSize:11,color:"#aaa"}}>Clicca su un mese per il dettaglio</p></div>
      {selMonth!==null&&selMonth<=cM&&(data.clients||[]).length>0&&<div style={{background:"#fff",borderRadius:12,padding:20,border:"1px solid #F0C040",marginBottom:16}}>
        <h4 style={{margin:"0 0 12px",color:CL.greyDk,fontSize:14}}>Dettaglio per cliente — {MESI[selMonth]} {year}</h4>
        <div style={{overflowX:"auto"}}><table style={{borderCollapse:"collapse",width:"100%",fontSize:13,fontFamily:FONT}}>
          <thead><tr style={{background:"#FFF8F8"}}>
            <th style={{padding:"8px 14px",borderBottom:"2px solid "+CL.red,textAlign:"left"}}>Cliente</th>
            <th style={{padding:"8px",borderBottom:"2px solid "+CL.red,textAlign:"center"}}>Previste</th>
            <th style={{padding:"8px",borderBottom:"2px solid "+CL.red,textAlign:"center"}}>Effettive</th>
            <th style={{padding:"8px",borderBottom:"2px solid "+CL.red,textAlign:"center"}}>Delta</th></tr></thead>
          <tbody>{(data.clients||[]).map(function(c){var eff=months[selMonth].byClient[c]||0;var active=isClientActiveInMonth(clientEndDates[c],year,selMonth);var bud=active?(clientBudgets[c]||0):0;var diff=eff-bud;
            return<tr key={c}><td style={{padding:"8px 14px",borderBottom:"1px solid #eee",fontWeight:600,color:CL.greyDk,textAlign:"left"}}>{c}{!active&&<span style={{marginLeft:6,fontSize:10,color:CL.red,fontWeight:700}}>(scaduto)</span>}</td>
              <td style={{padding:"8px",borderBottom:"1px solid #eee",textAlign:"center"}}>{fmtNum(bud)}</td>
              <td style={{padding:"8px",borderBottom:"1px solid #eee",textAlign:"center",fontWeight:700,color:CL.red}}>{fmtNum(eff)}</td>
              <td style={{padding:"8px",borderBottom:"1px solid #eee",textAlign:"center",fontWeight:700,color:diff>=0?"#2E7D32":CL.red}}>{(diff>=0?"+":"")+fmtNum(diff)}</td></tr>;})}
          <tr style={{background:"#FFF8F8"}}><td style={{padding:"8px 14px",borderTop:"2px solid "+CL.red,fontWeight:700,color:CL.greyDk}}>TOTALE</td>
            <td style={{padding:"8px",borderTop:"2px solid "+CL.red,textAlign:"center",fontWeight:700}}>{fmtNum(months[selMonth].planned)}</td>
            <td style={{padding:"8px",borderTop:"2px solid "+CL.red,textAlign:"center",fontWeight:700,color:CL.red}}>{fmtNum(months[selMonth].actual)}</td>
            <td style={{padding:"8px",borderTop:"2px solid "+CL.red,textAlign:"center",fontWeight:700,color:months[selMonth].actual-months[selMonth].planned>=0?"#2E7D32":CL.red}}>{(months[selMonth].actual-months[selMonth].planned>=0?"+":"")+fmtNum(months[selMonth].actual-months[selMonth].planned)}</td></tr>
        </tbody></table></div></div>}
      </div>}

    {viewMode==="weekly"&&<div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"center",marginBottom:16,gap:12}}>
        <button onClick={function(){sSelWeek(null);sWMo(wMo===0?11:wMo-1);}} style={{background:"#fff",border:"1px solid #ddd",borderRadius:8,padding:"6px 12px",cursor:"pointer",fontSize:18}}>&#8249;</button>
        <h2 style={{margin:0,fontSize:18,color:CL.greyDk,minWidth:180,textAlign:"center"}}>{MESI[wMo]} {year}</h2>
        <button onClick={function(){sSelWeek(null);sWMo(wMo===11?0:wMo+1);}} style={{background:"#fff",border:"1px solid #ddd",borderRadius:8,padding:"6px 12px",cursor:"pointer",fontSize:18}}>&#8250;</button>
      </div>
      <div style={{background:"#fff",borderRadius:12,padding:20,border:"1px solid #eee",marginBottom:16}}>
        <div style={{display:"flex",gap:16,marginBottom:16,fontSize:12}}>
          <div style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:12,height:12,background:CL.red,borderRadius:2}}/><span>Target</span></div>
          <div style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:12,height:12,background:"#2E7D32",borderRadius:2}}/><span>Previste</span></div>
          <div style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:12,height:12,background:CL.grey,borderRadius:2}}/><span>Effettive</span></div></div>
        <div style={{display:"flex",alignItems:"flex-end",gap:8,height:210,overflowX:"auto"}}>{weeks.map(function(w,i){var yr2=String(year).substring(2);return(<div key={w.num} onClick={function(){sSelWeek(selWeek===i?null:i);}} style={{flex:1,minWidth:70,display:"flex",flexDirection:"column",alignItems:"center",cursor:"pointer",padding:"4px",borderRadius:8,background:selWeek===i?"#FFF8F0":"transparent",border:selWeek===i?"1px solid #F0C040":"1px solid transparent"}}>
          <div style={{display:"flex",gap:3,alignItems:"flex-end",height:170}}>
            <div style={{width:14,height:Math.max(2,(w.target/mxW)*170),background:CL.red,borderRadius:"2px 2px 0 0"}}/>
            <div style={{width:14,height:Math.max(2,(w.planned/mxW)*170),background:"#2E7D32",borderRadius:"2px 2px 0 0"}}/>
            <div style={{width:14,height:Math.max(2,(w.actual/mxW)*170),background:CL.grey,borderRadius:"2px 2px 0 0"}}/></div>
          <div style={{fontSize:11,color:selWeek===i?CL.red:CL.greyMd,fontWeight:selWeek===i?700:400,marginTop:6}}>{w.isoW+"/"+yr2}</div>
          <div style={{fontSize:9,color:"#aaa"}}>{w.start}-{w.end}</div></div>);})}</div>
        <p style={{marginTop:12,fontSize:11,color:"#aaa"}}>Clicca su una settimana per la situazione YTD</p></div>
      <div style={{overflowX:"auto",marginBottom:16}}><table style={{borderCollapse:"collapse",width:"100%",fontSize:13,fontFamily:FONT}}>
        <thead><tr style={{background:"#FFF8F8"}}><th style={{padding:"8px 14px",borderBottom:"2px solid "+CL.red,textAlign:"left"}}>Settimana</th><th style={{padding:"8px",borderBottom:"2px solid "+CL.red}}>GG lav.</th><th style={{padding:"8px",borderBottom:"2px solid "+CL.red}}>Target</th><th style={{padding:"8px",borderBottom:"2px solid "+CL.red}}>Previste</th><th style={{padding:"8px",borderBottom:"2px solid "+CL.red}}>Effettive</th><th style={{padding:"8px",borderBottom:"2px solid "+CL.red,color:"#7B1FA2"}}>Form. API</th><th style={{padding:"8px",borderBottom:"2px solid "+CL.red}}>Delta</th></tr></thead>
        <tbody>{weeks.map(function(w,i){var delta=w.actual-w.target;var yr2=String(year).substring(2);return(<tr key={w.num} onClick={function(){sSelWeek(selWeek===i?null:i);}} style={{cursor:"pointer",background:selWeek===i?"#FFF8F0":"transparent"}}>
          <td style={{padding:"8px 14px",borderBottom:"1px solid #eee",fontWeight:600,color:CL.greyDk,textAlign:"left"}}>Sett. {w.isoW}/{yr2} ({w.start}-{w.end} {MESI[wMo].substring(0,3)})</td>
          <td style={{padding:"8px",borderBottom:"1px solid #eee",textAlign:"center"}}>{fmtNum(w.workDays)}</td>
          <td style={{padding:"8px",borderBottom:"1px solid #eee",textAlign:"center",color:CL.red,fontWeight:600}}>{fmtNum(w.target)}</td>
          <td style={{padding:"8px",borderBottom:"1px solid #eee",textAlign:"center",color:"#2E7D32",fontWeight:600}}>{fmtNum(w.planned)}</td>
          <td style={{padding:"8px",borderBottom:"1px solid #eee",textAlign:"center",fontWeight:700,color:CL.greyDk}}>{fmtNum(w.actual)}</td>
          <td style={{padding:"8px",borderBottom:"1px solid #eee",textAlign:"center",fontWeight:700,color:"#7B1FA2"}}>{w.training?fmtNum(w.training):"-"}</td>
          <td style={{padding:"8px",borderBottom:"1px solid #eee",textAlign:"center",fontWeight:700,color:delta>=0?"#2E7D32":CL.red}}>{(delta>=0?"+":"")+fmtNum(delta)}</td></tr>);})}</tbody></table></div>
      {ytdData&&<div style={{background:"#fff",borderRadius:12,padding:20,border:"1px solid #F0C040"}}>
        <h4 style={{margin:"0 0 12px",color:CL.greyDk,fontSize:14}}>YTD fino a Sett. {weeks[selWeek].isoW}/{String(year).substring(2)} ({weeks[selWeek].end} {MESI[wMo]})</h4>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:12}}>
          <div style={{padding:"12px 16px",background:"#FFF3F3",borderRadius:10,border:"1px solid "+CL.red}}><div style={{fontSize:11,color:CL.greyMd}}>Target YTD</div><div style={{fontSize:22,fontWeight:700,color:CL.red}}>{fmtNum(ytdData.target)}</div></div>
          <div style={{padding:"12px 16px",background:"#E8F5E9",borderRadius:10,border:"1px solid #A5D6A7"}}><div style={{fontSize:11,color:CL.greyMd}}>Previste YTD</div><div style={{fontSize:22,fontWeight:700,color:"#2E7D32"}}>{fmtNum(ytdData.planned)}</div></div>
          <div style={{padding:"12px 16px",background:CL.greyLt,borderRadius:10,border:"1px solid #ddd"}}><div style={{fontSize:11,color:CL.greyMd}}>Effettive YTD</div><div style={{fontSize:22,fontWeight:700,color:CL.greyDk}}>{fmtNum(ytdData.actual)}</div></div>
          <div style={{padding:"12px 16px",background:ytdData.actual>=ytdData.target?"#E8F5E9":"#FFF3F3",borderRadius:10,border:"1px solid "+(ytdData.actual>=ytdData.target?"#A5D6A7":CL.red)}}><div style={{fontSize:11,color:CL.greyMd}}>Raggiungimento</div><div style={{fontSize:22,fontWeight:700,color:ytdData.actual>=ytdData.target?"#2E7D32":CL.red}}>{ytdData.target>0?Math.round((ytdData.actual/ytdData.target)*100):0}%</div></div></div>
        <div style={{marginTop:12,height:10,background:CL.greyLt,borderRadius:5,overflow:"hidden"}}><div style={{height:"100%",width:Math.min(100,ytdData.target>0?(ytdData.actual/ytdData.target)*100:0)+"%",background:ytdData.actual>=ytdData.target?"#2E7D32":CL.red,borderRadius:5}}/></div></div>}
      <div style={{textAlign:"center",marginTop:20}}>
        <button onClick={function(){generateWeeklyMail(data,year,wMo,weeks,monthlyPlanned,target,months,cM);}} style={{padding:"12px 28px",borderRadius:8,border:"none",background:CL.red,color:"#fff",fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:FONT}}>Invia Report via Mail</button>
      </div>
    </div>}
  </div>);
}
