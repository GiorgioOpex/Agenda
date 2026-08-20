"use client";
import { useState, useEffect } from "react";
import { MESI, CL, FONT, sO } from "./shared";

function apiGetReportStatus(year, month) {
  return fetch('/api/report-status?year=' + year + '&month=' + month).then(function (r) { return r.json(); });
}

function fmtDateTime(iso) {
  if (!iso) return "";
  var d = new Date(iso);
  var pad = function (n) { return n < 10 ? "0" + n : "" + n; };
  return pad(d.getDate()) + "/" + pad(d.getMonth() + 1) + "/" + d.getFullYear() + " " + pad(d.getHours()) + ":" + pad(d.getMinutes());
}

export function ReportStatusModal(p) {
  var year = p.year, month = p.month, consultantEmails = p.consultantEmails || {}, onClose = p.onClose;
  var ls = useState(true), loading = ls[0], sLoading = ls[1];
  var ss = useState([]), statuses = ss[0], sStatuses = ss[1];
  var es = useState(""), errMsg = es[0], sErrMsg = es[1];

  useEffect(function () {
    sLoading(true);
    apiGetReportStatus(year, month).then(function (res) {
      if (res && res.statuses) {
        var sorted = res.statuses.slice().sort(function (a, b) { return a.consultantName.localeCompare(b.consultantName, 'it'); });
        sStatuses(sorted);
      } else {
        sErrMsg((res && res.error) || "Errore nel caricamento dello stato report");
      }
      sLoading(false);
    }).catch(function () { sErrMsg("Errore di connessione"); sLoading(false); });
  }, [year, month]);

  var missing = statuses.filter(function (s) { return !s.generatedAt; });

  function inviaSollecito() {
    var destinatari = missing.map(function (s) { return consultantEmails[s.consultantName]; }).filter(function (e) { return !!e; });
    if (destinatari.length === 0) return;
    var subject = "Sollecito Report " + MESI[month] + " " + year;
    var body = "Ciao,%0D%0A%0D%0Ati ricordiamo di generare e inviare il Report di " + MESI[month] + " " + year + " dall'Agenda il prima possibile.%0D%0A%0D%0AGrazie,%0D%0AAmministrazione OPEX Solutions";
    var mailto = "mailto:" + encodeURIComponent(destinatari.join(",")) + "?subject=" + encodeURIComponent(subject) + "&body=" + body;
    window.location.href = mailto;
  }

  return (<div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }} onClick={onClose}>
    <div onClick={function (e) { e.stopPropagation(); }} style={{ background: "#fff", borderRadius: 16, padding: 28, width: 520, maxWidth: "94vw", maxHeight: "80vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,.2)", fontFamily: FONT }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        <h3 style={{ margin: 0, fontSize: 18, color: CL.greyDk }}>Stato Report — {MESI[month]} {year}</h3>
        <button onClick={onClose} style={{ padding: "4px 10px", borderRadius: 6, border: "1px solid #ddd", background: "#fff", fontSize: 11, cursor: "pointer", fontFamily: FONT, color: "#888" }}>Chiudi</button>
      </div>
      {loading && <p style={{ textAlign: "center", color: "#999", padding: "20px 0" }}>Caricamento...</p>}
      {errMsg && <p style={{ color: CL.red, fontSize: 13 }}>{errMsg}</p>}
      {!loading && !errMsg && <div>
        <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 13, fontFamily: FONT, marginBottom: 18 }}>
          <thead><tr style={{ background: "#FFF8F8" }}>
            <th style={{ padding: "8px 12px", borderBottom: "2px solid " + CL.red, textAlign: "left" }}>Consulente</th>
            <th style={{ padding: "8px 12px", borderBottom: "2px solid " + CL.red, textAlign: "left" }}>Stato</th></tr></thead>
          <tbody>{statuses.map(function (s) {
            return (<tr key={s.consultantName}>
              <td style={{ padding: "7px 12px", borderBottom: "1px solid #eee", color: CL.greyDk }}>{s.consultantName}</td>
              <td style={{ padding: "7px 12px", borderBottom: "1px solid #eee" }}>
                {s.generatedAt
                  ? <span style={{ color: "#2E7D32", fontWeight: 600 }}>✅ Generato — {fmtDateTime(s.generatedAt)}</span>
                  : <span style={{ color: "#e53935", fontWeight: 600 }}>⏳ Non generato</span>}
              </td>
            </tr>);
          })}</tbody>
        </table>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <p style={{ margin: 0, fontSize: 12, color: "#888" }}>{missing.length} di {statuses.length} consulenti non hanno ancora generato il report</p>
          <button onClick={inviaSollecito} disabled={missing.length === 0} style={{ padding: "9px 16px", borderRadius: 8, border: "none", background: missing.length === 0 ? "#ccc" : CL.red, color: "#fff", fontSize: 13, fontWeight: 600, cursor: missing.length === 0 ? "default" : "pointer", fontFamily: FONT, whiteSpace: "nowrap" }}>Invia sollecito</button>
        </div>
      </div>}
    </div>
  </div>);
}
