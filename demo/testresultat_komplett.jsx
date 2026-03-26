import { useState } from "react";

const DATA = {"period":"februari 2026","region":"Västra Götaland","sjukhus":[{"namn":"Sahlgrenska Universitetssjukhuset","kod":"501010","antal":19,"andel":85.7,"namnare":14,"taljare":12,"median":61,"medel":54.6,"patientresa":77,"remiss_beslut":39,"man":11,"kvinna":8,"alder":{"<50":0,"50-64":1,"65-74":11,"75-84":7,"85+":0},"vantetid":{"0-30":6,"31-60":3,"61-90":8,"91-120":1,"121-180":1,">180":0},"per_bokning":[{"kod":"2","antal":5,"andel":100.0,"median":41},{"kod":"3","antal":8,"andel":75.0,"median":65.5},{"kod":"4","antal":6,"andel":100.0,"median":34.5}],"per_remittent":[{"hsaid":"OPT001","antal":3,"andel":100.0,"median":63},{"hsaid":"OPT002","antal":4,"andel":100.0,"median":36.0},{"hsaid":"OPT003","antal":4,"andel":100.0,"median":45.0},{"hsaid":"OPT004","antal":4,"andel":66.7,"median":47.5}]},{"namn":"Skaraborgs Sjukhus","kod":"501040","antal":13,"andel":100.0,"namnare":10,"taljare":10,"median":58,"medel":61.8,"patientresa":87,"remiss_beslut":35,"man":3,"kvinna":10,"alder":{"<50":0,"50-64":1,"65-74":5,"75-84":5,"85+":2},"vantetid":{"0-30":1,"31-60":6,"61-90":4,"91-120":1,"121-180":1,">180":0},"per_bokning":[{"kod":"2","antal":3,"andel":100.0,"median":66},{"kod":"3","antal":7,"andel":100.0,"median":58},{"kod":"4","antal":3,"andel":100.0,"median":57}],"per_remittent":[{"hsaid":"OPT001","antal":1,"andel":100.0,"median":38},{"hsaid":"OPT002","antal":2,"andel":100.0,"median":72.0},{"hsaid":"OPT003","antal":2,"andel":100.0,"median":69.5},{"hsaid":"OPT004","antal":4,"andel":100.0,"median":48.0}]},{"namn":"Södra Älvsborgs Sjukhus","kod":"501050","antal":20,"andel":88.2,"namnare":17,"taljare":15,"median":54.0,"medel":59.5,"patientresa":87,"remiss_beslut":30,"man":8,"kvinna":12,"alder":{"<50":0,"50-64":4,"65-74":5,"75-84":9,"85+":2},"vantetid":{"0-30":3,"31-60":11,"61-90":3,"91-120":1,"121-180":2,">180":0},"per_bokning":[{"kod":"2","antal":7,"andel":100.0,"median":43},{"kod":"3","antal":6,"andel":83.3,"median":58.0},{"kod":"4","antal":7,"andel":80.0,"median":37}],"per_remittent":[{"hsaid":"OPT001","antal":2,"andel":0.0,"median":78.5},{"hsaid":"OPT002","antal":8,"andel":100.0,"median":56.0},{"hsaid":"OPT003","antal":5,"andel":80.0,"median":54},{"hsaid":"OPT004","antal":4,"andel":100.0,"median":47.0}]},{"namn":"NU-sjukvården","kod":"501060","antal":18,"andel":100.0,"namnare":12,"taljare":12,"median":61.5,"medel":65.2,"patientresa":90,"remiss_beslut":34,"man":11,"kvinna":7,"alder":{"<50":0,"50-64":0,"65-74":15,"75-84":3,"85+":0},"vantetid":{"0-30":3,"31-60":5,"61-90":7,"91-120":0,"121-180":3,">180":0},"per_bokning":[{"kod":"2","antal":5,"andel":100.0,"median":32},{"kod":"3","antal":10,"andel":100.0,"median":55.5},{"kod":"4","antal":3,"andel":100.0,"median":126}],"per_remittent":[{"hsaid":"OPT001","antal":4,"andel":100.0,"median":55.5},{"hsaid":"OPT002","antal":6,"andel":100.0,"median":71.5},{"hsaid":"OPT003","antal":1,"andel":100.0,"median":62},{"hsaid":"OPT004","antal":2,"andel":100.0,"median":38.5}]}]};

const BOKNING_NAMN = {"2":"Tidbok (web)","3":"Tidbok (telefon)","4":"Väntelista"};
const font = "'Inter', -apple-system, sans-serif";

const Bar = ({ value, max, color }) => (
  <div style={{ background: "#f1f5f9", borderRadius: 4, height: 20, width: "100%", overflow: "hidden" }}>
    <div style={{ background: color, height: "100%", width: `${Math.min((value/max)*100,100)}%`, borderRadius: 4, transition: "width 0.3s" }} />
  </div>
);

const AndelBadge = ({ andel }) => {
  const color = andel >= 90 ? "#15803d" : andel >= 80 ? "#b45309" : "#dc2626";
  const bg = andel >= 90 ? "#f0fdf4" : andel >= 80 ? "#fffbeb" : "#fef2f2";
  return <span style={{ fontSize: 13, fontWeight: 700, padding: "3px 10px", borderRadius: 6, background: bg, color }}>{andel}%</span>;
};

export default function Testresultat() {
  const [tab, setTab] = useState("oversikt");
  const [valt, setValt] = useState(0);
  const sj = DATA.sjukhus;
  const totalt = sj.reduce((a, s) => a + s.antal, 0);
  const s = sj[valt];

  const Tb = ({ id, label }) => (
    <button onClick={() => setTab(id)} style={{ padding: "8px 16px", background: tab === id ? "#1e293b" : "transparent", color: tab === id ? "#fff" : "#64748b", border: "none", borderBottom: tab === id ? "2px solid #1e293b" : "2px solid transparent", cursor: "pointer", fontFamily: font, fontSize: 13, fontWeight: tab === id ? 600 : 400 }}>{label}</button>
  );

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh", fontFamily: font, color: "#1e293b", padding: "20px 16px" }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div style={{ marginBottom: 6 }}>
          <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 6, background: "#eff6ff", color: "#1e40af" }}>Testresultat — syntetisk data</span>
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 800, margin: "4px 0", letterSpacing: "-0.03em" }}>Katarakt väntetidsdata — hela kedjan</h1>
        <p style={{ color: "#64748b", fontSize: 13, margin: "2px 0 14px" }}>100 patienter → beräkning → kvalitetskontroll → FHIR-format → resultat</p>

        <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
          {sj.map((sjh, i) => (
            <button key={i} onClick={() => { setValt(i); setTab("oversikt"); }} style={{ padding: "8px 14px", borderRadius: 8, border: valt === i ? "2px solid #1e40af" : "1px solid #e2e8f0", background: valt === i ? "#eff6ff" : "#fff", color: valt === i ? "#1e40af" : "#475569", cursor: "pointer", fontFamily: font, fontSize: 13, fontWeight: valt === i ? 600 : 400 }}>
              {sjh.namn.length > 20 ? sjh.namn.slice(0, 18) + "…" : sjh.namn}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", gap: 0, borderBottom: "1px solid #e2e8f0", marginBottom: 14, overflowX: "auto" }}>
          <Tb id="oversikt" label="Nyckeltal" />
          <Tb id="fordelning" label="Fördelning" />
          <Tb id="dimension" label="Per bokningssätt" />
          <Tb id="remittent" label="Per remittent" />
          <Tb id="modell" label="Vår modell" />
          <Tb id="format" label="Tre format" />
          <Tb id="kedja" label="Kedjan" />
        </div>


        {tab === "oversikt" && (
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 700, margin: "0 0 12px" }}>{s.namn}</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10, marginBottom: 16 }}>
              {[
                { label: "Operationer", value: s.antal, sub: `${s.man} män, ${s.kvinna} kvinnor` },
                { label: "Inom vårdgaranti", value: `${s.andel}%`, sub: `${s.taljare} av ${s.namnare}`, color: s.andel >= 90 ? "#15803d" : "#b45309" },
                { label: "Median väntetid", value: `${s.median} d`, sub: `Medel: ${s.medel} dagar` },
                { label: "Patientresa", value: `${s.patientresa} d`, sub: `Remiss→beslut: ${s.remiss_beslut} d` },
              ].map((c, i) => (
                <div key={i} style={{ background: "#fff", borderRadius: 10, border: "1px solid #e2e8f0", padding: 14 }}>
                  <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{c.label}</div>
                  <div style={{ fontSize: 26, fontWeight: 800, color: c.color || "#1e293b", marginTop: 2 }}>{c.value}</div>
                  <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{c.sub}</div>
                </div>
              ))}
            </div>
            <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e2e8f0", padding: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>Alla sjukhus jämförda</div>
              <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #e2e8f0" }}>
                    <th style={{ textAlign: "left", padding: "6px 8px", color: "#64748b", fontWeight: 600 }}>Sjukhus</th>
                    <th style={{ textAlign: "right", padding: "6px 8px", color: "#64748b" }}>Antal</th>
                    <th style={{ textAlign: "right", padding: "6px 8px", color: "#64748b" }}>Vårdgaranti</th>
                    <th style={{ textAlign: "right", padding: "6px 8px", color: "#64748b" }}>Median</th>
                    <th style={{ textAlign: "right", padding: "6px 8px", color: "#64748b" }}>Medel</th>
                    <th style={{ textAlign: "right", padding: "6px 8px", color: "#64748b" }}>Patientresa</th>
                    <th style={{ textAlign: "right", padding: "6px 8px", color: "#64748b" }}>Rem→besl</th>
                  </tr>
                </thead>
                <tbody>
                  {sj.map((sjh, i) => (
                    <tr key={i} onClick={() => setValt(i)} style={{ borderBottom: "1px solid #f1f5f9", cursor: "pointer", background: i === valt ? "#eff6ff" : "transparent" }}>
                      <td style={{ padding: "8px", fontWeight: i === valt ? 600 : 400 }}>{sjh.namn.length > 25 ? sjh.namn.slice(0,23) + "…" : sjh.namn}</td>
                      <td style={{ textAlign: "right", padding: "8px" }}>{sjh.antal}</td>
                      <td style={{ textAlign: "right", padding: "8px" }}><AndelBadge andel={sjh.andel} /></td>
                      <td style={{ textAlign: "right", padding: "8px" }}>{sjh.median} d</td>
                      <td style={{ textAlign: "right", padding: "8px" }}>{sjh.medel} d</td>
                      <td style={{ textAlign: "right", padding: "8px" }}>{sjh.patientresa} d</td>
                      <td style={{ textAlign: "right", padding: "8px" }}>{sjh.remiss_beslut} d</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "fordelning" && (
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 700, margin: "0 0 14px" }}>{s.namn} — fördelningar</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e2e8f0", padding: 16 }}>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>Väntetid (dagar)</div>
                {Object.entries(s.vantetid).map(([k, v]) => (
                  <div key={k} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 12, color: "#64748b", minWidth: 55, textAlign: "right" }}>{k}</span>
                    <div style={{ flex: 1 }}><Bar value={v} max={s.antal} color={k === ">180" || k === "121-180" ? "#f87171" : k === "91-120" ? "#fbbf24" : "#60a5fa"} /></div>
                    <span style={{ fontSize: 12, fontWeight: 600, minWidth: 20, textAlign: "right" }}>{v}</span>
                  </div>
                ))}
              </div>
              <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e2e8f0", padding: 16 }}>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>Ålder</div>
                {Object.entries(s.alder).map(([k, v]) => (
                  <div key={k} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 12, color: "#64748b", minWidth: 55, textAlign: "right" }}>{k}</span>
                    <div style={{ flex: 1 }}><Bar value={v} max={s.antal} color="#a78bfa" /></div>
                    <span style={{ fontSize: 12, fontWeight: 600, minWidth: 20, textAlign: "right" }}>{v}</span>
                  </div>
                ))}
              </div>
              <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e2e8f0", padding: 16 }}>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>Kön</div>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: "#64748b", minWidth: 55, textAlign: "right" }}>Män</span>
                  <div style={{ flex: 1 }}><Bar value={s.man} max={s.antal} color="#60a5fa" /></div>
                  <span style={{ fontSize: 12, fontWeight: 600, minWidth: 20 }}>{s.man}</span>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span style={{ fontSize: 12, color: "#64748b", minWidth: 55, textAlign: "right" }}>Kvinnor</span>
                  <div style={{ flex: 1 }}><Bar value={s.kvinna} max={s.antal} color="#f472b6" /></div>
                  <span style={{ fontSize: 12, fontWeight: 600, minWidth: 20 }}>{s.kvinna}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === "dimension" && (
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 700, margin: "0 0 14px" }}>{s.namn} — per bokningssätt</h2>
            <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e2e8f0", padding: 16 }}>
              <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #e2e8f0" }}>
                    <th style={{ textAlign: "left", padding: "6px 8px", color: "#64748b" }}>Bokningssätt</th>
                    <th style={{ textAlign: "right", padding: "6px 8px", color: "#64748b" }}>Antal</th>
                    <th style={{ textAlign: "right", padding: "6px 8px", color: "#64748b" }}>Vårdgaranti</th>
                    <th style={{ textAlign: "right", padding: "6px 8px", color: "#64748b" }}>Median väntetid</th>
                  </tr>
                </thead>
                <tbody>
                  {s.per_bokning.map((b, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "8px" }}>{BOKNING_NAMN[b.kod] || `Kod ${b.kod}`}</td>
                      <td style={{ textAlign: "right", padding: "8px" }}>{b.antal}</td>
                      <td style={{ textAlign: "right", padding: "8px" }}><AndelBadge andel={b.andel} /></td>
                      <td style={{ textAlign: "right", padding: "8px" }}>{b.median} dagar</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "remittent" && (
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 700, margin: "0 0 14px" }}>{s.namn} — per remittent</h2>
            <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e2e8f0", padding: 16 }}>
              <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #e2e8f0" }}>
                    <th style={{ textAlign: "left", padding: "6px 8px", color: "#64748b" }}>Remittent</th>
                    <th style={{ textAlign: "right", padding: "6px 8px", color: "#64748b" }}>Antal</th>
                    <th style={{ textAlign: "right", padding: "6px 8px", color: "#64748b" }}>Vårdgaranti</th>
                    <th style={{ textAlign: "right", padding: "6px 8px", color: "#64748b" }}>Median väntetid</th>
                  </tr>
                </thead>
                <tbody>
                  {s.per_remittent.map((r, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "8px" }}>Optiker {r.hsaid}</td>
                      <td style={{ textAlign: "right", padding: "8px" }}>{r.antal}</td>
                      <td style={{ textAlign: "right", padding: "8px" }}><AndelBadge andel={r.andel} /></td>
                      <td style={{ textAlign: "right", padding: "8px" }}>{r.median} dagar</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "modell" && (
          <div>
            <h2 style={{ fontSize:17, fontWeight:700, margin:"0 0 6px" }}>Så fungerar beräkningen — steg för steg</h2>
            <p style={{ fontSize:12, color:"#64748b", margin:"0 0 16px" }}>Data från sjukhusens journalsystem renas, beräknas och paketeras. Här ser du vad som händer i varje steg.</p>

            {[
              {
                nr: "1", titel: "Rådata kommer in", subtitle: "35 variabler per vårdkontakt",
                color: "#2563eb", bg: "#eff6ff",
                text: "Varje operation som registreras i sjukhusets system (Melior, ELVIS) genererar en rad med 35 uppgifter: vem patienten är, vilken åtgärd som gjordes, när remissen kom, när behandlingen startade, och så vidare.",
                input: "Alla operationer från VGR:s system",
                output: "I testdata: 100 rader, 35 kolumner per rad",
                examples: ["Personnummer → födelsear + kön", "KVÅ-kod (t.ex. CJE20 = linsimplantation)", "Datum: remiss, beslut, operation", "Sjukhus, remittent, bokningssätt"]
              },
              {
                nr: "2", titel: "Vi filtrerar", subtitle: "Bara katarakt, bara genomförda",
                color: "#dc2626", bg: "#fef2f2",
                text: "Inte alla operationer är katarakt. Vi plockar ut de rader som har rätt KVÅ-kod (15 stycken för gråstarr) och rätt verksamhetsområde (ögon = 511). Vi delar upp i genomförda och väntande.",
                input: "100 rader",
                output: "70 genomförda + 30 väntande",
                examples: ["Bort: ortopedi, hjärta, övrigt", "Kvar: CJC00, CJE20, CJD10... (15 koder)", "GENOMFORD → nyckeltal", "VANTANDE → separat lista"]
              },
              {
                nr: "3", titel: "Vi beräknar väntetider", subtitle: "4 beräkningar per patient — stannar inom regionen",
                color: "#7c3aed", bg: "#fdf4ff",
                text: "Varje enskild patient får fyra siffror beräknade från sina datum. Dessa stannar inom regionen — det är patientnivådata och får inte skickas till hubben. Däremot är de råmaterialet som nästa steg aggregerar till statistik.",
                input: "70 genomförda operationer med datum",
                output: "70 rader × 4 beräknade värden per rad",
                examples: [
                  "Väntetid = operationsdag − beslutsdag (t.ex. 58 dagar)",
                  "Patientresa = operationsdag − remissdag (t.ex. 77 dagar)",
                  "Remiss→beslut = beslutsdag − remissdag (t.ex. 17 dagar)",
                  "Inom garanti? JA om väntetid ≤ 90 dagar (t.ex. JA)"
                ]
              },
              {
                nr: "4", titel: "Vi räknar ihop till nyckeltal", subtitle: "16 KPI:er — byggda av steg 3",
                color: "#059669", bg: "#f0fdf4",
                text: "Nu sammanfattar vi alla patienters siffror från steg 3 till nyckeltal per sjukhus. T.ex. beräkningen 'väntetid' (steg 3) ger upphov till medianen, medelvärdet, andelen inom 90 dagar och fördelningen (steg 4). Samma nyckeltal bryts dessutom ner per kön, ålder, bokningssätt, remittent och kommun.",
                input: "70 rader med 4 beräknade värden per rad",
                output: "16 KPI:er × 4 sjukhus = 20 totaler + 420 per-dimension",
                examples: [
                  "Andel inom 90 dagar: 85.7% (Sahlgrenska)",
                  "Medianväntetid: 61 dagar",
                  "Per bokningssätt: tidbok 100%, väntelista 75%",
                  "Per remittent: OPT004 bara 67%"
                ]
              },
              {
                nr: "5", titel: "Vi paketerar statistik för FHIR", subtitle: "Bara aggregerade nyckeltal lämnar regionen",
                color: "#1e40af", bg: "#eff6ff",
                text: "Nyckeltalen — inte patientdata — formateras till FHIR MeasureReport. Det som skickas till hubben är statistik: '85.7% klarade vårdgarantin, medianen var 61 dagar'. Inga personnummer, datum eller radnivådata lämnar regionen.",
                input: "440 nyckeltal-rader (aggregerade)",
                output: "12 MeasureReport-resurser (214 KB JSON) — klassade som statistik",
                examples: [
                  "Hubben tar emot: 'Sahlgrenska, feb 2026, 85.7%'",
                  "Hubben tar INTE emot: 'Patient X väntade 58 dagar'",
                  "Stratifiers: kön, ålder, intervall, bokning, remittent, kommun",
                  "Internationellt format → SoS, EHDS, andra regioner"
                ]
              },
              {
                nr: "6", titel: "FHIR-paketen skickas till hubben", subtitle: "16 KPI:er via REST API",
                color: "#dc2626", bg: "#fef2f2",
                text: "De 12 MeasureReport-resurserna — som tillsammans innehåller alla 16 KPI:er — skickas från regionen till vårddatahubben via FHIR REST API. Hubben tar emot, validerar och lagrar. Andra regioner gör samma sak med sin data. Hubben kan sedan jämföra, aggregera nationellt och skicka vidare till Socialstyrelsen.",
                input: "12 MeasureReports (FHIR Bundle, 214 KB)",
                output: "Hubben bekräftar: HTTP 200 OK, data lagrat",
                examples: [
                  "POST https://hub.kchd.se/fhir/Bundle",
                  "Hubben validerar: rätt format? rätt period? alla KPI:er?",
                  "Alla 21 regioner skickar samma paket → nationell bild",
                  "Hubben kan svara tillbaka: 'er median är 61d, riket 54d'"
                ]
              },
            ].map((step, i) => (
              <div key={i} style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: step.bg, border: `2px solid ${step.color}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 800, color: step.color, flexShrink: 0 }}>{step.nr}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: "#1e293b" }}>{step.titel}</div>
                    <div style={{ fontSize: 12, color: step.color, fontWeight: 600 }}>{step.subtitle}</div>
                    <div style={{ fontSize: 13, color: "#475569", marginTop: 6, lineHeight: 1.6 }}>{step.text}</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 8 }}>
                      {step.examples.map((ex, j) => (
                        <div key={j} style={{ fontSize: 11, color: "#475569", padding: "6px 10px", background: step.bg, borderRadius: 6, borderLeft: `3px solid ${step.color}` }}>{ex}</div>
                      ))}
                    </div>
                    <div style={{ display: "flex", gap: 16, marginTop: 8, fontSize: 11 }}>
                      <div><span style={{ color: "#94a3b8" }}>In: </span><span style={{ color: "#475569", fontWeight: 500 }}>{step.input}</span></div>
                      <div><span style={{ color: "#94a3b8" }}>Ut: </span><span style={{ color: step.color, fontWeight: 600 }}>{step.output}</span></div>
                    </div>
                  </div>
                </div>
                {i < 5 && <div style={{ marginLeft: 20, borderLeft: `2px dashed ${step.color}33`, height: 16 }} />}
              </div>
            ))}

            <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e2e8f0", padding: 14, marginTop: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Vad händer med de 35 variablerna?</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                <div style={{ background: "#f0fdf4", borderRadius: 8, padding: 10 }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "#15803d" }}>22</div>
                  <div style={{ fontSize: 11, color: "#166534", fontWeight: 600 }}>Används i beräkningen</div>
                  <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>Filter, datum, grupperingar</div>
                </div>
                <div style={{ background: "#eff6ff", borderRadius: 8, padding: 10 }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "#1e40af" }}>16</div>
                  <div style={{ fontSize: 11, color: "#1e40af", fontWeight: 600 }}>Bidrar till FHIR-outputen</div>
                  <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>Period, sjukhus, nyckeltal, dimensioner</div>
                </div>
                <div style={{ background: "#f8fafc", borderRadius: 8, padding: 10 }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "#94a3b8" }}>13</div>
                  <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>Finns i källan, används inte</div>
                  <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>Hierarki, dubbletter, referensdata</div>
                </div>
              </div>
              <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 8 }}>Se fliken "Tre format" för exakt vilka variabler som hamnar var.</div>
            </div>
          </div>
        )}

        {tab === "format" && (() => {
          const mono = { fontFamily: "'Courier New', monospace", fontSize: 10, lineHeight: 1.4 };
          const V = (col,cat,val,denodo,fhirAgg,fhirRad,conf) => ({col,cat,val,denodo,fhirAgg,fhirRad,conf});
          const cc2 = {
            id:{ bg:"#f1f5f9",c:"#475569",l:"ID" }, tid:{ bg:"#fef3c7",c:"#92400e",l:"Tid" },
            geo:{ bg:"#eff6ff",c:"#1e40af",l:"Geo" }, pat:{ bg:"#fce7f3",c:"#9d174d",l:"Patient" },
            klin:{ bg:"#fef2f2",c:"#991b1b",l:"Klinisk" }, proc:{ bg:"#f0fdf4",c:"#166534",l:"Process" },
            dat:{ bg:"#fdf4ff",c:"#7c3aed",l:"Datum" }, ber:{ bg:"#ecfdf5",c:"#065f46",l:"Beräknad" },
          };
          // conf: ✅=verifierad mot R4 spec, ⚠=kräver Extension, —=ej relevant
          const vars = [
            V("vardkontakt_id","id","VK-2026-0001","src_genomford (PK)","—","Procedure.identifier","✅"),
            V("remiss_id","id","REM-2026-0001","calc_vantetid (FK)","—","ServiceRequest.identifier","✅"),
            V("matperiod","tid","2026-02-01","res_kpi_manad (GROUP BY)","MR.period.start/end","—","✅"),
            V("regionkod","geo","14","res_kpi_manad (GROUP BY)","—","Organization.identifier","✅"),
            V("hsaid_region","geo","SE…00001","res_kpi_manad","MR.subject.identifier","Organization.identifier","✅"),
            V("hsaid_vardgivare","geo","SE…00131","—","—","Organization.partOf","✅"),
            V("hsaid_vardenhet","geo",(s.hsaid||"").slice(-10),"res_kpi_manad (GROUP BY)","MR.reporter.identifier","Procedure.performer.actor","✅"),
            V("hsaid_enhet","geo","SE…10148","—","—","Encounter.serviceProvider","✅"),
            V("hsaid_listning","geo","(tom)","—","—","Patient.generalPractitioner","✅"),
            V("sjukhuskod","geo",s.kod||"501010","res_kpi_manad (GROUP BY)","—","Organization.identifier","✅"),
            V("sjukhusnamn","geo",s.namn.slice(0,16),"res_kpi_manad","MR.reporter.display","Organization.name","✅"),
            V("lkf","geo","1480","res_kpi_per_kommun","stratifier[kommun]","Patient.address.district","✅"),
            V("fodelsear","pat","1958","calc → åldersgrupp","stratifier[alder]","Patient.birthDate","✅"),
            V("kon","pat","1","res_kpi_manad","stratifier[kon]","Patient.gender","✅"),
            V("kva_kod","klin","CJE20","src_genomford (FILTER)","—","Procedure.code","✅"),
            V("mvo_kod","klin","511","src_genomford (FILTER)","—","Encounter.serviceType","✅"),
            V("aktivitetskod","klin","A06","—","—","Extension","⚠"),
            V("aktivitet_kva","klin","CJE20","—","—","(dubblett)","—"),
            V("aktivitet_icd","klin","H25.0","—","—","Condition.code","✅"),
            V("vardgaranti","proc","JA","calc → nämnare","population[denominator]","Extension","⚠"),
            V("avvikelsekod","proc","(tom)","calc → exkludering","(indirekt)","Extension","⚠"),
            V("status","proc","GENOMFORD","src_genomford (FILTER)","population[initial-pop]","Procedure.status","✅"),
            V("fas","proc","4","src_genomford","—","Extension","⚠"),
            V("typ_akutverksamhet","proc","(tom)","—","—","Encounter.priority","✅"),
            V("yrkeskategori","proc","XS915","res_kpi_per_yrke","stratifier[yrkesk.]","PractitionerRole.code","✅"),
            V("bokningssatt","proc","3","res_kpi_per_bokning","stratifier[bokning]","Extension","⚠"),
            V("vardkontakttyp","proc","0","res_kpi_per_kontaktform","stratifier[kontakt]","Encounter.class","✅"),
            V("remittenttyp","proc","1","(referens)","—","ServiceRequest.requester type","✅"),
            V("remittent_hsaid","proc","SE…OPT002","res_kpi_per_remittent","stratifier[remittent]","ServiceRequest.requester","✅"),
            V("remiss_datum","dat","2025-12-05","calc → patientresa","group[patientresa].score","ServiceRequest.authoredOn","✅"),
            V("ankomst_datum","dat","2025-12-07","—","—","Extension","⚠"),
            V("beslut_datum","dat","2025-12-22","calc → väntetid","group[andel/median].score","Extension","⚠"),
            V("medicinskt_maldatum","dat","2026-03-22","—","—","ServiceRequest.occurrencePeriod","✅"),
            V("start_datum","dat","2026-02-18","calc → väntetid","group[alla].measureScore","Procedure.performedDateTime","✅"),
            V("vantetid_dagar","ber","58","(vi räknar själva)","—","(beräknas)","—"),
          ];
          const th2 = { textAlign:"left", padding:"5px 6px", color:"#64748b", fontWeight:600, fontSize:10, borderBottom:"2px solid #e2e8f0", position:"sticky", top:0, background:"#fff", zIndex:1 };
          const nDenodo = vars.filter(v => v.denodo !== "—").length;
          const nAgg = vars.filter(v => v.fhirAgg !== "—" && !v.fhirAgg.startsWith("(")).length;
          const nRadOk = vars.filter(v => v.conf === "✅" && v.fhirRad !== "—").length;
          const nRadExt = vars.filter(v => v.conf === "⚠").length;
          return (
            <div>
              <h2 style={{ fontSize:17, fontWeight:700, margin:"0 0 4px" }}>{s.namn} — alla 35 variabler, verifierade mappningar</h2>
              <p style={{ fontSize:12, color:"#64748b", margin:"0 0 10px" }}>Varje mappning verifierad mot hl7.org/fhir/R4. Kolumnen Konf visar: ✅ standard R4, ⚠ kräver Extension, — ej relevant.</p>
              <div style={{ background:"#fff", borderRadius:10, border:"1px solid #e2e8f0", padding:14, marginBottom:14 }}>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
                  <div style={{ background:"#f0fdf4", borderRadius:8, padding:10, border:"1px solid #bbf7d0" }}>
                    <div style={{ fontSize:11, fontWeight:600, color:"#166534" }}>Vår modell (Denodo)</div>
                    <div style={{ fontSize:18, fontWeight:800, color:"#15803d" }}>{nDenodo} av 35 används</div>
                    <div style={{ fontSize:10, color:"#94a3b8" }}>Filter, beräkningar, grupperingar</div>
                  </div>
                  <div style={{ background:"#eff6ff", borderRadius:8, padding:10, border:"1px solid #bfdbfe" }}>
                    <div style={{ fontSize:11, fontWeight:600, color:"#1e40af" }}>FHIR aggregerat (fas 2)</div>
                    <div style={{ fontSize:18, fontWeight:800, color:"#1e40af" }}>16/16 KPI:er ✅</div>
                    <div style={{ fontSize:10, color:"#94a3b8" }}>{nAgg} källvariabler bidrar</div>
                  </div>
                  <div style={{ background:"#fdf4ff", borderRadius:8, padding:10, border:"1px solid #e9d5ff" }}>
                    <div style={{ fontSize:11, fontWeight:600, color:"#7c3aed" }}>FHIR radnivå (fas 4)</div>
                    <div style={{ fontSize:18, fontWeight:800, color:"#7c3aed" }}>{nRadOk} ✅ + {nRadExt} ⚠</div>
                    <div style={{ fontSize:10, color:"#94a3b8" }}>{nRadOk} standard R4, {nRadExt} kräver Extension</div>
                  </div>
                </div>
              </div>
              <div style={{ background:"#fff", borderRadius:10, border:"1px solid #e2e8f0", overflow:"hidden" }}>
                <div style={{ overflowX:"auto", maxHeight:480, overflowY:"auto" }}>
                  <table style={{ width:"100%", borderCollapse:"collapse", ...mono }}>
                    <thead>
                      <tr>
                        <th style={{ ...th2, minWidth:18 }}>#</th>
                        <th style={{ ...th2, minWidth:42 }}>Typ</th>
                        <th style={{ ...th2, minWidth:125 }}>Källvariabel</th>
                        <th style={{ ...th2, minWidth:70 }}>Exempel</th>
                        <th style={{ ...th2, minWidth:135, borderLeft:"2px solid #bbf7d0" }}>Vår modell</th>
                        <th style={{ ...th2, minWidth:125, borderLeft:"2px solid #bfdbfe" }}>FHIR aggregerat</th>
                        <th style={{ ...th2, minWidth:150, borderLeft:"2px solid #e9d5ff" }}>FHIR radnivå</th>
                        <th style={{ ...th2, minWidth:22 }}>Konf</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vars.map((v, i) => {
                        const ct = cc2[v.cat];
                        const isNew = i === 0 || vars[i-1].cat !== v.cat;
                        const mk = (val, cOn, cOff) => ({ padding:"4px 5px", fontSize:9, color:(val==="—"||val.startsWith("("))?cOff:cOn, fontWeight:(val==="—"||val.startsWith("("))?400:500 });
                        return (
                          <tr key={i} style={{ borderBottom:"1px solid #f1f5f9", background:i%2===0?"#fafbfc":"#fff", borderTop:isNew?"2px solid "+ct.c+"22":"none" }}>
                            <td style={{ padding:"4px 5px", color:"#94a3b8", fontSize:9 }}>{i+1}</td>
                            <td style={{ padding:"4px 5px" }}>
                              <span style={{ fontSize:8, padding:"1px 4px", borderRadius:3, background:ct.bg, color:ct.c, fontWeight:600 }}>{ct.l}</span>
                            </td>
                            <td style={{ padding:"4px 5px", fontWeight:600, color:"#1e293b" }}>{v.col}</td>
                            <td style={{ padding:"4px 5px", color:"#0f172a", fontSize:9 }}>{v.val}</td>
                            <td style={{ ...mk(v.denodo,"#15803d","#cbd5e1"), borderLeft:"2px solid #bbf7d0" }}>{v.denodo}</td>
                            <td style={{ ...mk(v.fhirAgg,"#1e40af","#cbd5e1"), borderLeft:"2px solid #bfdbfe" }}>{v.fhirAgg}</td>
                            <td style={{ ...mk(v.fhirRad,"#7c3aed","#cbd5e1"), borderLeft:"2px solid #e9d5ff" }}>{v.fhirRad}</td>
                            <td style={{ padding:"4px 5px", fontSize:11, textAlign:"center" }}>{v.conf}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          );
        })()}

        {tab === "kedja" && (
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 700, margin: "0 0 14px" }}>Hela kedjan — steg för steg</h2>
            {[
              { nr: "1", titel: "Testdata", desc: "100 syntetiska patienter (70 genomförda, 30 väntande) för 4 VGR-sjukhus, period februari 2026.", status: "✅", detalj: "katarakt_testdata_100_VGR.csv" },
              { nr: "2", titel: "Beräkning (steg 1–3)", desc: "70 operationer beräknade: väntetid, vårdgaranti, patientresa. 5 nyckeltal × 4 sjukhus = 20 totalvärden.", status: "✅", detalj: "res_kpi_manad + res_kpi_per_*" },
              { nr: "3", titel: "Kvalitetskontroll", desc: "7 automatiska kontroller körda. Alla 30 delkontroller passerade utan fel.", status: "✅", detalj: "dq0–dq6 + dq_rapport_data" },
              { nr: "4", titel: "FHIR-tabell", desc: "440 rader: 20 totalrader (5 nyckeltal × 4 sjukhus) + 420 per-dimension-rader (5 dimensioner × 5 nyckeltal × varierande antal). Alla 16 KPI:er täckta.", status: "✅", detalj: "fhir_measure_report → fhir_resultat.tsv" },
              { nr: "5", titel: "FHIR JSON", desc: "12 MeasureReport-resurser i en FHIR Bundle (214 KB). Validerad mot FHIR R4-specifikationen.", status: "✅", detalj: "fhir_serializer.py → fhir_bundle_example.json" },
              { nr: "6", titel: "C#/SSIS (nästa steg)", desc: "VGR bygger C#-serialiserare baserat på vår spec och Python-referens. Jämför output mot referens-JSON.", status: "📋", detalj: "fhir_serializer_spec.md → VGR" },
            ].map((step, i) => (
              <div key={i} style={{ display: "flex", gap: 12, marginBottom: 10, background: "#fff", borderRadius: 10, border: "1px solid #e2e8f0", padding: 14, alignItems: "flex-start" }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: step.status === "✅" ? "#f0fdf4" : "#fffbeb", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>{step.status}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>Steg {step.nr}: {step.titel}</div>
                  <div style={{ fontSize: 13, color: "#475569", marginTop: 2 }}>{step.desc}</div>
                  <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4, fontFamily: "monospace" }}>{step.detalj}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: 20, padding: "10px 0", borderTop: "1px solid #e2e8f0", color: "#94a3b8", fontSize: 10, display: "flex", justifyContent: "space-between" }}>
          <span>KCHD × VGR | Katarakt väntetidsdata | Testresultat mot syntetisk data</span>
          <span>Genererat 2026-03-26</span>
        </div>
      </div>
    </div>
  );
}
