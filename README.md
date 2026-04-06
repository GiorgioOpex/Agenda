# 📅 Agenda OPEX - Gestione Disponibilità Consulenti

Applicazione web per la gestione delle disponibilità dei consulenti OPEX Solutions.

## Funzionalità

- **Login consulente**: ogni consulente accede con il proprio nome e vede solo il suo calendario
- **Login admin**: accesso protetto da password con supporto multi-admin
- **Mezze giornate**: ogni giorno si divide in mattina e pomeriggio (AM/PM)
- **Copia AM → PM**: pulsante per copiare lo stato della mattina al pomeriggio
- **Vista Panoramica**: griglia mensile con tutti i consulenti (solo admin)
- **Vista per Cliente**: breakdown settimanale per cliente selezionato (solo admin)
- **Consuntivo**: riepilogo mensile giornate per consulente e cliente (solo admin)
- **Gestione**: aggiunta/rimozione consulenti, clienti e admin (solo admin)

## Deploy su Vercel (gratuito)

### Prerequisiti
- Un account [Vercel](https://vercel.com) (registrazione gratuita con GitHub)
- Un account [GitHub](https://github.com)

### Passi

1. **Crea un repository GitHub**
   - Vai su github.com → New Repository → nome: `agenda-opex`
   - Carica tutti i file di questa cartella nel repository

2. **Collega a Vercel**
   - Vai su [vercel.com](https://vercel.com) → "Add New Project"
   - Seleziona il repository `agenda-opex`
   - Framework: Next.js (viene rilevato automaticamente)
   - Clicca "Deploy"

3. **Fatto!** 
   - Vercel ti darà un URL tipo `agenda-opex.vercel.app`
   - Puoi collegare un dominio personalizzato (es. `agenda.opex-solutions.it`)

### Primo accesso
1. Apri l'URL dell'app
2. Clicca "🔒 Admin" 
3. Crea il primo amministratore (nome + password)
4. Dalle impostazioni (⚙️) aggiungi consulenti e clienti
5. Condividi l'URL con il team!

## Sviluppo locale

```bash
npm install
npm run dev
```

L'app sarà disponibile su http://localhost:3000

## Struttura

```
agenda-opex-standalone/
├── src/
│   ├── app/
│   │   ├── layout.js          # Layout HTML base
│   │   ├── page.js            # Pagina principale
│   │   ├── globals.css        # Stili globali
│   │   └── api/data/route.js  # API per lettura/scrittura dati
│   └── components/
│       └── App.js             # Componente React principale
├── data/
│   └── db.json                # Database JSON (dati persistenti)
├── package.json
├── next.config.js
└── README.md
```

## Note importanti

- **Storage**: i dati sono salvati in `data/db.json` sul server
- **Sicurezza**: la password admin è hashata ma non è crittografia forte — adatto per uso interno
- **Backup**: per fare backup, copiare il file `data/db.json`
- **Per un uso più robusto**: si può sostituire il file JSON con un database come PostgreSQL o MongoDB

## Colori OPEX
- Rosso: `#C41E2A`
- Grigio scuro: `#3C3C3C` / `#2A2A2A`
- Grigio chiaro: `#F2F2F2`
