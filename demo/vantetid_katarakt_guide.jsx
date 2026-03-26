import { useState } from "react";

const C = {
  bg: "#fafaf9", card: "#ffffff", border: "#e7e5e4",
  accent: "#1e40af", accentLight: "#3b82f6", accentBg: "#eff6ff",
  green: "#15803d", greenBg: "#f0fdf4", greenBorder: "#bbf7d0",
  amber: "#b45309", amberBg: "#fffbeb", amberBorder: "#fde68a",
  red: "#b91c1c", redBg: "#fef2f2",
  purple: "#7c3aed", purpleBg: "#f5f3ff",
  text: "#1c1917", textMuted: "#78716c", textDim: "#a8a29e",
  codeBg: "#1e1e2e", codeText: "#cdd6f4",
  kw: "#cba6f7", fn: "#89b4fa", str: "#a6e3a1", cm: "#6c7086", num: "#fab387",
};
const font = "'Inter', -apple-system, sans-serif";
const mono = "'JetBrains Mono', 'Fira Code', monospace";

const Tab = ({ active, onClick, children, badge }) => (
  <button onClick={onClick} style={{ padding: "10px 16px", background: active ? C.accent : "transparent", color: active ? "#fff" : C.textMuted, border: "none", borderBottom: active ? `2px solid ${C.accent}` : "2px solid transparent", cursor: "pointer", fontFamily: font, fontSize: 13, fontWeight: active ? 600 : 400, display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}>
    {children}
    {badge && <span style={{ background: active ? "rgba(255,255,255,0.2)" : C.accentBg, color: active ? "#fff" : C.accent, fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 8 }}>{badge}</span>}
  </button>
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
const Badge = ({ children, color }) => (
  <span style={{ display: "inline-block", background: color + "15", color, fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 4, fontFamily: mono, marginRight: 4 }}>{children}</span>
);
const StepN = ({ n }) => (
  <div style={{ width: 28, height: 28, borderRadius: 14, background: C.accent, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>{n}</div>
);
const Code = ({ code, title }) => (
  <div style={{ marginBottom: 12 }}>
    {title && <div style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, marginBottom: 4 }}>{title}</div>}
    <pre style={{ background: C.codeBg, color: C.codeText, padding: 16, borderRadius: 8, fontSize: 12, lineHeight: 1.6, fontFamily: mono, overflowX: "auto", margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{code}</pre>
  </div>
);
const VarRow = ({ name, xsd, source, req, rule, isNew }) => (
  <tr style={isNew ? { background: "#fefce8" } : {}}>
    <td style={{ padding: "7px 8px", borderBottom: `1px solid ${C.border}`, fontFamily: mono, fontSize: 11.5, color: C.accent, fontWeight: 600 }}>{xsd}{isNew && <span style={{ color: C.amber, marginLeft: 4, fontSize: 9 }}>NY</span>}</td>
    <td style={{ padding: "7px 8px", borderBottom: `1px solid ${C.border}`, fontSize: 12, color: C.text }}>{name}</td>
    <td style={{ padding: "7px 8px", borderBottom: `1px solid ${C.border}`, fontSize: 11, color: C.textMuted, fontFamily: mono }}>{source}</td>
    <td style={{ padding: "7px 8px", borderBottom: `1px solid ${C.border}`, textAlign: "center" }}>{req ? <span style={{ color: C.green, fontWeight: 700 }}>●</span> : <span style={{ color: C.textDim }}>○</span>}</td>
    <td style={{ padding: "7px 8px", borderBottom: `1px solid ${C.border}`, fontSize: 11, color: C.textMuted, lineHeight: 1.4 }}>{rule}</td>
  </tr>
);

// ── VQL Snippets ──

const VQL_00 = `-- ============================================================
-- 00  KODVERK: ref_kva_katarakt
--     Kopiera allt nedan. Klistra in i Denodo. Kör.
-- ============================================================
-- Aktivitet 51101 Gråstarr | MVO 511 Ögon
-- Källa: Socialstyrelsens "Lista över aktiviteter/vårdutbud"
-- Definierade KVÅ-grupper: CJC, CJD, CJE (15 koder)
-- Diagnoskoder: inga — enbart KVÅ definierar aktiviteten.

CREATE OR REPLACE VIEW ref_kva_katarakt AS
-- CJC: Intrakapsulär kataraktextraktion (ICCE, sällsynt)
          SELECT 'CJC00' AS kva_kod, 'ICCE' AS beskrivning
UNION ALL SELECT 'CJC10', 'ICCE + linsprotes FK'
UNION ALL SELECT 'CJC20', 'ICCE + linsprotes BK'
UNION ALL SELECT 'CJC99', 'Annan ICCE'
-- CJD: Extrakapsulär utan fakoemulsifikation (ECCE)
UNION ALL SELECT 'CJD00', 'ECCE'
UNION ALL SELECT 'CJD10', 'ECCE + linsprotes FK'
UNION ALL SELECT 'CJD20', 'ECCE + linsprotes BK'
UNION ALL SELECT 'CJD99', 'Annan ECCE'
-- CJE: Fakoemulsifikation (>98% av alla kataraktop)
UNION ALL SELECT 'CJE00', 'Fakoemulsifikation'
UNION ALL SELECT 'CJE05', 'Fako + iridektomi'
UNION ALL SELECT 'CJE10', 'Fako + linsprotes FK'
UNION ALL SELECT 'CJE15', 'Fako + iridektomi + linsprotes FK'
UNION ALL SELECT 'CJE20', 'Fako + linsprotes BK'           -- DOMINANT
UNION ALL SELECT 'CJE25', 'Fako + iridektomi + linsprotes BK'
UNION ALL SELECT 'CJE99', 'Annan fako';`;

const VQL_01 = `-- ============================================================
-- 01  BASVY: src_genomford
--     Kopiera allt nedan. Klistra in i Denodo.
--
--     ⚠️  INNAN NI KÖR: Ändra två saker:
--     1) Kolumnnamnen till VÄNSTER i SELECT (era datalagernamn)
--     2) Tabellnamnet i FROM-satsen längst ner
-- ============================================================

CREATE OR REPLACE VIEW src_genomford AS
SELECT
  -- ⚠️ ÄNDRA KOLUMNNAMNEN TILL VÄNSTER
  -- (vänster = ert datalager, höger = paketets namn)
  kontakt_id          AS vardkontakt_id,    -- ⚠️ ändra
  pat_id              AS patient_id,        -- ⚠️ ändra
  kon_kod             AS kon,               -- ⚠️ ändra  ('1'=Man '2'=Kvinna)
  fodelsar            AS fodelsear,         -- ⚠️ ändra
  '51'                AS regionkod,         -- VGR = 51 (hårdkodat)
  hsa_region          AS hsaid_region,      -- ⚠️ ändra
  hsa_vardgivare      AS hsaid_vardgivare,  -- ⚠️ ändra
  hsa_vardenhet       AS hsaid_vardenhet,   -- ⚠️ ändra
  hsa_enhet           AS hsaid_enhet,       -- ⚠️ ändra  (NULL om saknas)
  sjukhus_kod         AS sjukhuskod,        -- ⚠️ ändra
  sjukhus_namn        AS sjukhusnamn,       -- ⚠️ ändra
  mvo                 AS mvo_kod,           -- ⚠️ ändra  ('511' = Ögon)
  '51101'             AS aktivitetskod,     -- Gråstarr (hårdkodat)
  kva_aktivitet       AS aktivitet_kva,     -- ⚠️ ändra  (NULL om saknas)
  icd_aktivitet       AS aktivitet_icd,     -- ⚠️ ändra  (NULL om saknas)
  kva                 AS kva_kod,           -- ⚠️ ändra  ('CJE20' etc.)
  yrke                AS yrkeskategori,     -- ⚠️ ändra
  bokning             AS bokningssatt,      -- ⚠️ ändra
  kontakttyp          AS vardkontakttyp,    -- ⚠️ ändra
  vg_flagga           AS vardgaranti,       -- ⚠️ ändra  ('JA'/'NEJ')
  avvikelse           AS avvikelsekod,      -- ⚠️ ändra  (NULL/'PvV'/'MoV')
  remtyp              AS remittenttyp,      -- ⚠️ ändra
  rem_hsaid           AS remittent_hsaid,   -- ⚠️ ändra
  remiss_id           AS remiss_id,         -- ⚠️ ändra
  rem_datum           AS remiss_datum,      -- ⚠️ ändra
  rem_ankomst         AS ankomst_datum,     -- ⚠️ ändra
  beslut_datum        AS beslut_datum,      -- ⚠️ ändra  (MP1)
  start_datum         AS start_datum,       -- ⚠️ ändra  (MP2)
  med_maldatum        AS medicinskt_maldatum, -- ⚠️ ändra (MP3)
  kommun_kod          AS lkf,               -- ⚠️ ändra
  hsa_listning        AS hsaid_listning,    -- ⚠️ ändra
  period              AS matperiod          -- ⚠️ ändra

-- ⚠️ ÄNDRA TABELLNAMNET NEDAN till er faktiska tabell/vy
FROM ds_datalager.v_genomford_specialiserad;`;

const VQL_01V = `-- ============================================================
-- 01b BASVY: src_vantande
--     Kopiera allt nedan. Klistra in i Denodo.
--
--     ⚠️  INNAN NI KÖR: Ändra två saker:
--     1) Kolumnnamnen till VÄNSTER i SELECT (era datalagernamn)
--     2) Tabellnamnet i FROM-satsen längst ner
--
--     OBS: Om genomförda och väntande ligger i SAMMA tabell
--     i ert datalager, peka mot samma tabell som src_genomford
--     men lägg till WHERE start_datum IS NULL (eller motsvarande
--     filter för väntande patienter).
-- ============================================================

CREATE OR REPLACE VIEW src_vantande AS
SELECT
  -- ⚠️ ÄNDRA KOLUMNNAMNEN TILL VÄNSTER (samma princip som src_genomford)
  kontakt_id          AS vardkontakt_id,    -- ⚠️ ändra
  pat_id              AS patient_id,        -- ⚠️ ändra
  kon_kod             AS kon,               -- ⚠️ ändra
  fodelsar            AS fodelsear,         -- ⚠️ ändra
  '51'                AS regionkod,
  hsa_region          AS hsaid_region,      -- ⚠️ ändra
  hsa_vardgivare      AS hsaid_vardgivare,  -- ⚠️ ändra
  hsa_vardenhet       AS hsaid_vardenhet,   -- ⚠️ ändra
  hsa_enhet           AS hsaid_enhet,       -- ⚠️ ändra
  sjukhus_kod         AS sjukhuskod,        -- ⚠️ ändra
  sjukhus_namn        AS sjukhusnamn,       -- ⚠️ ändra
  mvo                 AS mvo_kod,           -- ⚠️ ändra
  '51101'             AS aktivitetskod,
  kva_aktivitet       AS aktivitet_kva,     -- ⚠️ ändra
  icd_aktivitet       AS aktivitet_icd,     -- ⚠️ ändra
  kva                 AS kva_kod,           -- ⚠️ ändra
  yrke                AS yrkeskategori,     -- ⚠️ ändra
  bokning             AS bokningssatt,      -- ⚠️ ändra
  kontakttyp          AS vardkontakttyp,    -- ⚠️ ändra
  vg_flagga           AS vardgaranti,       -- ⚠️ ändra
  avvikelse           AS avvikelsekod,      -- ⚠️ ändra
  remtyp              AS remittenttyp,      -- ⚠️ ändra
  rem_hsaid           AS remittent_hsaid,   -- ⚠️ ändra
  remiss_id           AS remiss_id,         -- ⚠️ ändra
  rem_datum           AS remiss_datum,      -- ⚠️ ändra
  rem_ankomst         AS ankomst_datum,     -- ⚠️ ändra
  beslut_datum        AS beslut_datum,      -- ⚠️ ändra
  NULL                AS start_datum,       -- Alltid NULL för väntande
  med_maldatum        AS medicinskt_maldatum, -- ⚠️ ändra
  kommun_kod          AS lkf,               -- ⚠️ ändra
  hsa_listning        AS hsaid_listning,    -- ⚠️ ändra
  period              AS matperiod          -- ⚠️ ändra

-- ⚠️ ÄNDRA TABELLNAMNET NEDAN
-- Om samma tabell som genomförda: lägg till WHERE-villkor för väntande
FROM ds_datalager.v_vantande_specialiserad;`;

const VQL_02 = `-- ============================================================
-- 02a BERÄKNING: calc_vantetid_genomford
--     Kopiera allt nedan. Klistra in i Denodo. Kör.
--     Ingen ändring behövs — läser från src_genomford.
-- ============================================================

CREATE OR REPLACE VIEW calc_vantetid_genomford AS
SELECT
  src.*,

  -- Kärnformel: antal dagar mellan beslut och operation
  GETDAYSBETWEEN(src.start_datum, src.beslut_datum)
    AS vantetid_dagar,

  -- Väntetidsintervall (samma som SKR visar)
  CASE
    WHEN GETDAYSBETWEEN(src.start_datum, src.beslut_datum) <= 30  THEN '0-30'
    WHEN GETDAYSBETWEEN(src.start_datum, src.beslut_datum) <= 60  THEN '31-60'
    WHEN GETDAYSBETWEEN(src.start_datum, src.beslut_datum) <= 90  THEN '61-90'
    WHEN GETDAYSBETWEEN(src.start_datum, src.beslut_datum) <= 120 THEN '91-120'
    WHEN GETDAYSBETWEEN(src.start_datum, src.beslut_datum) <= 180 THEN '121-180'
    ELSE '>180'
  END AS vantetid_intervall,

  -- Åldersgrupp
  CASE
    WHEN (GETYEAR(src.start_datum) - src.fodelsear) < 50 THEN '<50'
    WHEN (GETYEAR(src.start_datum) - src.fodelsear) < 65 THEN '50-64'
    WHEN (GETYEAR(src.start_datum) - src.fodelsear) < 75 THEN '65-74'
    WHEN (GETYEAR(src.start_datum) - src.fodelsear) < 85 THEN '75-84'
    ELSE '85+'
  END AS aldersgrupp,

  -- Vårdgaranti: 1 om uppfylld, 0 annars (PvV exkluderas)
  CASE
    WHEN src.vardgaranti = 'JA'
         AND COALESCE(src.avvikelsekod, '') <> 'PvV'
         AND GETDAYSBETWEEN(src.start_datum, src.beslut_datum) <= 90
    THEN 1 ELSE 0
  END AS uppfyller_vg,

  -- Total patientresa: remiss till operation
  CASE WHEN src.remiss_datum IS NOT NULL
    THEN GETDAYSBETWEEN(src.start_datum, src.remiss_datum)
    ELSE NULL
  END AS total_patientresa_dagar,

  -- Remiss till beslut
  CASE WHEN src.remiss_datum IS NOT NULL AND src.beslut_datum IS NOT NULL
    THEN GETDAYSBETWEEN(src.beslut_datum, src.remiss_datum)
    ELSE NULL
  END AS remiss_till_beslut_dagar,

  GETYEAR(src.start_datum)  AS op_ar,
  GETMONTH(src.start_datum) AS op_manad

FROM src_genomford src
WHERE src.kva_kod IN (SELECT kva_kod FROM ref_kva_katarakt)
  AND src.mvo_kod = '511'
  AND src.beslut_datum IS NOT NULL
  AND src.start_datum  IS NOT NULL
  AND GETDAYSBETWEEN(src.start_datum, src.beslut_datum) >= 0;`;

const VQL_02V = `-- ============================================================
-- 02b BERÄKNING: calc_vantande
--     Kopiera allt nedan. Klistra in i Denodo. Kör.
--     Ingen ändring behövs — läser från src_vantande.
-- ============================================================
-- OBS: Denna vy förutsätter att ni också har skapat
-- src_vantande (samma mall som src_genomford, men med
-- data för patienter som VÄNTAR på operation).

CREATE OR REPLACE VIEW calc_vantande AS
SELECT
  src.*,

  -- Kärnformel: dagar sedan beslut (ögonblicksbild)
  GETDAYSBETWEEN(
    LASTDAYOFMONTH(CURRENT_DATE), src.beslut_datum
  ) AS vantetid_dagar,

  LASTDAYOFMONTH(CURRENT_DATE) AS rapportdatum,

  -- Väntetidsintervall
  CASE
    WHEN GETDAYSBETWEEN(LASTDAYOFMONTH(CURRENT_DATE), src.beslut_datum) <= 30  THEN '0-30'
    WHEN GETDAYSBETWEEN(LASTDAYOFMONTH(CURRENT_DATE), src.beslut_datum) <= 60  THEN '31-60'
    WHEN GETDAYSBETWEEN(LASTDAYOFMONTH(CURRENT_DATE), src.beslut_datum) <= 90  THEN '61-90'
    WHEN GETDAYSBETWEEN(LASTDAYOFMONTH(CURRENT_DATE), src.beslut_datum) <= 120 THEN '91-120'
    WHEN GETDAYSBETWEEN(LASTDAYOFMONTH(CURRENT_DATE), src.beslut_datum) <= 180 THEN '121-180'
    ELSE '>180'
  END AS vantetid_intervall,

  -- Aktivt väntande (MoV = ej aktivt)
  CASE
    WHEN COALESCE(src.avvikelsekod, '') = 'MoV' THEN 'Ej aktivt väntande'
    ELSE 'Aktivt väntande'
  END AS vantestatus,

  -- VG-risk: bryter redan vårdgarantin?
  CASE
    WHEN src.vardgaranti = 'JA'
         AND COALESCE(src.avvikelsekod, '') NOT IN ('PvV','MoV')
         AND GETDAYSBETWEEN(LASTDAYOFMONTH(CURRENT_DATE), src.beslut_datum) > 90
    THEN 1 ELSE 0
  END AS bryter_vg

FROM src_vantande src
WHERE src.kva_kod IN (SELECT kva_kod FROM ref_kva_katarakt)
  AND src.mvo_kod = '511'
  AND src.beslut_datum IS NOT NULL
  AND src.start_datum  IS NULL;`;

const VQL_03 = `-- ============================================================
-- 03a RESULTAT: res_kpi_manad
--     Kopiera allt nedan. Klistra in i Denodo. Kör.
--     Ingen ändring behövs.
-- ============================================================

CREATE OR REPLACE VIEW res_kpi_manad AS
SELECT
  g.op_ar AS ar, g.op_manad AS manad,
  g.hsaid_vardenhet, g.regionkod, g.sjukhuskod,

  COUNT(*) AS antal_genomforda,

  MEDIAN(g.vantetid_dagar)                   AS median_vantetid,
  AVG(CAST(g.vantetid_dagar AS DOUBLE))      AS medel_vantetid,

  -- Vårdgarantiuppfyllelse (PvV exkluderas)
  COUNT(CASE WHEN g.vardgaranti='JA' AND COALESCE(g.avvikelsekod,'')<>'PvV' THEN 1 END) AS namnare_vg,
  COUNT(CASE WHEN g.vardgaranti='JA' AND COALESCE(g.avvikelsekod,'')<>'PvV' AND g.vantetid_dagar<=90 THEN 1 END) AS taljare_vg,
  CASE WHEN COUNT(CASE WHEN g.vardgaranti='JA' AND COALESCE(g.avvikelsekod,'')<>'PvV' THEN 1 END) > 0
    THEN CAST(COUNT(CASE WHEN g.vardgaranti='JA' AND COALESCE(g.avvikelsekod,'')<>'PvV' AND g.vantetid_dagar<=90 THEN 1 END) AS DOUBLE)
       / COUNT(CASE WHEN g.vardgaranti='JA' AND COALESCE(g.avvikelsekod,'')<>'PvV' THEN 1 END)
    ELSE NULL END AS andel_inom_90,

  -- Fördelning per tidsintervall
  COUNT(CASE WHEN g.vantetid_intervall='0-30' THEN 1 END) AS n_0_30,
  COUNT(CASE WHEN g.vantetid_intervall='31-60' THEN 1 END) AS n_31_60,
  COUNT(CASE WHEN g.vantetid_intervall='61-90' THEN 1 END) AS n_61_90,
  COUNT(CASE WHEN g.vantetid_intervall='91-120' THEN 1 END) AS n_91_120,
  COUNT(CASE WHEN g.vantetid_intervall='121-180' THEN 1 END) AS n_121_180,
  COUNT(CASE WHEN g.vantetid_intervall='>180' THEN 1 END) AS n_over_180,

  -- Per kön
  COUNT(CASE WHEN g.kon='1' THEN 1 END) AS antal_man,
  COUNT(CASE WHEN g.kon='2' THEN 1 END) AS antal_kvinna,
  MEDIAN(CASE WHEN g.kon='1' THEN g.vantetid_dagar END) AS median_man,
  MEDIAN(CASE WHEN g.kon='2' THEN g.vantetid_dagar END) AS median_kvinna,

  -- Per åldersgrupp
  COUNT(CASE WHEN g.aldersgrupp='<50' THEN 1 END) AS n_age_lt50,
  COUNT(CASE WHEN g.aldersgrupp='50-64' THEN 1 END) AS n_age_50_64,
  COUNT(CASE WHEN g.aldersgrupp='65-74' THEN 1 END) AS n_age_65_74,
  COUNT(CASE WHEN g.aldersgrupp='75-84' THEN 1 END) AS n_age_75_84,
  COUNT(CASE WHEN g.aldersgrupp='85+' THEN 1 END) AS n_age_85plus,

  -- Mervärde: patientresa
  MEDIAN(g.total_patientresa_dagar) AS median_total_patientresa,
  MEDIAN(g.remiss_till_beslut_dagar) AS median_remiss_till_beslut

FROM calc_vantetid_genomford g
GROUP BY g.op_ar, g.op_manad, g.hsaid_vardenhet, g.regionkod, g.sjukhuskod;`;

const VQL_03B = `-- ============================================================
-- 03b RESULTAT: Dimensionsvyer
--     Kopiera allt nedan. Klistra in i Denodo. Kör.
--     Ingen ändring behövs.
--     OBS: Innehåller 5 CREATE VIEW-satser.
--     Denodo kör dem alla i sekvens.
-- ============================================================

CREATE OR REPLACE VIEW res_kpi_per_yrke AS
SELECT op_ar, op_manad, yrkeskategori,
  COUNT(*) AS antal, MEDIAN(vantetid_dagar) AS median_vt,
  CAST(COUNT(CASE WHEN uppfyller_vg=1 THEN 1 END) AS DOUBLE)
    / NULLIF(COUNT(CASE WHEN vardgaranti='JA' AND COALESCE(avvikelsekod,'')<>'PvV' THEN 1 END),0) AS andel_90
FROM calc_vantetid_genomford GROUP BY op_ar, op_manad, yrkeskategori;

CREATE OR REPLACE VIEW res_kpi_per_kontaktform AS
SELECT op_ar, op_manad, vardkontakttyp,
  COUNT(*) AS antal, MEDIAN(vantetid_dagar) AS median_vt
FROM calc_vantetid_genomford GROUP BY op_ar, op_manad, vardkontakttyp;

CREATE OR REPLACE VIEW res_kpi_per_bokning AS
SELECT op_ar, op_manad, bokningssatt,
  COUNT(*) AS antal, MEDIAN(vantetid_dagar) AS median_vt
FROM calc_vantetid_genomford GROUP BY op_ar, op_manad, bokningssatt;

CREATE OR REPLACE VIEW res_kpi_per_remittent AS
SELECT op_ar, op_manad, remittenttyp, remittent_hsaid,
  COUNT(*) AS antal, MEDIAN(vantetid_dagar) AS median_vt
FROM calc_vantetid_genomford GROUP BY op_ar, op_manad, remittenttyp, remittent_hsaid;

CREATE OR REPLACE VIEW res_kpi_per_kommun AS
SELECT op_ar, op_manad, lkf,
  COUNT(*) AS antal, MEDIAN(vantetid_dagar) AS median_vt
FROM calc_vantetid_genomford GROUP BY op_ar, op_manad, lkf;`;

const VQL_03C = `-- ============================================================
-- 03c RESULTAT: Detaljvyer (en rad per patient)
--     Kopiera allt nedan. Klistra in i Denodo. Kör.
--     Ingen ändring behövs.
--     Dessa vyer ger tillgång till enskilda patienter
--     för verifiering och detaljanalys.
-- ============================================================

CREATE OR REPLACE VIEW res_genomford_detalj AS
SELECT
  vardkontakt_id,
  patient_id,
  kon,
  fodelsear,
  aldersgrupp,
  regionkod,
  sjukhuskod,
  sjukhusnamn,
  hsaid_vardenhet,
  mvo_kod,
  kva_kod,
  aktivitetskod,
  yrkeskategori,
  bokningssatt,
  vardkontakttyp,
  vardgaranti,
  avvikelsekod,
  remittenttyp,
  remittent_hsaid,
  remiss_datum,
  ankomst_datum,
  beslut_datum,
  start_datum,
  medicinskt_maldatum,
  lkf,
  hsaid_listning,
  matperiod,
  vantetid_dagar,
  vantetid_intervall,
  uppfyller_vg,
  total_patientresa_dagar,
  remiss_till_beslut_dagar,
  op_ar,
  op_manad
FROM calc_vantetid_genomford;

CREATE OR REPLACE VIEW res_vantande_detalj AS
SELECT
  vardkontakt_id,
  patient_id,
  kon,
  fodelsear,
  regionkod,
  sjukhuskod,
  sjukhusnamn,
  hsaid_vardenhet,
  mvo_kod,
  kva_kod,
  aktivitetskod,
  yrkeskategori,
  vardgaranti,
  avvikelsekod,
  remittenttyp,
  remittent_hsaid,
  remiss_datum,
  beslut_datum,
  medicinskt_maldatum,
  lkf,
  hsaid_listning,
  matperiod,
  vantetid_dagar,
  vantetid_intervall,
  rapportdatum,
  vantestatus,
  bryter_vg
FROM calc_vantande;`;

const KPIS = [
  { kpi: "Andel inom 90 dagar", skr: true, vy: "res_kpi_manad", falt: "andel_inom_90", formel: "COUNT(VG=JA ∧ ¬PvV ∧ ≤90d) / COUNT(VG=JA ∧ ¬PvV)", note: "SKR:s huvudmått. PvV exkluderas ur både täljare och nämnare." },
  { kpi: "Medianväntetid", skr: true, vy: "res_kpi_manad", falt: "median_vantetid", formel: "MEDIAN(vantetid_dagar)", note: "Alla genomförda, oavsett VG-status." },
  { kpi: "Medelväntetid", skr: true, vy: "res_kpi_manad", falt: "medel_vantetid", formel: "AVG(vantetid_dagar)", note: "Visas på SKR:s 'Medel- och medianväntetid'-sida." },
  { kpi: "Antal genomförda", skr: true, vy: "res_kpi_manad", falt: "antal_genomforda", formel: "COUNT(*)", note: "Per månad, sjukhus/klinik." },
  { kpi: "Antal väntande", skr: true, vy: "calc_vantande", falt: "COUNT(*)", formel: "COUNT(*) WHERE start_datum IS NULL", note: "Ögonblicksbild sista dag i månad." },
  { kpi: "Väntetidsfördelning", skr: true, vy: "res_kpi_manad", falt: "n_0_30 … n_over_180", formel: "COUNT per intervall-bucket", note: "0-30, 31-60, 61-90, 91-120, 121-180, >180 dagar." },
  { kpi: "Per kön (antal + median)", skr: true, vy: "res_kpi_manad", falt: "antal_man/kvinna + median", formel: "COUNT + MEDIAN WHERE kon='1'/'2'", note: "SKR filtrerar på kön i webbgränssnittet." },
  { kpi: "Per åldersgrupp", skr: true, vy: "res_kpi_manad", falt: "n_age_*", formel: "COUNT per åldersintervall", note: "Beräknat från födelseår, inte personnummer." },
  { kpi: "Per yrkeskategori", skr: true, vy: "res_kpi_per_yrke", falt: "antal, median_vt, andel_90", formel: "GROUP BY yrkeskategori", note: "SKR filtrerar på detta. Katarakt = nästan alltid XS915 (Läkare)." },
  { kpi: "Per kontaktform", skr: true, vy: "res_kpi_per_kontaktform", falt: "antal, median_vt", formel: "GROUP BY vardkontakttyp", note: "Mottagning(0), distans(81-83), sluten(91)." },
  { kpi: "Per bokningssätt", skr: true, vy: "res_kpi_per_bokning", falt: "antal, median_vt", formel: "GROUP BY bokningssatt", note: "1-5: Bokat själv → Obokad." },
  { kpi: "Per remittent", skr: false, vy: "res_kpi_per_remittent", falt: "antal, median_vt", formel: "GROUP BY remittenttyp, remittent_hsaid", note: "MERVÄRDE: Ej på SKR. Visar vilka remittenter som genererar volymer." },
  { kpi: "Per kommun (Lkf)", skr: false, vy: "res_kpi_per_kommun", falt: "antal, median_vt", formel: "GROUP BY lkf", note: "MERVÄRDE: Geografisk analys av patienternas hemort." },
  { kpi: "Total patientresa", skr: false, vy: "res_kpi_manad", falt: "median_total_patientresa", formel: "MEDIAN(start_datum − remiss_datum)", note: "MERVÄRDE: Hela vägen remiss→operation, ej bara beslut→op." },
  { kpi: "Remiss → Beslut", skr: false, vy: "res_kpi_manad", falt: "median_remiss_till_beslut", formel: "MEDIAN(beslut_datum − remiss_datum)", note: "MERVÄRDE: Tid från remiss till specialistens op-beslut." },
  { kpi: "VG-riskpatienter", skr: false, vy: "calc_vantande", falt: "bryter_vg=1", formel: "COUNT WHERE VG=JA ∧ ¬PvV/MoV ∧ >90d", note: "MERVÄRDE: Proaktiv kölista för operationsplanering." },
];

export default function VantetidKataraktGuide() {
  const [tab, setTab] = useState("intro");
  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.text, fontFamily: font, padding: "24px 16px" }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4, flexWrap: "wrap" }}>
          <div style={{ background: C.accent, color: "#fff", padding: "4px 12px", borderRadius: 6, fontSize: 12, fontWeight: 700, fontFamily: mono }}>KCHD</div>
          <div style={{ background: C.greenBg, color: C.green, padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, border: `1px solid ${C.greenBorder}` }}>Paket 2: Väntetidsberäkning</div>
          <div style={{ background: C.purpleBg, color: C.purple, padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600 }}>Katarakt (grå starr)</div>
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: C.text, margin: "8px 0 4px", letterSpacing: "-0.03em" }}>Väntetider Katarakt — VQL-implementationspaket</h1>
        <p style={{ color: C.textMuted, fontSize: 14, margin: "0 0 20px" }}>Denodo-paket med 33 variabler, 16 KPI:er, tre beräkningslager. Version 2.3</p>

        <div style={{ display: "flex", gap: 0, borderBottom: `1px solid ${C.border}`, marginBottom: 20, overflowX: "auto" }}>
          <Tab active={tab==="intro"} onClick={() => setTab("intro")}>Så fungerar det</Tab>
          <Tab active={tab==="oversikt"} onClick={() => setTab("oversikt")}>Översikt</Tab>
          <Tab active={tab==="variabler"} onClick={() => setTab("variabler")} badge="33">Variabler</Tab>
          <Tab active={tab==="kpi"} onClick={() => setTab("kpi")} badge="16">KPI:er</Tab>
          <Tab active={tab==="vql"} onClick={() => setTab("vql")} badge="VQL">Kod</Tab>
          <Tab active={tab==="steg"} onClick={() => setTab("steg")}>Implementation</Tab>
        </div>

        {/* ══════ SÅ FUNGERAR DET ══════ */}
        {tab === "intro" && (<div>
          <Card>
            <H2>Vad är det här?</H2>
            <div style={{ fontSize: 14, lineHeight: 1.9, color: C.text }}>
              <p style={{ marginTop: 0 }}>Det här är ett färdigt beräkningspaket för att mäta väntetider till kataraktoperation (grå starr) i Denodo. Det är byggt så att det ska kunna användas av vilken region som helst, men det första målet är VGR.</p>
              <p>Paketet beräknar <strong>samma mått</strong> som presenteras på SKR:s vantetider.se — andel opererade inom 90 dagar, medianväntetid, antal väntande — men gör det <strong>lokalt i regionens egen Denodo-miljö</strong>, direkt mot regionens datalager. Det innebär att regionen får tillgång till sin egen väntetidsstatistik utan att behöva vänta på nationell publicering, och med möjlighet till finare nedbrytningar än vad den nationella webben erbjuder.</p>
            </div>
          </Card>

          <Card>
            <H2>Hur hänger det ihop?</H2>
            <div style={{ fontSize: 14, lineHeight: 1.9, color: C.text }}>
              <p style={{ marginTop: 0 }}>Paketet består av <strong>VQL-filer</strong> (Virtual Query Language, Denodos språk) som bygger på varandra i tre steg:</p>
              <div style={{ background: C.accentBg, borderRadius: 8, padding: 16, marginBottom: 16 }}>
                <div style={{ fontSize: 14, lineHeight: 2.2 }}>
                  <strong style={{ color: C.accent }}>Steg 1 — Datahämtning (01_basvy)</strong><br/>
                  <span style={{ color: C.textMuted }}>Här definieras <em>var data finns</em>. En mall som pekar mot regionens datalager — tabellen där ELVIS-data för specialiserad vård lagras. Det här är det <strong>enda steg som är VGR-specifikt</strong>. VGR:s Denodo-team behöver ändra kolumnnamnen i mallen så att de matchar VGR:s faktiska datalager.</span>
                </div>
                <div style={{ fontSize: 14, lineHeight: 2.2, marginTop: 8 }}>
                  <strong style={{ color: C.accent }}>Steg 2 — Beräkning (02_berakning)</strong><br/>
                  <span style={{ color: C.textMuted }}>Här sker själva väntetidsberäkningen: antal dagar mellan beslut och operation, indelning i tidsintervall, vårdgarantiflaggor. Denna kod <strong>rör aldrig källsystemet</strong> — den läser bara från Steg 1. Samma kod fungerar i alla regioner.</span>
                </div>
                <div style={{ fontSize: 14, lineHeight: 2.2, marginTop: 8 }}>
                  <strong style={{ color: C.accent }}>Steg 3 — Resultat (03_resultatvy)</strong><br/>
                  <span style={{ color: C.textMuted }}>Här aggregeras data till färdiga KPI:er: medianväntetid per månad, andel inom 90 dagar, väntetidsfördelning, uppdelat på kön/ålder/klinik. Dessa vyer kan kopplas direkt till ett BI-verktyg för visualisering.</span>
                </div>
              </div>
              <p>Utöver de tre stegen finns också <strong>kodverk</strong> (00_kodverk) — referenstabeller som definierar vilka KVÅ-koder som räknas som kataraktoperation, vilka avvikelsekoder som finns, och så vidare. De säkerställer att alla regioner filtrerar exakt likadant.</p>
            </div>
          </Card>

          <Card>
            <H2>Varför tre lager?</H2>
            <div style={{ fontSize: 14, lineHeight: 1.9, color: C.text }}>
              <p style={{ marginTop: 0 }}>Hela poängen med uppdelningen är <strong>portabilitet</strong>. När nästa region vill använda paketet behöver de bara ändra Steg 1 (peka mot sitt eget datalager). Beräkningarna i Steg 2 och resultaten i Steg 3 är identiska oavsett vilken region som kör dem.</p>
              <p style={{ marginBottom: 0 }}>Samma mönster kan återanvändas för andra vårdutbud i framtiden — höftledsprotser, knäprotser, ljumskbråck — med andra KVÅ-koder i kodverket men samma beräkningslogik.</p>
            </div>
          </Card>

          <Card>
            <H2>Vad måste VGR göra?</H2>
            <div style={{ fontSize: 14, lineHeight: 1.9, color: C.text }}>
              <p style={{ marginTop: 0 }}>Kort sagt: <strong>svara på några frågor</strong> (se nästa flik) och <strong>ändra kolumnnamnen i Steg 1</strong> (två mallar: en för genomförda operationer, en för väntande patienter) så att de matchar VGR:s datalager. Sedan körs VQL-koderna i Denodo i ordning (00 → 01 → 02 → 03), och resultatet är färdiga vyer med väntetidsstatistik för katarakt.</p>
              <p style={{ marginBottom: 0 }}>All kod finns under fliken <strong>"Kod"</strong> i denna guide. VGR:s Denodo-team kopierar koderna därifrån, klistrar in i Denodo Design Studio (eller VQL Shell) och kör dem.</p>
            </div>
          </Card>
        </div>)}

        {/* ══════ ÖVERSIKT ══════ */}
        {tab === "oversikt" && (<div>

          {/* FRÅGOR TILL VGR */}
          <Card accent={C.red} style={{ background: C.redBg }}>
            <H2 sub="Vi behöver svar på dessa frågor innan vi kan slutföra paketet">Frågor till VGR</H2>
            <div style={{ fontSize: 13, lineHeight: 1.8 }}>
              {[
                { q: "Vilken Denodo-version kör ni?", why: "Paketet använder funktionerna GETDAYSBETWEEN och LASTDAYOFMONTH som kräver Denodo 8.0 eller nyare." },
                { q: "Vad heter tabellen/vyn i ert datalager som innehåller väntetidsdata för specialiserad vård?", why: "Paketet har två mallar i Steg 1: en för genomförda operationer (src_genomford) och en för väntande patienter (src_vantande). Vi behöver veta om dessa ligger i samma tabell eller i separata tabeller, samt kolumnnamnen." },
                { q: "Vilka ögonkliniker och privata utförare rapporterar kataraktoperationer till ert datalager?", why: "Nationellt täcker väntetidsdatabasen bara ~50% av kataraktoperationer pga att privata kliniker ofta inte rapporterar automatiskt. Vi behöver veta vilka enheter som ingår i er data." },
                { q: "Har ni en HSA-id-tabell tillgänglig i Denodo?", why: "Behövs för att översätta HSA-id till läsbara kliniknamn i resultatvyerna." },
              ].map((f, i) => (
                <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "flex-start" }}>
                  <span style={{ color: C.red, fontWeight: 700, flexShrink: 0, fontSize: 16 }}>?</span>
                  <div><strong>{f.q}</strong><br/><span style={{ color: C.textMuted }}>{f.why}</span></div>
                </div>
              ))}
            </div>
          </Card>

          {/* VAD VGR BEHÖVER GÖRA */}
          <Card accent={C.green}>
            <H2 sub="Sammanfattning av ansvarsfördelningen">Vad VGR behöver göra</H2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div style={{ background: C.accentBg, borderRadius: 8, padding: 16 }}>
                <div style={{ fontWeight: 700, color: C.accent, fontSize: 13, marginBottom: 8 }}>KCHD LEVERERAR</div>
                <div style={{ fontSize: 13, lineHeight: 1.7 }}>
                  Denna guide med all VQL-kod (under fliken "Kod"), kodverk med KVÅ-koder och avvikelsedefinitioner, variabellista och KPI-dokumentation.
                </div>
              </div>
              <div style={{ background: C.greenBg, borderRadius: 8, padding: 16 }}>
                <div style={{ fontWeight: 700, color: C.green, fontSize: 13, marginBottom: 8 }}>VGR GÖR</div>
                <div style={{ fontSize: 13, lineHeight: 1.7 }}>
                  <strong>① Svara på frågorna ovan</strong><br/>
                  <strong>② Ändra kolumnnamnen i Steg 1</strong> (två mallar: src_genomford + src_vantande) så de matchar ert datalager.<br/>
                  <strong>③ Kör VQL-filerna i Denodo</strong> i ordning (00→01→02→03)<br/>
                  <strong>④ Verifiera</strong> genom att jämföra resultaten mot vantetider.se
                </div>
              </div>
            </div>
          </Card>

          {/* Architecture */}
          <Card>
            <H2 sub="02+03 rör aldrig källsystemet — portabelt till andra regioner">Tre-lagers-arkitektur</H2>
            <div style={{ fontFamily: mono, fontSize: 12.5, lineHeight: 2, background: C.codeBg, color: C.codeText, padding: 20, borderRadius: 8, textAlign: "center" }}>
              <div style={{ color: C.fn }}>┌───────────────────────────────────────┐</div>
              <div style={{ color: C.fn }}>│  <span style={{color:C.str}}>03_resultatvy</span> — KPI:er + detalj       │</div>
              <div style={{ color: C.fn }}>│  res_kpi_manad · res_kpi_per_yrke     │</div>
              <div style={{ color: C.fn }}>│  res_kpi_per_kontaktform · _bokning   │</div>
              <div style={{ color: C.fn }}>│  res_kpi_per_remittent · _kommun      │</div>
              <div style={{ color: C.fn }}>│  res_genomford_detalj · _vantande     │</div>
              <div style={{ color: C.fn }}>└────────────────┬──────────────────────┘</div>
              <div style={{ color: C.cm }}>                 │ SELECT FROM</div>
              <div style={{ color: C.kw }}>┌────────────────┴──────────────────────┐</div>
              <div style={{ color: C.kw }}>│  <span style={{color:C.str}}>02_berakning</span>  ← <span style={{color:C.num}}>100% PORTABEL</span>         │</div>
              <div style={{ color: C.kw }}>│  calc_vantetid_genomford              │</div>
              <div style={{ color: C.kw }}>│  calc_vantande                        │</div>
              <div style={{ color: C.kw }}>└────────────────┬──────────────────────┘</div>
              <div style={{ color: C.cm }}>                 │ SELECT FROM</div>
              <div style={{ color: C.num }}>┌────────────────┴──────────────────────┐</div>
              <div style={{ color: C.num }}>│  <span style={{color:C.str}}>01_basvy</span>  ← <span style={{color:C.cm}}>ENDA VGR ANPASSAR</span>       │</div>
              <div style={{ color: C.num }}>│  src_genomford · src_vantande         │</div>
              <div style={{ color: C.num }}>│  Ändra kolumnnamn + tabellnamn         │</div>
              <div style={{ color: C.num }}>└───────────────────────────────────────┘</div>
            </div>
          </Card>
        </div>)}

        {/* ══════ VARIABLER ══════ */}
        {tab === "variabler" && (<div>
          <Card>
            <H2 sub={"33 av ~42 i hela XSD. 9 akut-/admin-fält exkluderade (ej relevanta för elektiv katarakt)."}>Variabellista — katarakt</H2>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead><tr>{["XSD/VQL", "SKR-namn", "VGR-källa", "Obl", "Regel"].map((h,i) => (
                  <th key={i} style={{ textAlign: "left", padding: "7px 8px", borderBottom: `2px solid ${C.border}`, color: C.textMuted, fontWeight: 600, fontSize: 11 }}>{h}</th>
                ))}</tr></thead>
                <tbody>
                  <tr><td colSpan={5} style={{ padding: "7px 8px", fontWeight: 700, fontSize: 12, background: C.accentBg, color: C.accent, borderBottom: `1px solid ${C.border}` }}>Tidsmått</td></tr>
                  <VarRow xsd="beslut_datum" name="BeslutAktivitet (MP1)" source="ELVIS" req rule="Väntetidsstart. Fas 2: specialists op-beslut." />
                  <VarRow xsd="start_datum" name="StartAktivitet (MP2)" source="ELVIS" req rule="Väntetidsslut. NULL för väntande." />
                  <VarRow xsd="medicinskt_maldatum" name="MedicinsktMaldatum (MP3)" source="ELVIS" req={false} rule="Planerat datum. Obl. vid Fas 4 (återbesök)." />
                  <VarRow xsd="matperiod" name="DatatGallerFor" source="Kalender" req rule="Rapportmånad. Sista dag = snapshot." />

                  <tr><td colSpan={5} style={{ padding: "7px 8px", fontWeight: 700, fontSize: 12, background: C.greenBg, color: C.green, borderBottom: `1px solid ${C.border}` }}>Katarakt-filter</td></tr>
                  <VarRow xsd="kva_kod" name="KVÅ-åtgärdskod" source="ELVIS" req rule="CJC%, CJD%, CJE% (15 koder). Joinas mot ref_kva_katarakt. Primärfilter." />
                  <VarRow xsd="mvo_kod" name="MVO" source="ELVIS" req rule="'511' = Ögonsjukvård." />
                  <VarRow xsd="aktivitetskod" name="SKR vårdutbudskod" source="ELVIS/manuell" req={false} rule="51101 = Gråstarr. Källa: SoS 'Lista över aktiviteter/vårdutbud'." />
                  <VarRow xsd="aktivitet_kva" name="Aktivitet KVÅ" source="ELVIS" req={false} rule="Huvudåtgärd KVÅ. Tillagd i XSD 2025-02-20." isNew />
                  <VarRow xsd="aktivitet_icd" name="Aktivitet ICD" source="ELVIS" req={false} rule="ICD kopplad till aktivitet. Tillagd 2025-02-20." isNew />

                  <tr><td colSpan={5} style={{ padding: "7px 8px", fontWeight: 700, fontSize: 12, background: C.purpleBg, color: C.purple, borderBottom: `1px solid ${C.border}` }}>Klassificering</td></tr>
                  <VarRow xsd="vardgaranti" name="VG JA/NEJ" source="ELVIS" req rule="JA vid ny vårdinsats. NEJ vid reop/uppföljning." />
                  <VarRow xsd="avvikelsekod" name="Avvikelse" source="ELVIS" req={false} rule="NULL=ingen. PvV=patientvald. MoV=medicinsk." />

                  <tr><td colSpan={5} style={{ padding: "7px 8px", fontWeight: 700, fontSize: 12, background: C.amberBg, color: C.amber, borderBottom: `1px solid ${C.border}` }}>Organisation</td></tr>
                  <VarRow xsd="regionkod" name="Regionkod" source="'51'" req rule="VGR = 51." />
                  <VarRow xsd="hsaid_region" name="Huvudman" source="HSA" req rule="HSA-id region." />
                  <VarRow xsd="hsaid_vardgivare" name="Vårdgivare" source="HSA" req rule="HSA-id vårdgivare." />
                  <VarRow xsd="hsaid_vardenhet" name="Klinik" source="HSA" req rule="HSA-id ögonklinik. Drill-down." />
                  <VarRow xsd="hsaid_enhet" name="Vårdande enhet" source="HSA" req={false} rule="Finare granularitet." />
                  <VarRow xsd="sjukhuskod" name="Sjukhus (SoS)" source="ELVIS/HSA" req rule="5-6-siffrig SoS-kod." />
                  <VarRow xsd="sjukhusnamn" name="Sjukhusnamn" source="ELVIS/HSA" req rule="Klartext." />
                  <VarRow xsd="yrkeskategori" name="Yrkesgrupp" source="ELVIS" req rule="XS910-926. Katarakt ≈ alltid XS915." />
                  <VarRow xsd="bokningssatt" name="Bokningssätt" source="ELVIS" req rule="1-5." />
                  <VarRow xsd="vardkontakttyp" name="Kontaktform" source="ELVIS" req rule="0=mottagning, 91=sluten vård." />

                  <tr><td colSpan={5} style={{ padding: "7px 8px", fontWeight: 700, fontSize: 12, background: C.redBg, color: C.red, borderBottom: `1px solid ${C.border}` }}>Patient + Remiss</td></tr>
                  <VarRow xsd="kon" name="Kön" source="ELVIS" req rule="1/2/3." />
                  <VarRow xsd="fodelsear" name="Födelseår" source="ELVIS" req rule="→ åldersgrupp." />
                  <VarRow xsd="lkf" name="Kommunkod" source="ELVIS" req rule="SCB-kod. Geografisk analys." />
                  <VarRow xsd="hsaid_listning" name="Listad hos (VC)" source="ELVIS" req={false} rule="HSA-id för listnings-VC." />
                  <VarRow xsd="remittenttyp" name="Remittenttyp" source="ELVIS" req={false} rule="1=Remiss 2=Egen vårdbegäran." />
                  <VarRow xsd="remittent_hsaid" name="Remittent" source="ELVIS" req={false} rule="HSA-id remitterande enhet (optiker/VC)." />
                  <VarRow xsd="remiss_id" name="Remiss-id" source="ELVIS" req={false} rule="Unik remissidentitet." />
                  <VarRow xsd="remiss_datum" name="Remissdatum" source="ELVIS" req={false} rule="Datum remiss skapad. → total patientresa." />
                  <VarRow xsd="ankomst_datum" name="Ankomstdatum" source="ELVIS" req={false} rule="Datum remiss inkommen." />
                </tbody>
              </table>
            </div>
            <div style={{ marginTop: 12, fontSize: 12, color: C.textDim, lineHeight: 1.6 }}>
              <strong>Exkluderade (ej relevanta):</strong> TidStartAkut, TidBedomning, TidAvslut, VardAvbruten, TypAkutverksamhet (alla akut-specifika), ErsattningsId, LeveransReferens (administrativa).
              Fas hårdkodas till 2 (Operation/åtgärd).<br/>
              <strong>Viktig notering:</strong> ICD-10-diagnoser (H25-H28) definierar <em>inte</em> aktivitet 51101 Gråstarr — enbart KVÅ-koder (CJC/CJD/CJE) utgör primärfiltret. Diagnoser rapporteras separat som kompletterande data.
            </div>
          </Card>
        </div>)}

        {/* ══════ KPI:er ══════ */}
        {tab === "kpi" && (<div>
          <Card>
            <H2 sub="11 motsvarar SKR:s webb exakt. 5 är mervärde från hubben (markerade).">16 KPI:er — fullständig förteckning</H2>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead><tr>{["KPI", "SKR", "Resultatvy", "Formel", "Not"].map((h,i) => (
                  <th key={i} style={{ textAlign: "left", padding: "8px 8px", borderBottom: `2px solid ${C.border}`, color: C.textMuted, fontWeight: 600, fontSize: 11 }}>{h}</th>
                ))}</tr></thead>
                <tbody>
                  {KPIS.map((k,i) => (
                    <tr key={i} style={!k.skr ? { background: C.purpleBg } : {}}>
                      <td style={{ padding: "7px 8px", borderBottom: `1px solid ${C.border}`, fontWeight: 600, color: C.text }}>{k.kpi}{!k.skr && <Badge color={C.purple}>MERVÄRDE</Badge>}</td>
                      <td style={{ padding: "7px 8px", borderBottom: `1px solid ${C.border}`, textAlign: "center" }}>{k.skr ? "✓" : "—"}</td>
                      <td style={{ padding: "7px 8px", borderBottom: `1px solid ${C.border}`, fontFamily: mono, fontSize: 11, color: C.accent }}>{k.vy}</td>
                      <td style={{ padding: "7px 8px", borderBottom: `1px solid ${C.border}`, fontFamily: mono, fontSize: 11, color: C.textMuted }}>{k.formel}</td>
                      <td style={{ padding: "7px 8px", borderBottom: `1px solid ${C.border}`, fontSize: 11, color: C.textMuted }}>{k.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>)}

        {/* ══════ VQL KOD ══════ */}
        {tab === "vql" && (<div>
          <Card style={{ background: C.greenBg, border: `1px solid ${C.greenBorder}` }}>
            <div style={{ fontSize: 14, color: C.green, lineHeight: 1.7 }}>
              <strong>Kopiera koderna nedan i ordning och kör dem i Denodo.</strong> Öppna Denodo Design Studio eller VQL Shell, klistra in ett kodblock i taget, och kör. Det enda ni behöver ändra är <strong>01_basvy</strong> — byt kolumnnamnen och tabellnamnet så de matchar ert datalager.
            </div>
          </Card>
          <Card style={{ background: C.amberBg, border: `1px solid ${C.amberBorder}` }}>
            <div style={{ fontSize: 13, color: C.amber }}>Kör i ordning: <strong>00 → 01 → 02 → 03</strong>. Varje steg bygger på det föregående. Börja inte med 02 innan 00 och 01 är körda.</div>
          </Card>
          <Code title="00_kodverk/ref_kva_katarakt.vql — Aktivitet 51101 Gråstarr: CJC+CJD+CJE (15 koder)" code={VQL_00} />
          <Code title="01_basvy/src_genomford.vql — Mall: ändra kolumnnamnen så de matchar ert datalager" code={VQL_01} />
          <Code title="01_basvy/src_vantande.vql — Mall: samma princip, pekar mot väntande patienter" code={VQL_01V} />
          <Code title="02_berakning/calc_vantetid_genomford.vql — Kärnberäkning genomförda" code={VQL_02} />
          <Code title="02_berakning/calc_vantande.vql — Kärnberäkning väntande" code={VQL_02V} />
          <Code title="03_resultatvy/res_kpi_manad.vql — Aggregerad KPI-vy (huvudvy)" code={VQL_03} />
          <Code title="03_resultatvy/res_kpi_dimension.vql — Per yrke, kontaktform, bokning, remittent, kommun" code={VQL_03B} />
          <Code title="03_resultatvy/res_genomford_detalj + res_vantande_detalj — En rad per patient (verifiering)" code={VQL_03C} />
        </div>)}

        {/* ══════ IMPLEMENTATION ══════ */}
        {tab === "steg" && (<div>
          <Card>
            <H2 sub="Kopiera koden från Kod-fliken, klistra in i Denodo, kör.">Så här går det till i praktiken</H2>
            <div style={{ fontSize: 13, lineHeight: 1.8, color: C.text }}>
              <p style={{ marginTop: 0 }}>Varje kodblock under fliken "Kod" innehåller en <span style={{ fontFamily: mono, color: C.accent }}>CREATE VIEW</span>-sats. För att köra dem öppnar ni Denodo Design Studio (det grafiska verktyget) eller VQL Shell (kommandoraden), klistrar in koden och kör. Det skapar en vy i Denodo som sedan finns tillgänglig för frågor och BI-kopplingar.</p>
              <p style={{ marginBottom: 0 }}>Koderna måste köras <strong>i ordning</strong> eftersom varje lager bygger på det föregående: 00 (kodverk) → 01 (basvy) → 02 (beräkning) → 03 (resultat).</p>
            </div>
          </Card>

          {[
            { n: 1, t: "Kopiera kodverket (00_kodverk)", d: "Gå till fliken \"Kod\" ovan. Kopiera det första kodblocket (ref_kva_katarakt). Klistra in i Denodo Design Studio eller VQL Shell och kör. Det skapar en referenstabell med 15 KVÅ-koder. Verifiera: kör SELECT * FROM ref_kva_katarakt — ska ge 15 rader." },
            { n: 2, t: "Kopiera och anpassa basvyerna (01_basvy) — det enda VGR-specifika steget", d: "Kopiera kodblock två (src_genomford) och tre (src_vantande). Båda har exempelkolumnnamn till vänster och paketets namn till höger. Ändra kolumnnamnen till vänster så de matchar ert datalager, och ändra tabellnamnet i FROM-satsen. Om genomförda och väntande ligger i samma tabell, peka båda mot samma tabell. Kör sedan båda i Denodo." },
            { n: 3, t: "Kopiera och kör beräkningarna (02_berakning)", d: "Kopiera och kör kodblock fyra och fem (calc_vantetid_genomford + calc_vantande). Ingen ändring behövs — de läser automatiskt från basvyerna ni skapade i steg 2. Verifiera: kör SELECT vantetid_dagar FROM calc_vantetid_genomford LIMIT 20 — alla värden ska vara ≥ 0." },
            { n: 4, t: "Kopiera och kör resultatvyerna (03_resultatvy)", d: "Kopiera och kör kodblock sex, sju och åtta (res_kpi_manad, res_kpi_dimension och detaljvyerna). Verifiera: jämför andel_inom_90 med vantetider.se → Västra Götalandsregionen → Ögonsjukvård → Operation/åtgärd. Öppna res_genomford_detalj och kontrollera enskilda patienter." },
          ].map((s) => (
            <Card key={s.n} accent={s.n===2 ? C.amber : undefined}>
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <StepN n={s.n} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: C.text, marginBottom: 4 }}>{s.t}</div>
                  {s.cmd && <div style={{ fontFamily: mono, fontSize: 12, color: C.accent, marginBottom: 6 }}>{s.cmd}</div>}
                  <div style={{ fontSize: 13, color: C.textMuted, lineHeight: 1.6 }}>{s.d}</div>
                </div>
              </div>
            </Card>
          ))}

          <Card>
            <H2>Referens: Källdokument från Socialstyrelsen</H2>
            <div style={{ fontSize: 13, lineHeight: 1.8 }}>
              <p style={{ marginTop: 0 }}>Aktivitetskoden 51101 och KVÅ-grupperna CJC/CJD/CJE kommer från Socialstyrelsens officiella förteckning. Om ni behöver verifiera eller slå upp andra aktiviteter finns dokumenten här:</p>
              <div style={{ background: C.codeBg, color: C.accentLight, padding: "10px 14px", borderRadius: 6, fontFamily: mono, fontSize: 12, marginBottom: 12, wordBreak: "break-all" }}>
                https://www.socialstyrelsen.se/statistik-och-data/register/lamna-uppgifter-till-register/vantetider/
              </div>
              <p style={{ marginBottom: 0, color: C.textMuted }}>Sidan är JS-renderad — scrolla ned till nedladdningarna. Relevanta filer: “Lista över aktiviteter/vårdutbud” och “Lista över avvikelsekoder”.</p>
            </div>
          </Card>
        </div>)}

        <div style={{ marginTop: 28, paddingTop: 14, borderTop: `1px solid ${C.border}`, color: C.textDim, fontSize: 11, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 6 }}>
          <span>KCHD — Kompetenscentrum Hälsodata | Paket 2: Väntetidsberäkning Katarakt v2.3</span>
          <span>2026-03-19</span>
        </div>
      </div>
    </div>
  );
}
