import { CL, STATI, FONT, makeKey, daysInMonth, firstDow, fmtNum } from "./shared";

export function Panoramica(p){
  var entries=p.entries,cons=p.consultants,year=p.year,month=p.month;
  var days=daysInMonth(year,month),fd=firstDow(year,month);
  return(<div style={{overflowX:"auto"}}><table style={{borderCollapse:"collapse",width:"100%",fontSize:11,fontFamily:FONT}}>
    <thead><tr><th style={{position:"sticky",left:0,background:"#fff",padding:"7px 10px",borderBottom:"2px solid "+CL.red,textAlign:"left",minWidth:110,zIndex:2}}>Consulente</th>
      {Array.from({length:days},function(_,i){return<th key={i+1} style={{padding:"5px 2px",borderBottom:"2px solid "+CL.red,textAlign:"center",minWidth:24,color:(fd+i)%7>=5?"#ccc":CL.greyMd,fontSize:10}}>{i+1}</th>;})}<th style={{padding:"7px 5px",borderBottom:"2px solid "+CL.red,textAlign:"center",fontWeight:700,color:CL.red,fontSize:11}}>GG</th></tr></thead>
    <tbody>{cons.map(function(name){var cE=entries[name]||{},tot=0;
      var tds=Array.from({length:days},function(_,i){var key=makeKey(year,month,i+1),e=cE[key],we=(fd+i)%7>=5;
        var aS=e&&e.am&&e.am.status?STATI[e.am.status]:null,pS=e&&e.pm&&e.pm.status?STATI[e.pm.status]:null;
        if(e&&e.am&&e.am.status==="client")tot+=.5;if(e&&e.pm&&e.pm.status==="client")tot+=.5;
        return<td key={i+1} style={{padding:1,borderBottom:"1px solid #eee",textAlign:"center"}}><div style={{width:18,height:18,borderRadius:3,margin:"0 auto",overflow:"hidden",display:"flex",flexDirection:"column",background:we&&!aS&&!pS?"#f5f5f5":"transparent"}}><div style={{flex:1,background:aS?aS.bg:"transparent"}}/><div style={{flex:1,background:pS?pS.bg:"transparent"}}/></div></td>;});
      return<tr key={name}><td style={{position:"sticky",left:0,background:"#fff",padding:"4px 10px",borderBottom:"1px solid #eee",fontWeight:600,color:CL.greyDk,fontSize:11,zIndex:1}}>{name}</td>{tds}<td style={{padding:"4px 5px",borderBottom:"1px solid #eee",textAlign:"center",fontWeight:700,color:CL.red,fontSize:12}}>{fmtNum(tot)}</td></tr>;})}</tbody></table></div>);
}
