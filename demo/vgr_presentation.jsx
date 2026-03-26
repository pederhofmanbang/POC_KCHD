import { useState } from "react";

const font = "'Inter', -apple-system, sans-serif";
const mono = "'JetBrains Mono', 'Fira Code', monospace";

const C = {
  bg: "#fafaf9", card: "#ffffff", border: "#e7e5e4",
  accent: "#1e40af", accentBg: "#eff6ff",
  green: "#15803d", greenBg: "#f0fdf4", greenBorder: "#bbf7d0",
  amber: "#b45309", amberBg: "#fffbeb",
  purple: "#7c3aed", purpleBg: "#f5f3ff",
  text: "#1c1917", muted: "#78716c", dim: "#a8a29e",
};

const Tb = ({ active, onClick, children }) => (
  <button onClick={onClick} style={{ padding: "10px 18px", background: active ? C.accent : "transparent", color: active ? "#fff" : C.muted, border: "none", borderBottom: active ? `2px solid ${C.accent}` : "2px solid transparent", cursor: "pointer", fontFamily: font, fontSize: 14, fontWeight: active ? 600 : 400, whiteSpace: "nowrap" }}>{children}</button>
);

const Card = ({ children, style: s, accent }) => (
  <div style={{ background: C.card, borderRadius: 10, border: `1px solid ${C.border}`, padding: 20, marginBottom: 14, borderLeft: accent ? `3px solid ${accent}` : undefined, ...s }}>{children}</div>
);

const Badge = ({ color, bg, border, children }) => (
  <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 6, background: bg, color, border: border ? `1px solid ${border}` : undefined, whiteSpace: "nowrap" }}>{children}</span>
);

const VyRad = ({ namn, desc, status }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0", borderBottom: `1px solid #f5f5f4` }}>
    <span style={{ fontFamily: mono, fontSize: 12, fontWeight: 600, color: C.accent, minWidth: 220 }}>{namn}</span>
    <span style={{ fontSize: 13, color: C.muted, flex: 1 }}>{desc}</span>
    <Badge color={status === "live" ? C.green : C.amber} bg={status === "live" ? C.greenBg : C.amberBg} border={status === "live" ? C.greenBorder : undefined}>{status === "live" ? "Igång hos er" : "Nytt paket"}</Badge>
  </div>
);

export default function VGRPresentation() {
  const [tab, setTab] = useState("oversikt");

  return (
    <div style={{ background: C.bg, minHeight: "100vh", fontFamily: font, color: C.text, padding: "24px 16px" }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet" />
      <div style={{ maxWidth: 960, margin: "0 auto" }}>

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
          <Badge color="#fff" bg={C.accent}>KCHD × VGR</Badge>
          <Badge color={C.amber} bg={C.amberBg}>Statusmöte 2026-03-26</Badge>
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 800, margin: "6px 0 4px", letterSpacing: "-0.03em" }}>Katarakt väntetidsdata — lägesöversikt</h1>
        <p style={{ color: C.muted, fontSize: 14, margin: "0 0 16px" }}>Vad ni har, vad ni just fått, och vad som kommer härnäst</p>

        <div style={{ display: "flex", gap: 0, borderBottom: `1px solid ${C.border}`, marginBottom: 16, overflowX: "auto" }}>
          <Tb active={tab==="oversikt"} onClick={() => setTab("oversikt")}>Översikt</Tb>
          <Tb active={tab==="ni_har"} onClick={() => setTab("ni_har")}>Vad ni har idag</Tb>
          <Tb active={tab==="nytt"} onClick={() => setTab("nytt")}>Nytt paket</Tb>
          <Tb active={tab==="nasta"} onClick={() => setTab("nasta")}>Nästa steg</Tb>
          <Tb active={tab==="arkitektur"} onClick={() => setTab("arkitektur")}>Helhetsbild</Tb>
        </div>

        {/* ═══ ÖVERSIKT ═══ */}
        {tab === "oversikt" && (<div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 20 }}>
            {[
              { num: "23", label: "Beräkningsvyer i Denodo", sub: "13 igång hos er + 10 skickade, redo att köra" },
              { num: "16", label: "Nyckeltal beräknas", sub: "t.ex. medianväntetid, andel inom 90 dagar" },
              { num: "33", label: "Variabler hämtas", sub: "Från era journalsystem" },
              { num: "7", label: "Kvalitetskontroller", sub: "Automatisk check att data ser rätt ut" },
            ].map((c, i) => (
              <div key={i} style={{ background: C.card, borderRadius: 10, border: `1px solid ${C.border}`, padding: 16, textAlign: "center" }}>
                <div style={{ fontSize: 32, fontWeight: 800, fontFamily: mono, color: C.accent }}>{c.num}</div>
                <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>{c.label}</div>
                <div style={{ fontSize: 11, color: C.muted }}>{c.sub}</div>
              </div>
            ))}
          </div>

          <Card accent={C.green}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <span style={{ fontSize: 20 }}>✅</span>
              <span style={{ fontSize: 16, fontWeight: 700 }}>Klart och igång</span>
            </div>
            <div style={{ fontSize: 14, lineHeight: 1.8 }}>
              <strong>Beräkningspaketet</strong> — 13 vyer som ni redan har i Denodo och kört mot er data. De hämtar rådata från era system, beräknar väntetider, och producerar färdiga nyckeltal (median, medelvärde, andel inom vårdgarantin, fördelning per kön och ålder med mera).
            </div>
          </Card>

          <Card accent={C.amber}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <span style={{ fontSize: 20 }}>📦</span>
              <span style={{ fontSize: 16, fontWeight: 700 }}>Skickat idag — redo att köra</span>
            </div>
            <div style={{ fontSize: 14, lineHeight: 1.8 }}>
              <strong>Verifieringspaket</strong> — Jämför era beräknade siffror mot vantetider.se. Varje rad berättar exakt var på sajten ni hittar motsvarande siffra. Steg-för-steg-instruktion ingår.<br/>
              <strong>Kvalitetspaket</strong> — 7 automatiska kontroller som kollar att data ser rätt ut: inga tomma fält som ska vara ifyllda, inga ogiltiga koder, inga orimliga väntetider. Inkluderar en visuell rapport (HTML-fil som ni öppnar lokalt — ingen data skickas till internet).
            </div>
          </Card>

          <Card accent={C.purple}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <span style={{ fontSize: 20 }}>🔮</span>
              <span style={{ fontSize: 16, fontWeight: 700 }}>Kommande leveranser</span>
            </div>
            <div style={{ fontSize: 14, lineHeight: 1.8 }}>
              <strong>Standardiserat format (FHIR)</strong> — Vi bygger vyer som omvandlar era beräknade nyckeltal till det internationella hälsodataformatet FHIR. Ni behöver inte ändra något — vyerna läser från det ni redan har.<br/>
              <strong>Transformation via SSIS</strong> — Kod som tar FHIR-datan och transformerar den via Microsofts SSIS (samma verktyg ni redan använder för rapportering till Socialstyrelsen).<br/>
              <strong>Patientnivå</strong> — Samma mönster men för enskilda operationer och väntande, så att ni kan testa hela flödet lokalt.
            </div>
          </Card>
        </div>)}

        {/* ═══ VAD NI HAR IDAG ═══ */}
        {tab === "ni_har" && (<div>
          <Card>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>Era 13 vyer i Denodo — beräkningspaketet</div>
            <div style={{ fontSize: 13, color: C.muted, marginBottom: 12 }}>Dessa är levererade och igång. Data flödar i tre steg: hämta källdata → beräkna väntetider → producera nyckeltal.</div>

            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.accent, marginBottom: 6 }}>Steg 0 — Referensdata</div>
              <VyRad namn="ref_kva_katarakt" desc="Lista över de 15 operationskoder som gäller för katarakt" status="live" />
            </div>

            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.accent, marginBottom: 6 }}>Steg 1 — Hämta data (dessa anpassade ni till era system)</div>
              <VyRad namn="src_genomford" desc="Alla genomförda kataraktoperationer ur era system" status="live" />
              <VyRad namn="src_vantande" desc="Patienter som väntar på operation just nu" status="live" />
            </div>

            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.accent, marginBottom: 6 }}>Steg 2 — Beräkna (samma logik för alla regioner)</div>
              <VyRad namn="calc_vantetid_genomford" desc="Räknar ut väntetid i dagar, intervall, om vårdgarantin uppfylls" status="live" />
              <VyRad namn="calc_vantande" desc="Räknar ut hur länge varje patient väntat" status="live" />
            </div>

            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.accent, marginBottom: 6 }}>Steg 3 — Färdiga nyckeltal (redo för dashboard/rapport)</div>
              {[
                ["res_kpi_manad","Alla 16 nyckeltal per månad och vårdenhet"],
                ["res_kpi_per_yrke","Samma nyckeltal uppdelat per yrkeskategori"],
                ["res_kpi_per_kontaktform","Uppdelat per kontaktform (besök/telefon/video)"],
                ["res_kpi_per_bokning","Uppdelat per bokningssätt"],
                ["res_kpi_per_remittent","Uppdelat per remittent (vem som skickade remissen)"],
                ["res_kpi_per_kommun","Uppdelat per patientens hemkommun"],
                ["res_genomford_detalj","Varje enskild operation — för manuell kontroll"],
                ["res_vantande_detalj","Varje väntande patient — för manuell kontroll"],
              ].map(([n,d],i) => <VyRad key={i} namn={n} desc={d} status="live" />)}
            </div>
          </Card>

          <Card style={{ background: C.greenBg, border: `1px solid ${C.greenBorder}` }}>
            <div style={{ fontSize: 14, color: C.green, lineHeight: 1.7 }}>
              <strong>Viktigt: bara steg 1 är VGR-specifikt.</strong> Det var där ni anpassade vyerna till era system (Melior, ELVIS, Orbit). Steg 2 och 3 (beräkningar och nyckeltal) fungerar identiskt för alla regioner. När nästa region ansluter behöver de bara göra sitt eget steg 1.
            </div>
          </Card>
        </div>)}

        {/* ═══ NYTT PAKET ═══ */}
        {tab === "nytt" && (<div>
          <Card accent={C.amber}>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Verifieringspaket</div>
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 12 }}>verifieringspaket.vql — 2 nya vyer</div>

            <div style={{ fontSize: 14, lineHeight: 1.8, marginBottom: 14 }}>
              <strong>Syfte:</strong> Kontrollera att era beräkningar stämmer med vantetider.se.
            </div>

            <div style={{ background: "#f5f5f4", borderRadius: 8, padding: 14, marginBottom: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Så gör ni:</div>
              <div style={{ fontSize: 13, lineHeight: 2 }}>
                1. Kör VQL-filen i Denodo (skapar 2 vyer)<br/>
                2. <span style={{ fontFamily: mono, background: "#e7e5e4", padding: "1px 6px", borderRadius: 4 }}>SELECT * FROM verif_jamforelse</span><br/>
                3. Ni får ~14 rader — en per nyckeltal med ert beräknade värde<br/>
                4. Kolumnen <strong>var_pa_vantetider_se</strong> berättar exakt var ni klickar på vantetider.se<br/>
                5. Jämför siffra för siffra
              </div>
            </div>

            <VyRad namn="verif_jamforelse" desc="14 nyckeltal med instruktion för var på vantetider.se ni hittar motsvarande siffra" status="nytt" />
            <VyRad namn="verif_stickprov" desc="Enskilda patienter — för att kontrollera om en specifik beräkning stämmer" status="nytt" />
          </Card>

          <Card accent={C.amber}>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Kvalitetspaket</div>
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 12 }}>kvalitetspaket.vql + dq_rapport.html — 8 nya vyer + lokal rapport</div>

            <div style={{ fontSize: 14, lineHeight: 1.8, marginBottom: 14 }}>
              <strong>Syfte:</strong> Automatisk kontroll av datakvalitet. 0 rader = allt OK.
            </div>

            <div style={{ background: "#f5f5f4", borderRadius: 8, padding: 14, marginBottom: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Så gör ni (snabbaste vägen):</div>
              <div style={{ fontSize: 13, lineHeight: 2 }}>
                1. Kör VQL-filen i Denodo (skapar 8 vyer)<br/>
                2. <span style={{ fontFamily: mono, background: "#e7e5e4", padding: "1px 6px", borderRadius: 4 }}>SELECT * FROM dq_rapport_data</span><br/>
                3. Kopiera alla rader<br/>
                4. Dubbelklicka på <strong>dq_rapport.html</strong> — öppnas lokalt i webbläsaren<br/>
                5. Klistra in — rapporten uppdateras direkt med era siffror<br/>
                <span style={{ fontSize: 12, color: C.green }}>🔒 Ingen data skickas till internet</span>
              </div>
            </div>

            <div style={{ fontSize: 13, fontWeight: 600, color: C.accent, marginBottom: 6 }}>Sju kontroller som körs automatiskt:</div>
            {[
              ["dq0_existens","Finns det överhuvudtaget data i systemet?"],
              ["dq1_null","Är alla obligatoriska fält ifyllda (datum, koder, kön)?"],
              ["dq2_doman","Är koderna giltiga? Rätt operationskoder, rätt regionkod?"],
              ["dq3_intervall","Är värdena rimliga? Inga negativa väntetider, rimliga födelseår?"],
              ["dq4_ifyllnadsgrad","Hur stor andel av varje fält har värden? (informativt, inte ett fel)"],
              ["dq5_korsvalidering","Stämmer summorna? T.ex. att antal i delarna = antal i totalen."],
              ["dq6_rimlighet","Ser nyckeltalen rimliga ut? T.ex. medianväntetid mellan 1–365 dagar."],
              ["dq_rapport_data","Samlar alla kontroller i en körning — matar rapporten"],
            ].map(([n,d],i) => <VyRad key={i} namn={n} desc={d} status="nytt" />)}
          </Card>
        </div>)}

        {/* ═══ NÄSTA STEG ═══ */}
        {tab === "nasta" && (<div>
          <Card>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>Tidslinje</div>
            <div style={{ fontFamily: mono, fontSize: 13, lineHeight: 2.4, background: "#1e1e2e", color: "#cdd6f4", padding: 20, borderRadius: 8 }}>
              <div><span style={{ color: "#a6e3a1" }}>✅ Beräkningspaketet</span>       Igång hos er — 13 vyer</div>
              <div><span style={{ color: "#a6e3a1" }}>✅ Komplettering</span>            Levererat — 3 vyer</div>
              <div><span style={{ color: "#fab387" }}>📦 Verifiering + Kvalitet</span>   Skickat idag — 10 vyer + rapport</div>
              <div>   ─── ni kör dessa, skickar resultat till oss ───</div>
              <div><span style={{ color: "#89b4fa" }}>🔜 FHIR-format</span>              Nyckeltal i internationell standard</div>
              <div><span style={{ color: "#89b4fa" }}>🔜 SSIS-transformation</span>      Via Microsofts verktyg (redan i ert flöde)</div>
              <div><span style={{ color: "#cba6f7" }}>🔜 Patientnivå</span>              Samma sak fast per operation/patient</div>
            </div>
          </Card>

          <Card>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>Vad vi behöver från er nu</div>
            <div style={{ fontSize: 14, lineHeight: 2 }}>
              {[
                "Kör verifieringspaketet — jämför era siffror med vantetider.se och skicka resultatet till oss",
                "Kör kvalitetspaketet och öppna rapporten — skicka den till oss (instruktioner finns i mailet)",
                "Hör av er om något ser konstigt ut — vi hjälper till att analysera",
                "För nästa steg (FHIR) behöver ni inte göra något nytt — vi bygger vyer som läser från det ni redan har",
              ].map((t, i) => (
                <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <span style={{ color: C.accent, fontWeight: 700, flexShrink: 0 }}>{i+1}.</span>
                  <span>{t}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card accent={C.purple}>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>Vad innebär nästa steg (FHIR) för er?</div>
            <div style={{ fontSize: 14, lineHeight: 1.8 }}>
              I praktiken: vi lägger till nya vyer i Denodo som omvandlar era beräknade nyckeltal till det internationella hälsodataformatet FHIR. Ni kör dem precis som alla andra vyer. Sedan kan den data som kommer ut transformeras via SSIS (Microsofts verktyg som ni redan använder för rapportering till Socialstyrelsen) till färdiga FHIR-filer. Inga nya system behövs — bara nya vyer ovanpå det ni redan har.
            </div>
          </Card>
        </div>)}

        {/* ═══ HELHETSBILD ═══ */}
        {tab === "arkitektur" && (<div>
          <Card>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>Så hänger allt ihop</div>
            <div style={{ fontFamily: mono, fontSize: 12, lineHeight: 2.2, background: "#1e1e2e", color: "#cdd6f4", padding: 20, borderRadius: 8, textAlign: "center" }}>
              <div style={{ color: "#6c7086" }}>Era journalsystem (Melior, ELVIS, Orbit)</div>
              <div style={{ color: "#6c7086" }}>            │</div>
              <div style={{ color: "#a6e3a1" }}>┌───────────┴───────────────────────┐</div>
              <div style={{ color: "#a6e3a1" }}>│  Steg 1: Hämta data              │ ← Ni anpassade</div>
              <div style={{ color: "#a6e3a1" }}>│  (det enda VGR-specifika)         │</div>
              <div style={{ color: "#a6e3a1" }}>└───────────┬───────────────────────┘</div>
              <div style={{ color: "#a6e3a1" }}>┌───────────┴───────────────────────┐</div>
              <div style={{ color: "#a6e3a1" }}>│  Steg 2: Beräkna väntetider      │ ← Samma för alla</div>
              <div style={{ color: "#a6e3a1" }}>│  (dagar, intervall, VG-uppfylld)  │    regioner</div>
              <div style={{ color: "#a6e3a1" }}>└───────────┬───────────────────────┘</div>
              <div style={{ color: "#a6e3a1" }}>┌───────────┴───────────────────────┐</div>
              <div style={{ color: "#a6e3a1" }}>│  Steg 3: Färdiga nyckeltal       │ ← 16 nyckeltal</div>
              <div style={{ color: "#a6e3a1" }}>│  (median, andel, fördelning)      │</div>
              <div style={{ color: "#a6e3a1" }}>└──┬────────────────────────────┬───┘</div>
              <div style={{ color: "#fab387" }}>   │                            │</div>
              <div style={{ color: "#fab387" }}>┌──┴──────────────┐   ┌───────┴──────────┐</div>
              <div style={{ color: "#fab387" }}>│ Kvalitetskontroll│   │ FHIR-format      │</div>
              <div style={{ color: "#fab387" }}>│ 7 automatiska   │   │ Internationell   │</div>
              <div style={{ color: "#fab387" }}>│ kontroller      │   │ standard         │</div>
              <div style={{ color: "#fab387" }}>│ (skickat idag)  │   │ (kommer snart)   │</div>
              <div style={{ color: "#fab387" }}>└─────────────────┘   └───────┬──────────┘</div>
              <div style={{ color: "#89b4fa" }}>                      ┌───────┴──────────┐</div>
              <div style={{ color: "#89b4fa" }}>                      │ SSIS-transformation│</div>
              <div style={{ color: "#89b4fa" }}>                      │ (Microsofts verktyg)│</div>
              <div style={{ color: "#89b4fa" }}>                      └───────┬──────────┘</div>
              <div style={{ color: "#cba6f7" }}>                      ┌───────┴──────────┐</div>
              <div style={{ color: "#cba6f7" }}>                      │  Socialstyrelsen │</div>
              <div style={{ color: "#cba6f7" }}>                      │  / Vårddatahubben│</div>
              <div style={{ color: "#cba6f7" }}>                      └──────────────────┘</div>
            </div>
          </Card>

          <Card>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>Allt ni byggt används vidare</div>
            <div style={{ fontSize: 14, lineHeight: 1.8 }}>
              Det här är inte en pilot som sedan ska "göras om ordentligt". Alla vyer dokumenteras och sparas i hubbens gemensamma kodbibliotek. Er insats — att anpassa datahämtningen till era system — är det enda som är specifikt för VGR. Beräkningar, kvalitetskontroller och FHIR-lagret fungerar för alla regioner.
            </div>
            <div style={{ fontSize: 14, lineHeight: 1.8, marginTop: 12 }}>
              Nästa region som vill köra samma sak behöver bara anpassa steg 1 (datahämtningen) till sitt datalager. Allt annat följer med.
            </div>
          </Card>

          <Card style={{ background: C.accentBg }}>
            <div style={{ fontSize: 14, color: C.accent, lineHeight: 1.8 }}>
              <strong>Varför internationell standard?</strong> Socialstyrelsen tar över väntetidsrapporteringen från SKR den 1 juli 2025. De planerar att använda FHIR (den internationella hälsodatastandarden) för inrapportering. Genom att vi bygger FHIR-lagret nu är ni redo innan det blir ett krav — och det kostar er ingenting extra, eftersom vyerna bara läser från det ni redan har.
            </div>
          </Card>
        </div>)}

        <div style={{ marginTop: 24, paddingTop: 12, borderTop: `1px solid ${C.border}`, color: C.dim, fontSize: 10, display: "flex", justifyContent: "space-between" }}>
          <span>KCHD × VGR | Katarakt väntetidsdata | Statusmöte</span>
          <span>2026-03-26</span>
        </div>
      </div>
    </div>
  );
}
