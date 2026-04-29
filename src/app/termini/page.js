export const metadata = { title: "Termini di Servizio - Agenda OPEX" };

export default function TerminiPage() {
  return (
    <div style={{maxWidth:800,margin:"0 auto",padding:"40px 20px",fontFamily:"DM Sans,Arial,sans-serif",color:"#3C3C3C",lineHeight:1.7}}>
      <div style={{textAlign:"center",marginBottom:32}}>
        <h1 style={{color:"#C41E2A",fontSize:28,margin:"0 0 8px"}}>Termini e Condizioni di Servizio</h1>
        <p style={{color:"#888",fontSize:13}}>Applicazione Agenda OPEX</p>
        <p style={{color:"#888",fontSize:12}}>Ultimo aggiornamento: Aprile 2026</p>
      </div>

      <h2 style={{color:"#C41E2A",fontSize:18,marginTop:28}}>1. Definizioni</h2>
      <ul>
        <li><strong>Fornitore:</strong> Opex Solutions S.r.l., Via Lorenzo Balicco 61, 23900 Lecco (LC), P.IVA 04154460135</li>
        <li><strong>Servizio:</strong> l&apos;applicazione web &quot;Agenda OPEX&quot;</li>
        <li><strong>Cliente:</strong> l&apos;organizzazione che sottoscrive il Servizio</li>
        <li><strong>Utente:</strong> la persona fisica che utilizza il Servizio</li>
      </ul>

      <h2 style={{color:"#C41E2A",fontSize:18,marginTop:28}}>2. Oggetto del Servizio</h2>
      <p>La piattaforma consente: registrazione giornate lavorative, monitoraggio disponibilita&apos;, gestione contratti cliente, generazione report, invio report via email.</p>

      <h2 style={{color:"#C41E2A",fontSize:18,marginTop:28}}>3. Accesso e Registrazione</h2>
      <p>L&apos;accesso avviene tramite credenziali personali (email e password). Ogni Utente e&apos; responsabile della custodia delle credenziali.</p>

      <h2 style={{color:"#C41E2A",fontSize:18,marginTop:28}}>4. Obblighi del Cliente</h2>
      <p>Il Cliente si impegna a: fornire informazioni veritiere, utilizzare il Servizio in conformita&apos; alla legge, non utilizzarlo per scopi illeciti, mantenere riservate le credenziali.</p>

      <h2 style={{color:"#C41E2A",fontSize:18,marginTop:28}}>5. Obblighi del Fornitore</h2>
      <p>Il Fornitore si impegna a: garantire uptime del 99.5%, proteggere i dati, effettuare backup, notificare data breach, non accedere ai dati senza autorizzazione.</p>

      <h2 style={{color:"#C41E2A",fontSize:18,marginTop:28}}>6. Proprieta&apos; dei Dati</h2>
      <p>I dati restano di proprieta&apos; esclusiva del Cliente. In caso di cessazione, esportazione dati entro 30 giorni.</p>

      <h2 style={{color:"#C41E2A",fontSize:18,marginTop:28}}>7. Livelli di Servizio (SLA)</h2>
      <ul>
        <li>Disponibilita&apos;: 99.5% su base mensile</li>
        <li>Segnalazioni critiche: risposta entro 4 ore lavorative</li>
        <li>Segnalazioni non critiche: risposta entro 2 giorni lavorativi</li>
        <li>Manutenzione programmata: preavviso di 48 ore</li>
      </ul>

      <h2 style={{color:"#C41E2A",fontSize:18,marginTop:28}}>8. Limitazione di Responsabilita&apos;</h2>
      <p>Il Fornitore non e&apos; responsabile per danni da uso improprio, interruzioni per forza maggiore, perdita dati causata dal Cliente. Responsabilita&apos; massima: importo pagato nei 12 mesi precedenti.</p>

      <h2 style={{color:"#C41E2A",fontSize:18,marginTop:28}}>9. Durata e Recesso</h2>
      <p>Contratto annuale con rinnovo automatico. Disdetta con 30 giorni di anticipo, da inviare via PEC a <strong>direzione@pec.opexsolutions.it</strong>.</p>

      <h2 style={{color:"#C41E2A",fontSize:18,marginTop:28}}>10. Trattamento Dati</h2>
      <p>Disciplinato dalla <a href="/privacy" style={{color:"#C41E2A"}}>Privacy Policy</a>.</p>

      <h2 style={{color:"#C41E2A",fontSize:18,marginTop:28}}>11. Proprieta&apos; Intellettuale</h2>
      <p>L&apos;applicazione e&apos; di proprieta&apos; esclusiva del Fornitore. Licenza d&apos;uso non esclusiva, non trasferibile.</p>

      <h2 style={{color:"#C41E2A",fontSize:18,marginTop:28}}>12. Legge Applicabile</h2>
      <p>Legge italiana. Foro competente: Lecco.</p>

      <h2 style={{color:"#C41E2A",fontSize:18,marginTop:28}}>13. Contatti</h2>
      <p>Email: <strong>amministrazione@opexsolutions.it</strong><br/>PEC: <strong>direzione@pec.opexsolutions.it</strong><br/>Sede: Via Lorenzo Balicco 61, 23900 Lecco (LC)<br/>Web: www.opexsolutions.it</p>

      <div style={{textAlign:"center",marginTop:40,paddingTop:20,borderTop:"1px solid #eee"}}>
        <p style={{color:"#888",fontSize:12}}>Opex Solutions S.r.l. — Via Lorenzo Balicco 61, 23900 Lecco (LC)</p>
        <a href="/" style={{color:"#C41E2A",fontSize:13}}>Torna all&apos;applicazione</a>
      </div>
    </div>
  );
}
