#!/usr/bin/env python3
"""
KCHD Build — Genererar dq_rapport.jsx från dq_resultat.tsv

Flöde:
  1. test_dq.py testdata.csv → dq_resultat.tsv
  2. build_dq_rapport.py dq_resultat.tsv → dq_rapport.jsx

Aldrig skriv siffror manuellt i JSX:en.
"""
import sys, os

def build(tsv_path, jsx_path):
    with open(tsv_path, 'r', encoding='utf-8') as f:
        tsv_content = f.read().strip()
    
    # Escape backticks for JS template literal
    tsv_escaped = tsv_content.replace('`', '\\`').replace('${', '\\${')
    
    jsx = r'''import { useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const font = "'Inter', -apple-system, sans-serif";
const mono = "'JetBrains Mono', 'Fira Code', monospace";

// ══════════════════════════════════════════════════════
// Genererad från dq_resultat.tsv av build_dq_rapport.py
// Ändra ALDRIG denna data manuellt — kör test_dq.py
// ══════════════════════════════════════════════════════
const DEMO_TSV = `''' + tsv_escaped + r'''`;

function parseData(tsv) {
  return tsv.trim().split("\n").filter(l => l.trim()).map(line => {
    const sep = line.includes("\t") ? "\t" : line.includes(";") ? ";" : ",";
    const [dq, kontroll, objekt, varde, status] = line.split(sep).map(s => s?.trim());
    return { dq, kontroll, objekt, varde, status };
  });
}

const PctBar = ({ pct }) => {
  const n = parseFloat(pct) || 0;
  const color = n >= 90 ? "#15803d" : n >= 50 ? "#b45309" : "#b91c1c";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 140 }}>
      <div style={{ flex: 1, height: 8, background: "#f3f4f6", borderRadius: 4, overflow: "hidden" }}>
        <div style={{ width: `${Math.min(n, 100)}%`, height: "100%", background: color, borderRadius: 4 }} />
      </div>
      <span style={{ fontFamily: mono, fontSize: 11, color: "#6b7280", minWidth: 36, textAlign: "right" }}>{n}%</span>
    </div>
  );
};

export default function DQRapport() {
  const [rawData, setRawData] = useState(DEMO_TSV);
  const [showPaste, setShowPaste] = useState(false);
  const [tab, setTab] = useState("sammanfattning");
  const [isDemo, setIsDemo] = useState(true);

  const rows = useMemo(() => parseData(rawData), [rawData]);

  const dqNames = { DQ0: "Existens", DQ1: "Null-kontroll", DQ2: "Domänkontroll", DQ3: "Intervallkontroll", DQ5: "Korsvalidering", DQ6: "Rimlighet" };
  const dqDesc = { DQ0: "Finns data i basvyerna?", DQ1: "Obligatoriska fält ifyllda?", DQ2: "Alla värden giltiga?", DQ3: "Beräkningar rimliga?", DQ5: "Summor stämmer mellan lager?", DQ6: "KPI:er inom rimliga intervall?" };

  const dqSummary = useMemo(() => {
    return ["DQ0","DQ1","DQ2","DQ3","DQ5","DQ6"].map(id => {
      const r = rows.filter(r => r.dq === id);
      const fel = r.filter(r => r.status === "FEL").length;
      return { id, ok: fel === 0, fel, rows: r };
    });
  }, [rows]);

  const dq4 = useMemo(() => rows.filter(r => r.dq === "DQ4"), [rows]);
  const totalOk = dqSummary.filter(d => d.ok).length;
  const totalFel = dqSummary.reduce((a, d) => a + d.fel, 0);
  const nPat = rows.filter(r => r.dq === "DQ0").reduce((a, r) => a + (parseInt(r.varde) || 0), 0);

  const handlePaste = (val) => { setRawData(val); setIsDemo(false); };
  const resetDemo = () => { setRawData(DEMO_TSV); setIsDemo(true); };

  const Tb = ({ id, children }) => (
    <button onClick={() => setTab(id)} style={{ padding: "8px 14px", background: tab===id ? "#1e40af" : "transparent", color: tab===id ? "#fff" : "#6b7280", border: "none", borderBottom: tab===id ? "2px solid #1e40af" : "2px solid transparent", cursor: "pointer", fontFamily: font, fontSize: 13, fontWeight: tab===id ? 600 : 400, whiteSpace: "nowrap" }}>{children}</button>
  );

  return (
    <div style={{ background: "#f9fafb", minHeight: "100vh", fontFamily: font, padding: "20px 16px" }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600;700&display=swap" rel="stylesheet" />
      <div style={{ maxWidth: 960, margin: "0 auto" }}>

        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
          <span style={{ background: "#1e40af", color: "#fff", padding: "3px 10px", borderRadius: 5, fontSize: 11, fontWeight: 700, fontFamily: mono }}>KCHD</span>
          <span style={{ background: totalFel === 0 ? "#f0fdf4" : "#fef2f2", color: totalFel === 0 ? "#15803d" : "#b91c1c", padding: "3px 8px", borderRadius: 5, fontSize: 11, fontWeight: 600, border: `1px solid ${totalFel === 0 ? "#bbf7d0" : "#fecaca"}` }}>
            {totalFel === 0 ? "Alla kontroller OK" : `${totalFel} fel funna`}
          </span>
          {isDemo && <span style={{ background: "#fef3c7", color: "#92400e", padding: "3px 8px", borderRadius: 5, fontSize: 11, fontWeight: 600 }}>KCHD testdata</span>}
          {!isDemo && <span style={{ background: "#dbeafe", color: "#1e40af", padding: "3px 8px", borderRadius: 5, fontSize: 11, fontWeight: 600 }}>Era data</span>}
        </div>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: "#111827", margin: "6px 0 2px" }}>Datakvalitetsrapport — Katarakt</h1>
        <p style={{ color: "#6b7280", fontSize: 13, margin: "0 0 10px" }}>{nPat} patienter | DQ0–DQ6 | {isDemo ? "Testdata (kör SELECT * FROM dq_rapport_data för att uppdatera med era)" : "Era data"}</p>

        <div style={{ marginBottom: 14 }}>
          <button onClick={() => setShowPaste(!showPaste)} style={{ background: "#eff6ff", color: "#1e40af", border: "1px solid #bfdbfe", borderRadius: 6, padding: "6px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: font }}>
            {showPaste ? "Dölj datainmatning" : "Uppdatera med era data"}
          </button>
          {!isDemo && <button onClick={resetDemo} style={{ background: "transparent", color: "#6b7280", border: "1px solid #e5e7eb", borderRadius: 6, padding: "6px 14px", fontSize: 12, cursor: "pointer", fontFamily: font, marginLeft: 8 }}>Visa testdata</button>}
        </div>

        {showPaste && (
          <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e5e7eb", padding: 16, marginBottom: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Klistra in resultatet från Denodo</div>
            <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 10, lineHeight: 1.6 }}>
              Kör: <span style={{ fontFamily: mono, background: "#f3f4f6", padding: "1px 6px", borderRadius: 4 }}>SELECT * FROM dq_rapport_data</span><br/>
              Markera alla rader (utan kolumnrubriker). Kopiera. Klistra in nedan.
            </div>
            <textarea
              value={isDemo ? "" : rawData}
              onChange={e => handlePaste(e.target.value)}
              placeholder={"Klistra in resultat (tab, semikolon eller komma)\nExempel:\nDQ0\texistens\tsrc_genomford\t70\tOK"}
              style={{ width: "100%", height: 150, fontFamily: mono, fontSize: 11, padding: 10, border: "1px solid #e5e7eb", borderRadius: 6, resize: "vertical", background: "#fafaf9" }}
            />
          </div>
        )}

        <div style={{ display: "flex", gap: 0, borderBottom: "1px solid #e5e7eb", marginBottom: 14, overflowX: "auto" }}>
          <Tb id="sammanfattning">Sammanfattning</Tb>
          <Tb id="ifyllnad">DQ4 Ifyllnadsgrad</Tb>
          <Tb id="detalj">Alla rader</Tb>
        </div>

        {tab === "sammanfattning" && (<div>
          <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 140, background: totalFel === 0 ? "#f0fdf4" : "#fef2f2", borderRadius: 10, border: `1px solid ${totalFel === 0 ? "#bbf7d0" : "#fecaca"}`, padding: 16, textAlign: "center" }}>
              <div style={{ fontSize: 36, fontWeight: 800, color: totalFel === 0 ? "#15803d" : "#b91c1c", fontFamily: mono }}>{totalOk}/6</div>
              <div style={{ fontSize: 12, color: totalFel === 0 ? "#15803d" : "#b91c1c" }}>kontroller OK</div>
            </div>
            <div style={{ flex: 1, minWidth: 140, background: "#fff", borderRadius: 10, border: "1px solid #e5e7eb", padding: 16, textAlign: "center" }}>
              <div style={{ fontSize: 36, fontWeight: 800, color: totalFel > 0 ? "#b91c1c" : "#1e40af", fontFamily: mono }}>{totalFel}</div>
              <div style={{ fontSize: 12, color: "#6b7280" }}>fel funna</div>
            </div>
            <div style={{ flex: 1, minWidth: 140, background: "#fff", borderRadius: 10, border: "1px solid #e5e7eb", padding: 16, textAlign: "center" }}>
              <div style={{ fontSize: 36, fontWeight: 800, color: "#111827", fontFamily: mono }}>{nPat}</div>
              <div style={{ fontSize: 12, color: "#6b7280" }}>patienter</div>
            </div>
          </div>

          <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e5e7eb", overflow: "hidden" }}>
            {dqSummary.map((d, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderBottom: "1px solid #f3f4f6" }}>
                <div style={{ width: 32, height: 32, borderRadius: 16, background: d.ok ? "#f0fdf4" : "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 14 }}>
                  {d.ok ? "✅" : "❌"}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontFamily: mono, fontSize: 12, color: "#1e40af", fontWeight: 700 }}>{d.id}</span>
                    <span style={{ fontSize: 14, fontWeight: 600 }}>{dqNames[d.id]}</span>
                    <span style={{ fontSize: 10, background: d.ok ? "#f0fdf4" : "#fef2f2", color: d.ok ? "#15803d" : "#b91c1c", padding: "1px 6px", borderRadius: 4, fontWeight: 600 }}>{d.ok ? "0 fel" : `${d.fel} fel`}</span>
                  </div>
                  <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>{dqDesc[d.id]}</div>
                  {d.rows.map((r, j) => (
                    <div key={j} style={{ fontSize: 11, fontFamily: mono, color: r.status === "FEL" ? "#b91c1c" : "#9ca3af", marginTop: 2 }}>
                      {r.objekt}: {r.varde} {r.status === "FEL" ? "← FEL" : ""}
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px" }}>
              <div style={{ width: 32, height: 32, borderRadius: 16, background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 14 }}>ℹ️</div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontFamily: mono, fontSize: 12, color: "#1e40af", fontWeight: 700 }}>DQ4</span>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>Ifyllnadsgrad</span>
                  <span style={{ fontSize: 10, background: "#eff6ff", color: "#1e40af", padding: "1px 6px", borderRadius: 4, fontWeight: 600 }}>informativt</span>
                </div>
                <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>Se fliken "DQ4 Ifyllnadsgrad"</div>
              </div>
            </div>
          </div>
        </div>)}

        {tab === "ifyllnad" && (<div>
          <div style={{ background: "#eff6ff", borderRadius: 8, padding: 12, marginBottom: 14, fontSize: 13, color: "#1e40af" }}>
            Grönt ≥90%, gult 50–89%, rött &lt;50%. Avvikelsekod ~14% är normalt (de flesta har ingen avvikelse).
          </div>
          <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e5e7eb", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead><tr style={{ background: "#f9fafb" }}>
                {["Fält","Källa","Ifyllnadsgrad"].map((h,i) => (
                  <th key={i} style={{ textAlign: "left", padding: "8px 10px", borderBottom: "2px solid #e5e7eb", color: "#6b7280", fontWeight: 600, fontSize: 11 }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {dq4.map((r, i) => (
                  <tr key={i}>
                    <td style={{ padding: "6px 10px", borderBottom: "1px solid #f3f4f6", fontFamily: mono, fontSize: 11, fontWeight: 500 }}>{r.objekt}</td>
                    <td style={{ padding: "6px 10px", borderBottom: "1px solid #f3f4f6", fontSize: 11, color: "#6b7280" }}>{r.kontroll.replace("ifyllnad_","")}</td>
                    <td style={{ padding: "6px 10px", borderBottom: "1px solid #f3f4f6" }}><PctBar pct={r.varde} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>)}

        {tab === "detalj" && (<div>
          <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e5e7eb", overflow: "hidden" }}>
            <div style={{ padding: "10px 16px", background: "#1e1e2e", color: "#a6e3a1", fontFamily: mono, fontSize: 12 }}>
              SELECT * FROM dq_rapport_data; -- {rows.length} rader
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead><tr style={{ background: "#f9fafb" }}>
                  {["dq","kontroll","objekt","varde","status"].map((h,i) => (
                    <th key={i} style={{ textAlign: "left", padding: "6px 10px", borderBottom: "2px solid #e5e7eb", color: "#6b7280", fontWeight: 600, fontSize: 11, fontFamily: mono }}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={i} style={{ background: r.status === "FEL" ? "#fef2f2" : undefined }}>
                      <td style={{ padding: "5px 10px", borderBottom: "1px solid #f3f4f6", fontFamily: mono, fontSize: 11, color: "#1e40af", fontWeight: 700 }}>{r.dq}</td>
                      <td style={{ padding: "5px 10px", borderBottom: "1px solid #f3f4f6", fontSize: 11, color: "#6b7280" }}>{r.kontroll}</td>
                      <td style={{ padding: "5px 10px", borderBottom: "1px solid #f3f4f6", fontFamily: mono, fontSize: 11 }}>{r.objekt}</td>
                      <td style={{ padding: "5px 10px", borderBottom: "1px solid #f3f4f6", fontFamily: mono, fontSize: 11, fontWeight: 600, textAlign: "right" }}>{r.varde}</td>
                      <td style={{ padding: "5px 10px", borderBottom: "1px solid #f3f4f6" }}>
                        <span style={{ fontSize: 10, fontWeight: 600, padding: "1px 6px", borderRadius: 4,
                          background: r.status === "OK" ? "#f0fdf4" : r.status === "FEL" ? "#fef2f2" : "#eff6ff",
                          color: r.status === "OK" ? "#15803d" : r.status === "FEL" ? "#b91c1c" : "#1e40af"
                        }}>{r.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>)}

        <div style={{ marginTop: 20, paddingTop: 10, borderTop: "1px solid #e5e7eb", color: "#9ca3af", fontSize: 10, display: "flex", justifyContent: "space-between" }}>
          <span>KCHD DQ-rapport | Katarakt | {isDemo ? "Testdata" : "Era data"}</span>
          <span>SELECT * FROM dq_rapport_data</span>
        </div>
      </div>
    </div>
  );
}
'''
    
    with open(jsx_path, 'w', encoding='utf-8') as f:
        f.write(jsx)
    
    print(f"Genererat {jsx_path} från {tsv_path} ({len(tsv_content.splitlines())} datarader)")

if __name__ == '__main__':
    tsv = sys.argv[1] if len(sys.argv) > 1 else 'dq_resultat.tsv'
    jsx = sys.argv[2] if len(sys.argv) > 2 else 'dq_rapport.jsx'
    build(tsv, jsx)
