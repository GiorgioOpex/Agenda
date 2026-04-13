"use client";
import { useState, useMemo } from "react";
import { MESI, CL, FONT, sI, fmtNum, calcMonthActuals, makeKey, daysInMonth, firstDow } from "./shared";

function getWeeksOfMonth(year,month){
  var days=daysInMonth(year,month),fd=firstDow(year,month),weeks=[];
  var wStart=1,wNum=1;
  for(var d=1;d<=days;d++){
    var dow=(fd+d-1)%7;
    if(dow===0&&d>1){weeks.push({num:wNum,start:wStart,end:d-1});wNum++;wStart=d;}
  }
  weeks.push({num:wNum,start:wStart,end:days});
  return weeks;
}

function calcWeekActuals(entries,consultants,year,month,startDay,endDay){
  var fd=firstDow(year,month),tot=0,workHalves=0;
  for(var d=startDay;d<=endDay;d++){
    if((fd+d-1)%7>=5)continue;
    workHalves+=2;
    consultants.forEach(function(n){var cE=entries[n]||{};var e=cE[makeKey(year,month,d)];if(!e)return;
      ["am","pm"].forEach(function(h){var x=e[h];if(x&&x.status==="client")tot+=0.5;});});
  }
  return{actual:tot,workDays:workHalves/2};
}

function calcYTD(entries,consultants,year,upToMonth,upToWeekEnd,planned,target){
  var totActual=0,totPlanned=0,totTarget=0;
  for(var mi=0;mi<=upToMonth;mi++){
    if(mi<upToMonth){
      var a=calcMonthActuals(entries,consultants,year,mi);
      totActual+=a.totalClient;totPlanned+=planned;totTarget+=target;
    } else {
      var fd=firstDow(year,mi),days=daysInMonth(year,mi);
      var workDaysMonth=0;for(var d=1;d<=days;d++){if((fd+d-1)%7<5)workDaysMonth++;}
      var workDaysUpTo=0;for(var d2=1;d2<=upToWeekEnd;d2++){if((fd+d2-1)%7<5)workDaysUpTo++;}
      var ratio=workDaysMonth>0?workDaysUpTo/workDaysMonth:0;
      totPlanned+=planned*ratio;totTarget+=target*ratio;
      var a2=calcWeekActuals(entries,consultants,year,mi,1,upToWeekEnd);
      totActual+=a2.actual;
    }
  }
  return{actual:totActual,planned:totPlanned,target:totTarget};
}

export function Dashboard(p){
  var data=p.data,year=p.year,target=data.targetMensile||0;
  var planned=(data.clients||[]).reduce(function(s,c){return s+((data.clientBudgets||{})[c]||0);},0);
  var cM=new Date().getMonth();
  var vs=useState("monthly"),viewMode=vs[0],sViewMode=vs[1];
  var ws=useState(null),selWeek=ws[0],sSelWeek=ws[1];

  var months=useMemo(function(){return MESI.map(function(nome,mi){var a=calcMonthActuals(data.entries,data.consultants,year,mi);return{nome:nome.substring(0,3),actual:a.totalClient,planned:planned,target:target};});},[data,year,target,planned]);

  var weeks=useMemo(function(){
    var wks=getWeeksOfMonth(year,cM);
    return wks.map(function(w){
      var wa=calcWeekActuals(data.entries,data.consultants,year,cM,w.start,w.end);
      var pRatio=wa.workDays>0?planned*(wa.workDays/20):0;
      var tRatio=wa.workDays>0?target*(wa.workDays/20):0;
      return{num:w.num,start:w.start,end:w.end,actual:wa.actual,planned:pRatio,target:tRatio,workDays:wa.workDays};
    });
  },[data,year,cM,planned,target]);

  var ytdData=useMemo(function(){
    if(selWeek===null)return null;
    var w=weeks[selWeek];if(!w)return null;
    return calcYTD(data.entries,data.consultants,year,cM,w.end,planned,target);
  },[selWeek,data,year,cM,weeks,planned,target]);

  var mxM=Math.max(target,planned,Math.max.apply(null,months.map(function(m){return m.actual;})))||1;
  var mxW=weeks.length>0?Math.max(Math.max.apply(null,weeks.map(function(w){return Math.max(w.actual,w.planned,w.target);})),1):1;

  var ytdActual=months.reduce(function(s,m,i){return i<=cM?s+m.actual:s;},0);
  var ytdPlanned=planned*(cM+1);
  var ytdTarget=target*(cM+1);

  return(<div>
    <div style={{display:"flex",gap:8,marginBottom:20}}>
      <button onClick={function(){sViewMode("monthly");sSelWeek(null);}} style={{padding:"8px 18px",borderRadius:8,border:"none",fontSize:13,fontWeight:viewMode==="monthly"?700:400,cursor:"pointer",fontFamily:FONT,background:viewMode==="monthly"?CL.red:"#f0f0f0",color:viewMode==="monthly"?"#fff":CL.greyMd}}>Mensile</button>
      <button onClick={function(){sViewMode("weekly");sSelWeek(null);}} style={{padding:"8px 18px",borderRadius:8,border:"none",fontSize:13,fontWeight:viewMode==="weekly"?700:400,cursor:"pointer",fontFamily:FONT,background:viewMode==="weekly"?CL.red:"#f0f0f0",color:viewMode==="weekly"?"#fff":CL.greyMd}}>Settimanale</button>
    </div>

    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:12,marginBottom:24}}>
      <div style={{padding:"14px 18px",background:"#FFF3F3",borderRadius:12,border:"1px solid "+CL.red}}><div style={{fontSize:11,color:CL.greyMd}}>Target mensile</div><div style={{fontSize:28,fontWeight:700,color:CL.red}}>{fmtNum(target)}</div><div style={{fontSize:11,color:"#888"}}>giornate</div></div>
      <div style={{padding:"14px 18px",background:"#E8F5E9",borderRadius:12,border:"1px solid #A5D6A7"}}><div style={{fontSize:11,color:CL.greyMd}}>Richieste clienti</div><div style={{fontSize:28,fontWeight:700,color:"#2E7D32"}}>{fmtNum(planned)}</div><div style={{fontSize:11,color:"#888"}}>gg/mese</div></div>
      <div style={{padding:"14px 18px",background:CL.greyLt,borderRadius:12,border:"1px solid #ddd"}}><div style={{fontSize:11,color:CL.greyMd}}>Effettive {MESI[cM]}</div><div style={{fontSize:28,fontWeight:700,color:CL.greyDk}}>{fmtNum(months[cM].actual)}</div></div>
      <div style={{padding:"14px 18px",background:months[cM].actual>=target?"#E8F5E9":"#FFF3F3",borderRadius:12,border:"1px solid "+(months[cM].actual>=target?"#A5D6A7":CL.red)}}><div style={{fontSize:11,color:CL.greyMd}}>vs Target mese</div><div style={{fontSize:28,fontWeight:700,color:months[cM].actual>=target?"#2E7D32":CL.red}}>{target>0?Math.round((months[cM].actual/target)*100):0}%</div></div>
    </div>

    {viewMode==="monthly"&&<div>
      <div style={{background:"#fff",borderRadius:12,padding:20,border:"1px solid #eee",marginBottom:16}}>
        <h4 style={{margin:"0 0 16px",color:CL.greyDk,fontSize:14}}>Andamento mensile {year}</h4>
        <div style={{display:"flex",gap:16,marginBottom:16,fontSize:12}}>
          <div style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:12,height:12,background:CL.red,borderRadius:2}}/><span>Target</span></div>
          <div style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:12,height:12,background:"#2E7D32",borderRadius:2}}/><span>Richieste</span></div>
          <div style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:12,height:12,background:CL.grey,borderRadius:2}}/><span>Effettive</span></div></div>
        <div style={{display:"flex",alignItems:"flex-end",gap:4,height:210,overflowX:"auto"}}>{months.map(function(m,i){return(<div key={m.nome} style={{flex:1,minWidth:50,display:"flex",flexDirection:"column",alignItems:"center",opacity:i>cM?.4:1}}>
          <div style={{display:"flex",gap:2,alignItems:"flex-end",height:180}}>
            <div style={{width:10,height:Math.max(2,(target/mxM)*180),background:CL.red,borderRadius:"2px 2px 0 0"}}/>
            <div style={{width:10,height:Math.max(2,(m.planned/mxM)*180),background:"#2E7D32",borderRadius:"2px 2px 0 0"}}/>
            <div style={{width:10,height:Math.max(2,(m.actual/mxM)*180),background:CL.grey,borderRadius:"2px 2px 0 0"}}/></div>
          <div style={{fontSize:10,color:i===cM?CL.red:"#888",fontWeight:i===cM?700:400,marginTop:4}}>{m.nome}</div></div>);})}</div>
        <p style={{marginTop:12,fontSize:11,color:"#aaa"}}>Mesi futuri in trasparenza</p>
      </div>
      <div style={{background:"#fff",borderRadius:12,padding:20,border:"1px solid #eee"}}>
        <h4 style={{margin:"0 0 12px",color:CL.greyDk,fontSize:14}}>Situazione YTD (da Gennaio a {MESI[cM]})</h4>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:12}}>
          <div style={{padding:"12px 16px",background:"#FFF3F3",borderRadius:10,border:"1px solid "+CL.red}}><div style={{fontSize:11,color:CL.greyMd}}>Target YTD</div><div style={{fontSize:22,fontWeight:700,color:CL.red}}>{fmtNum(ytdTarget)}</div></div>
          <div style={{padding:"12px 16px",background:"#E8F5E9",borderRadius:10,border:"1px solid #A5D6A7"}}><div style={{fontSize:11,color:CL.greyMd}}>Previste YTD</div><div style={{fontSize:22,fontWeight:700,color:"#2E7D32"}}>{fmtNum(ytdPlanned)}</div></div>
          <div style={{padding:"12px 16px",background:CL.greyLt,borderRadius:10,border:"1px solid #ddd"}}><div style={{fontSize:11,color:CL.greyMd}}>Effettive YTD</div><div style={{fontSize:22,fontWeight:700,color:CL.greyDk}}>{fmtNum(ytdActual)}</div></div>
          <div style={{padding:"12px 16px",background:ytdActual>=ytdTarget?"#E8F5E9":"#FFF3F3",borderRadius:10,border:"1px solid "+(ytdActual>=ytdTarget?"#A5D6A7":CL.red)}}><div style={{fontSize:11,color:CL.greyMd}}>Raggiungimento</div><div style={{fontSize:22,fontWeight:700,color:ytdActual>=ytdTarget?"#2E7D32":CL.red}}>{ytdTarget>0?Math.round((ytdActual/ytdTarget)*100):0}%</div></div>
        </div>
      </div>
    </div>}

    {viewMode==="weekly"&&<div>
      <div style={{background:"#fff",borderRadius:12,padding:20,border:"1px solid #eee",marginBottom:16}}>
        <h4 style={{margin:"0 0 16px",color:CL.greyDk,fontSize:14}}>Settimane di {MESI[cM]} {year}</h4>
        <div style={{display:"flex",gap:16,marginBottom:16,fontSize:12}}>
          <div style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:12,height:12,background:CL.red,borderRadius:2}}/><span>Target</span></div>
          <div style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:12,height:12,background:"#2E7D32",borderRadius:2}}/><span>Previste</span></div>
          <div style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:12,height:12,background:CL.grey,borderRadius:2}}/><span>Effettive</span></div></div>
        <div style={{display:"flex",alignItems:"flex-end",gap:8,height:210,overflowX:"auto"}}>{weeks.map(function(w,i){return(<div key={w.num} onClick={function(){sSelWeek(selWeek===i?null:i);}} style={{flex:1,minWidth:70,display:"flex",flexDirection:"column",alignItems:"center",cursor:"pointer",opacity:1,padding:"4px",borderRadius:8,background:selWeek===i?"#FFF8F0":"transparent",border:selWeek===i?"1px solid #F0C040":"1px solid transparent"}}>
          <div style={{display:"flex",gap:3,alignItems:"flex-end",height:170}}>
            <div style={{width:14,height:Math.max(2,(w.target/mxW)*170),background:CL.red,borderRadius:"2px 2px 0 0"}}/>
            <div style={{width:14,height:Math.max(2,(w.planned/mxW)*170),background:"#2E7D32",borderRadius:"2px 2px 0 0"}}/>
            <div style={{width:14,height:Math.max(2,(w.actual/mxW)*170),background:CL.grey,borderRadius:"2px 2px 0 0"}}/></div>
          <div style={{fontSize:11,color:selWeek===i?CL.red:CL.greyMd,fontWeight:selWeek===i?700:400,marginTop:6}}>S{w.num}</div>
          <div style={{fontSize:9,color:"#aaa"}}>{w.start}-{w.end}</div>
        </div>);})}</div>
        <p style={{marginTop:12,fontSize:11,color:"#aaa"}}>Clicca su una settimana per vedere la situazione YTD</p>
      </div>

      <div style={{overflowX:"auto",marginBottom:16}}>
        <table style={{borderCollapse:"collapse",width:"100%",fontSize:13,fontFamily:FONT}}>
          <thead><tr style={{background:"#FFF8F8"}}>
            <th style={{padding:"8px 14px",borderBottom:"2px solid "+CL.red,textAlign:"left"}}>Settimana</th>
            <th style={{padding:"8px",borderBottom:"2px solid "+CL.red}}>Giorni lav.</th>
            <th style={{padding:"8px",borderBottom:"2px solid "+CL.red}}>Target</th>
            <th style={{padding:"8px",borderBottom:"2px solid "+CL.red}}>Previste</th>
            <th style={{padding:"8px",borderBottom:"2px solid "+CL.red}}>Effettive</th>
            <th style={{padding:"8px",borderBottom:"2px solid "+CL.red}}>Delta</th>
          </tr></thead>
          <tbody>{weeks.map(function(w,i){var delta=w.actual-w.target;return(<tr key={w.num} onClick={function(){sSelWeek(selWeek===i?null:i);}} style={{cursor:"pointer",background:selWeek===i?"#FFF8F0":"transparent"}}>
            <td style={{padding:"8px 14px",borderBottom:"1px solid #eee",fontWeight:600,color:CL.greyDk,textAlign:"left"}}>Sett. {w.num} ({w.start}-{w.end} {MESI[cM].substring(0,3)})</td>
            <td style={{padding:"8px",borderBottom:"1px solid #eee",textAlign:"center"}}>{fmtNum(w.workDays)}</td>
            <td style={{padding:"8px",borderBottom:"1px solid #eee",textAlign:"center",color:CL.red,fontWeight:600}}>{fmtNum(w.target)}</td>
            <td style={{padding:"8px",borderBottom:"1px solid #eee",textAlign:"center",color:"#2E7D32",fontWeight:600}}>{fmtNum(w.planned)}</td>
            <td style={{padding:"8px",borderBottom:"1px solid #eee",textAlign:"center",fontWeight:700,color:CL.greyDk}}>{fmtNum(w.actual)}</td>
            <td style={{padding:"8px",borderBottom:"1px solid #eee",textAlign:"center",fontWeight:700,color:delta>=0?"#2E7D32":CL.red}}>{(delta>=0?"+":"")+fmtNum(delta)}</td>
          </tr>);})}</tbody>
        </table>
      </div>

      {ytdData&&<div style={{background:"#fff",borderRadius:12,padding:20,border:"1px solid #F0C040"}}>
        <h4 style={{margin:"0 0 12px",color:CL.greyDk,fontSize:14}}>Situazione YTD fino a Sett. {weeks[selWeek].num} ({weeks[selWeek].end} {MESI[cM]})</h4>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:12}}>
          <div style={{padding:"12px 16px",background:"#FFF3F3",borderRadius:10,border:"1px solid "+CL.red}}><div style={{fontSize:11,color:CL.greyMd}}>Target YTD</div><div style={{fontSize:22,fontWeight:700,color:CL.red}}>{fmtNum(ytdData.target)}</div></div>
          <div style={{padding:"12px 16px",background:"#E8F5E9",borderRadius:10,border:"1px solid #A5D6A7"}}><div style={{fontSize:11,color:CL.greyMd}}>Previste YTD</div><div style={{fontSize:22,fontWeight:700,color:"#2E7D32"}}>{fmtNum(ytdData.planned)}</div></div>
          <div style={{padding:"12px 16px",background:CL.greyLt,borderRadius:10,border:"1px solid #ddd"}}><div style={{fontSize:11,color:CL.greyMd}}>Effettive YTD</div><div style={{fontSize:22,fontWeight:700,color:CL.greyDk}}>{fmtNum(ytdData.actual)}</div></div>
          <div style={{padding:"12px 16px",background:ytdData.actual>=ytdData.target?"#E8F5E9":"#FFF3F3",borderRadius:10,border:"1px solid "+(ytdData.actual>=ytdData.target?"#A5D6A7":CL.red)}}><div style={{fontSize:11,color:CL.greyMd}}>Raggiungimento</div><div style={{fontSize:22,fontWeight:700,color:ytdData.actual>=ytdData.target?"#2E7D32":CL.red}}>{ytdData.target>0?Math.round((ytdData.actual/ytdData.target)*100):0}%</div></div>
        </div>
        <div style={{marginTop:12,height:10,background:CL.greyLt,borderRadius:5,overflow:"hidden"}}><div style={{height:"100%",width:Math.min(100,ytdData.target>0?(ytdData.actual/ytdData.target)*100:0)+"%",background:ytdData.actual>=ytdData.target?"#2E7D32":CL.red,borderRadius:5}}/></div>
      </div>}
    </div>}
  </div>);
}
