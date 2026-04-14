"use client";
import { useState } from "react";

export var MESI=["Gennaio","Febbraio","Marzo","Aprile","Maggio","Giugno","Luglio","Agosto","Settembre","Ottobre","Novembre","Dicembre"];
export var GIORNI=["Lun","Mar","Mer","Gio","Ven","Sab","Dom"];
export var CL={red:"#C41E2A",redDk:"#9B1520",grey:"#3C3C3C",greyDk:"#2A2A2A",greyMd:"#555",greyLt:"#F2F2F2"};
export var STATI={client:{bg:CL.red,text:"#fff",label:"Cliente OPEX"},busy:{bg:CL.grey,text:"#fff",label:"Altro impegno"},commercial:{bg:"#FF8F00",text:"#fff",label:"Commerciale OPEX"}};
export var CLIENT_COLORS=["#C41E2A","#FF8F00","#2E7D32","#E65100","#6A1B9A","#00838F","#AD1457","#F9A825","#4E342E","#37474F","#00695C","#283593","#BF360C","#1B5E20","#4A148C","#006064","#D84315","#0277BD","#558B2F","#FF6F00","#7B1FA2","#00796B","#C2185B","#F57F17","#3E2723","#455A64","#004D40","#1A237E","#E53935","#43A047","#8E24AA","#039BE5"];
export var FONT="'DM Sans',sans-serif";
export var sI={padding:"9px 12px",borderRadius:8,border:"1px solid #ddd",fontSize:14,fontFamily:FONT,flex:1,minWidth:0,boxSizing:"border-box",textTransform:"uppercase"};
export var sB={padding:"9px 16px",borderRadius:8,border:"none",background:CL.red,color:"#fff",fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:FONT,whiteSpace:"nowrap"};
export var sO={padding:"9px 16px",borderRadius:8,border:"1px solid #ddd",background:"#fff",color:"#555",fontSize:14,cursor:"pointer",fontFamily:FONT};

export function getClientColor(clients,clientName){
  if(!clientName||!clients)return CL.grey;
  var idx=clients.indexOf(clientName);if(idx<0)return CL.red;
  return CLIENT_COLORS[idx%CLIENT_COLORS.length];}

export function getHalfBg(half,clients){
  if(!half||!half.status)return "transparent";
  if(half.status==="busy")return CL.grey;
  if(half.status==="commercial")return "#FF8F00";
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

export function calcAllActuals(entries,consultants){
  var r={};consultants.forEach(function(n){var cE=entries[n]||{};Object.keys(cE).forEach(function(key){
    var e=cE[key];if(!e)return;["am","pm"].forEach(function(h){var x=e[h];if(!x||!x.status||x.status!=="client"||!x.client)return;
    if(!r[x.client])r[x.client]=0;r[x.client]+=0.5;});});});return r;}

export function calcMonthActuals(entries,consultants,year,month){
  var r={byClient:{},totalClient:0,totalBusy:0,totalCommercial:0};
  consultants.forEach(function(n){var cE=entries[n]||{};for(var d=1;d<=daysInMonth(year,month);d++){var e=cE[makeKey(year,month,d)];if(!e)continue;
    ["am","pm"].forEach(function(h){var x=e[h];if(!x||!x.status)return;if(x.status==="client"){r.totalClient+=0.5;if(x.client)r.byClient[x.client]=(r.byClient[x.client]||0)+0.5;}else if(x.status==="busy")r.totalBusy+=0.5;else if(x.status==="commercial")r.totalCommercial+=0.5;});}});return r;}

export function calcContractTotal(budget,endDate){
  if(!budget||!endDate)return 0;var now=new Date();var end=new Date(endDate);
  if(end<=now)return 0;var months=0;var d=new Date(now.getFullYear(),now.getMonth(),1);
  while(d<=end){months++;d.setMonth(d.getMonth()+1);}return budget*months;}

export var EMPTY={consultants:[],clients:[],clientBudgets:{},clientEndDates:{},entries:{},admins:[],targetMensile:0};

export async function loadAll(){try{var res=await fetch("/api/data?t="+Date.now());if(!res.ok)return Object.assign({},EMPTY);var d=await res.json();return Object.assign({},EMPTY,d);}catch(e){return Object.assign({},EMPTY);}}
export async function saveAll(fd){try{var res=await fetch("/api/data",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(fd)});var r=await res.json();return r.ok;}catch(e){return false;}}

export function Logo(p){return(<img src="/Logo_Opex.jpg" alt="OPEX" style={{height:p.h||36,objectFit:"contain"}}/>);}

export function Legenda(p){
  var clients=p.clients||[],entries=p.entries||{};
  var used=getUsedClients(entries);
  var hasBusy=false,hasComm=false;
  Object.keys(entries).forEach(function(key){var e=entries[key];if(!e)return;
    ["am","pm"].forEach(function(h){if(e[h]&&e[h].status==="busy")hasBusy=true;if(e[h]&&e[h].status==="commercial")hasComm=true;});});
  return(<div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:16,alignItems:"center"}}>
    {used.map(function(c){return<div key={c} style={{display:"flex",alignItems:"center",gap:4}}>
      <div style={{width:13,height:13,borderRadius:4,background:getClientColor(clients,c)}}/><span style={{fontSize:11,color:CL.greyMd}}>{c}</span></div>;})}
    {hasBusy&&<div style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:13,height:13,borderRadius:4,background:CL.grey}}/><span style={{fontSize:11,color:CL.greyMd}}>Altro impegno</span></div>}
    {hasComm&&<div style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:13,height:13,borderRadius:4,background:"#FF8F00"}}/><span style={{fontSize:11,color:CL.greyMd}}>Commerciale OPEX</span></div>}
  </div>);
}
