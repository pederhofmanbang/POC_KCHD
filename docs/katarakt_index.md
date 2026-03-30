# KCHD Katarakt VGR — Komplett index
## Alla filer, beslut och status för POC:en

**Senast uppdaterad:** 2026-03-30 (v2.4 split + VGR-variant + FHIR klar)
**Vårdutbud:** Katarakt (gråstarr), aktivitetskod 51101
**Region:** Västra Götalandsregionen (VGR), regionkod 51
**System:** Denodo 8.0+ (VQL), SSIS (SQL Server 2019, Visual Studio 2022)

---

## 1. LEVERANSPAKET TILL VGR

| Fas | Fil | Innehåll | Status | Skickat |
|-----|-----|----------|--------|---------|
| — | vantetid_katarakt_guide.jsx | Huvudguide v2.3, 8 kodblock, 13 vyer, 6 flikar | ✅ Levererat | Ja |
| — | komplettering_detaljvyer.vql | src_vantande + 2 detaljvyer (buggfix) | ✅ Levererat | Ja |
| **0** | **katarakt_vantetid_v2.4.vql** | **Beräkningspaketet: 15 vyer (kodverk + basvy + beräkning + resultat)** | **✅ Klar, testad** | **Ej skickat** |
| **0** | **katarakt_vantetid_v2.4_VGR.vql** | **VGR-variant: samma 15 vyer, VGR:s tabeller + kön M/K→1/2 i basvy** | **✅ Klar** | **Ej skickat** |
| **—** | **vantetid_katarakt_guide_v2.4_VGR.jsx** | **Ny guide: 5 flikar, 4 paket med copy-knappar, SSIS-instruktion steg 5** | **✅ Klar** | **Ej skickat** |
| 1a | verifieringspaket_v2.4.vql | verif_jamforelse (1 vy), nu med per-sjukhus | ✅ Klar, testad | Ej skickat |
| 1b | kvalitetspaket_v2.4.vql | dq_rapport_data (1 vy), DQ6 per sjukhus | ✅ Klar, testad | Ej skickat |
| 1b | dq_rapport.html | Lokal DQ-rapport, paste-to-render, multi-separator | ✅ Klar | Ja (2026-03-26) |
| 2 | fhir_paket.vql v3.1 | ref_fhir_system + fhir_measure_report (2 vyer) | ✅ Klar, testad (3 fixar applicerade) | Ej skickat |
| 3 | KchdFhirSerializer/ (C#) | .NET 8 + Hl7.Fhir.R4. Self-contained .exe publicerad. | ✅ Klar, release v1.0.0 | Ej skickat |
| 3 | fhir_serializer.py | Python-referensimplementation | ✅ Klar | I repo (intern referens) |
| 3 | fhir_bundle_example.json | Referens-JSON: 12 MeasureReports, validerad | ✅ Klar | I repo (intern referens) |
| 4 | fhir_radniva.vql + C# | Procedure/ServiceRequest + SSIS | 📋 Ej påbörjat | — |

**v2.4 har tre separata paketfiler** (beräkning, verifiering, kvalitet) — inte en ihopslagen fil. Paketen levereras oberoende men versioneras tillsammans. FHIR-paketet (fas 2+3) levereras separat via eget repo.

**VGR-varianten** (`_VGR.vql`) är identisk med det generiska paketet förutom basvyerna (src_genomford, src_vantande) som pekar mot VGR:s tabeller och normaliserar kön. VGR kör den utan att ändra något.

## 2. DEMO-ARTEFAKTER (visa VGR/styrgrupp)

| Fil | Syfte | Fas |
|-----|-------|-----|
| testresultat_komplett.jsx | Testresultat hela kedjan — 7 flikar | Alla |
| vgr_presentation.jsx | Statusmöte-presentation — 5 flikar, pedagogisk | Alla |
| verifiering_demo.jsx | Visar verif_jamforelse-resultat + vantetider.se-instruktion | 1a |
| katarakt_dashboard.jsx | VGR vs Halland, 200 patienter, 6 flikar | — |
| vantetider.jsx | SKR XSD-visualisering (tidigt arbete) | — |

## 3. INTERN TESTSVIT (KCHD)

| Fil | Syfte | Kör med |
|-----|-------|---------|
| test_dq.py | DQ-kontroller mot testdata → dq_resultat.tsv | `python3 test_dq.py testdata.csv` |
| build_dq_rapport.py | TSV → dq_rapport.jsx (aldrig hårdkoda data) | `python3 build_dq_rapport.py dq_resultat.tsv dq_rapport.jsx` |
| dq_resultat.tsv | Genererad av test_dq.py — 30 rader, 0 fel | — |
| test_fhir.py | FHIR MeasureReport v3 mot testdata → fhir_resultat.tsv | `python3 test_fhir.py testdata.csv` |
| fhir_resultat.tsv | Genererad — 440 rader (20 total + 420 per-dimension), 0 fel | — |
| fhir_serializer.py | TSV → FHIR R4 Bundle JSON (referensimplementation) | `python3 fhir_serializer.py fhir_resultat.tsv -o bundle.json -v` |
| fhir_bundle_example.json | Referens-JSON: 12 MeasureReports, validerad | Genererad av fhir_serializer.py |
| pipeline_runner.py | Kör hela kedjan steg 1-8 | `python3 pipeline_runner.py testdata.csv resultat/` |
| test_csharp.sh | Bygger + kör C#, jämför mot Python-referens | `bash test_csharp.sh` |
| verify_fhir_structure.py | Strukturell validering av FHIR Bundle JSON | `python3 verify_fhir_structure.py bundle.json` |

### Pipeline-output (resultat/)

| Fil | Steg | Innehåll | Rader |
|-----|------|----------|-------|
| steg1_radata.tsv | 1 | All källdata, alla 35 kolumner | 100 |
| steg2_filtrerade.tsv | 2 | Katarakt-filtrerade, uppdelat genomförda/väntande | 100 |
| steg3_beraknade.tsv | 3 | 4 beräknade väntetider per patient | 70 |
| steg4_kpi_total.tsv | 4 | 16 KPI:er per sjukhus (totaler) | 4 |
| steg4_kpi_per_dim.tsv | 4 | KPI:er per dimension | 84 |
| steg5_dq.tsv | 5 | Kvalitetskontroll DQ0-DQ6 (10 kontroller, alla OK) | 10 |
| steg6_fhir_tabell.tsv | 6 | FHIR MeasureReport-rader | 440 |
| steg7_fhir_bundle.json | 7 | FHIR R4 Bundle (12 MeasureReports, 219 KB) | — |
| steg8_hubb_kvittens.json | 8 | Simulerad hubb-kvittens (200 OK) | — |
| pipeline_rapport.txt | — | Fullständig körningslogg | 68 |

**Snabbtest:** `python3 pipeline_runner.py katarakt_testdata_100__1__VGR.csv resultat/`

## 4. INTERN PLANERING OCH DOKUMENTATION (KCHD)

| Fil | Syfte |
|-----|-------|
| plan_katarakt_fas2.jsx | Fasplan 0–4, principer, vylista, FHIR-arkitektur, audit |
| fhir_mappning_analys.md | FHIR-mappning: bekräftade element, designbeslut, diskussionslogg |
| fhir_mappningsregister.md | Alla URI:er, KPI-täckning, luckor, sökkällor |
| fhir_serializer_spec.md | C#-projektspec: kolumner, pseudokod, NuGet, SSIS-integration |
| prompt_fhir_mappning.md | Återanvändbar prompt för FHIR-mappning |
| katarakt_index.md | DENNA FIL |

## 5. TESTDATA

| Fil | Innehåll |
|-----|----------|
| katarakt_testdata_100__1__VGR.csv | 100 patienter (70 genomförda + 30 väntande), VGR, period 2026-02 |

## 6. ARKIV

| Fil | Innehåll |
|-----|----------|
| alla_filer_extraherade.txt | XSD-extrakt från allra första sessionen |
| verifieringspaket_visning.md | Markdown-vy av verifieringspaketet |
| dq_rapport.jsx | Ersatt av dq_rapport.html |
| katarakt_vantetid_v2.4.vql (ihopslagen 855 rader) | Ursprunglig ihopslagen version — ersatt av 3 separata filer |

---

## 7. DESIGNBESLUT

| Nr | Beslut | Motivering | Datum |
|----|--------|-----------|-------|
| D1 | 3 separata FHIR Measure-resurser | Measure.scoring är Measure-nivå i R4, inte group-nivå | 2026-03-26 |
| D2 | Väntetidsfördelning som stratifier | FHIR R4 stratum[].value + population[].count | 2026-03-26 |
| D3 | Kön och ålder som stratifiers | Standard FHIR-mönster | 2026-03-26 |
| D4 | Reporter som logical reference (HSA-id) | Undviker contained-dubbletter | 2026-03-26 |
| D5 | urn:oid: för verifierade, kchd.se för provisoriska URI:er | Sverige saknar HTTP-URI:er | 2026-03-26 |
| D6 | DQ-rapport som lokal HTML, inte JSX | Datasäkerhet — VGR kan inte klistra data i molntjänst | 2026-03-26 |
| D7 | Testdata genererar demodata (aldrig hårdkoda) | test_dq.py → TSV → build_dq_rapport.py → JSX/HTML | 2026-03-26 |
| D8 | Multi-separator i paste-parser | Denodo kan exportera i olika format | 2026-03-26 |
| D9 | VQL aldrig SQL, alla filer .vql | VGR kör Denodo | 2026-03-25 |
| D10 | KCHD testar allt mot testdata innan leverans | VGR ska aldrig vara först med att hitta fel | 2026-03-25 |
| D11 | Per-dimensioner som FHIR stratifiers | Bekräftat i HIV-IG, Da Vinci DEQM, VBPR | 2026-03-26 |
| D12 | Medelväntetid som extra group i Measure 2 | FHIR continuous-variable stöder flera groups | 2026-03-26 |
| D13 | Remiss→beslut som extra group i Measure 3 | Samma motivering som D12 | 2026-03-26 |
| D14 | SSIS (ej SSID) | SQL Server Integration Services | 2026-03-26 |
| D15 | 35 källvariabler dokumenterade genom hela kedjan | testresultat_komplett.jsx visar varje variabels väg | 2026-03-26 |
| D16 | Radnivå-FHIR: 5 felaktiga mappningar korrigerade | 7 variabler kräver Extension | 2026-03-26 |
| D17 | Per-patient-beräkningar → FHIR Observation | Hubben tar emot beräknade värden, inte datum. Fas 4. | 2026-03-26 |
| D18 | Pipeline-runner kör hela kedjan steg 1-8 | Producerar 9 inspekterbara filer | 2026-03-26 |
| D19 | Fas 2+3 levereras som ett paket | VQL utan C# ger VGR en tabell de inte kan göra något med | 2026-03-28 |
| D20 | C# verifierad i GitHub Codespace (.NET 8) | 440 rader → 12 MeasureReports, match mot Python | 2026-03-28 |
| D21 | ref_filter_region för utomläningsflagga | is_hemregion filtrerar INTE, bara flaggar | 2026-03-28 |
| D22 | ref_avvikelsekoder dokumenterar koderna | XSD-format (1/2/3), ⚠️-kommentarer om textformat | 2026-03-28 |
| D23 | Per-dim-vyer utökade med alla KPI:er | Krävdes för FHIR-paketet | 2026-03-28 |
| D24 | Sjukhusnamn i verif_jamforelse + DQ6 | VGR:s feedback | 2026-03-28 |
| D25 | PvV exkluderas för genomförda, MoV inkluderas | Bekräftat mot SKR-dokumentation | 2026-03-28 |
| D26 | Tre separata paketfiler, inte en ihopslagen | Beräkning (15), verifiering (1), kvalitet (1). Samma mönster som v2.3-leveransen. | 2026-03-30 |
| D27 | VGR-variant med kön-normalisering i basvyn | M/K→1/2 i src_genomford/src_vantande. All övrig kod identisk med generisk. Mönster för alla regionvarianter. | 2026-03-30 |
| D28 | Self-contained .exe för C#-serialiseraren | VGR har SQL Server 2019, saknar .NET 8. Self-contained inkluderar runtime:n. net8.0, win-x64. | 2026-03-30 |
| D29 | Två distributionsrepon under kchd-se | vantetid-katarakt + vantetid-katarakt-fhir. Regioner prenumererar via Watch → Releases. | 2026-03-30 |

## 8. ÖPPNA PUNKTER

| Nr | Punkt | Status |
|----|-------|--------|
| U1 | KVÅ system-URI: urn:oid:1.2.752.116.1.3.2.3.6 | Fallback — bevaka HL7 Sweden |
| U2 | HSA-id: urn:oid:1.2.752.129.2.1.4.1 | Trolig korrekt — bevaka Inera |
| U3 | SKR aktivitetskod: https://kchd.se/fhir/CodeSystem/skr-aktivitetskod | Provisorisk |
| ~~U6~~ | ~~Medelväntetid i Measure 2~~ | ✅ Löst — D12 |
| ~~U7~~ | ~~.NET 8 runtime + SSIS-version hos VGR~~ | ✅ Löst — SQL Server 2019, saknar .NET 8. Self-contained .exe publicerad (D28) |
| U8 | Fas 4: FHIR Procedure/ServiceRequest | Väntar på fas 2+3 i produktion |
| ~~U9~~ | ~~Per-dimensioner för median/medel/patientresa~~ | ✅ Löst |
| ~~U10~~ | ~~fhir_paket.vql: 3 kolumnfix~~ | ✅ Löst 2026-03-30 — testad: 440 rader, 12 MeasureReports, validering OK |
| U11 | VGR utomläningstest | Väntar på VGR:s svar |
| ~~U12~~ | ~~Pusha v2.4 + fhir_paket till GitHub~~ | ✅ Löst 2026-03-30 |
| U13 | vantetid-katarakt: merga branch till main | Branch `claude/setup-claude-instructions-ZrllJ` |
| U14 | vantetid-katarakt-fhir: ta bort python/ och docs/ | Intern testverktyg, ska inte vara med |

## 9. SYSTEM-URI:ER (ref_fhir_system)

| Kodverk | System-URI | Källa | Status |
|---------|-----------|-------|--------|
| KVÅ | urn:oid:1.2.752.116.1.3.2.3.6 | Socialstyrelsens OID-serie | Verifierad OID |
| ICD-10-SE | urn:oid:1.2.752.116.1.1.1 | Socialstyrelsens OID-serie | Verifierad OID |
| HSA-id | urn:oid:1.2.752.129.2.1.4.1 | Inera Confluence | Verifierad |
| Sjukhuskod | https://kchd.se/fhir/CodeSystem/sjukhuskod | KCHD (provisorisk) | Ingen officiell URI |
| SKR aktivitetskod | https://kchd.se/fhir/CodeSystem/skr-aktivitetskod | KCHD (provisorisk) | Ingen officiell URI |

---

## 10. VYLISTA I DENODO (17 + 2 = 19 vyer)

| Lager | Vy | Paket | v2.4 ändring | Status |
|-------|-----|-------|-------------|--------|
| 00 | ref_kva_katarakt | Beräkning | Oförändrad | ✅ |
| 00 | ref_avvikelsekoder | Beräkning | NY | ✅ |
| 00 | ref_filter_region | Beräkning | NY | ✅ |
| 01 | src_genomford | Beräkning | VGR-variant med riktiga tabeller | ✅ |
| 01 | src_vantande | Beräkning | VGR-variant med riktiga tabeller | ✅ |
| 02 | calc_vantetid_genomford | Beräkning | +is_hemregion, fixad patientresa | ✅ |
| 02 | calc_vantande | Beräkning | Oförändrad | ✅ |
| 03 | res_kpi_manad | Beräkning | +sjukhusnamn, +hsaid_region | ✅ |
| 03 | res_kpi_per_yrke | Beräkning | Utökad — alla KPI:er | ✅ |
| 03 | res_kpi_per_kontaktform | Beräkning | Utökad | ✅ |
| 03 | res_kpi_per_bokning | Beräkning | Utökad | ✅ |
| 03 | res_kpi_per_remittent | Beräkning | Utökad | ✅ |
| 03 | res_kpi_per_kommun | Beräkning | Utökad | ✅ |
| 03 | res_genomford_detalj | Beräkning | +is_hemregion | ✅ |
| 03 | res_vantande_detalj | Beräkning | Oförändrad | ✅ |
| 04 | verif_jamforelse | Verifiering | +sjukhusnamn | ✅ |
| 04 | dq_rapport_data | Kvalitet | DQ6 per sjukhus | ✅ |
| 05 | ref_fhir_system | FHIR | Oförändrad | ✅ |
| 05 | fhir_measure_report | FHIR | v3.1: 3 kolumnfix | ✅ |

---

## 11. STEGEN I PIPELINE

| Steg | Vad | In | Ut | VGR-motsvarighet |
|------|-----|-----|-----|-----------------|
| 1 | Läs rådata | CSV (35 kol) | steg1_radata.tsv | Denodo-basvy |
| 2 | Filtrera katarakt | 100 rader | 70 genomförda + 30 väntande | src_genomford + src_vantande |
| 3 | Beräkna väntetider | 70 genomförda | 70 × 4 beräkningar | calc_vantetid_genomford |
| 4 | Aggregera KPI:er | 70 beräknade | 20 totaler + 84 per-dim | res_kpi_manad + res_kpi_per_* |
| 5 | Kvalitetskontroll | Beräknade rader | 10 DQ, alla OK | dq0–dq6 |
| 6 | FHIR-tabell | KPI:er | 440 FHIR-rader | fhir_measure_report |
| 7 | FHIR JSON | FHIR-tabell | 12 MeasureReports (219 KB) | KchdFhirSerializer ✅ |
| 8 | Skicka till hubb | FHIR Bundle | Kvittens: 200 OK | REST API POST |

---

## 12. GITHUB-REPON

### POC_KCHD (internt arbetsrepo)
**Repo:** https://github.com/pederhofmanbang/POC_KCHD
All kod, testdata, docs, demo-artefakter. KCHD:s interna arbetsmiljö.

| Mapp | Innehåll |
|------|----------|
| vql/ | Alla VQL-filer (generisk + VGR-variant) |
| python/ | Pipeline, testsvit, serialiserare |
| csharp/ | KchdFhirSerializer + testverktyg |
| docs/ | Index, FHIR-mappning, spec, prompts |
| demo/ | JSX-guider, presentationer, dashboards |
| testdata/ | 100 syntetiska VGR-patienter |
| resultat/ | Pipeline-output (gitignore:d) |

### vantetid-katarakt (distribution — beräkning)
**Repo:** https://github.com/kchd-se/vantetid-katarakt
Det som regioner prenumererar på för lokal väntetidsberäkning.
**Status:** Branch behöver mergas till main (U13).

### vantetid-katarakt-fhir (distribution — FHIR)
**Repo:** https://github.com/kchd-se/vantetid-katarakt-fhir
FHIR-transformering + C#-serialiserare. Kräver vantetid-katarakt.
**Release:** v1.0.0 (self-contained .exe win-x64)
**Beroende:** vantetid-katarakt v2.4+ (manifest.json)
**Rensa:** Ta bort python/ och docs/ (U14)

---

## 13. NÄSTA STEG

| Nr | Vad | Status |
|----|-----|--------|
| ~~1~~ | ~~Applicera 3 fixar i fhir_paket.vql~~ | ✅ Klart |
| ~~2~~ | ~~Pusha till GitHub~~ | ✅ Klart |
| ~~3~~ | ~~Self-contained .exe~~ | ✅ Release v1.0.0 |
| 4 | Merga vantetid-katarakt branch till main (U13) | 📋 |
| 5 | Rensa vantetid-katarakt-fhir (U14) | 📋 |
| 6 | **Skicka v2.4 + FHIR till VGR** (guide + mail) | 📋 Redo |
| 7 | Vänta på VGR:s utomläningstest (U11) | ⏳ |
| 8 | Fas 4: radnivå-FHIR | Väntar på fas 2+3 |
| 9 | Fler regioner / vårdutbud | Framtida |
| 10 | Vitalis: demo + paneldiskussion | Planeras |

---

## SÅ HITTAR DU TILLBAKA

1. Läs denna fil (katarakt_index.md)
2. Läs fhir_mappning_analys.md — FHIR-designbeslut
3. Läs fhir_mappningsregister.md — URI:er, KPI-täckning
4. Läs prompt_fhir_mappning.md — prompt för nästa vårdutbud
5. Kör `python3 pipeline_runner.py testdata.csv resultat/`
6. Kör `python3 fhir_serializer.py fhir_resultat.tsv -o bundle.json -v`
7. Läs fhir_serializer_spec.md — C#-spec
8. Läs plan_katarakt_fas2.jsx — fasplan

**Snabbtest:** `python3 pipeline_runner.py katarakt_testdata_100__1__VGR.csv resultat/`
**C#-snabbtest:** `cd csharp && bash test_csharp.sh`
