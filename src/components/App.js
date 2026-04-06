"use client";
import { useState, useEffect, useCallback, useMemo } from "react";

/* ─── Constants ─── */
const MESI = ["Gennaio","Febbraio","Marzo","Aprile","Maggio","Giugno","Luglio","Agosto","Settembre","Ottobre","Novembre","Dicembre"];
const GIORNI = ["Lun","Mar","Mer","Gio","Ven","Sab","Dom"];
const C = { red: "#C41E2A", redDk: "#9B1520", grey: "#3C3C3C", greyDk: "#2A2A2A", greyMd: "#555", greyLt: "#F2F2F2" };

const STATI = {
  client: { bg: C.red, text: "#fff", label: "Cliente OPEX" },
  busy:   { bg: C.grey, text: "#fff", label: "Altro impegno" },
  free:   { bg: "#E8F5E9", text: "#2E7D32", label: "Libero" },
};

/* ─── Helpers ─── */
const makeKey = (y, m, d) => `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
const parseKey = (k) => { const [y, m, d] = k.split("-").map(Number); return { year: y, month: m - 1, day: d }; };
const daysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
const firstDow = (y, m) => { const d = new Date(y, m, 1).getDay(); return d === 0 ? 6 : d - 1; };
const hashPw = (s) => { let h = 0; for (let i = 0; i < s.length; i++) { h = ((h << 5) - h) + s.charCodeAt(i); h = h & h; } return "h_" + Math.abs(h).toString(36); };
const weekNum = (y, m, d) => { const dy = Math.floor((new Date(y, m, d) - new Date(y, 0, 1)) / 864e5) + 1; return Math.ceil((dy + (new Date(y, 0, 4).getDay() || 7) - 1) / 7); };
const fmtNum = (n) => (n % 1 === 0 ? n : n.toFixed(1));

/* ─── API Storage ─── */
const loadAll = async () => {
  try {
    const res = await fetch("/api/data");
    return await res.json();
  } catch {
    return { consultants: [], clients: [], entries: {}, admins: [] };
  }
};

const saveData = async (patch) => {
  try {
    await fetch("/api/data", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(patch) });
  } catch (e) { console.error("Save error:", e); }
};

/* ─── Styles ─── */
const FONT = "'DM Sans', sans-serif";
const sInput = { padding: "9px 12px", borderRadius: 8, border: "1px solid #ddd", fontSize: 14, fontFamily: FONT, flex: 1, minWidth: 0, boxSizing: "border-box" };
const sBtn = { padding: "9px 16px", borderRadius: 8, border: "none", background: C.red, color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: FONT, whiteSpace: "nowrap" };
const sBtnOut = { padding: "9px 16px", borderRadius: 8, border: "1px solid #ddd", background: "#fff", color: "#555", fontSize: 14, cursor: "pointer", fontFamily: FONT };

/* ─── Logo (CSS) ─── */
function Logo({ size = 28 }) {
  return (
    <div style={{ display: "inline-flex", alignItems: "baseline", gap: 1, userSelect: "none" }}>
      <span style={{ fontFamily: "'Georgia', serif", fontStyle: "italic", fontWeight: 700, fontSize: size * 1.2, color: C.red, lineHeight: 1, transform: "rotate(-8deg)", display: "inline-block" }}>X</span>
      <span style={{ fontWeight: 800, fontSize: size, color: C.greyDk, letterSpacing: 2, fontFamily: FONT, lineHeight: 1 }}>OPEX</span>
    </div>
  );
}

/* ═══ LOGIN ═══ */
function LoginScreen({ consultants, admins, onLoginC, onLoginA }) {
  const [mode, setMode] = useState("consultant");
  const [sel, setSel] = useState(consultants[0] || "");
  const [adminName, setAdminName] = useState("");
  const [adminPw, setAdminPw] = useState("");
  const [err, setErr] = useState("");

  const doAdminLogin = () => {
    const found = admins.find((a) => a.name.toLowerCase() === adminName.toLowerCase().trim());
    if (!found) { setErr("Amministratore non trovato"); return; }
    if (hashPw(adminPw) !== found.passHash) { setErr("Password errata"); setAdminPw(""); return; }
    onLoginA(found.name);
  };

  return (
    <div style={{ minHeight: "100vh", fontFamily: FONT, display: "flex", alignItems: "center", justifyContent: "center", background: `linear-gradient(135deg, ${C.greyDk} 0%, ${C.grey} 50%, ${C.redDk} 100%)` }}>
      <div style={{ background: "#fff", borderRadius: 20, padding: "40px 36px", width: 400, maxWidth: "92vw", boxShadow: "0 30px 80px rgba(0,0,0,.4)" }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <Logo size={32} />
          <p style={{ margin: "6px 0 0", fontSize: 11, color: C.greyMd, letterSpacing: 2 }}>AGENDA CONSULENTI</p>
        </div>
        <div style={{ display: "flex", borderRadius: 10, overflow: "hidden", border: `2px solid ${C.red}`, marginBottom: 24 }}>
          {[["consultant", "👤 Consulente"], ["admin", "🔒 Admin"]].map(([k, l]) => (
            <button key={k} onClick={() => { setMode(k); setErr(""); }}
              style={{ flex: 1, padding: "10px 0", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: FONT, background: mode === k ? C.red : "#fff", color: mode === k ? "#fff" : C.red }}>{l}</button>
          ))}
        </div>
        {mode === "consultant" && (
          consultants.length === 0 ? (
            <p style={{ textAlign: "center", color: "#888", fontSize: 14 }}>Nessun consulente configurato. Un admin deve configurare il sistema.</p>
          ) : (
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: C.greyMd, display: "block", marginBottom: 8 }}>Seleziona il tuo nome</label>
              <select value={sel} onChange={(e) => setSel(e.target.value)} style={{ ...sInput, width: "100%", padding: "12px 14px", border: `2px solid ${C.red}`, marginBottom: 20, fontWeight: 600, color: C.greyDk }}>
                {consultants.map((c) => (<option key={c} value={c}>{c}</option>))}
              </select>
              <button onClick={() => onLoginC(sel)} style={{ ...sBtn, width: "100%", padding: "13px 0", fontSize: 15 }}>Accedi al mio calendario</button>
            </div>
          )
        )}
        {mode === "admin" && (
          admins.length === 0 ? (<FirstAdmin onDone={onLoginA} />) : (
            <div>
              <input value={adminName} onChange={(e) => { setAdminName(e.target.value); setErr(""); }} placeholder="Nome admin" style={{ ...sInput, width: "100%", marginBottom: 12 }} />
              <input type="password" value={adminPw} onChange={(e) => { setAdminPw(e.target.value); setErr(""); }} onKeyDown={(e) => e.key === "Enter" && doAdminLogin()} placeholder="Password" style={{ ...sInput, width: "100%", marginBottom: 4 }} />
              {err && <p style={{ margin: "8px 0 0", fontSize: 13, color: C.red, fontWeight: 600 }}>{err}</p>}
              <button onClick={doAdminLogin} style={{ ...sBtn, width: "100%", padding: "13px 0", fontSize: 15, marginTop: 16 }}>Accedi come Admin</button>
            </div>
          )
        )}
      </div>
    </div>
  );
}

function FirstAdmin({ onDone }) {
  const [n, setN] = useState(""); const [p, setP] = useState(""); const [p2, setP2] = useState(""); const [e, setE] = useState("");
  const go = async () => {
    if (!n.trim()) { setE("Inserisci un nome"); return; }
    if (p.length < 4) { setE("Min 4 caratteri"); return; }
    if (p !== p2) { setE("Non coincidono"); return; }
    await saveData({ admins: [{ name: n.trim(), passHash: hashPw(p) }] });
    onDone(n.trim());
  };
  return (
    <div>
      <div style={{ background: "#FFF3F3", borderRadius: 10, padding: "12px 16px", marginBottom: 20, borderLeft: `4px solid ${C.red}` }}>
        <p style={{ margin: 0, fontSize: 13, color: C.redDk }}>⚠️ Crea il primo amministratore per iniziare.</p>
      </div>
      <input value={n} onChange={(x) => { setN(x.target.value); setE(""); }} placeholder="Nome" style={{ ...sInput, width: "100%", marginBottom: 10 }} />
      <input type="password" value={p} onChange={(x) => { setP(x.target.value); setE(""); }} placeholder="Password" style={{ ...sInput, width: "100%", marginBottom: 10 }} />
      <input type="password" value={p2} onChange={(x) => { setP2(x.target.value); setE(""); }} onKeyDown={(x) => x.key === "Enter" && go()} placeholder="Conferma" style={{ ...sInput, width: "100%", marginBottom: 4 }} />
      {e && <p style={{ margin: "8px 0 0", fontSize: 13, color: C.red, fontWeight: 600 }}>{e}</p>}
      <button onClick={go} style={{ ...sBtn, width: "100%", padding: "13px 0", fontSize: 15, marginTop: 16 }}>Crea admin e accedi</button>
    </div>
  );
}

/* ═══ CALENDAR ═══ */
function Calendar({ year, month, entries, onDayClick }) {
  const days = daysInMonth(year, month);
  const fd = firstDow(year, month);
  const cells = [];
  for (let i = 0; i < fd; i++) cells.push(null);
  for (let d = 1; d <= days; d++) cells.push(d);
  const today = new Date();
  const isToday = (d) => d && today.getFullYear() === year && today.getMonth() === month && today.getDate() === d;

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2, marginBottom: 4 }}>
        {GIORNI.map((d) => (<div key={d} style={{ textAlign: "center", fontSize: 11, fontWeight: 600, color: "#888", padding: "4px 0", fontFamily: FONT }}>{d}</div>))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 3 }}>
        {cells.map((d, i) => {
          if (!d) return (<div key={"e" + i} />);
          const key = makeKey(year, month, d);
          const en = entries[key];
          const amSc = en && en.am && en.am.status ? STATI[en.am.status] : null;
          const pmSc = en && en.pm && en.pm.status ? STATI[en.pm.status] : null;
          const isWe = (fd + d - 1) % 7 >= 5;
          const has = amSc || pmSc;
          return (
            <div key={key} onClick={() => !isWe && onDayClick(key)}
              style={{ position: "relative", aspectRatio: "1", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 8, overflow: "hidden", cursor: isWe ? "default" : "pointer", border: isToday(d) ? `2px solid ${C.red}` : "1px solid #e8e8e8", background: isWe ? "#f0f0f0" : "#fafafa", transition: "all .15s", userSelect: "none" }}
              onMouseEnter={(e) => { if (!isWe) e.currentTarget.style.transform = "scale(1.08)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}>
              {has && !isWe && (
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column" }}>
                  <div style={{ flex: 1, background: amSc ? amSc.bg : "transparent", opacity: 0.88 }} />
                  <div style={{ flex: 1, background: pmSc ? pmSc.bg : "transparent", opacity: 0.88 }} />
                </div>
              )}
              <span style={{ position: "relative", zIndex: 1, fontSize: 13, fontWeight: isToday(d) ? 700 : 500, fontFamily: FONT, color: has && !isWe ? "#fff" : isWe ? "#bbb" : "#444", textShadow: has && !isWe ? "0 1px 2px rgba(0,0,0,.3)" : "none" }}>{d}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══ DAY MODAL ═══ */
function HalfEditor({ label, status, setStatus, client, setClient, note, setNote, clients }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <h4 style={{ margin: "0 0 8px", fontSize: 14, color: C.greyDk, fontWeight: 700 }}>{label}</h4>
      <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 8 }}>
        {[{ k: "", l: "— Nessuno —" }, ...Object.entries(STATI).map(([k, v]) => ({ k, l: v.label }))].map((o) => (
          <button key={o.k} onClick={() => setStatus(o.k)} style={{ padding: "6px 11px", borderRadius: 8, fontSize: 12, fontWeight: status === o.k ? 700 : 400, border: status === o.k ? `2px solid ${C.red}` : "1px solid #ddd", cursor: "pointer", fontFamily: FONT, background: status === o.k && o.k ? STATI[o.k].bg : "#f9f9f9", color: status === o.k && o.k ? STATI[o.k].text : "#555" }}>{o.l}</button>
        ))}
      </div>
      {status === "client" && (
        <select value={client} onChange={(e) => setClient(e.target.value)} style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: `2px solid ${C.red}`, fontSize: 13, fontFamily: FONT, background: "#fff8f8", marginBottom: 6, boxSizing: "border-box" }}>
          <option value="">— Seleziona cliente —</option>
          {clients.map((c) => (<option key={c} value={c}>{c}</option>))}
        </select>
      )}
      <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note (opzionale)" style={{ ...sInput, width: "100%", padding: "7px 10px", fontSize: 13 }} />
    </div>
  );
}

function DayModal({ dk, entry, clients, onSave, onClose }) {
  const [as, setAs] = useState(entry && entry.am ? entry.am.status || "" : "");
  const [ac, setAc] = useState(entry && entry.am ? entry.am.client || "" : "");
  const [an, setAn] = useState(entry && entry.am ? entry.am.note || "" : "");
  const [ps, setPs] = useState(entry && entry.pm ? entry.pm.status || "" : "");
  const [pc, setPc] = useState(entry && entry.pm ? entry.pm.client || "" : "");
  const [pn, setPn] = useState(entry && entry.pm ? entry.pm.note || "" : "");
  const info = parseKey(dk);

  const doSave = () => {
    if (as === "client" && !ac) { alert("Seleziona un cliente per la mattina"); return; }
    if (ps === "client" && !pc) { alert("Seleziona un cliente per il pomeriggio"); return; }
    const data = {};
    if (as) data.am = { status: as, client: as === "client" ? ac : "", note: an };
    if (ps) data.pm = { status: ps, client: ps === "client" ? pc : "", note: pn };
    onSave(dk, Object.keys(data).length > 0 ? data : null);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 16, padding: 28, width: 400, maxWidth: "92vw", maxHeight: "88vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,.2)", fontFamily: FONT }}>
        <h3 style={{ margin: "0 0 18px", fontSize: 18, color: C.greyDk }}>{info.day} {MESI[info.month]} {info.year}</h3>
        <HalfEditor label="🌅 Mattina" status={as} setStatus={setAs} client={ac} setClient={setAc} note={an} setNote={setAn} clients={clients} />
        <div style={{ display: "flex", justifyContent: "center", margin: "4px 0 8px" }}>
          <button onClick={() => { setPs(as); setPc(ac); setPn(an); }} disabled={!as}
            style={{ padding: "7px 18px", borderRadius: 20, fontSize: 12, fontWeight: 600, fontFamily: FONT, border: `1px solid ${as ? C.red : "#ddd"}`, cursor: as ? "pointer" : "default", background: as ? "#FFF3F3" : "#f5f5f5", color: as ? C.red : "#bbb", display: "flex", alignItems: "center", gap: 6 }}>⬇️ Copia mattina → pomeriggio</button>
        </div>
        <HalfEditor label="🌇 Pomeriggio" status={ps} setStatus={setPs} client={pc} setClient={setPc} note={pn} setNote={setPn} clients={clients} />
        <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
          <button onClick={doSave} style={{ ...sBtn, flex: 1, padding: "11px 0" }}>Salva</button>
          <button onClick={() => onSave(dk, null)} style={{ ...sBtnOut, color: "#999" }}>Cancella</button>
          <button onClick={onClose} style={sBtnOut}>Chiudi</button>
        </div>
      </div>
    </div>
  );
}

/* ═══ LEGENDA ═══ */
function Legenda() {
  return (
    <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 16, alignItems: "center" }}>
      {Object.values(STATI).map((s) => (
        <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <div style={{ width: 13, height: 13, borderRadius: 4, background: s.bg, border: s.bg === "#E8F5E9" ? "1px solid #A5D6A7" : "none" }} />
          <span style={{ fontSize: 12, color: C.greyMd }}>{s.label}</span>
        </div>
      ))}
      <div style={{ display: "flex", alignItems: "center", gap: 5, marginLeft: 6 }}>
        <div style={{ width: 16, height: 12, borderRadius: 3, overflow: "hidden", display: "flex", flexDirection: "column", border: "1px solid #ccc" }}>
          <div style={{ flex: 1, background: C.red }} /><div style={{ flex: 1, background: C.grey }} />
        </div>
        <span style={{ fontSize: 11, color: "#888" }}>AM/PM</span>
      </div>
    </div>
  );
}

/* ═══ ADMIN: PANORAMICA ═══ */
function Panoramica({ entries, consultants, year, month }) {
  const days = daysInMonth(year, month);
  const fd = firstDow(year, month);
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 11, fontFamily: FONT }}>
        <thead><tr>
          <th style={{ position: "sticky", left: 0, background: "#fff", padding: "7px 10px", borderBottom: `2px solid ${C.red}`, textAlign: "left", minWidth: 110, zIndex: 2 }}>Consulente</th>
          {Array.from({ length: days }, (_, i) => (<th key={i + 1} style={{ padding: "5px 2px", borderBottom: `2px solid ${C.red}`, textAlign: "center", minWidth: 24, color: (fd + i) % 7 >= 5 ? "#ccc" : C.greyMd, fontSize: 10 }}>{i + 1}</th>))}
          <th style={{ padding: "7px 5px", borderBottom: `2px solid ${C.red}`, textAlign: "center", fontWeight: 700, color: C.red, fontSize: 11 }}>GG</th>
        </tr></thead>
        <tbody>{consultants.map((name) => {
          const cE = entries[name] || {};
          let tot = 0;
          const tds = Array.from({ length: days }, (_, i) => {
            const key = makeKey(year, month, i + 1); const e = cE[key]; const we = (fd + i) % 7 >= 5;
            const amSc = e && e.am && e.am.status ? STATI[e.am.status] : null;
            const pmSc = e && e.pm && e.pm.status ? STATI[e.pm.status] : null;
            if (e && e.am && e.am.status === "client") tot += 0.5;
            if (e && e.pm && e.pm.status === "client") tot += 0.5;
            return (<td key={i + 1} style={{ padding: 1, borderBottom: "1px solid #eee", textAlign: "center" }}><div style={{ width: 18, height: 18, borderRadius: 3, margin: "0 auto", overflow: "hidden", display: "flex", flexDirection: "column", background: we && !amSc && !pmSc ? "#f5f5f5" : "transparent" }}><div style={{ flex: 1, background: amSc ? amSc.bg : "transparent" }} /><div style={{ flex: 1, background: pmSc ? pmSc.bg : "transparent" }} /></div></td>);
          });
          return (<tr key={name}><td style={{ position: "sticky", left: 0, background: "#fff", padding: "4px 10px", borderBottom: "1px solid #eee", fontWeight: 600, color: C.greyDk, fontSize: 11, zIndex: 1 }}>{name}</td>{tds}<td style={{ padding: "4px 5px", borderBottom: "1px solid #eee", textAlign: "center", fontWeight: 700, color: C.red, fontSize: 12 }}>{fmtNum(tot)}</td></tr>);
        })}</tbody>
      </table>
    </div>
  );
}

/* ═══ ADMIN: PER CLIENTE ═══ */
function VistaCliente({ entries, consultants, clients, year, month }) {
  const [sel, setSel] = useState(clients[0] || "");
  const days = daysInMonth(year, month);
  const fd = firstDow(year, month);
  const weeklyData = useMemo(() => {
    const weeks = {};
    for (let d = 1; d <= days; d++) {
      const we = (fd + d - 1) % 7; if (we >= 5) continue;
      const w = weekNum(year, month, d);
      if (!weeks[w]) weeks[w] = { wn: w, s: d, e: d, cons: {}, tot: 0 }; weeks[w].e = d;
      consultants.forEach((n) => {
        const key = makeKey(year, month, d); const en = (entries[n] || {})[key];
        if (!weeks[w].cons[n]) weeks[w].cons[n] = { h: 0, dd: [] };
        let count = 0;
        if (en && en.am && en.am.status === "client" && en.am.client === sel) { count += 0.5; weeks[w].cons[n].dd.push(d + "AM"); }
        if (en && en.pm && en.pm.status === "client" && en.pm.client === sel) { count += 0.5; weeks[w].cons[n].dd.push(d + "PM"); }
        weeks[w].cons[n].h += count; weeks[w].tot += count;
      });
    }
    return Object.values(weeks).sort((a, b) => a.wn - b.wn);
  }, [entries, consultants, sel, year, month, days, fd]);
  const grandTot = weeklyData.reduce((s, w) => s + w.tot, 0);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <label style={{ fontSize: 14, fontWeight: 600, color: C.greyDk }}>Cliente:</label>
        <select value={sel} onChange={(e) => setSel(e.target.value)} style={{ ...sInput, flex: "none", width: 220, padding: "8px 12px", border: `2px solid ${C.red}`, fontWeight: 600, color: C.greyDk }}>
          {clients.map((c) => (<option key={c} value={c}>{c}</option>))}
        </select>
        <div style={{ marginLeft: "auto", padding: "8px 16px", background: "#FFF3F3", borderRadius: 10, border: `1px solid ${C.red}` }}>
          <span style={{ fontSize: 13, color: C.greyMd }}>Totale: </span><span style={{ fontSize: 18, fontWeight: 700, color: C.red }}>{fmtNum(grandTot)}</span><span style={{ fontSize: 12, color: C.greyMd }}> gg</span>
        </div>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 13, fontFamily: FONT }}>
          <thead><tr style={{ background: "#FFF8F8" }}>
            <th style={{ padding: "10px 14px", borderBottom: `2px solid ${C.red}`, textAlign: "left" }}>Settimana</th>
            <th style={{ padding: "10px 8px", borderBottom: `2px solid ${C.red}`, textAlign: "center" }}>GG</th>
            {consultants.map((c) => (<th key={c} style={{ padding: "10px 8px", borderBottom: `2px solid ${C.red}`, textAlign: "center", maxWidth: 90, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c}</th>))}
          </tr></thead>
          <tbody>{weeklyData.map((w) => (
            <tr key={w.wn}>
              <td style={{ padding: "8px 14px", borderBottom: "1px solid #eee", fontWeight: 600, color: C.greyDk }}>Sett. {w.wn} <span style={{ fontWeight: 400, color: "#999", fontSize: 11 }}>({w.s}–{w.e} {MESI[month].substring(0, 3)})</span></td>
              <td style={{ padding: "8px", borderBottom: "1px solid #eee", textAlign: "center", fontWeight: 700, color: C.red, fontSize: 15 }}>{fmtNum(w.tot)}</td>
              {consultants.map((n) => { const cd = w.cons[n]; return (<td key={n} title={cd && cd.dd ? cd.dd.join(", ") : ""} style={{ padding: "8px", borderBottom: "1px solid #eee", textAlign: "center", color: cd && cd.h ? C.red : "#ccc" }}>{cd && cd.h ? fmtNum(cd.h) : "—"}</td>); })}
            </tr>
          ))}</tbody>
          <tfoot><tr style={{ background: "#FFF8F8" }}>
            <td style={{ padding: "10px 14px", borderTop: `2px solid ${C.red}`, fontWeight: 700, color: C.greyDk }}>TOTALE</td>
            <td style={{ padding: "10px 8px", borderTop: `2px solid ${C.red}`, textAlign: "center", fontWeight: 700, color: C.red, fontSize: 16 }}>{fmtNum(grandTot)}</td>
            {consultants.map((n) => { const t = weeklyData.reduce((s, w) => s + (w.cons[n] ? w.cons[n].h : 0), 0); return (<td key={n} style={{ padding: "10px 8px", borderTop: `2px solid ${C.red}`, textAlign: "center", fontWeight: 700, color: t ? C.red : "#ccc" }}>{t ? fmtNum(t) : "—"}</td>); })}
          </tr></tfoot>
        </table>
      </div>
      <p style={{ marginTop: 10, fontSize: 11, color: "#aaa" }}>Valori in giornate (0.5 = mezza giornata)</p>
    </div>
  );
}

/* ═══ ADMIN: CONSUNTIVO ═══ */
function Consuntivo({ entries, consultants, clients, year, month }) {
  const report = useMemo(() => {
    const d = {};
    consultants.forEach((n) => {
      d[n] = { tc: 0, tb: 0, tf: 0, bc: {} };
      clients.forEach((c) => { d[n].bc[c] = 0; });
      const cE = entries[n] || {};
      for (let i = 1; i <= daysInMonth(year, month); i++) {
        const e = cE[makeKey(year, month, i)]; if (!e) continue;
        ["am", "pm"].forEach((h) => { const x = e[h]; if (!x || !x.status) return; if (x.status === "client") { d[n].tc += 0.5; if (x.client) d[n].bc[x.client] = (d[n].bc[x.client] || 0) + 0.5; } else if (x.status === "busy") d[n].tb += 0.5; else d[n].tf += 0.5; });
      }
    });
    return d;
  }, [entries, consultants, clients, year, month]);

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 13, fontFamily: FONT }}>
        <thead><tr style={{ background: "#FFF8F8" }}>
          <th style={{ padding: "10px 14px", borderBottom: `2px solid ${C.red}`, textAlign: "left" }}>Consulente</th>
          <th style={{ padding: "10px 8px", borderBottom: `2px solid ${C.red}`, textAlign: "center" }}>GG Cli.</th>
          {clients.map((c) => (<th key={c} style={{ padding: "10px 8px", borderBottom: `2px solid ${C.red}`, textAlign: "center", maxWidth: 90, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c}</th>))}
          <th style={{ padding: "10px 8px", borderBottom: `2px solid ${C.red}`, textAlign: "center" }}>Altro</th>
          <th style={{ padding: "10px 8px", borderBottom: `2px solid ${C.red}`, textAlign: "center" }}>Libero</th>
        </tr></thead>
        <tbody>{consultants.map((n) => {
          const r = report[n];
          return (
            <tr key={n}>
              <td style={{ padding: "8px 14px", borderBottom: "1px solid #eee", fontWeight: 600, color: C.greyDk }}>{n}</td>
              <td style={{ padding: "8px", borderBottom: "1px solid #eee", textAlign: "center", fontWeight: 700, color: C.red, fontSize: 16 }}>{fmtNum(r.tc)}</td>
              {clients.map((c) => (<td key={c} style={{ padding: "8px", borderBottom: "1px solid #eee", textAlign: "center", color: r.bc[c] ? C.red : "#ccc" }}>{r.bc[c] ? fmtNum(r.bc[c]) : "—"}</td>))}
              <td style={{ padding: "8px", borderBottom: "1px solid #eee", textAlign: "center", color: C.grey, fontWeight: 600 }}>{fmtNum(r.tb)}</td>
              <td style={{ padding: "8px", borderBottom: "1px solid #eee", textAlign: "center", color: "#2E7D32" }}>{fmtNum(r.tf)}</td>
            </tr>
          );
        })}</tbody>
      </table>
      <p style={{ marginTop: 12, fontSize: 11, color: "#aaa" }}>Valori in giornate (0.5 = mezza giornata)</p>
    </div>
  );
}

/* ═══ SETTINGS ═══ */
function Impostazioni({ consultants, clients, admins, onSave, onClose, onSaveAdmins }) {
  const [cl, setCl] = useState([...consultants]); const [ll, setLl] = useState([...clients]); const [al, setAl] = useState([...admins]);
  const [nc, setNc] = useState(""); const [nl, setNl] = useState("");
  const [na, setNa] = useState(""); const [np, setNp] = useState(""); const [np2, setNp2] = useState(""); const [am, setAm] = useState("");
  const [tab, setTab] = useState("people");

  const addAdmin = () => {
    if (!na.trim()) { setAm("Inserisci un nome"); return; } if (np.length < 4) { setAm("Min 4 caratteri"); return; }
    if (np !== np2) { setAm("Non coincidono"); return; } if (al.find((a) => a.name.toLowerCase() === na.trim().toLowerCase())) { setAm("Già esistente"); return; }
    setAl([...al, { name: na.trim(), passHash: hashPw(np) }]); setNa(""); setNp(""); setNp2(""); setAm("✅ Aggiunto!");
    setTimeout(() => setAm(""), 2000);
  };
  const doSave = async () => { await onSave(cl, ll); await onSaveAdmins(al); };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 16, padding: 28, width: 480, maxWidth: "94vw", maxHeight: "88vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,.2)", fontFamily: FONT }}>
        <h3 style={{ margin: "0 0 16px", fontSize: 20, color: C.greyDk }}>⚙️ Gestione</h3>
        <div style={{ display: "flex", gap: 4, marginBottom: 20 }}>
          {[["people", "👥 Persone & Clienti"], ["admins", "🔐 Admin"]].map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)} style={{ padding: "8px 16px", borderRadius: 8, border: "none", fontSize: 13, fontWeight: tab === k ? 700 : 400, cursor: "pointer", fontFamily: FONT, background: tab === k ? C.red : "#f0f0f0", color: tab === k ? "#fff" : C.greyMd }}>{l}</button>
          ))}
        </div>
        {tab === "people" && (
          <div>
            <h4 style={{ margin: "0 0 10px", color: C.red }}>Consulenti</h4>
            {cl.map((c, i) => (<div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}><span style={{ flex: 1, padding: "6px 10px", background: C.greyLt, borderRadius: 6, fontSize: 14 }}>{c}</span><button onClick={() => setCl(cl.filter((_, j) => j !== i))} style={{ background: "none", border: "none", color: C.red, cursor: "pointer", fontSize: 18 }}>×</button></div>))}
            <div style={{ display: "flex", gap: 8, marginBottom: 24, marginTop: 6 }}>
              <input value={nc} onChange={(e) => setNc(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && nc.trim()) { setCl([...cl, nc.trim()]); setNc(""); } }} placeholder="Nuovo consulente..." style={sInput} />
              <button onClick={() => { if (nc.trim()) { setCl([...cl, nc.trim()]); setNc(""); } }} style={sBtn}>+</button>
            </div>
            <h4 style={{ margin: "0 0 10px", color: C.red }}>Clienti OPEX</h4>
            {ll.map((c, i) => (<div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}><span style={{ flex: 1, padding: "6px 10px", background: C.greyLt, borderRadius: 6, fontSize: 14 }}>{c}</span><button onClick={() => setLl(ll.filter((_, j) => j !== i))} style={{ background: "none", border: "none", color: C.red, cursor: "pointer", fontSize: 18 }}>×</button></div>))}
            <div style={{ display: "flex", gap: 8, marginBottom: 20, marginTop: 6 }}>
              <input value={nl} onChange={(e) => setNl(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && nl.trim()) { setLl([...ll, nl.trim()]); setNl(""); } }} placeholder="Nuovo cliente..." style={sInput} />
              <button onClick={() => { if (nl.trim()) { setLl([...ll, nl.trim()]); setNl(""); } }} style={sBtn}>+</button>
            </div>
          </div>
        )}
        {tab === "admins" && (
          <div>
            <h4 style={{ margin: "0 0 10px", color: C.red }}>Admin attivi</h4>
            {al.map((a, i) => (<div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}><span style={{ flex: 1, padding: "6px 10px", background: C.greyLt, borderRadius: 6, fontSize: 14, fontWeight: 600 }}>🔐 {a.name}</span>{al.length > 1 && (<button onClick={() => setAl(al.filter((_, j) => j !== i))} style={{ background: "none", border: "none", color: C.red, cursor: "pointer", fontSize: 18 }}>×</button>)}</div>))}
            <h4 style={{ margin: "16px 0 10px", color: C.red }}>Nuovo admin</h4>
            <input value={na} onChange={(e) => { setNa(e.target.value); setAm(""); }} placeholder="Nome" style={{ ...sInput, width: "100%", marginBottom: 8 }} />
            <input type="password" value={np} onChange={(e) => { setNp(e.target.value); setAm(""); }} placeholder="Password" style={{ ...sInput, width: "100%", marginBottom: 8 }} />
            <input type="password" value={np2} onChange={(e) => { setNp2(e.target.value); setAm(""); }} onKeyDown={(e) => e.key === "Enter" && addAdmin()} placeholder="Conferma" style={{ ...sInput, width: "100%", marginBottom: 4 }} />
            {am && <p style={{ margin: "8px 0 0", fontSize: 13, color: am.startsWith("✅") ? C.red : "#c44", fontWeight: 600 }}>{am}</p>}
            <button onClick={addAdmin} style={{ ...sBtn, width: "100%", padding: "10px 0", marginTop: 12 }}>+ Aggiungi</button>
          </div>
        )}
        <div style={{ display: "flex", gap: 10, marginTop: 24, borderTop: "1px solid #eee", paddingTop: 18 }}>
          <button onClick={doSave} style={{ ...sBtn, flex: 1, padding: "12px 0" }}>💾 Salva</button>
          <button onClick={onClose} style={sBtnOut}>Annulla</button>
        </div>
      </div>
    </div>
  );
}

/* ═══ MAIN APP ═══ */
export default function App() {
  const [loading, setLoading] = useState(true);
  const [cons, setCons] = useState([]); const [cls, setCls] = useState([]); const [ent, setEnt] = useState({}); const [adm, setAdm] = useState([]);
  const [logged, setLogged] = useState(false); const [isAdmin, setIsAdmin] = useState(false); const [user, setUser] = useState("");
  const [view, setView] = useState("personal"); const [yr, setYr] = useState(new Date().getFullYear()); const [mo, setMo] = useState(new Date().getMonth());
  const [editDay, setEditDay] = useState(null); const [showSettings, setShowSettings] = useState(false);

  useEffect(() => { loadAll().then((d) => { setCons(d.consultants); setCls(d.clients); setEnt(d.entries); setAdm(d.admins); setLoading(false); }); }, []);

  const loginC = (n) => { setUser(n); setIsAdmin(false); setLogged(true); setView("personal"); };
  const loginA = (n) => { setUser(n); setIsAdmin(true); setLogged(true); setView("admin"); };
  const logout = () => { setLogged(false); setIsAdmin(false); setUser(""); setView("personal"); setShowSettings(false); };

  const handleSaveDay = useCallback(async (dk, data) => {
    const u = { ...ent }; if (!u[user]) u[user] = {};
    if (data) u[user][dk] = data; else delete u[user][dk];
    setEnt(u); setEditDay(null); await saveData({ entries: u });
  }, [ent, user]);

  const handleSaveSettings = useCallback(async (nc, nl) => {
    setCons(nc); setCls(nl); await saveData({ consultants: nc, clients: nl }); setShowSettings(false);
  }, []);

  const handleSaveAdmins = useCallback(async (na) => { setAdm(na); await saveData({ admins: na }); }, []);

  const prevMonth = () => { if (mo === 0) { setMo(11); setYr((y) => y - 1); } else setMo((m) => m - 1); };
  const nextMonth = () => { if (mo === 11) { setMo(0); setYr((y) => y + 1); } else setMo((m) => m + 1); };

  if (loading) { return (<div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", fontFamily: FONT, color: C.red, fontSize: 18 }}>Caricamento...</div>); }
  if (!logged) { return (<LoginScreen consultants={cons} admins={adm} onLoginC={loginC} onLoginA={loginA} />); }

  const adminViews = [["admin", "👥 Panoramica"], ["client", "🏢 Per Cliente"], ["report", "📊 Consuntivo"]];

  return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(135deg, #f9f3f3 0%, ${C.greyLt} 100%)`, fontFamily: FONT }}>
      <div style={{ background: `linear-gradient(135deg, ${C.greyDk} 0%, ${C.grey} 40%, ${C.redDk} 100%)`, padding: "14px 24px", color: "#fff" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ background: "#fff", borderRadius: 8, padding: "4px 10px" }}><Logo size={20} /></div>
            <div><p style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>Agenda Consulenti</p><p style={{ margin: 0, fontSize: 11, opacity: 0.6 }}>{isAdmin ? "🔐 " + user : "👤 " + user}</p></div>
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
            {isAdmin && adminViews.map(([k, l]) => (<button key={k} onClick={() => setView(k)} style={{ padding: "7px 14px", borderRadius: 8, border: "none", fontSize: 12, fontWeight: view === k ? 700 : 400, background: view === k ? "rgba(255,255,255,.22)" : "rgba(255,255,255,.08)", color: "#fff", cursor: "pointer", fontFamily: FONT }}>{l}</button>))}
            {isAdmin && (<button onClick={() => setShowSettings(true)} style={{ padding: "7px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,.25)", background: "transparent", color: "#fff", fontSize: 12, cursor: "pointer", fontFamily: FONT }}>⚙️</button>)}
            <button onClick={logout} style={{ padding: "7px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,.2)", background: "rgba(255,100,100,.15)", color: "#ffcccc", fontSize: 11, cursor: "pointer", fontFamily: FONT }}>Esci</button>
          </div>
        </div>
      </div>
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "20px 16px 40px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16, gap: 12 }}>
          <button onClick={prevMonth} style={{ background: "#fff", border: "1px solid #ddd", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 18 }}>‹</button>
          <h2 style={{ margin: 0, fontSize: 20, color: C.greyDk, minWidth: 200, textAlign: "center" }}>{MESI[mo]} {yr}</h2>
          <button onClick={nextMonth} style={{ background: "#fff", border: "1px solid #ddd", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 18 }}>›</button>
        </div>
        <Legenda />
        {!isAdmin && (<div style={{ background: "#fff", borderRadius: 16, padding: 20, boxShadow: "0 4px 20px rgba(0,0,0,.06)" }}><Calendar year={yr} month={mo} entries={ent[user] || {}} onDayClick={setEditDay} /></div>)}
        {isAdmin && view === "admin" && (<div style={{ background: "#fff", borderRadius: 16, padding: 20, boxShadow: "0 4px 20px rgba(0,0,0,.06)" }}><h3 style={{ margin: "0 0 14px", color: C.greyDk, fontSize: 16 }}>Panoramica — {MESI[mo]} {yr}</h3><Panoramica entries={ent} consultants={cons} year={yr} month={mo} /></div>)}
        {isAdmin && view === "client" && (<div style={{ background: "#fff", borderRadius: 16, padding: 20, boxShadow: "0 4px 20px rgba(0,0,0,.06)" }}><h3 style={{ margin: "0 0 14px", color: C.greyDk, fontSize: 16 }}>Per Cliente — {MESI[mo]} {yr}</h3><VistaCliente entries={ent} consultants={cons} clients={cls} year={yr} month={mo} /></div>)}
        {isAdmin && view === "report" && (<div style={{ background: "#fff", borderRadius: 16, padding: 20, boxShadow: "0 4px 20px rgba(0,0,0,.06)" }}><h3 style={{ margin: "0 0 14px", color: C.greyDk, fontSize: 16 }}>Consuntivo — {MESI[mo]} {yr}</h3><Consuntivo entries={ent} consultants={cons} clients={cls} year={yr} month={mo} /></div>)}
      </div>
      {editDay && (<DayModal dk={editDay} entry={(ent[user] || {})[editDay]} clients={cls} onSave={handleSaveDay} onClose={() => setEditDay(null)} />)}
      {showSettings && (<Impostazioni consultants={cons} clients={cls} admins={adm} onSave={handleSaveSettings} onClose={() => setShowSettings(false)} onSaveAdmins={handleSaveAdmins} />)}
    </div>
  );
}
