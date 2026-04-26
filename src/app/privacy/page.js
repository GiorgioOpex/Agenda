export const metadata = { title: "Privacy Policy - Agenda OPEX" };

export default function PrivacyPage() {
  return (
    <div style={{maxWidth:800,margin:"0 auto",padding:"40px 20px",fontFamily:"DM Sans,Arial,sans-serif",color:"#3C3C3C",lineHeight:1.7}}>
      <div style={{textAlign:"center",marginBottom:32}}>
        <h1 style={{color:"#C41E2A",fontSize:28,margin:"0 0 8px"}}>Informativa sulla Privacy</h1>
        <p style={{color:"#888",fontSize:13}}>Ai sensi degli artt. 13 e 14 del Regolamento UE 2016/679 (GDPR)</p>
        <p style={{color:"#888",fontSize:12}}>Ultimo aggiornamento: Aprile 2026</p>
      </div>

      <h2 style={{color:"#C41E2A",fontSize:18,marginTop:28}}>1. Titolare del Trattamento</h2>
      <p><strong>Opex Solutions S.r.l.</strong><br/>Via Lorenzo Balicco 61, 23900 Lecco (LC)<br/>P.IVA/C.F. 04154460135<br/>Email: amministrazione@opexsolutions.it</p>

      <h2 style={{color:"#C41E2A",fontSize:18,marginTop:28}}>2. Dati Personali Raccolti</h2>
      <p>L&apos;applicazione Agenda OPEX raccoglie:</p>
      <ul>
        <li><strong>Dati identificativi:</strong> nome e cognome</li>
        <li><strong>Dati di contatto:</strong> indirizzo email aziendale</li>
        <li><strong>Dati di ruolo:</strong> ruolo nell&apos;organizzazione (consulente o amministratore)</li>
        <li><strong>Credenziali di accesso:</strong> password (conservata in forma crittografata)</li>
        <li><strong>Dati di utilizzo:</strong> registrazioni delle giornate lavorative</li>
      </ul>
      <p>Non vengono raccolti dati sensibili, biometrici, relativi alla salute o giudiziari.</p>

      <h2 style={{color:"#C41E2A",fontSize:18,marginTop:28}}>3. Finalita&apos; del Trattamento</h2>
      <p>I dati sono trattati per: gestione accesso e autenticazione, pianificazione disponibilita&apos; consulenti, generazione report e consuntivi, gestione contratti clienti, comunicazioni operative via email.</p>

      <h2 style={{color:"#C41E2A",fontSize:18,marginTop:28}}>4. Base Giuridica</h2>
      <ul>
        <li>Esecuzione del contratto di lavoro o collaborazione (art. 6.1.b GDPR)</li>
        <li>Legittimo interesse per la gestione organizzativa (art. 6.1.f GDPR)</li>
        <li>Adempimento di obblighi legali e fiscali (art. 6.1.c GDPR)</li>
      </ul>

      <h2 style={{color:"#C41E2A",fontSize:18,marginTop:28}}>5. Modalita&apos; del Trattamento</h2>
      <p>I dati sono conservati su infrastruttura cloud:</p>
      <ul>
        <li><strong>Supabase (PostgreSQL):</strong> database, data center EU (Francoforte), conforme SOC2 Type II</li>
        <li><strong>Vercel:</strong> hosting applicazione, crittografia TLS, conforme SOC2</li>
      </ul>
      <p>Comunicazioni tramite HTTPS (TLS 1.2+). Dati a riposo crittografati (AES-256).</p>

      <h2 style={{color:"#C41E2A",fontSize:18,marginTop:28}}>6. Periodo di Conservazione</h2>
      <ul>
        <li>Utenti attivi: per la durata del rapporto di collaborazione</li>
        <li>Utenti cessati: cancellati entro 30 giorni</li>
        <li>Dati di utilizzo: massimo 10 anni per finalita&apos; fiscali</li>
        <li>Log di accesso: 6 mesi</li>
      </ul>

      <h2 style={{color:"#C41E2A",fontSize:18,marginTop:28}}>7. Comunicazione dei Dati</h2>
      <p>I dati non sono diffusi a terzi, ad eccezione di: Supabase Inc. (hosting database), Vercel Inc. (hosting applicazione), Autorita&apos; competenti se richiesto dalla legge.</p>

      <h2 style={{color:"#C41E2A",fontSize:18,marginTop:28}}>8. Diritti dell&apos;Interessato</h2>
      <p>L&apos;utente ha diritto di: accesso (art. 15), rettifica (art. 16), cancellazione (art. 17), limitazione (art. 18), portabilita&apos; (art. 20), opposizione (art. 21), reclamo al Garante Privacy (www.garanteprivacy.it).</p>
      <p>Per esercitare i diritti: <strong>amministrazione@opexsolutions.it</strong></p>

      <h2 style={{color:"#C41E2A",fontSize:18,marginTop:28}}>9. Sicurezza</h2>
      <p>Misure adottate: crittografia in transito e a riposo, password crittografate (bcrypt), controllo accessi basato su ruoli, Row Level Security, backup automatici.</p>

      <h2 style={{color:"#C41E2A",fontSize:18,marginTop:28}}>10. Modifiche</h2>
      <p>Le modifiche saranno comunicate tramite l&apos;applicazione e/o via email.</p>

      <div style={{textAlign:"center",marginTop:40,paddingTop:20,borderTop:"1px solid #eee"}}>
        <p style={{color:"#888",fontSize:12}}>Opex Solutions S.r.l. — Via Lorenzo Balicco 61, 23900 Lecco (LC)</p>
        <a href="/" style={{color:"#C41E2A",fontSize:13}}>Torna all&apos;applicazione</a>
      </div>
    </div>
  );
}
