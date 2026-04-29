export const metadata = { title: "Cookie Policy - Agenda OPEX" };

export default function CookiePage() {
  return (
    <div style={{maxWidth:800,margin:"0 auto",padding:"40px 20px",fontFamily:"DM Sans,Arial,sans-serif",color:"#3C3C3C",lineHeight:1.7}}>
      <div style={{textAlign:"center",marginBottom:32}}>
        <h1 style={{color:"#C41E2A",fontSize:28,margin:"0 0 8px"}}>Cookie Policy</h1>
        <p style={{color:"#888",fontSize:12}}>Ultimo aggiornamento: Aprile 2026</p>
      </div>

      <h2 style={{color:"#C41E2A",fontSize:18,marginTop:28}}>1. Cosa Sono i Cookie</h2>
      <p>I cookie sono piccoli file di testo che i siti web inviano al browser dell&apos;utente per essere poi ritrasmessi alla visita successiva.</p>

      <h2 style={{color:"#C41E2A",fontSize:18,marginTop:28}}>2. Cookie Utilizzati</h2>
      <p>L&apos;applicazione Agenda OPEX utilizza esclusivamente <strong>cookie tecnici necessari</strong>:</p>
      <ul>
        <li><strong>Cookie di autenticazione (Supabase Auth):</strong> mantengono la sessione di login. Durata: fino al logout o chiusura browser.</li>
        <li><strong>Cookie di sessione Next.js:</strong> necessari al funzionamento dell&apos;applicazione. Durata: sessione.</li>
      </ul>
      <p><strong>NON utilizziamo:</strong> cookie di profilazione, cookie pubblicitari, cookie analitici (Google Analytics o simili), cookie di tracciamento cross-site.</p>

      <h2 style={{color:"#C41E2A",fontSize:18,marginTop:28}}>3. Base Giuridica</h2>
      <p>I cookie tecnici necessari non richiedono consenso ai sensi dell&apos;art. 122 del D.Lgs. 196/2003 e delle Linee Guida del Garante Privacy del 10 giugno 2021.</p>

      <h2 style={{color:"#C41E2A",fontSize:18,marginTop:28}}>4. Gestione dei Cookie</h2>
      <p>E&apos; possibile gestire i cookie tramite le impostazioni del browser. La disabilitazione dei cookie tecnici potrebbe compromettere il funzionamento dell&apos;applicazione.</p>

      <h2 style={{color:"#C41E2A",fontSize:18,marginTop:28}}>5. Contatti</h2>
      <p>Per domande: <strong>amministrazione@opexsolutions.it</strong><br/>PEC: <strong>direzione@pec.opexsolutions.it</strong></p>

      <div style={{textAlign:"center",marginTop:40,paddingTop:20,borderTop:"1px solid #eee"}}>
        <p style={{color:"#888",fontSize:12}}>Opex Solutions S.r.l. — Via Lorenzo Balicco 61, 23900 Lecco (LC)</p>
        <a href="/" style={{color:"#C41E2A",fontSize:13}}>Torna all&apos;applicazione</a>
      </div>
    </div>
  );
}
