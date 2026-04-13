"use client";
import { useState } from "react";

export var MESI=["Gennaio","Febbraio","Marzo","Aprile","Maggio","Giugno","Luglio","Agosto","Settembre","Ottobre","Novembre","Dicembre"];
export var GIORNI=["Lun","Mar","Mer","Gio","Ven","Sab","Dom"];
export var CL={red:"#C41E2A",redDk:"#9B1520",grey:"#3C3C3C",greyDk:"#2A2A2A",greyMd:"#555",greyLt:"#F2F2F2"};
export var STATI={client:{bg:CL.red,text:"#fff",label:"Cliente OPEX"},busy:{bg:CL.grey,text:"#fff",label:"Altro impegno"}};
export var FONT="'DM Sans',sans-serif";
export var sI={padding:"9px 12px",borderRadius:8,border:"1px solid #ddd",fontSize:14,fontFamily:FONT,flex:1,minWidth:0,boxSizing:"border-box"};
export var sB={padding:"9px 16px",borderRadius:8,border:"none",background:CL.red,color:"#fff",fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:FONT,whiteSpace:"nowrap"};
export var sO={padding:"9px 16px",borderRadius:8,border:"1px solid #ddd",background:"#fff",color:"#555",fontSize:14,cursor:"pointer",fontFamily:FONT};

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
  var r={byClient:{},totalClient:0,totalBusy:0};
  consultants.forEach(function(n){var cE=entries[n]||{};for(var d=1;d<=daysInMonth(year,month);d++){var e=cE[makeKey(year,month,d)];if(!e)continue;
    ["am","pm"].forEach(function(h){var x=e[h];if(!x||!x.status)return;if(x.status==="client"){r.totalClient+=0.5;if(x.client)r.byClient[x.client]=(r.byClient[x.client]||0)+0.5;}else if(x.status==="busy")r.totalBusy+=0.5;});}});return r;}

export function calcContractTotal(budget,endDate){
  if(!budget||!endDate)return 0;var now=new Date();var end=new Date(endDate);
  if(end<=now)return 0;var months=0;var d=new Date(now.getFullYear(),now.getMonth(),1);
  while(d<=end){months++;d.setMonth(d.getMonth()+1);}return budget*months;}

export var EMPTY={consultants:[],clients:[],clientBudgets:{},clientEndDates:{},entries:{},admins:[],targetMensile:0};

export async function loadAll(){try{var res=await fetch("/api/data?t="+Date.now());if(!res.ok)return Object.assign({},EMPTY);var d=await res.json();return Object.assign({},EMPTY,d);}catch(e){return Object.assign({},EMPTY);}}
export async function saveAll(fd){try{var res=await fetch("/api/data",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(fd)});var r=await res.json();return r.ok;}catch(e){return false;}}

export function Logo(p){return(<img src="/Logo_Opex.jpg" alt="OPEX" style={{height:p.h||36,objectFit:"contain"}}/>);}

export function Legenda(){return(<div style={{display:"flex",gap:14,flexWrap:"wrap",marginBottom:16,alignItems:"center"}}>
  {Object.values(STATI).map(function(s){return<div key={s.label} style={{display:"flex",alignItems:"center",gap:5}}><div style={{width:13,height:13,borderRadius:4,background:s.bg}}/><span style={{fontSize:12,color:CL.greyMd}}>{s.label}</span></div>;})}
  <div style={{display:"flex",alignItems:"center",gap:5,marginLeft:6}}><div style={{width:16,height:12,borderRadius:3,overflow:"hidden",display:"flex",flexDirection:"column",border:"1px solid #ccc"}}><div style={{flex:1,background:CL.red}}/><div style={{flex:1,background:CL.grey}}/></div><span style={{fontSize:11,color:"#888"}}>AM/PM</span></div></div>);}
