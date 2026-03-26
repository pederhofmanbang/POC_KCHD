import { useState } from "react";

const font = "'Inter', -apple-system, sans-serif";
const mono = "'JetBrains Mono', 'Fira Code', monospace";

const VERIF = [
  { kpi: "Andel inom 90 dagar", varde: "92.5", enhet: "%", namnare: 53, taljare: 49, var: "vantetider.se > Spec. vård > Aktuellt VG-läge > Välj: VGR + Ögonsjukvård + Operation/åtgärd", kommentar: "Spindeldiagrammet visar andel i %. Välj rätt period." },
  { kpi: "Medianväntetid (alla genomförda)", varde: "58.0", enhet: "dagar", namnare: 70, taljare: null, var: "vantetider.se > Spec. vård > Medel- och medianväntetid > Välj: VGR + Ögonsjukvård + Operation/åtgärd", kommentar: "Visa median (inte medel). Tabellen visar dagar." },
  { kpi: "Medelväntetid (alla genomförda)", varde: "60.1", enhet: "dagar", namnare: 70, taljare: null, var: "vantetider.se > Spec. vård > Medel- och medianväntetid > Välj: VGR + Ögonsjukvård + Operation/åtgärd", kommentar: "Visa medel (inte median). Tabellen visar dagar." },
  { kpi: "Antal genomförda operationer", varde: "70", enhet: "st", namnare: null, taljare: null, var: "vantetider.se > Spec. vård > Utökad uppföljning > Välj: VGR + Ögonsjukvård + Operation/åtgärd", kommentar: "Antal visas i tabellen. Välj rätt månad." },
  { kpi: "Antal väntande", varde: "30", enhet: "st", namnare: null, taljare: null, var: "vantetider.se > Spec. vård > Utökad uppföljning > Välj: VGR + Ögonsjukvård + Operation/åtgärd > Fliken Väntande", kommentar: "Ögonblicksbild sista dag i månaden." },
  { kpi: "  Intervall 0-30 dagar", varde: "13", enhet: "st", namnare: null, taljare: null, var: "Utökad uppföljning > Fördelning", kommentar: "Stapeldiagrammet visar antal per intervall." },
  { kpi: "  Intervall 31-60 dagar", varde: "25", enhet: "st" },
  { kpi: "  Intervall 61-90 dagar", varde: "22", enhet: "st" },
  { kpi: "  Intervall 91-120 dagar", varde: "3", enhet: "st" },
  { kpi: "  Intervall 121-180 dagar", varde: "7", enhet: "st" },
  { kpi: "  Intervall >180 dagar", varde: "0", enhet: "st" },
  { kpi: "Median man", varde: "58", enhet: "dagar", namnare: 33, taljare: null, var: "Utökad uppföljning > Filtrera på kön", kommentar: "Välj Man i dropdown." },
  { kpi: "Median kvinna", varde: "57", enhet: "dagar", namnare: 37, taljare: null, var: "", kommentar: "" },
];

const STICKPROV = [
  { id: "VGR-ÖGON-F49581111D33", sjukhus: "Sahlgrenska", kva: "CJE20", beslut: "2026-01-06", start: "2026-02-02", vt: 27, vg: "JA", avv: "—", uppf: 1 },
  { id: "VGR-ÖGON-5DC818C34D85", sjukhus: "NU-sjukvården", kva: "CJE20", beslut: "2025-10-02", start: "2026-02-05", vt: 126, vg: "JA", avv: "PvV", uppf: 0 },
  { id: "VGR-ÖGON-ED9AAD06F441", sjukhus: "SÄS", kva: "CJE20", beslut: "2026-01-11", start: "2026-02-23", vt: 43, vg: "JA", avv: "—", uppf: 1 },
  { id: "VGR-ÖGON-28758F6F01D4", sjukhus: "NU-sjukvården", kva: "CJE20", beslut: "2025-12-14", start: "2026-02-21", vt: 69, vg: "JA", avv: "—", uppf: 1 },
  { id: "VGR-ÖGON-0E5D0B109325", sjukhus: "NU-sjukvården", kva: "CJE20", beslut: "2026-01-14", start: "2026-02-07", vt: 24, vg: "JA", avv: "—", uppf: 1 },
  { id: "VGR-ÖGON-A6E8ADD93E02", sjukhus: "NU-sjukvården", kva: "CJE20", beslut: "2026-01-11", start: "2026-02-12", vt: 32, vg: "NEJ", avv: "—", uppf: 0 },
  { id: "VGR-ÖGON-21A6F85BDC7E", sjukhus: "Skaraborgs Sjh", kva: "CJE20", beslut: "2025-12-24", start: "2026-02-28", vt: 66, vg: "JA", avv: "—", uppf: 1 },
  { id: "VGR-ÖGON-345F08702E54", sjukhus: "NU-sjukvården", kva: "CJE00", beslut: "2025-08-29", start: "2026-02-17", vt: 172, vg: "JA", avv: "PvV", uppf: 0 },
  { id: "VGR-ÖGON-98C19F851F1E", sjukhus: "Sahlgrenska", kva: "CJE20", beslut: "2025-12-27", start: "2026-02-27", vt: 62, vg: "JA", avv: "—", uppf: 1 },
  { id: "VGR-ÖGON-7A1E64C1AA73", sjukhus: "SÄS", kva: "CJE20", beslut: "2025-12-23", start: "2026-02-15", vt: 54, vg: "JA", avv: "—", uppf: 1 },
];

export default function Verifiering() {
  const [tab, setTab] = useState("resultat");
  const Tb = ({ id, children }) => (
    <button onClick={() => setTab(id)} style={{ padding: "8px 16px", background: tab===id ? "#1e40af" : "transparent", color: tab===id ? "#fff" : "#6b7280", border: "none", borderBottom: tab===id ? "2px solid #1e40af" : "2px solid transparent", cursor: "pointer", fontFamily: font, fontSize: 13, fontWeight: tab===id ? 600 : 400 }}>{children}</button>
  );

  return (
    <div style={{ background: "#f9fafb", minHeight: "100vh", fontFamily: font, padding: "20px 16px" }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600;700&display=swap" rel="stylesheet" />
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
          <span style={{ background: "#1e40af", color: "#fff", padding: "3px 10px", borderRadius: 5, fontSize: 11, fontWeight: 700, fontFamily: mono }}>KCHD</span>
          <span style={{ background: "#dbeafe", color: "#1e40af", padding: "3px 8px", borderRadius: 5, fontSize: 11, fontWeight: 600 }}>Verifieringspaket</span>
          <span style={{ background: "#fef3c7", color: "#92400e", padding: "3px 8px", borderRadius: 5, fontSize: 11, fontWeight: 600 }}>Testdata VGR 100 pat</span>
        </div>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: "#111827", margin: "6px 0 2px", letterSpacing: "-0.03em" }}>SELECT * FROM verif_jamforelse</h1>
        <p style={{ color: "#6b7280", fontSize: 13, margin: "0 0 14px" }}>Resultat av verifieringsvyn körda mot VGR:s testdata. Jämför kolumn "beräknat_värde" med vantetider.se.</p>

        <div style={{ display: "flex", gap: 0, borderBottom: "1px solid #e5e7eb", marginBottom: 14 }}>
          <Tb id="resultat">Resultat (verif_jamforelse)</Tb>
          <Tb id="stickprov">Stickprov (verif_stickprov)</Tb>
          <Tb id="instruktion">Så gör ni på vantetider.se</Tb>
        </div>

        {tab === "resultat" && (
          <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e5e7eb", overflow: "hidden" }}>
            <div style={{ padding: "12px 16px", background: "#1e1e2e", color: "#a6e3a1", fontFamily: mono, fontSize: 12 }}>
              SELECT * FROM verif_jamforelse;
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr style={{ background: "#f9fafb" }}>
                    {["kpi", "beräknat_värde", "enhet", "nämnare", "täljare", "var_på_vantetider_se", "kommentar"].map((h, i) => (
                      <th key={i} style={{ textAlign: "left", padding: "8px 10px", borderBottom: "2px solid #e5e7eb", color: "#6b7280", fontWeight: 600, fontSize: 11, fontFamily: mono, whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {VERIF.map((r, i) => {
                    const isHead = !r.kpi.startsWith("  ");
                    return (
                      <tr key={i} style={{ background: isHead ? "#fff" : "#f9fafb" }}>
                        <td style={{ padding: "6px 10px", borderBottom: "1px solid #f3f4f6", fontWeight: isHead ? 600 : 400, color: "#111827", whiteSpace: "nowrap" }}>{r.kpi}</td>
                        <td style={{ padding: "6px 10px", borderBottom: "1px solid #f3f4f6", fontFamily: mono, fontWeight: 700, color: "#1e40af", textAlign: "right" }}>{r.varde}</td>
                        <td style={{ padding: "6px 10px", borderBottom: "1px solid #f3f4f6", color: "#9ca3af" }}>{r.enhet}</td>
                        <td style={{ padding: "6px 10px", borderBottom: "1px solid #f3f4f6", fontFamily: mono, color: "#6b7280", textAlign: "right" }}>{r.namnare ?? ""}</td>
                        <td style={{ padding: "6px 10px", borderBottom: "1px solid #f3f4f6", fontFamily: mono, color: "#6b7280", textAlign: "right" }}>{r.taljare ?? ""}</td>
                        <td style={{ padding: "6px 10px", borderBottom: "1px solid #f3f4f6", fontSize: 11, color: "#6b7280", maxWidth: 280 }}>{r.var || ""}</td>
                        <td style={{ padding: "6px 10px", borderBottom: "1px solid #f3f4f6", fontSize: 11, color: "#9ca3af", fontStyle: "italic" }}>{r.kommentar || ""}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "stickprov" && (
          <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e5e7eb", overflow: "hidden" }}>
            <div style={{ padding: "12px 16px", background: "#1e1e2e", color: "#a6e3a1", fontFamily: mono, fontSize: 12 }}>
              SELECT * FROM verif_stickprov LIMIT 10;
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr style={{ background: "#f9fafb" }}>
                    {["vardkontakt_id", "sjukhusnamn", "kva_kod", "beslut_datum", "start_datum", "vantetid_dagar", "vardgaranti", "avvikelse", "uppfyller_vg"].map((h, i) => (
                      <th key={i} style={{ textAlign: "left", padding: "8px 10px", borderBottom: "2px solid #e5e7eb", color: "#6b7280", fontWeight: 600, fontSize: 11, fontFamily: mono, whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {STICKPROV.map((r, i) => (
                    <tr key={i}>
                      <td style={{ padding: "6px 10px", borderBottom: "1px solid #f3f4f6", fontFamily: mono, fontSize: 11, color: "#6b7280" }}>{r.id}</td>
                      <td style={{ padding: "6px 10px", borderBottom: "1px solid #f3f4f6", fontSize: 12 }}>{r.sjukhus}</td>
                      <td style={{ padding: "6px 10px", borderBottom: "1px solid #f3f4f6", fontFamily: mono, fontSize: 11 }}>{r.kva}</td>
                      <td style={{ padding: "6px 10px", borderBottom: "1px solid #f3f4f6", fontFamily: mono, fontSize: 11 }}>{r.beslut}</td>
                      <td style={{ padding: "6px 10px", borderBottom: "1px solid #f3f4f6", fontFamily: mono, fontSize: 11 }}>{r.start}</td>
                      <td style={{ padding: "6px 10px", borderBottom: "1px solid #f3f4f6", fontFamily: mono, fontWeight: 700, color: r.vt > 90 ? "#b91c1c" : "#15803d", textAlign: "right" }}>{r.vt}</td>
                      <td style={{ padding: "6px 10px", borderBottom: "1px solid #f3f4f6", textAlign: "center" }}>{r.vg}</td>
                      <td style={{ padding: "6px 10px", borderBottom: "1px solid #f3f4f6", color: r.avv === "PvV" ? "#b45309" : "#9ca3af", fontWeight: r.avv === "PvV" ? 600 : 400 }}>{r.avv}</td>
                      <td style={{ padding: "6px 10px", borderBottom: "1px solid #f3f4f6", textAlign: "center", color: r.uppf ? "#15803d" : "#b91c1c", fontWeight: 700 }}>{r.uppf}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ padding: 16, borderTop: "1px solid #e5e7eb", fontSize: 12, color: "#6b7280", lineHeight: 1.8 }}>
              <strong>Manuell kontroll:</strong> Rad 2 (5DC818C34D85) har vantetid_dagar = 126, men uppfyller_vg = 0 trots VG=JA — korrekt, eftersom avvikelsekod = PvV (patientvald väntan). PvV exkluderas ur VG-beräkningen. Rad 6 (A6E8ADD93E02) har VG=NEJ → uppfyller_vg = 0 oavsett väntetid. Rad 8 (345F08702E54) har 172 dagar + PvV → räknas inte mot vårdgarantin.
            </div>
          </div>
        )}

        {tab === "instruktion" && (
          <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e5e7eb", padding: 20 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 16px" }}>Navigering på vantetider.se — steg för steg</h2>

            {[
              { steg: 1, titel: "Öppna vantetider.se", text: "Gå till https://extra.skr.se/vantetiderivarden.46246.html" },
              { steg: 2, titel: "Välj \"Specialiserad vård\" i vänstermenyn", text: "Klicka på \"Specialiserad vård\" — det expanderar undermenyn." },
              { steg: 3, titel: "Välj rätt statistiksida", text: "Beroende på vilken KPI ni vill jämföra:\n• \"Aktuellt vårdgarantiläge\" → andel inom 90 dagar (spindeldiagram)\n• \"Medel- och medianväntetid\" → median + medel\n• \"Utökad uppföljning\" → antal, fördelning, per kön" },
              { steg: 4, titel: "Filtrera", text: "I filterpanelen överst, välj:\n• Region: Västra Götalandsregionen\n• Specialitet (MVO): Ögonsjukvård\n• Fas: Operation/åtgärd\n• Period: 2026-02 (eller den månad som matchar er matperiod)" },
              { steg: 5, titel: "Jämför", text: "Siffran på skärmen ska ligga i samma storleksordning som kolumnen \"beräknat_värde\" i verif_jamforelse.\n\nFörväntade avvikelser:\n• Volymen kan skilja sig om er data inte täcker privata ögonkliniker\n• Procentandelen (VG) bör vara nära — om den avviker >20%, kör DQ-paketet" },
            ].map((s, i) => (
              <div key={i} style={{ display: "flex", gap: 14, marginBottom: 20, alignItems: "flex-start" }}>
                <div style={{ width: 32, height: 32, borderRadius: 16, background: "#1e40af", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, flexShrink: 0 }}>{s.steg}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{s.titel}</div>
                  <div style={{ fontSize: 13, color: "#374151", lineHeight: 1.7, whiteSpace: "pre-line" }}>{s.text}</div>
                </div>
              </div>
            ))}

            <div style={{ marginTop: 16, background: "#eff6ff", borderRadius: 8, padding: 14, fontSize: 13, color: "#1e40af", lineHeight: 1.7 }}>
              <strong>OBS:</strong> vantetider.se har inget API — ni kan inte automatisera jämförelsen. Men verif_jamforelse-tabellen gör det manuella arbetet minimalt: varje rad berättar exakt var på vantetider.se ni hittar motsvarande siffra.
            </div>
          </div>
        )}

        <div style={{ marginTop: 20, paddingTop: 10, borderTop: "1px solid #e5e7eb", color: "#9ca3af", fontSize: 10, display: "flex", justifyContent: "space-between" }}>
          <span>KCHD Verifieringspaket | Katarakt VGR | Testdata 100 patienter (70 genomförda + 30 väntande)</span>
          <span>Mätperiod 2026-02</span>
        </div>
      </div>
    </div>
  );
}
