import "./globals.css";

export const metadata = {
  title: "OPEX - Agenda Consulenti",
  description: "Gestione disponibilità consulenti OPEX Solutions",
};

export default function RootLayout({ children }) {
  return (
    <html lang="it">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
