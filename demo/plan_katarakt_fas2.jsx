import { useState } from "react";

const C = {
  bg: "#fafaf9", card: "#ffffff", border: "#e7e5e4",
  accent: "#1e40af", accentBg: "#eff6ff",
  green: "#15803d", greenBg: "#f0fdf4", greenBorder: "#bbf7d0",
  amber: "#b45309", amberBg: "#fffbeb", amberBorder: "#fde68a",
  red: "#b91c1c", redBg: "#fef2f2",
  purple: "#7c3aed", purpleBg: "#f5f3ff",
  teal: "#0f766e", tealBg: "#f0fdfa",
  text: "#1c1917", textMuted: "#78716c", textDim: "#a8a29e",
  codeBg: "#1e1e2e", codeText: "#cdd6f4",
};
const font = "'Inter', -apple-system, sans-serif";
const mono = "'JetBrains Mono', 'Fira Code', monospace";

const Tab = ({ active, onClick, children }) => (
  <button onClick={onClick} style={{ padding: "10px 16px", background: active ? C.accent : "transparent", color: active ? "#fff" : C.textMuted, border: "none", borderBottom: active ? `2px solid ${C.accent}` : "2px solid transparent", cursor: "pointer", fontFamily: font, fontSize: 13, fontWeight: active ? 600 : 400, whiteSpace: "nowrap" }}>{children}</button>
);
const Card = ({ children, style: s, accent }) => (
  <div style={{ background: C.card, borderRadius: 10, border: `1px solid ${C.border}`, padding: 20, marginBottom: 16, borderLeft: accent ? `3px solid ${accent}` : undefined, ...s }}>{children}</div>
);
const H2 = ({ children, sub }) => (
  <div style={{ marginBottom: 16 }}>
    <h2 style={{ fontSize: 17, fontWeight: 700, color: C.text, margin: 0 }}>{children}</h2>
    {sub && <p style={{ color: C.textMuted, fontSize: 13, margin: "4px 0 0" }}>{sub}</p>}
  </div>
);

const Phase = ({ nr, title, status, statusColor, desc, kchd, vgr, audit, depends, note }) => (
  <Card accent={statusColor}>
    <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
      <div style={{ width: 36, height: 36, borderRadius: 18, background: statusColor, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, flexShrink: 0 }}>{nr}</div>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: C.text }}>{title}</span>
          <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 4, background: statusColor + "15", color: statusColor }}>{status}</span>
        </div>
        <p style={{ fontSize: 14, color: C.text, lineHeight: 1.7, marginTop: 4, marginBottom: 12 }}>{desc}</p>

        {depends && (
          <div style={{ fontSize: 12, color: C.red, marginBottom: 10 }}>
            <strong>Förutsätter:</strong> {depends}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.accent, marginBottom: 6 }}>KCHD gör</div>
            <div style={{ fontSize: 13, lineHeight: 1.7 }}>{kchd}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.green, marginBottom: 6 }}>VGR gör</div>
            <div style={{ fontSize: 13, lineHeight: 1.7 }}>{vgr}</div>
          </div>
        </div>

        <div style={{ marginTop: 12, background: C.redBg, borderRadius: 6, padding: 10 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.red, marginBottom: 4 }}>Audit innan leverans</div>
          <div style={{ fontSize: 12, color: C.text, lineHeight: 1.7 }}>{audit}</div>
        </div>

        {note && (
          <div style={{ marginTop: 10, background: C.accentBg, borderRadius: 6, padding: 10 }}>
            <div style={{ fontSize: 12, color: C.accent, lineHeight: 1.6 }}>{note}</div>
          </div>
        )}
      </div>
    </div>
  </Card>
);

export default function Plan() {
  const [tab, setTab] = useState("plan");
  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.text, fontFamily: font, padding: "24px 16px" }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet" />
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4, flexWrap: "wrap" }}>
          <div style={{ background: C.accent, color: "#fff", padding: "4px 12px", borderRadius: 6, fontSize: 12, fontWeight: 700, fontFamily: mono }}>KCHD</div>
          <div style={{ background: C.amberBg, color: C.amber, padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, border: `1px solid ${C.amberBorder}` }}>Intern plan — ej VGR-leverans</div>
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 800, margin: "8px 0 4px", letterSpacing: "-0.03em" }}>Katarakt VGR — komplett plan fas 0–4</h1>
        <p style={{ color: C.textMuted, fontSize: 14, margin: "0 0 16px" }}>OMOP-mappning → Kvalitet → FHIR aggregerat → SSIS-transformation → FHIR radnivå</p>

        <div style={{ display: "flex", gap: 0, borderBottom: `1px solid ${C.border}`, marginBottom: 16, overflowX: "auto" }}>
          <Tab active={tab==="plan"} onClick={() => setTab("plan")}>Fasplan</Tab>
          <Tab active={tab==="principer"} onClick={() => setTab("principer")}>Principer</Tab>
          <Tab active={tab==="vyer"} onClick={() => setTab("vyer")}>Vylista</Tab>
          <Tab active={tab==="fhir"} onClick={() => setTab("fhir")}>FHIR-arkitektur</Tab>
          <Tab active={tab==="audit"} onClick={() => setTab("audit")}>Audit-checklista</Tab>
        </div>

        {/* ═══ FASPLAN ═══ */}
        {tab === "plan" && (<div>

          <Card style={{ background: C.amberBg, border: `1px solid ${C.amberBorder}` }}>
            <div style={{ fontSize: 13, color: C.amber, lineHeight: 1.7 }}>
              <strong>Grundprincip:</strong> KCHD bygger och testar allt mot vår testdata (VGR 100 + Halland 100) innan vi levererar till VGR. Allt dokumenteras för hubbens GitHub — POC-koden ÄR den permanenta koden. VQL genomgående, aldrig SQL.
            </div>
          </Card>

          <Phase
            nr="0"
            title="OMOP-mappning (patientnivå) — planering"
            status="PLANERA NU"
            statusColor={C.purple}
            desc="Definiera hur väntetidsdata på patientnivå mappas till OMOP CDM v5.4 via Denodo/VQL. Vi bygger inte koden nu, men vi dokumenterar mappningen så att den finns redo när VGR (eller annan region) vill gå vidare med OMOP."
            kchd={<>
              Skapa mappningsdokument:<br/>
              • src_genomford → procedure_occurrence<br/>
              • src_vantande → observation (väntar på vård)<br/>
              • ref_kva_katarakt → concept (KVÅ → SNOMED via OMOP vocabulary)<br/>
              • Organisation → care_site / location<br/>
              Dokumentera som del av hubbens GitHub-repo.
            </>}
            vgr="Ingen insats nu. Blir aktuellt vid framtida OMOP-implementation."
            audit={<>
              ☐ Mappningsdokument granskat mot OMOP CDM v5.4 spec<br/>
              ☐ KVÅ→SNOMED concept_id-mappning verifierad mot OHDSI Athena<br/>
              ☐ Dokumentet anger vilka VQL-vyer som behövs (men de skapas inte ännu)
            </>}
            note="Poängen: om en region redan har OMOP kan de hoppa över 01_basvy och peka 02_berakning direkt mot sina OMOP-vyer. Tre-lagers-arkitekturen möjliggör detta utan att ändra beräkningslogiken."
          />

          <Phase
            nr="1a"
            title="Verifiering mot vantetider.se"
            status="GÖR NU"
            statusColor={C.green}
            desc="Vi i KCHD kör res_kpi_manad mot vår testdata och jämför med vad vantetider.se visar för VGR. Vi behöver inte vänta på VGR — vi gör detta själva först. Sedan ber vi VGR köra samma verifiering mot sin riktiga data."
            kchd={<>
              Kör alla resultatvyer mot testdata (100 pat VGR).<br/>
              Jämför med vantetider.se → VGR → Ögon → Op/åtgärd.<br/>
              Dokumentera: vilka KPI:er matchar, vilka avviker, varför.<br/>
              Skriv VQL-baserad verifieringsvy som VGR sedan kör.
            </>}
            vgr="Kör samma verifierings-VQL mot sin riktiga data. Skicka resultat till KCHD."
            audit={<>
              ☐ Verifierings-VQL refererar bara vyer som existerar hos VGR<br/>
              ☐ Jämförelseresultat dokumenterat (testdata vs vantetider.se)<br/>
              ☐ Kända avvikelser förklarade (testdata ≠ riktiga volymer, men proportioner ska stämma)
            </>}
          />

          <Phase
            nr="1b"
            title="Kvalitetspaket (04_kvalitet/)"
            status="GÖR NU"
            statusColor={C.green}
            desc="7 VQL-vyer som kontrollerar datakvalitet. Varje DQ-vy returnerar rader enbart vid FEL — 0 rader = allt OK. Vi testar mot vår testdata, sedan levererar till VGR."
            kchd={<>
              7 VQL-vyer:<br/>
              <span style={{ fontFamily: mono, fontSize: 12, color: C.accent }}>dq0_existens</span> — rader finns i src_genomford/src_vantande<br/>
              <span style={{ fontFamily: mono, fontSize: 12, color: C.accent }}>dq1_null</span> — obligatoriska fält ej NULL<br/>
              <span style={{ fontFamily: mono, fontSize: 12, color: C.accent }}>dq2_doman</span> — kva_kod ∈ ref_kva, regionkod, mvo_kod<br/>
              <span style={{ fontFamily: mono, fontSize: 12, color: C.accent }}>dq3_intervall</span> — vantetid_dagar ≥ 0, rimligt födelseår<br/>
              <span style={{ fontFamily: mono, fontSize: 12, color: C.accent }}>dq4_ifyllnadsgrad</span> — andel NULL per kolumn<br/>
              <span style={{ fontFamily: mono, fontSize: 12, color: C.accent }}>dq5_korsvalidering</span> — summor stämmer mellan lager<br/>
              <span style={{ fontFamily: mono, fontSize: 12, color: C.accent }}>dq6_rimlighet</span> — KPI:er inom rimliga intervall<br/>
              Testa alla mot testdata innan leverans.
            </>}
            vgr="Köra alla DQ-vyer. Rapportera fel. Åtgärda datakvalitetsproblem i källdata."
            audit={<>
              ☐ Alla 7 DQ-vyer har CREATE VIEW i koden<br/>
              ☐ Alla FROM pekar på befintliga 01–03-vyer<br/>
              ☐ Alla DQ-vyer testade mot testdata — returnerar 0 rader (inga fel)<br/>
              ☐ Copy-paste-körbar VQL (inga FOLDER, VALUES, INTERFACE VIEW)
            </>}
          />

          <Card style={{ background: "#fef3c7", border: "1px solid #fde68a", borderRadius: 8, padding: 12, marginBottom: 16 }}>
            <div style={{ textAlign: "center", fontWeight: 700, color: C.amber }}>─── KVALITETSGRIND: Data OK, beräkningar verifierade ───</div>
          </Card>

          <Phase
            nr="2"
            title="FHIR-mappning aggregerad nivå (05_fhir/)"
            status="NÄSTA"
            statusColor={C.amber}
            depends="Fas 1a+1b klara — vi vet att grunddata och beräkningar stämmer"
            desc="VQL-vyer som producerar data i FHIR-kompatibel struktur för aggregerade mått (Measure/MeasureReport). Mappningen bygger på officiella FHIR R4-specifikationer — vi slår direkt mot hl7.org/fhir för att säkerställa korrekt struktur och kodning. Resultatet ska vara återanvändbart för alla framtida vårdutbud."
            kchd={<>
              Slå mot officiella FHIR-källor:<br/>
              • hl7.org/fhir/R4/measure.html<br/>
              • hl7.org/fhir/R4/measurereport.html<br/>
              • HL7 Sweden FHIR-profiler om tillämpliga<br/><br/>
              Skapa VQL-vyer:<br/>
              <span style={{ fontFamily: mono, fontSize: 12, color: C.accent }}>fhir_measure_definition</span> → FHIR Measure<br/>
              <span style={{ fontFamily: mono, fontSize: 12, color: C.accent }}>fhir_measure_report</span> → FHIR MeasureReport<br/><br/>
              Hämta tidigare mappningsinstruktioner från patientnivå-sessionen.<br/>
              Testa mot testdata. Dokumentera för hubbens GitHub.
            </>}
            vgr="Ingen insats — vyerna läser från befintliga 02/03-lager. VGR kör dem bara."
            audit={<>
              ☐ FHIR-resursmappning verifierad mot officiell R4-spec (hl7.org/fhir)<br/>
              ☐ Kodning verifierad (KVÅ-system-URI, SNOMED, SKR aktivitetskod)<br/>
              ☐ MeasureReport-struktur matchar Measure-definition<br/>
              ☐ Alla FROM pekar på befintliga vyer i 02/03<br/>
              ☐ Testkörd mot testdata<br/>
              ☐ Återanvändbar design (parametriserat på aktivitetskod, inte hårdkodat katarakt)
            </>}
            note="Tidigare session hade instruktioner för FHIR-mappning på patientnivå — hämta dessa som grund. Measure/MeasureReport är nytt men följer samma princip: VQL producerar tabelldata med FHIR-kompatibla kolumnnamn."
          />

          <Phase
            nr="3"
            title="SSIS-transformation (C#)"
            status="SEDAN"
            statusColor={C.accent}
            depends="Fas 2 klar — FHIR-vyer finns i Denodo"
            desc="C#-kod som läser aggregerade FHIR-vyer via ODBC/JDBC och transformerar till FHIR R4 JSON med Microsofts SSIS. SSIS är det verktyg VGR normalt använder för att transformera källdata till Socialstyrelsens format — här använder vi det för att producera FHIR-resurser från vår VQL-data. Mappningen mot officiella FHIR-källor krävs även här."
            kchd={<>
              C#-projekt:<br/>
              <span style={{ fontFamily: mono, fontSize: 12, color: C.accent }}>DenodoReader</span> — ODBC/JDBC mot fhir_measure_report<br/>
              <span style={{ fontFamily: mono, fontSize: 12, color: C.accent }}>SsidTransformer</span> — MS SSIS-integration<br/>
              <span style={{ fontFamily: mono, fontSize: 12, color: C.accent }}>FhirValidator</span> — validerar output mot R4/svenska profiler<br/>
              + enhetstester med testdata<br/>
              Dokumentera för hubbens GitHub.
            </>}
            vgr="Tillhandahålla SSIS-miljö/credentials. Testa i testmiljö."
            audit={<>
              ☐ Genererad FHIR JSON validerar mot R4-schema<br/>
              ☐ SSIS-konfiguration verifierad mot Microsofts dokumentation<br/>
              ☐ Inga hårdkodade VGR-specifika värden i C# (allt från VQL)<br/>
              ☐ Enhetstester passerar med testdata<br/>
              ☐ Felhantering vid Denodo-anslutningsproblem
            </>}
          />

          <Phase
            nr="4"
            title="FHIR + SSIS på radnivå/patientnivå"
            status="SEDAN"
            statusColor={C.accent}
            depends="Fas 2+3 klara — aggregerad pipeline bevisad"
            desc="Samma mönster som fas 2+3, men för patientnivådata. VQL-vyer som mappar enskilda operationer/väntande till FHIR Procedure/ServiceRequest, och C#-kod som transformerar via SSIS. VGR kan testa detta själva även om de inte ska skicka data vidare till hubben i nuläget."
            kchd={<>
              VQL-vyer (05_fhir/):<br/>
              <span style={{ fontFamily: mono, fontSize: 12, color: C.accent }}>fhir_procedure</span> — genomförd op → FHIR Procedure<br/>
              <span style={{ fontFamily: mono, fontSize: 12, color: C.accent }}>fhir_service_request</span> — väntande → FHIR ServiceRequest<br/><br/>
              C#-komplettering:<br/>
              <span style={{ fontFamily: mono, fontSize: 12, color: C.accent }}>PatientLevelTransformer</span> — läser radnivå-FHIR-vyer, SSIS-transformation<br/><br/>
              Hämta mappningsinstruktioner från tidigare session.<br/>
              Slå mot officiella FHIR R4-spec för Procedure + ServiceRequest.<br/>
              Testa mot testdata. Dokumentera.
            </>}
            vgr="Testa hela pipelinen mot sin riktiga data. Radnivådata stannar hos VGR — skickas inte till hubben i nuläget."
            audit={<>
              ☐ FHIR Procedure-mappning verifierad mot R4-spec + HL7 Sweden<br/>
              ☐ FHIR ServiceRequest-mappning verifierad<br/>
              ☐ KVÅ-kodning korrekt (system URI, display)<br/>
              ☐ Testdata producerar valida FHIR-resurser<br/>
              ☐ Samma C#-arkitektur som fas 3 (DenodoReader återanvänds)
            </>}
            note="Detta ger VGR en komplett lokal pipeline: källdata → Denodo → FHIR → SSIS. De kan använda den för att ersätta sin nuvarande manuella rapportering till Socialstyrelsen på sikt."
          />

          <Card accent={C.purple}>
            <H2>Tidslinje</H2>
            <div style={{ fontFamily: mono, fontSize: 12, lineHeight: 2.4, background: C.codeBg, color: C.codeText, padding: 20, borderRadius: 8 }}>
              <div><span style={{ color: "#cba6f7" }}>0   OMOP-mappning (dok)</span>     Dokumentera, ej bygga. Kan pågå parallellt.</div>
              <div><span style={{ color: "#a6e3a1" }}>1a  Verifiering</span>            KCHD testar mot testdata + vantetider.se</div>
              <div><span style={{ color: "#a6e3a1" }}>1b  Kvalitetspaket</span>         KCHD bygger + testar → levererar till VGR</div>
              <div>    ─── kvalitetsgrind: data OK ───</div>
              <div><span style={{ color: "#fab387" }}>2   FHIR aggregerat</span>        VQL-vyer (Measure/MeasureReport)</div>
              <div><span style={{ color: "#89b4fa" }}>3   SSIS C# aggregerat</span>     C#-kod, MS SSIS-integration</div>
              <div><span style={{ color: "#89b4fa" }}>4   FHIR+SSIS radnivå</span>      Procedure/ServiceRequest + C#</div>
              <div>    ─── alla paket dokumenterade på hubbens GitHub ───</div>
            </div>
          </Card>
        </div>)}

        {/* ═══ PRINCIPER ═══ */}
        {tab === "principer" && (<div>
          <Card accent={C.accent}>
            <H2>Grundprinciper för allt vi bygger</H2>
            <div style={{ fontSize: 14, lineHeight: 2 }}>
              {[
                { p: "VQL, aldrig SQL", d: "Vi kör Denodo. Alla filer heter .vql, all kod är VQL-syntax, alla funktioner är Denodo-funktioner (GETDAYSBETWEEN, LASTDAYOFMONTH, COALESCE)." },
                { p: "Testa mot testdata först", d: "Vi har 100 VGR-patienter + 100 Halland-patienter. All kod testas mot dessa innan leverans. VGR ska aldrig vara först med att hitta fel." },
                { p: "POC-koden ÄR produktionskoden", d: "Allt vi bygger dokumenteras för hubbens GitHub-repo. Vi bygger inte saker som sedan behöver 'göras om ordentligt' — vi gör det ordentligt direkt." },
                { p: "KCHD gör så mycket som möjligt", d: "Vi väntar inte på VGR för saker vi kan göra själva. Verifiering mot vantetider.se, testning, dokumentation — allt detta gör vi innan vi levererar." },
                { p: "Officiella FHIR-källor", d: "All FHIR-mappning slår direkt mot hl7.org/fhir/R4. Vi gissar inte resurstruktur — vi verifierar mot specen." },
                { p: "Återanvändbart", d: "Inget i beräknings- eller FHIR-lagret ska vara hårdkodat för katarakt. Aktivitetskod, KVÅ-filter och MVO-kod kommer från kodverket (00_kodverk). Nästa vårdutbud byter bara kodverk." },
                { p: "Audit innan varje leverans", d: "Se Audit-fliken. Vi kör hela checklistan innan vi skickar något till VGR." },
              ].map((r, i) => (
                <div key={i} style={{ marginBottom: 12 }}>
                  <strong style={{ color: C.accent }}>{r.p}</strong><br/>
                  <span style={{ color: C.textMuted, fontSize: 13 }}>{r.d}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card accent={C.red}>
            <H2>Misstag i första leveransen — aldrig igen</H2>
            <div style={{ fontSize: 14, lineHeight: 1.9 }}>
              {[
                { fel: "src_vantande skapades aldrig", fix: "Automatisk check: alla FROM-vyer måste ha matchande CREATE VIEW." },
                { fel: "Detaljvyer lovade i diagram men saknades i kod", fix: "Diagram och kod granskas mot samma checklista." },
                { fel: "Power BI-referens kvar i diagram", fix: "Sök alla förekomster av borttagna termer." },
                { fel: "Levererade utan att testa mot testdata", fix: "All kod testas mot testdata innan leverans." },
              ].map((m, i) => (
                <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                  <span style={{ color: C.red }}>❌</span>
                  <div><strong>{m.fel}</strong> → <span style={{ color: C.green }}>{m.fix}</span></div>
                </div>
              ))}
            </div>
          </Card>
        </div>)}

        {/* ═══ VYLISTA ═══ */}
        {tab === "vyer" && (<div>
          <Card>
            <H2 sub="13 live + 7 bygga nu (DQ) + 4 bygga snart (FHIR) + framtida OMOP">Komplett vylista alla lager</H2>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead><tr>
                  {["Lager", "Vy", "Fas", "Status", "Läser från", "VGR ändrar?"].map((h, i) => (
                    <th key={i} style={{ textAlign: "left", padding: "6px 8px", borderBottom: `2px solid ${C.border}`, color: C.textMuted, fontWeight: 600, fontSize: 11 }}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {[
                    { lager: "00", vy: "ref_kva_katarakt", fas: "—", status: "✅", from: "—", vgr: "Nej" },
                    { lager: "01", vy: "src_genomford", fas: "—", status: "✅", from: "datalager", vgr: "Ja" },
                    { lager: "01", vy: "src_vantande", fas: "—", status: "✅", from: "datalager", vgr: "Ja" },
                    { lager: "02", vy: "calc_vantetid_genomford", fas: "—", status: "✅", from: "src_genomford, ref_kva", vgr: "Nej" },
                    { lager: "02", vy: "calc_vantande", fas: "—", status: "✅", from: "src_vantande, ref_kva", vgr: "Nej" },
                    { lager: "03", vy: "res_kpi_manad", fas: "—", status: "✅", from: "calc_vantetid_genomford", vgr: "Nej" },
                    { lager: "03", vy: "res_kpi_per_yrke", fas: "—", status: "✅", from: "calc_vantetid_genomford", vgr: "Nej" },
                    { lager: "03", vy: "res_kpi_per_kontaktform", fas: "—", status: "✅", from: "calc_vantetid_genomford", vgr: "Nej" },
                    { lager: "03", vy: "res_kpi_per_bokning", fas: "—", status: "✅", from: "calc_vantetid_genomford", vgr: "Nej" },
                    { lager: "03", vy: "res_kpi_per_remittent", fas: "—", status: "✅", from: "calc_vantetid_genomford", vgr: "Nej" },
                    { lager: "03", vy: "res_kpi_per_kommun", fas: "—", status: "✅", from: "calc_vantetid_genomford", vgr: "Nej" },
                    { lager: "03", vy: "res_genomford_detalj", fas: "—", status: "✅", from: "calc_vantetid_genomford", vgr: "Nej" },
                    { lager: "03", vy: "res_vantande_detalj", fas: "—", status: "✅", from: "calc_vantande", vgr: "Nej" },
                    { lager: "04", vy: "dq0_existens", fas: "1b", status: "🔨", from: "src_genomford, src_vantande", vgr: "Nej" },
                    { lager: "04", vy: "dq1_null", fas: "1b", status: "🔨", from: "src_genomford, src_vantande", vgr: "Nej" },
                    { lager: "04", vy: "dq2_doman", fas: "1b", status: "🔨", from: "src_*, ref_kva", vgr: "Nej" },
                    { lager: "04", vy: "dq3_intervall", fas: "1b", status: "🔨", from: "calc_*", vgr: "Nej" },
                    { lager: "04", vy: "dq4_ifyllnadsgrad", fas: "1b", status: "🔨", from: "src_genomford, src_vantande", vgr: "Nej" },
                    { lager: "04", vy: "dq5_korsvalidering", fas: "1b", status: "🔨", from: "calc_*, res_kpi_manad", vgr: "Nej" },
                    { lager: "04", vy: "dq6_rimlighet", fas: "1b", status: "🔨", from: "res_kpi_manad", vgr: "Nej" },
                    { lager: "05", vy: "fhir_measure_definition", fas: "2", status: "📋", from: "hårdkodad (16 KPI:er)", vgr: "Nej" },
                    { lager: "05", vy: "fhir_measure_report", fas: "2", status: "📋", from: "res_kpi_manad", vgr: "Nej" },
                    { lager: "05", vy: "fhir_procedure", fas: "4", status: "📋", from: "res_genomford_detalj", vgr: "Nej" },
                    { lager: "05", vy: "fhir_service_request", fas: "4", status: "📋", from: "res_vantande_detalj", vgr: "Nej" },
                  ].map((r, i) => (
                    <tr key={i} style={{ background: r.status === "✅" ? undefined : r.status === "🔨" ? C.amberBg : C.purpleBg }}>
                      <td style={{ padding: "5px 8px", borderBottom: `1px solid ${C.border}`, fontFamily: mono, fontSize: 11, color: C.accent }}>{r.lager}</td>
                      <td style={{ padding: "5px 8px", borderBottom: `1px solid ${C.border}`, fontFamily: mono, fontSize: 11, fontWeight: 600 }}>{r.vy}</td>
                      <td style={{ padding: "5px 8px", borderBottom: `1px solid ${C.border}`, fontSize: 11, color: C.textMuted }}>{r.fas}</td>
                      <td style={{ padding: "5px 8px", borderBottom: `1px solid ${C.border}`, fontSize: 12 }}>{r.status}</td>
                      <td style={{ padding: "5px 8px", borderBottom: `1px solid ${C.border}`, fontSize: 11, color: C.textMuted, fontFamily: mono }}>{r.from}</td>
                      <td style={{ padding: "5px 8px", borderBottom: `1px solid ${C.border}`, fontSize: 12, textAlign: "center" }}>{r.vgr}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ marginTop: 12, fontSize: 12, color: C.textMuted }}>
              ✅ = live hos VGR | 🔨 = KCHD bygger nu | 📋 = planerad
            </div>
          </Card>
        </div>)}

        {/* ═══ FHIR-ARKITEKTUR ═══ */}
        {tab === "fhir" && (<div>
          <Card>
            <H2 sub="Två parallella spår: aggregerat (Measure) och radnivå (Procedure)">VQL → C#/SSIS → FHIR R4</H2>
            <div style={{ fontFamily: mono, fontSize: 12, lineHeight: 2.2, background: C.codeBg, color: C.codeText, padding: 20, borderRadius: 8, textAlign: "center" }}>
              <div style={{ color: "#6c7086" }}>         AGGREGERAT (fas 2+3)          RADNIVÅ (fas 4)</div>
              <div style={{ color: "#a6e3a1" }}>┌──────────────────────┐   ┌──────────────────────┐</div>
              <div style={{ color: "#a6e3a1" }}>│ fhir_measure_report  │   │ fhir_procedure       │</div>
              <div style={{ color: "#a6e3a1" }}>│ fhir_measure_def     │   │ fhir_service_request │</div>
              <div style={{ color: "#a6e3a1" }}>└──────────┬───────────┘   └──────────┬───────────┘</div>
              <div style={{ color: "#6c7086" }}>           │ ODBC/JDBC                  │ ODBC/JDBC</div>
              <div style={{ color: "#89b4fa" }}>┌──────────┴───────────┐   ┌──────────┴───────────┐</div>
              <div style={{ color: "#89b4fa" }}>│ C# + MS SSIS         │   │ C# + MS SSIS         │</div>
              <div style={{ color: "#89b4fa" }}>│ → Measure            │   │ → Procedure          │</div>
              <div style={{ color: "#89b4fa" }}>│ → MeasureReport      │   │ → ServiceRequest     │</div>
              <div style={{ color: "#89b4fa" }}>└──────────┬───────────┘   └──────────┬───────────┘</div>
              <div style={{ color: "#6c7086" }}>           │ FHIR R4 JSON               │ FHIR R4 JSON</div>
              <div style={{ color: "#cba6f7" }}>┌──────────┴──────────────────────────┴───────────┐</div>
              <div style={{ color: "#cba6f7" }}>│           Socialstyrelsen / Hubben              │</div>
              <div style={{ color: "#cba6f7" }}>│  (aggregerat via hubben, radnivå via SoS)       │</div>
              <div style={{ color: "#cba6f7" }}>└─────────────────────────────────────────────────┘</div>
            </div>
          </Card>

          <Card>
            <H2>FHIR-resurser per fas</H2>
            <div style={{ fontSize: 14, lineHeight: 1.9 }}>
              <p style={{ marginTop: 0 }}><strong>Fas 2 — Aggregerat:</strong></p>
              <p><span style={{ fontFamily: mono, color: C.accent }}>Measure</span> — definierar KPI:t (population, beräkningslogik, kodning). En per KPI (16 st). Statisk — ändras bara om KPI-definitionen ändras.</p>
              <p><span style={{ fontFamily: mono, color: C.accent }}>MeasureReport</span> — det faktiska resultatet. En per KPI × period × enhet. Dynamisk — ny data varje månad.</p>

              <p><strong>Fas 4 — Radnivå:</strong></p>
              <p><span style={{ fontFamily: mono, color: C.accent }}>Procedure</span> — genomförd operation (code = KVÅ CJE20, performed = start_datum, basedOn → ServiceRequest). En per operation.</p>
              <p><span style={{ fontFamily: mono, color: C.accent }}>ServiceRequest</span> — väntande patient (authoredOn = beslut_datum, code = KVÅ, status = active). En per väntande.</p>

              <p><strong>Officiella källor att slå mot:</strong></p>
              <div style={{ fontSize: 13, lineHeight: 1.8, color: C.textMuted }}>
                hl7.org/fhir/R4/measure.html<br/>
                hl7.org/fhir/R4/measurereport.html<br/>
                hl7.org/fhir/R4/procedure.html<br/>
                hl7.org/fhir/R4/servicerequest.html<br/>
                simplifier.net (HL7 Sweden profiler)<br/>
                Tidigare FHIR-mappningssession (patientnivå-instruktioner)
              </div>
            </div>
          </Card>

          <Card>
            <H2>SSIS:s roll</H2>
            <div style={{ fontSize: 14, lineHeight: 1.9 }}>
              <p style={{ marginTop: 0 }}>SSIS (Microsofts transformeringsverktyg) är det VGR normalt använder för att transformera källdata till Socialstyrelsens format för väntetidsdata. I vår pipeline använder vi SSIS i C#-lagret för att:</p>
              <p>1. Läsa tabelldata från Denodos FHIR-vyer (05_fhir/) via ODBC/JDBC</p>
              <p>2. Transformera till validerade FHIR R4 JSON-resurser</p>
              <p style={{ marginBottom: 0 }}>3. Publicera/exportera (till hubben eller Socialstyrelsen)</p>
            </div>
          </Card>
        </div>)}

        {/* ═══ AUDIT ═══ */}
        {tab === "audit" && (<div>
          <Card accent={C.red}>
            <H2 sub="Kör VARJE punkt innan VARJE leverans till VGR. Inga undantag.">Audit-checklista</H2>
            <div style={{ fontSize: 13, lineHeight: 2.2 }}>
              <div style={{ fontWeight: 700, color: C.accent, marginBottom: 4 }}>VQL-kod</div>
              {[
                "Varje CREATE VIEW har exakt ett matchande kodblock i leveransen",
                "Varje FROM-referens pekar på en vy som skapas i samma paket ELLER redan finns hos VGR",
                "Inga FOLDER-satser, VALUES-syntax, INTERFACE VIEW, eller SQL-specifik syntax",
                "Alla VQL-block kan copy-pastas direkt i Denodo utan ändringar (utom 01_basvy)",
                "All kod testad mot testdata (100 VGR + 100 Halland) — alla vyer returnerar data utan fel",
              ].map((c, i) => (
                <div key={i} style={{ display: "flex", gap: 8 }}><span style={{ color: C.red, flexShrink: 0 }}>☐</span><span>{c}</span></div>
              ))}

              <div style={{ fontWeight: 700, color: C.accent, marginTop: 12, marginBottom: 4 }}>Dokumentation</div>
              {[
                "Arkitekturdiagram listar exakt de vyer som koden skapar — varken fler eller färre",
                "Implementationssteg refererar rätt antal kodblock med rätt namn",
                "Inga kvarvarande borttagna termer (GitHub, OMOP, Power BI) i text eller diagram",
                "Version uppdaterad i header och footer",
              ].map((c, i) => (
                <div key={i} style={{ display: "flex", gap: 8 }}><span style={{ color: C.red, flexShrink: 0 }}>☐</span><span>{c}</span></div>
              ))}

              <div style={{ fontWeight: 700, color: C.accent, marginTop: 12, marginBottom: 4 }}>Teknisk kvalitet</div>
              {[
                "Inga unicode-escapes — alla å/ä/ö är riktig UTF-8",
                "JSX parsas utan syntaxfel (braces + parens balanserade)",
                "Filer heter .vql (inte .sql)",
              ].map((c, i) => (
                <div key={i} style={{ display: "flex", gap: 8 }}><span style={{ color: C.red, flexShrink: 0 }}>☐</span><span>{c}</span></div>
              ))}

              <div style={{ fontWeight: 700, color: C.accent, marginTop: 12, marginBottom: 4 }}>Hubbens GitHub</div>
              {[
                "Koden dokumenterad i format som kan gå direkt in i hubbens repo",
                "README med syfte, beroenden, körordning, verifieringssteg",
                "Allt återanvändbart — inget hårdkodat för katarakt i 02/03/04/05-lagren",
              ].map((c, i) => (
                <div key={i} style={{ display: "flex", gap: 8 }}><span style={{ color: C.red, flexShrink: 0 }}>☐</span><span>{c}</span></div>
              ))}
            </div>
          </Card>
        </div>)}

        <div style={{ marginTop: 24, paddingTop: 12, borderTop: `1px solid ${C.border}`, color: C.textDim, fontSize: 10, display: "flex", justifyContent: "space-between" }}>
          <span>KCHD intern plan | Katarakt VGR fas 0–4</span>
          <span>2026-03-25</span>
        </div>
      </div>
    </div>
  );
}
