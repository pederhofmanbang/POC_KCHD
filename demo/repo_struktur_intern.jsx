import { useState } from "react";

const C = {
  bg: "#fafaf9", card: "#ffffff", border: "#e7e5e4",
  accent: "#1e40af", accentBg: "#eff6ff",
  green: "#15803d", greenBg: "#f0fdf4", greenBorder: "#bbf7d0",
  text: "#1c1917", textMuted: "#78716c", textDim: "#a8a29e",
  codeBg: "#1e1e2e", codeText: "#cdd6f4",
};
const font = "'Inter', -apple-system, sans-serif";
const mono = "'JetBrains Mono', 'Fira Code', monospace";

const Card = ({ children, accent }) => (
  <div style={{ background: C.card, borderRadius: 10, border: `1px solid ${C.border}`, padding: 20, marginBottom: 16, borderLeft: accent ? `3px solid ${accent}` : undefined }}>{children}</div>
);
const H2 = ({ children, sub }) => (
  <div style={{ marginBottom: 16 }}>
    <h2 style={{ fontSize: 17, fontWeight: 700, color: C.text, margin: 0 }}>{children}</h2>
    {sub && <p style={{ color: C.textMuted, fontSize: 13, margin: "4px 0 0" }}>{sub}</p>}
  </div>
);

export default function RepoStruktur() {
  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.text, fontFamily: font, padding: "24px 16px" }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <div style={{ background: C.accent, color: "#fff", padding: "4px 12px", borderRadius: 6, fontSize: 12, fontWeight: 700, fontFamily: mono }}>KCHD</div>
          <div style={{ background: "#fef2f2", color: "#b91c1c", padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600 }}>Intern — ej VGR-leverans</div>
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 20px", letterSpacing: "-0.03em" }}>GitHub-repostruktur — för framtida distribution</h1>

        <Card accent={C.accent}>
          <H2 sub="Används när vi vill distribuera paketet till fler regioner">Förslag: kchd-se/vantetid-katarakt</H2>
          <pre style={{ background: C.codeBg, color: C.codeText, padding: 20, borderRadius: 8, fontSize: 12.5, lineHeight: 1.8, fontFamily: mono, overflowX: "auto", margin: 0 }}>{`kchd-vantetid-katarakt/
├── README.md
├── CHANGELOG.md
├── LICENSE                      Apache 2.0
│
├── vql/
│   ├── 00_kodverk/
│   │   ├── ref_kva_katarakt.vql       15 KVÅ-koder (CJC+CJD+CJE)
│   │   ├── ref_fas.vql                Fas 1-5 med beskrivning
│   │   ├── ref_avvikelse.vql          PvV/MoV/SoV med regler
│   │   └── ref_vantetid_intervall.vql Intervall-definitioner
│   │
│   ├── 01_basvy/
│   │   ├── src_genomford.vql          Mall — ändra kolumnnamn här
│   │   └── src_vantande.vql           Mall — ändra kolumnnamn här
│   │
│   ├── 02_berakning/
│   │   ├── calc_vantetid_genomford.vql  Rör ej
│   │   └── calc_vantande.vql            Rör ej
│   │
│   └── 03_resultatvy/
│       ├── res_kpi_manad.vql          Rör ej
│       ├── res_kpi_dimension.vql      Rör ej
│       ├── res_genomford_detalj.vql   Rör ej
│       └── res_vantande_detalj.vql    Rör ej
│
├── tests/
│   ├── test_vantetid_positiv.sql
│   ├── test_vg_exkludering.sql
│   └── test_intervall_summa.sql
│
└── docs/
    ├── variabellista.md
    └── verifiering.md`}</pre>
        </Card>

        <Card>
          <H2>Kodverk — varför de behövs i paketet</H2>
          <div style={{ fontSize: 13, lineHeight: 1.8 }}>
            {[
              "Repeaterbarhet: Nästa region som implementerar (utan ögonkirurgisk expertis) ska kunna köra paketet utan att gissa.",
              "Dokumentation: Kodverket ÄR specifikationen. Exakt 15 koder i 3 grupper (CJC + CJD + CJE) = Socialstyrelsens definition av aktivitet 51101.",
              "Verifierbarhet: VGR kan jämföra ref_kva_katarakt mot sin egen kodlista. Om de saknar CJC-gruppen (ICCE, sällsynt) ser de det direkt.",
            ].map((r,i) => (
              <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6 }}><span style={{ color: C.accent }}>•</span><span>{r}</span></div>
            ))}
          </div>
        </Card>

        <Card>
          <H2>Distributionsmodell — när vi går vidare</H2>
          <div style={{ fontSize: 13, lineHeight: 1.8 }}>
            <p style={{ marginTop: 0 }}><strong>Steg 1 — POC med VGR:</strong> JSX-guiden ÄR leveransen. VGR kopierar VQL direkt från den. Ingen GitHub behövs.</p>
            <p><strong>Steg 2 — GitHub-repo:</strong> När POC:en är verifierad, skapa repo under github.com/kchd-se/vantetid-katarakt (public, Apache 2.0). Extrahera VQL-koden ur JSX:en till separata .vql-filer.</p>
            <p><strong>Steg 3 — Fler regioner:</strong> Varje region skapar en branch (region/ostergotland, region/kalmar) där de anpassar 01_basvy. Main-branchen har generisk mall.</p>
            <p style={{ marginBottom: 0 }}><strong>Steg 4 — Fler vårdutbud:</strong> Samma tre-lagers-mönster återanvänds för höftledsprotes (31102), knäledsprotes (31103) etc. Kodverket byts ut, beräkningslogiken är identisk.</p>
          </div>
        </Card>

        <div style={{ marginTop: 20, color: C.textDim, fontSize: 11 }}>KCHD intern planering | 2026-03-19</div>
      </div>
    </div>
  );
}
