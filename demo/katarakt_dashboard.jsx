import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts";

const VGR = {
  label: "Västra Götalandsregionen", short: "VGR", kod: "51", color: "#2563eb",
  n_g: 70, n_v: 30, median: 58, medel: 60.1,
  namnare: 53, taljare: 49, andel90: 92.5,
  dist_g: { "0-30": 13, "31-60": 25, "61-90": 22, "91-120": 3, "121-180": 7, ">180": 0 },
  dist_v: { "0-30": 7, "31-60": 11, "61-90": 10, "91-120": 0, "121-180": 2, ">180": 0 },
  kon: { Man: 33, Kvinna: 37 }, median_m: 58, median_k: 57,
  alder: { "<50": 0, "50-64": 6, "65-74": 36, "75-84": 24, "85+": 4 },
  sjukhus: [
    { namn: "Sahlgrenska", n: 19, median: 61 },
    { namn: "NU-sjukvården", n: 18, median: 61.5 },
    { namn: "SÄS", n: 20, median: 54 },
    { namn: "Skaraborgs Sjukhus", n: 13, median: 58 },
  ],
  avv_g: { Ingen: 60, PvV: 6, MoV: 4 },
  avv_v: { Ingen: 28, PvV: 2, MoV: 0 },
  rem_beslut: 34, total_resa: 87, vg_risk: 0, median_v: 56,
  bokning: { "Erbjuden tid": 31, Bokad: 19, "Överenskommen": 20 },
};

const HAL = {
  label: "Region Halland", short: "Halland", kod: "42", color: "#059669",
  n_g: 70, n_v: 30, median: 42, medel: 55.0,
  namnare: 49, taljare: 47, andel90: 95.9,
  dist_g: { "0-30": 21, "31-60": 27, "61-90": 9, "91-120": 8, "121-180": 5, ">180": 0 },
  dist_v: { "0-30": 9, "31-60": 6, "61-90": 14, "91-120": 0, "121-180": 1, ">180": 0 },
  kon: { Man: 31, Kvinna: 39 }, median_m: 46, median_k: 39,
  alder: { "<50": 0, "50-64": 7, "65-74": 33, "75-84": 22, "85+": 8 },
  sjukhus: [
    { namn: "Halmstad", n: 20, median: 45.5 },
    { namn: "Kungsbacka", n: 28, median: 39 },
    { namn: "Varberg", n: 22, median: 40.5 },
  ],
  avv_g: { Ingen: 57, PvV: 11, MoV: 2 },
  avv_v: { Ingen: 29, PvV: 0, MoV: 1 },
  rem_beslut: 34, total_resa: 78, vg_risk: 0, median_v: 60,
  bokning: { "Erbjuden tid": 41, Bokad: 11, "Överenskommen": 18 },
};

const font = "'Inter', -apple-system, sans-serif";
const mono = "'JetBrains Mono', monospace";

const KPICard = ({ title, vgr, hal, unit, better }) => {
  const vgrBetter = better === "low" ? vgr < hal : vgr > hal;
  const halBetter = !vgrBetter;
  return (
    <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e5e7eb", padding: 16, minWidth: 0 }}>
      <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 10, fontWeight: 500 }}>{title}</div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <div>
          <span style={{ fontSize: 28, fontWeight: 800, color: VGR.color, fontFamily: mono }}>{vgr}</span>
          <span style={{ fontSize: 13, color: "#9ca3af", marginLeft: 2 }}>{unit}</span>
          {vgrBetter && <span style={{ marginLeft: 6, fontSize: 11, color: "#10b981" }}>▼</span>}
        </div>
        <div style={{ textAlign: "right" }}>
          <span style={{ fontSize: 28, fontWeight: 800, color: HAL.color, fontFamily: mono }}>{hal}</span>
          <span style={{ fontSize: 13, color: "#9ca3af", marginLeft: 2 }}>{unit}</span>
          {halBetter && <span style={{ marginLeft: 6, fontSize: 11, color: "#10b981" }}>▼</span>}
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
        <span style={{ fontSize: 11, color: VGR.color, fontWeight: 600 }}>VGR</span>
        <span style={{ fontSize: 11, color: HAL.color, fontWeight: 600 }}>Halland</span>
      </div>
    </div>
  );
};

const Section = ({ title, children }) => (
  <div style={{ marginBottom: 24 }}>
    <h2 style={{ fontSize: 15, fontWeight: 700, color: "#111827", margin: "0 0 12px", borderBottom: "2px solid #e5e7eb", paddingBottom: 6 }}>{title}</h2>
    {children}
  </div>
);

export default function KataraktDashboard() {
  const [tab, setTab] = useState("overview");

  const distData = ["0-30", "31-60", "61-90", "91-120", "121-180", ">180"].map(k => ({
    intervall: k, VGR: VGR.dist_g[k], Halland: HAL.dist_g[k]
  }));
  const distVData = ["0-30", "31-60", "61-90", "91-120", "121-180", ">180"].map(k => ({
    intervall: k, VGR: VGR.dist_v[k], Halland: HAL.dist_v[k]
  }));
  const ageData = ["<50", "50-64", "65-74", "75-84", "85+"].map(k => ({
    grupp: k, VGR: VGR.alder[k], Halland: HAL.alder[k]
  }));
  const konData = [
    { kon: "Man", VGR: VGR.kon.Man, Halland: HAL.kon.Man },
    { kon: "Kvinna", VGR: VGR.kon.Kvinna, Halland: HAL.kon.Kvinna },
  ];

  const radarData = [
    { metric: "Andel ≤90d", VGR: VGR.andel90, Halland: HAL.andel90 },
    { metric: "Kort median", VGR: Math.max(0, 100 - VGR.median), Halland: Math.max(0, 100 - HAL.median) },
    { metric: "Genomförda", VGR: VGR.n_g, Halland: HAL.n_g },
    { metric: "Kort total resa", VGR: Math.max(0, 120 - VGR.total_resa), Halland: Math.max(0, 120 - HAL.total_resa) },
    { metric: "Få avvikelser", VGR: Math.round(VGR.avv_g.Ingen / VGR.n_g * 100), Halland: Math.round(HAL.avv_g.Ingen / HAL.n_g * 100) },
  ];

  const sjukhusAll = [...VGR.sjukhus.map(s => ({...s, region: "VGR"})), ...HAL.sjukhus.map(s => ({...s, region: "Halland"}))];

  const Tb = ({ active, onClick, children }) => (
    <button onClick={onClick} style={{ padding: "8px 16px", background: active ? "#1e40af" : "transparent", color: active ? "#fff" : "#6b7280", border: "none", borderBottom: active ? "2px solid #1e40af" : "2px solid transparent", cursor: "pointer", fontFamily: font, fontSize: 13, fontWeight: active ? 600 : 400 }}>{children}</button>
  );

  return (
    <div style={{ background: "#f9fafb", minHeight: "100vh", fontFamily: font, padding: "20px 16px" }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600;700&display=swap" rel="stylesheet" />
      <div style={{ maxWidth: 960, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: 4, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{ background: "#1e40af", color: "#fff", padding: "3px 10px", borderRadius: 5, fontSize: 11, fontWeight: 700, fontFamily: mono }}>KCHD</span>
          <span style={{ background: "#dbeafe", color: "#1e40af", padding: "3px 8px", borderRadius: 5, fontSize: 11, fontWeight: 600 }}>Aktivitet 51101 Gråstarr</span>
          <span style={{ background: "#fef3c7", color: "#92400e", padding: "3px 8px", borderRadius: 5, fontSize: 11, fontWeight: 600 }}>Testdata februari 2026</span>
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#111827", margin: "6px 0 2px", letterSpacing: "-0.03em" }}>
          Väntetider kataraktoperation — <span style={{ color: VGR.color }}>VGR</span> vs <span style={{ color: HAL.color }}>Halland</span>
        </h1>
        <p style={{ color: "#6b7280", fontSize: 13, margin: "0 0 16px" }}>
          100 patienter per region (70 genomförda + 30 väntande) | Mätperiod 2026-02 | Fas 2: Operation/åtgärd | MVO 511 Ögonsjukvård
        </p>

        <div style={{ display: "flex", gap: 0, borderBottom: "1px solid #e5e7eb", marginBottom: 16 }}>
          <Tb active={tab==="overview"} onClick={() => setTab("overview")}>Översikt</Tb>
          <Tb active={tab==="genomford"} onClick={() => setTab("genomford")}>Genomförda</Tb>
          <Tb active={tab==="vantande"} onClick={() => setTab("vantande")}>Väntande</Tb>
          <Tb active={tab==="sjukhus"} onClick={() => setTab("sjukhus")}>Per sjukhus</Tb>
          <Tb active={tab==="demografi"} onClick={() => setTab("demografi")}>Demografi</Tb>
          <Tb active={tab==="patientresa"} onClick={() => setTab("patientresa")}>Patientresa</Tb>
        </div>

        {/* ═══ ÖVERSIKT ═══ */}
        {tab === "overview" && (<div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginBottom: 20 }}>
            <KPICard title="Andel inom 90 dagar (VG)" vgr={VGR.andel90 + "%"} hal={HAL.andel90 + "%"} unit="" better="high" />
            <KPICard title="Medianväntetid (genomförda)" vgr={VGR.median} hal={HAL.median} unit="d" better="low" />
            <KPICard title="Medelväntetid (genomförda)" vgr={VGR.medel} hal={HAL.medel} unit="d" better="low" />
            <KPICard title="Antal väntande" vgr={VGR.n_v} hal={HAL.n_v} unit="pat" />
          </div>

          <Section title="Jämförelse — spindeldiagram">
            <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e5e7eb", padding: 16 }}>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fill: "#374151" }} />
                  <PolarRadiusAxis tick={{ fontSize: 10 }} domain={[0, 100]} />
                  <Radar name="VGR" dataKey="VGR" stroke={VGR.color} fill={VGR.color} fillOpacity={0.15} strokeWidth={2} />
                  <Radar name="Halland" dataKey="Halland" stroke={HAL.color} fill={HAL.color} fillOpacity={0.15} strokeWidth={2} />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
              <div style={{ fontSize: 11, color: "#9ca3af", textAlign: "center", marginTop: 4 }}>Högre = bättre. "Kort median" och "Kort total resa" inverterade (100 − dagar).</div>
            </div>
          </Section>

          <Section title="Väntetidsfördelning — genomförda operationer">
            <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e5e7eb", padding: 16 }}>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={distData} barGap={2}>
                  <XAxis dataKey="intervall" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="VGR" fill={VGR.color} radius={[3,3,0,0]} />
                  <Bar dataKey="Halland" fill={HAL.color} radius={[3,3,0,0]} />
                </BarChart>
              </ResponsiveContainer>
              <div style={{ fontSize: 11, color: "#9ca3af", textAlign: "center" }}>Antal genomförda kataraktoperationer per väntetidsintervall (dagar från beslut till operation)</div>
            </div>
          </Section>
        </div>)}

        {/* ═══ GENOMFÖRDA ═══ */}
        {tab === "genomford" && (<div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 20 }}>
            <KPICard title="Antal genomförda" vgr={VGR.n_g} hal={HAL.n_g} unit="op" />
            <KPICard title="Median" vgr={VGR.median} hal={HAL.median} unit="d" better="low" />
            <KPICard title="Medel" vgr={VGR.medel} hal={HAL.medel} unit="d" better="low" />
            <KPICard title="Andel ≤90d (VG)" vgr={VGR.andel90 + "%"} hal={HAL.andel90 + "%"} unit="" better="high" />
          </div>

          <Section title="Fördelning per tidsintervall">
            <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e5e7eb", padding: 16 }}>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={distData} barGap={2}>
                  <XAxis dataKey="intervall" tick={{ fontSize: 11 }} label={{ value: "Dagar", position: "insideBottom", offset: -2, fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} label={{ value: "Antal", angle: -90, position: "insideLeft", fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="VGR" fill={VGR.color} radius={[3,3,0,0]} />
                  <Bar dataKey="Halland" fill={HAL.color} radius={[3,3,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Section>

          <Section title="Avvikelser — genomförda">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {[VGR, HAL].map(r => (
                <div key={r.short} style={{ background: "#fff", borderRadius: 10, border: "1px solid #e5e7eb", padding: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: r.color, marginBottom: 8 }}>{r.short}</div>
                  <div style={{ fontSize: 13, lineHeight: 2 }}>
                    <div>Ingen avvikelse: <strong>{r.avv_g.Ingen}</strong> ({Math.round(r.avv_g.Ingen/r.n_g*100)}%)</div>
                    <div>PvV (patientvald): <strong>{r.avv_g.PvV}</strong> — <span style={{ color: "#92400e", fontSize: 11 }}>exkluderas ur VG-beräkning</span></div>
                    <div>MoV (medicinsk): <strong>{r.avv_g.MoV}</strong> — <span style={{ color: "#6b7280", fontSize: 11 }}>kan exkluderas</span></div>
                  </div>
                  <div style={{ marginTop: 8, background: r.color + "10", borderRadius: 6, padding: 8 }}>
                    <span style={{ fontSize: 11, color: "#6b7280" }}>VG-nämnare (exkl PvV): </span>
                    <strong>{r.namnare}</strong>
                    <span style={{ fontSize: 11, color: "#6b7280" }}> → inom 90d: </span>
                    <strong>{r.taljare}</strong>
                    <span style={{ fontSize: 11, color: "#6b7280" }}> = </span>
                    <strong style={{ color: r.color, fontSize: 16 }}>{r.andel90}%</strong>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        </div>)}

        {/* ═══ VÄNTANDE ═══ */}
        {tab === "vantande" && (<div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 20 }}>
            <KPICard title="Antal väntande" vgr={VGR.n_v} hal={HAL.n_v} unit="pat" />
            <KPICard title="Median väntetid" vgr={56} hal={60} unit="d" better="low" />
            <KPICard title="VG-risk (>90d, ej PvV/MoV)" vgr={VGR.vg_risk} hal={HAL.vg_risk} unit="pat" better="low" />
          </div>

          <Section title="Väntande — fördelning per tidsintervall">
            <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e5e7eb", padding: 16 }}>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={distVData} barGap={2}>
                  <XAxis dataKey="intervall" tick={{ fontSize: 11 }} label={{ value: "Dagar väntad hittills", position: "insideBottom", offset: -2, fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="VGR" fill={VGR.color} radius={[3,3,0,0]} />
                  <Bar dataKey="Halland" fill={HAL.color} radius={[3,3,0,0]} />
                </BarChart>
              </ResponsiveContainer>
              <div style={{ fontSize: 11, color: "#9ca3af", textAlign: "center", marginTop: 4 }}>Ögonblicksbild 2026-02-28. Antal patienter som väntar på kataraktoperation, per väntetidsintervall.</div>
            </div>
          </Section>

          <Section title="Avvikelser — väntande">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {[VGR, HAL].map(r => (
                <div key={r.short} style={{ background: "#fff", borderRadius: 10, border: "1px solid #e5e7eb", padding: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: r.color, marginBottom: 8 }}>{r.short} — {r.n_v} väntande</div>
                  <div style={{ fontSize: 13, lineHeight: 2 }}>
                    <div>Aktivt väntande (ingen avvikelse): <strong>{r.avv_v.Ingen}</strong></div>
                    <div>PvV: <strong>{r.avv_v.PvV}</strong></div>
                    <div>MoV (ej aktivt väntande): <strong>{r.avv_v.MoV}</strong></div>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        </div>)}

        {/* ═══ PER SJUKHUS ═══ */}
        {tab === "sjukhus" && (<div>
          <Section title="Genomförda operationer per sjukhus">
            <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e5e7eb", padding: 16 }}>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={sjukhusAll} layout="vertical" barSize={18}>
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="namn" type="category" width={140} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v, name) => [v, name === "n" ? "Antal" : "Median dagar"]} />
                  <Bar dataKey="n" fill="#94a3b8" radius={[0,3,3,0]} name="Antal operationer">
                    {sjukhusAll.map((s, i) => (
                      <Cell key={i} fill={s.region === "VGR" ? VGR.color : HAL.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Section>

          <Section title="Medianväntetid per sjukhus (dagar)">
            <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e5e7eb", padding: 16 }}>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={sjukhusAll} layout="vertical" barSize={18}>
                  <XAxis type="number" tick={{ fontSize: 11 }} domain={[0, 80]} />
                  <YAxis dataKey="namn" type="category" width={140} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="median" name="Median dagar" radius={[0,3,3,0]}>
                    {sjukhusAll.map((s, i) => (
                      <Cell key={i} fill={s.region === "VGR" ? VGR.color : HAL.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 8, fontSize: 12 }}>
                <span><span style={{ display: "inline-block", width: 12, height: 12, background: VGR.color, borderRadius: 2, marginRight: 4 }}/> VGR</span>
                <span><span style={{ display: "inline-block", width: 12, height: 12, background: HAL.color, borderRadius: 2, marginRight: 4 }}/> Halland</span>
              </div>
            </div>
          </Section>
        </div>)}

        {/* ═══ DEMOGRAFI ═══ */}
        {tab === "demografi" && (<div>
          <Section title="Åldersfördelning — genomförda operationer">
            <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e5e7eb", padding: 16 }}>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={ageData} barGap={2}>
                  <XAxis dataKey="grupp" tick={{ fontSize: 11 }} label={{ value: "Åldersgrupp", position: "insideBottom", offset: -2, fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="VGR" fill={VGR.color} radius={[3,3,0,0]} />
                  <Bar dataKey="Halland" fill={HAL.color} radius={[3,3,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Section>

          <Section title="Könsfördelning + medianväntetid per kön">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e5e7eb", padding: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Antal per kön</div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={konData} barGap={2}>
                    <XAxis dataKey="kon" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="VGR" fill={VGR.color} radius={[3,3,0,0]} />
                    <Bar dataKey="Halland" fill={HAL.color} radius={[3,3,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e5e7eb", padding: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Medianväntetid per kön (dagar)</div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={[
                    { kon: "Man", VGR: VGR.median_m, Halland: HAL.median_m },
                    { kon: "Kvinna", VGR: VGR.median_k, Halland: HAL.median_k },
                  ]} barGap={2}>
                    <XAxis dataKey="kon" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 11 }} domain={[0, 70]} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="VGR" fill={VGR.color} radius={[3,3,0,0]} />
                    <Bar dataKey="Halland" fill={HAL.color} radius={[3,3,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Section>

          <Section title="Bokningssätt">
            <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e5e7eb", padding: 16 }}>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={Object.keys(VGR.bokning).map(k => ({ typ: k, VGR: VGR.bokning[k], Halland: HAL.bokning[k] || 0 }))} barGap={2}>
                  <XAxis dataKey="typ" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="VGR" fill={VGR.color} radius={[3,3,0,0]} />
                  <Bar dataKey="Halland" fill={HAL.color} radius={[3,3,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Section>
        </div>)}

        {/* ═══ PATIENTRESA ═══ */}
        {tab === "patientresa" && (<div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginBottom: 20 }}>
            <KPICard title="Median remiss → beslut" vgr={VGR.rem_beslut} hal={HAL.rem_beslut} unit="d" better="low" />
            <KPICard title="Median beslut → operation" vgr={VGR.median} hal={HAL.median} unit="d" better="low" />
            <KPICard title="Median total patientresa" vgr={VGR.total_resa} hal={HAL.total_resa} unit="d" better="low" />
          </div>

          <Section title="Patientresans tre faser">
            <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e5e7eb", padding: 20 }}>
              {[VGR, HAL].map(r => (
                <div key={r.short} style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: r.color, marginBottom: 8 }}>{r.label}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
                    <div style={{ background: r.color + "15", border: `1px solid ${r.color}40`, borderRadius: 8, padding: "8px 12px", textAlign: "center", minWidth: 80 }}>
                      <div style={{ fontSize: 10, color: "#6b7280" }}>Remiss</div>
                    </div>
                    <div style={{ flex: r.rem_beslut, height: 4, background: r.color + "60", position: "relative" }}>
                      <div style={{ position: "absolute", top: -16, left: "50%", transform: "translateX(-50%)", fontSize: 11, fontWeight: 700, color: r.color, whiteSpace: "nowrap" }}>{r.rem_beslut}d</div>
                    </div>
                    <div style={{ background: r.color + "15", border: `1px solid ${r.color}40`, borderRadius: 8, padding: "8px 12px", textAlign: "center", minWidth: 80 }}>
                      <div style={{ fontSize: 10, color: "#6b7280" }}>Beslut op</div>
                    </div>
                    <div style={{ flex: r.median, height: 4, background: r.color, position: "relative" }}>
                      <div style={{ position: "absolute", top: -16, left: "50%", transform: "translateX(-50%)", fontSize: 11, fontWeight: 700, color: r.color, whiteSpace: "nowrap" }}>{r.median}d</div>
                    </div>
                    <div style={{ background: r.color + "15", border: `1px solid ${r.color}40`, borderRadius: 8, padding: "8px 12px", textAlign: "center", minWidth: 80 }}>
                      <div style={{ fontSize: 10, color: "#6b7280" }}>Operation</div>
                    </div>
                  </div>
                  <div style={{ textAlign: "center", marginTop: 6, fontSize: 12, color: "#6b7280" }}>Total: <strong style={{ color: r.color }}>{r.total_resa} dagar</strong> (median)</div>
                </div>
              ))}
              <div style={{ marginTop: 8, fontSize: 11, color: "#9ca3af", borderTop: "1px solid #e5e7eb", paddingTop: 8 }}>
                <strong>Notera:</strong> SKR/Socialstyrelsen mäter bara beslut→operation (VG 90d). Total patientresa (remiss→operation) är ett mervärde som hubben tillför — det visar hela bilden ur patientens perspektiv.
              </div>
            </div>
          </Section>

          <Section title="Vårdgarantikedjan 0-3-90-90">
            <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e5e7eb", padding: 16 }}>
              <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 16 }}>
                {[
                  { d: "0", l: "Kontakt", c: "#10b981" },
                  { d: "3", l: "Bedömning", c: "#3b82f6" },
                  { d: "90", l: "Besök spec.", c: "#f59e0b" },
                  { d: "90", l: "Operation", c: "#ef4444" },
                ].map((s, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <div style={{ background: s.c + "15", border: `1px solid ${s.c}40`, borderRadius: 8, padding: "8px 14px", textAlign: "center" }}>
                      <div style={{ fontSize: 22, fontWeight: 800, color: s.c, fontFamily: mono }}>{s.d}</div>
                      <div style={{ fontSize: 10, color: "#6b7280" }}>{s.l}</div>
                    </div>
                    {i < 3 && <span style={{ color: "#d1d5db", fontSize: 18 }}>→</span>}
                  </div>
                ))}
              </div>
              <div style={{ textAlign: "center", fontSize: 13 }}>
                Detta paket mäter steg 4: <strong style={{ color: "#ef4444" }}>beslut → operation ≤ 90 dagar</strong>
                <div style={{ marginTop: 4, fontSize: 12, color: "#6b7280" }}>
                  VGR: <strong style={{ color: VGR.color }}>{VGR.andel90}%</strong> inom 90d | Halland: <strong style={{ color: HAL.color }}>{HAL.andel90}%</strong> inom 90d
                </div>
              </div>
            </div>
          </Section>
        </div>)}

        <div style={{ marginTop: 24, paddingTop: 12, borderTop: "1px solid #e5e7eb", color: "#9ca3af", fontSize: 10, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 4 }}>
          <span>KCHD Väntetidspaket — Katarakt | Beräknat med VQL-logik: GETDAYSBETWEEN(start_datum, beslut_datum) | PvV exkluderad ur VG</span>
          <span>Testdata 2×100 patienter | 2026-03-19</span>
        </div>
      </div>
    </div>
  );
}
