# KCHD Katarakt VGR — Komplett index
## Alla filer, beslut och status för POC:en

**Senast uppdaterad:** 2026-03-26
**Vårdutbud:** Katarakt (gråstarr), aktivitetskod 51101
**Region:** Västra Götalandsregionen (VGR), regionkod 51
**System:** Denodo 8.0+ (VQL), SSIS (Microsoft)

---

## 1. LEVERANSPAKET TILL VGR

| Fas | Fil | Innehåll | Status | Skickat |
|-----|-----|----------|--------|---------|
| — | vantetid_katarakt_guide.jsx | Huvudguide v2.3, 8 kodblock, 13 vyer, 6 flikar | ✅ Levererat | Ja |
| — | komplettering_detaljvyer.vql | src_vantande + 2 detaljvyer (buggfix) | ✅ Levererat | Ja |
| 1a | verifieringspaket.vql | verif_jamforelse + verif_stickprov (2 vyer) | ✅ Klar | Ja (2026-03-26) |
| 1b | kvalitetspaket.vql | dq0–dq6 + dq_rapport_data (8 vyer, 373 rader) | ✅ Klar | Ja (2026-03-26) |
| 1b | dq_rapport.html | Lokal DQ-rapport, paste-to-render, multi-separator | ✅ Klar | Ja (2026-03-26) |
| 2 | fhir_paket.vql | ref_fhir_system + fhir_measure_report v3 (2 vyer, alla 16 KPI:er × alla dimensioner, 30 SELECT-block) | ✅ Klar | Ej skickat |
| 3 | fhir_serializer.py | Python-referensimplementation — läser TSV, producerar FHIR Bundle JSON | ✅ Klar | Ej skickat |
| 3 | fhir_serializer_spec.md | C#-projektspec: kolumner, pseudokod, NuGet, SSIS-integration, testning | ✅ Klar | Ej skickat |
| 3 | fhir_bundle_example.json | Referens-JSON: 12 MeasureReports, 214 KB, validerad | ✅ Klar | Ej skickat |
| 3 | KchdFhirSerializer/ (C#) | 6 filer skapade (.NET 8, Hl7.Fhir.R4). EJ kompilerat, EJ testat — kräver dotnet build lokalt | ⚠️ Ej verifierat | I repo |
| 4 | fhir_radniva.vql + C# | Procedure/ServiceRequest + SSIS | 📋 Ej påbörjat | — |

## 2. DEMO-ARTEFAKTER (visa VGR/styrgrupp)

| Fil | Syfte | Fas |
|-----|-------|-----|
| testresultat_komplett.jsx | Testresultat hela kedjan — 7 flikar: Nyckeltal, Fördelning, Per bokningssätt, Per remittent, Vår modell (Denodo 26 vyer), Tre format (35 variabler verifierade mot R4-spec), Kedjan | Alla |
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
| test_fhir.py | FHIR MeasureReport v3 mot testdata → fhir_resultat.tsv (alla 16 KPI:er × alla dimensioner) | `python3 test_fhir.py testdata.csv` |
| fhir_resultat.tsv | Genererad av test_fhir.py — 440 rader (20 total + 420 per-dimension), 0 fel | — |
| fhir_serializer.py | TSV → FHIR R4 Bundle JSON (referensimplementation) | `python3 fhir_serializer.py fhir_resultat.tsv -o bundle.json -v` |
| fhir_bundle_example.json | Referens-JSON: 12 MeasureReports, validerad | Genererad av fhir_serializer.py |
| pipeline_runner.py | Kör hela kedjan steg 1-8. Producerar 9 filer i resultat/ | `python3 pipeline_runner.py testdata.csv resultat/` |

### Pipeline-output (resultat/)

Genereras av `pipeline_runner.py` — dessa filer återskapas vid varje körning.

| Fil | Steg | Innehåll | Rader |
|-----|------|----------|-------|
| resultat/steg1_radata.tsv | 1 | All källdata, alla 35 kolumner | 100 |
| resultat/steg2_filtrerade.tsv | 2 | Katarakt-filtrerade, uppdelat genomförda/väntande | 100 |
| resultat/steg3_beraknade.tsv | 3 | 4 beräknade väntetider per patient | 70 |
| resultat/steg4_kpi_total.tsv | 4 | 16 KPI:er per sjukhus (totaler) | 4 |
| resultat/steg4_kpi_per_dim.tsv | 4 | KPI:er per dimension (yrke, bokning, remittent, kommun) | 84 |
| resultat/steg5_dq.tsv | 5 | Kvalitetskontroll DQ0-DQ6 (10 kontroller, alla OK) | 10 |
| resultat/steg6_fhir_tabell.tsv | 6 | FHIR MeasureReport-rader (5 mått × alla dimensioner) | 440 |
| resultat/steg7_fhir_bundle.json | 7 | FHIR R4 Bundle (12 MeasureReports, 214 KB) | — |
| resultat/steg8_hubb_kvittens.json | 8 | Simulerad hubb-kvittens (200 OK) | — |
| resultat/pipeline_rapport.txt | — | Fullständig körningslogg | 68 |

**Så återskapar du allt:** `python3 pipeline_runner.py katarakt_testdata_100__1__VGR.csv resultat/`

**Pipeline:** testdata.csv → test_*.py → *_resultat.tsv → build_*.py → artefakt
**Regel:** Aldrig hårdkoda data i artefakter. Alltid generera från testsviten.

## 4. INTERN PLANERING OCH DOKUMENTATION (KCHD)

| Fil | Syfte |
|-----|-------|
| plan_katarakt_fas2.jsx | Fasplan 0–4, principer, vylista, FHIR-arkitektur, audit |
| fhir_mappning_analys.md | FHIR-mappning: bekräftade element, designbeslut, diskussionslogg |
| fhir_mappningsregister.md | FHIR-mappningsregister: alla URI:er, KPI-täckning, luckor, sökkällor — nationell referens |
| fhir_serializer_spec.md | Fas 3 C#-projektspec: kolumner, pseudokod, NuGet, SSIS-integration, testplan |
| prompt_fhir_mappning.md | Återanvändbar prompt för FHIR-mappning av aggregerade nyckeltal |
| katarakt_index.md | DENNA FIL — komplett index |
| repo_struktur_intern.jsx | GitHub-repostruktur för framtida distribution |

## 5. TESTDATA

| Fil | Innehåll |
|-----|----------|
| katarakt_testdata_100__1__VGR.csv | 100 patienter (70 genomförda + 30 väntande), VGR, period 2026-02 |

## 6. ARKIV

| Fil | Innehåll |
|-----|----------|
| alla_filer_extraherade.txt | XSD-extrakt från allra första sessionen |
| verifieringspaket_visning.md | Markdown-vy av verifieringspaketet |
| dq_rapport.jsx | Ersatt av dq_rapport.html — behåll som referens |

---

## 7. DESIGNBESLUT (loggas här centralt)

| Nr | Beslut | Motivering | Datum |
|----|--------|-----------|-------|
| D1 | 3 separata FHIR Measure-resurser | Measure.scoring är Measure-nivå i R4, inte group-nivå | 2026-03-26 |
| D2 | Väntetidsfördelning som stratifier | FHIR R4 stratum[].value + population[].count | 2026-03-26 |
| D3 | Kön och ålder som stratifiers | Standard FHIR-mönster | 2026-03-26 |
| D4 | Reporter som logical reference (HSA-id) | Undviker contained-dubbletter | 2026-03-26 |
| D5 | urn:oid: för verifierade, kchd.se för provisoriska URI:er | Sverige saknar HTTP-URI:er — se fhir_mappning_analys.md | 2026-03-26 |
| D6 | DQ-rapport som lokal HTML, inte JSX | Datasäkerhet — VGR kan inte klistra data i molntjänst | 2026-03-26 |
| D7 | Testdata genererar demodata (aldrig hårdkoda) | test_dq.py → TSV → build_dq_rapport.py → JSX/HTML | 2026-03-26 |
| D8 | Multi-separator i paste-parser (tab/semikolon/komma) | Denodo kan exportera i olika format | 2026-03-26 |
| D9 | VQL aldrig SQL, alla filer .vql | VGR kör Denodo | 2026-03-25 |
| D10 | KCHD testar allt mot testdata innan leverans | VGR ska aldrig vara först med att hitta fel | 2026-03-25 |
| D11 | Per-dimensioner som FHIR stratifiers (ej separata rader) | Bekräftat i HIV-IG, Da Vinci DEQM, VBPR — se fhir_mappning_analys.md D6 | 2026-03-26 |
| D12 | Medelväntetid som extra group i Measure 2 | FHIR continuous-variable stöder flera groups — fhir_mappning_analys.md D7 | 2026-03-26 |
| D13 | Remiss→beslut som extra group i Measure 3 | Samma motivering som D12 — fhir_mappning_analys.md D8 | 2026-03-26 |
| D14 | SSIS (ej SSID) — korrigerat i alla dokument | Microsofts transformeringsverktyg heter SQL Server Integration Services | 2026-03-26 |
| D15 | 35 källvariabler dokumenterade genom hela kedjan | testresultat_komplett.jsx "Tre format"-fliken visar varje variabels roll, beräkning, resultatkolumn, FHIR-path | 2026-03-26 |
| D16 | Radnivå-FHIR verifierat mot R4-spec — 5 felaktiga mappningar korrigerade | vardgaranti/yrkeskategori/lkf/ankomst_datum/beslut_datum. 7 variabler kräver Extension. Se fhir_mappning_analys.md | 2026-03-26 |
| D17 | 4 per-patient-beräkningar → FHIR Observation (ej rådatum) till hubben | Användarvalet: hubben tar emot beräknade värden, inte datum. Regionen räknar, hubben aggregerar. Observation.valueQuantity + derivedFrom. Verifierat R4. Fas 4. | 2026-03-26 |
| D18 | Pipeline-runner kör hela kedjan steg 1-8 i ett kommando | Samma steg som VGR kör i produktion, fast med testdata. Producerar 9 inspekterbara filer. | 2026-03-26 |

## 8. ÖPPNA PUNKTER

| Nr | Punkt | Status |
|----|-------|--------|
| U1 | KVÅ system-URI: urn:oid:1.2.752.116.1.3.2.3.6 | Fallback — bevaka HL7 Sweden |
| U2 | HSA-id: urn:oid:1.2.752.129.2.1.4.1 | Trolig korrekt — bevaka Inera |
| U3 | SKR aktivitetskod: https://kchd.se/fhir/CodeSystem/skr-aktivitetskod | Provisorisk |
| ~~U6~~ | ~~Medelväntetid i Measure 2~~ | ✅ Löst — D12, group_code='medel_vantetid' |
| U7 | Fas 3: SSIS-konfiguration — vilken version? | Kräver input från VGR |
| U8 | Fas 4: FHIR Procedure/ServiceRequest — exakt mappning | Väntar på fas 2+3 |
| ~~U9~~ | ~~Per-dimensioner för median/medel/patientresa~~ | ✅ Löst — alla 5 mått per dimension byggt i v3 |

## 9. SYSTEM-URI:ER (ref_fhir_system)

| Kodverk | System-URI | Källa | Status |
|---------|-----------|-------|--------|
| KVÅ | urn:oid:1.2.752.116.1.3.2.3.6 | Socialstyrelsens OID-serie | Verifierad OID, ingen HTTP-URI |
| ICD-10-SE | urn:oid:1.2.752.116.1.1.1 | Socialstyrelsens OID-serie | Verifierad OID |
| HSA-id | urn:oid:1.2.752.129.2.1.4.1 | Inera Confluence | Verifierad |
| Sjukhuskod | https://kchd.se/fhir/CodeSystem/sjukhuskod | KCHD (provisorisk) | Ingen officiell URI finns |
| SKR aktivitetskod | https://kchd.se/fhir/CodeSystem/skr-aktivitetskod | KCHD (provisorisk) | Ingen officiell URI finns |

**Sökning genomförd 2026-03-26:** HL7 THO, HL7 Sweden basprofiler-r4 (CI build + simplifier.net paket v1.1.0), Inera Confluence, Socialstyrelsen OID-register, HL7 Sweden GitHub issues (#13, #30), commonprofiles.care (svensk branschgrupp: Cambio, Carasent, Doctrin, Chorus, ImagineCare). Ingen av dessa definierar NamingSystem-resurser för KVÅ, sjukhuskoder eller SKR aktivitetskoder. electronichealth.se-domänen bekräftad trasig sedan okt 2024. Se fhir_mappning_analys.md för fullständig dokumentation.

---

## 10. VYLISTA I DENODO (25 vyer totalt)

| Lager | Vy | Fas | Status |
|-------|-----|-----|--------|
| 00 | ref_kva_katarakt | — | ✅ Live hos VGR |
| 01 | src_genomford | — | ✅ Live |
| 01 | src_vantande | — | ✅ Live |
| 02 | calc_vantetid_genomford | — | ✅ Live |
| 02 | calc_vantande | — | ✅ Live |
| 03 | res_kpi_manad | — | ✅ Live |
| 03 | res_kpi_per_yrke | — | ✅ Live |
| 03 | res_kpi_per_kontaktform | — | ✅ Live |
| 03 | res_kpi_per_bokning | — | ✅ Live |
| 03 | res_kpi_per_remittent | — | ✅ Live |
| 03 | res_kpi_per_kommun | — | ✅ Live |
| 03 | res_genomford_detalj | — | ✅ Live |
| 03 | res_vantande_detalj | — | ✅ Live |
| 1a | verif_jamforelse | 1a | ✅ Skickat |
| 1a | verif_stickprov | 1a | ✅ Skickat |
| 1b | dq0_existens | 1b | ✅ Skickat |
| 1b | dq1_null | 1b | ✅ Skickat |
| 1b | dq2_doman | 1b | ✅ Skickat |
| 1b | dq3_intervall | 1b | ✅ Skickat |
| 1b | dq4_ifyllnadsgrad | 1b | ✅ Skickat |
| 1b | dq5_korsvalidering | 1b | ✅ Skickat |
| 1b | dq6_rimlighet | 1b | ✅ Skickat |
| 1b | dq_rapport_data | 1b | ✅ Skickat |
| 2 | ref_fhir_system | 2 | ✅ Klar, ej skickat |
| 2 | fhir_measure_report | 2 | ✅ Klar, ej skickat |

---

## SÅ HITTAR DU TILLBAKA

Om du (Claude) tappar kontext:

1. Läs denna fil (katarakt_index.md) — den samlar allt
2. Läs fhir_mappning_analys.md — alla FHIR-designbeslut och sökresultat
3. Läs fhir_mappningsregister.md — alla URI:er, KPI-täckning, luckor, provisoriska mappningar
4. Läs prompt_fhir_mappning.md — prompten du ska använda för nästa vårdutbud
5. Kör `python3 pipeline_runner.py testdata.csv resultat/` — återskapar alla 9 steg-filer
6. Kör fhir_serializer.py --validate — bekräfta att FHIR JSON är korrekt
7. Läs fhir_serializer_spec.md — C#-projektspecen (fas 3)
8. Läs plan_katarakt_fas2.jsx — fasplanen med alla principer

**Snabbtest:** `python3 pipeline_runner.py katarakt_testdata_100__1__VGR.csv resultat/`
Om det avslutas med "HELA KEDJAN GRÖN" fungerar allt.

**Transkript från tidigare sessioner:**
- /mnt/transcripts/2026-03-26-12-04-18-kchd-katarakt-vgr-fhir-pipeline.txt
- /mnt/transcripts/2026-03-25-23-00-23-kchd-katarakt-vql-fhir-pipeline.txt
- /mnt/transcripts/2026-03-19-22-36-26-skr-vantetider-katarakt-vgr.txt
- Se journal.txt i /mnt/transcripts/ för komplett lista

---

## 11. STEGEN I PIPELINE (pipeline_runner.py)

Exakt samma steg som VGR kör — enda skillnaden är att VGR byter testdata mot sin Denodo-källa.

| Steg | Vad händer | In | Ut | VGR-motsvarighet |
|------|-----------|-----|-----|-----------------|
| 1 | Läs rådata | CSV (35 kolumner) | steg1_radata.tsv | Denodo-basvy |
| 2 | Filtrera katarakt | 100 rader | 70 genomförda + 30 väntande | src_genomford + src_vantande |
| 3 | Beräkna väntetider | 70 genomförda | 70 rader × 4 beräkningar | calc_vantetid_genomford |
| 4 | Aggregera KPI:er | 70 beräknade | 20 totaler + 84 per-dimension | res_kpi_manad + res_kpi_per_* |
| 5 | Kvalitetskontroll | Beräknade rader | 10 DQ-kontroller, alla OK | dq0–dq6 |
| 6 | FHIR-tabell | KPI:er | 440 FHIR-rader | fhir_measure_report (VQL) |
| 7 | FHIR JSON | FHIR-tabell | 12 MeasureReports (214 KB) | C#/SSIS (KCHD bygger) |
| 8 | Skicka till hubb | FHIR Bundle | Kvittens: 200 OK | REST API POST |

**OBS:** Steg 7 körs i pipeline_runner.py av fhir_serializer.py (Python). I produktion ska detta göras av C#/SSIS — den koden är ännu inte byggd (se §1, rad "KchdFhirSerializer"). KCHD bygger den.

---

## 12. GITHUB-SYNK (POC_KCHD)

**Repo:** https://github.com/pederhofmanbang/POC_KCHD
**Senaste push:** 2026-03-26 (initial + C#-serialiserare)

Rutin: säg "paketera för GitHub" → jag ger dig en ny tar.gz med ändrade filer → du laddar upp via github.com → Add file → Upload files.

| Fil i repo | Senast ändrad | I repot? |
|-----------|---------------|----------|
| README.md | 2026-03-26 | ✅ |
| .gitignore | 2026-03-26 | ✅ |
| vql/komplettering_detaljvyer.vql | 2026-03-26 | ✅ |
| vql/verifieringspaket.vql | 2026-03-26 | ✅ |
| vql/kvalitetspaket.vql | 2026-03-26 | ✅ |
| vql/fhir_paket.vql | 2026-03-26 | ✅ |
| python/pipeline_runner.py | 2026-03-26 | ✅ |
| python/fhir_serializer.py | 2026-03-26 | ✅ |
| python/test_dq.py | 2026-03-26 | ✅ |
| python/test_fhir.py | 2026-03-26 | ✅ |
| python/build_dq_rapport.py | 2026-03-26 | ✅ |
| docs/katarakt_index.md | 2026-03-26 | ✅ |
| docs/fhir_mappning_analys.md | 2026-03-26 | ✅ |
| docs/fhir_mappningsregister.md | 2026-03-26 | ✅ |
| docs/fhir_serializer_spec.md | 2026-03-26 | ✅ |
| docs/prompt_fhir_mappning.md | 2026-03-26 | ✅ |
| docs/dq_rapport.html | 2026-03-26 | ✅ |
| docs/fhir_bundle_example.json | 2026-03-26 | ✅ |
| docs/CLAUDE_CODE_PROMPT_CSHARP.md | 2026-03-26 | ✅ |
| demo/vantetid_katarakt_guide.jsx | 2026-03-26 | ✅ |
| demo/testresultat_komplett.jsx | 2026-03-26 | ✅ |
| demo/vgr_presentation.jsx | 2026-03-26 | ✅ |
| demo/verifiering_demo.jsx | 2026-03-26 | ✅ |
| demo/katarakt_dashboard.jsx | 2026-03-26 | ✅ |
| demo/plan_katarakt_fas2.jsx | 2026-03-26 | ✅ |
| demo/repo_struktur_intern.jsx | 2026-03-26 | ✅ |
| testdata/katarakt_testdata_100__1__VGR.csv | 2026-03-26 | ✅ |
| csharp/KchdFhirSerializer/KchdFhirSerializer.csproj | 2026-03-26 | ✅ |
| csharp/KchdFhirSerializer/Program.cs | 2026-03-26 | ✅ |
| csharp/KchdFhirSerializer/TsvReader.cs | 2026-03-26 | ✅ |
| csharp/KchdFhirSerializer/MeasureReportBuilder.cs | 2026-03-26 | ✅ |
| csharp/KchdFhirSerializer/FhirValidator.cs | 2026-03-26 | ✅ |
| csharp/KchdFhirSerializer/appsettings.json | 2026-03-26 | ✅ |
