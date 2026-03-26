# KCHD FHIR-mappningsprompt — Aggregerade nyckeltal
## Anpassad från Mappningsprompt_Ateranvandbar.md

**Ursprung:** Peders generella mappningsprompt för rådata → openEHR/FHIR/OMOP
**Anpassad:** 2026-03-26 för aggregerade nyckeltal → enbart FHIR R4

---

## När ska denna prompt användas?

När vi har en ny uppsättning beräknade nyckeltal (från ett nytt vårdutbud,
t.ex. höftprotes, knäprotes, hjärtinfarkt) som ska mappas till FHIR R4
Measure/MeasureReport.

Förutsätter att beräkningspaketet (01–03) redan finns och producerar
nyckeltal i res_kpi_manad eller motsvarande.

---

## PROMPTEN

```
Jag vill att du skapar en FHIR R4-mappning för aggregerade nyckeltal
från en svensk väntetidsberäkning till FHIR Measure och MeasureReport.

Källa: [VY-NAMN, t.ex. "res_kpi_manad"] i Denodo
Vårdutbud: [NAMN, t.ex. "Katarakt (gråstarr)"]
Aktivitetskod: [KOD, t.ex. "51101"]

## STEG 1: Inventera nyckeltal

Lista ALLA kolumner i källvyn. För varje kolumn, ange:
- Kolumnnamn
- Datatyp
- Vad den representerar
- Exempel från testdata

## STEG 2: Slå mot FHIR R4-specifikationen

Sök i officiella källor — GISSA INTE:
- https://hl7.org/fhir/R4/measure.html
- https://hl7.org/fhir/R4/measurereport.html
- https://hl7.org/fhir/R4/clinicalreasoning-quality-reporting.html
- HAPI FHIR R4 API docs

Kontrollera:
- Measure.scoring: proportion | ratio | continuous-variable | cohort
- Measure.scoring är på MEASURE-nivå, inte group-nivå
- MeasureReport.group[].population[].code: initial-population | numerator | denominator
- MeasureReport.group[].measureScore: Quantity
- MeasureReport.group[].stratifier[]: code + stratum[].value

## STEG 3: Slå mot svenska FHIR-profiler

Sök i:
- HL7 Sweden basprofiler-r4: build.fhir.org/ig/HL7Sweden/basprofiler-r4/
- HL7 Sweden GitHub: github.com/HL7Sweden
- Inera Confluence: identifierare och OID:er
- Socialstyrelsen OID-register
- HL7 Terminology (THO): externa kodverk

Dokumentera för VARJE kodverk:
- Finns system-URI? → Använd den
- Finns OID men ingen URI? → Använd urn:oid:-formen
- Finns ingenting? → Skapa provisorisk under kchd.se, markera tydligt

## STEG 4: Designbeslut

Fatta och DOKUMENTERA beslut för:
- D1: En eller flera Measure-resurser? (beror på scoring-mix)
- D2: Vad blir stratifiers vs separata populations?
- D3: Reporter-design (contained vs logical reference)?
- D4: Hur hanteras system-URI:er som saknas?

Varje beslut ska ha:
- Frågan
- Alternativ
- Valt alternativ + motivering
- FHIR R4-referens (URL)

## STEG 5: Skapa VQL-vy

Skapa en VQL-vy (fhir_measure_report) som producerar en rad per
MeasureReport. Kolumnnamnen ska matcha FHIR-element så att C#-lagret
bara behöver serialisera, inte beräkna.

Alla system-URI:er ska samlas i en separat referensvy (ref_fhir_system)
så de kan bytas på ett ställe.

## STEG 6: Testa mot testdata

Skapa test_fhir.py som:
1. Simulerar VQL-logiken i Python mot testdata
2. Producerar fhir_resultat.tsv (samma format som VQL:en)
3. Validerar: andel 0–1, median 1–365, summor stämmer
4. Rapporterar OK/FEL

## STEG 7: Logga osäkerheter

Skapa/uppdatera diskussionslogg med:
- Beslutade punkter (D1, D2, ...) med datum
- Öppna punkter (U1, U2, ...) som kräver verifiering
- Vad som söktes, var, och vad som hittades/inte hittades

## VIKTIGA REGLER

- Slå ALLTID mot officiella FHIR-spec innan mappning. Inga gissningar.
- Om osäker: logga som diskussionspunkt, gå vidare med flaggad fallback.
- All VQL ska vara copy-paste-körbar i Denodo (inga FOLDER, VALUES etc).
- Testa mot testdata INNAN leverans.
- Dokumentera designbeslut så att nästa person (eller nästa Claude-session)
  förstår VARFÖR, inte bara VAD.
- System-URI:er i ref_fhir_system — ALDRIG hårdkodade i fhir_measure_report.
```

---

## Resultat från första körningen (Katarakt 2026-03-26)

Använde denna prompt för res_kpi_manad → FHIR Measure/MeasureReport.
Producerade:
- fhir_paket.vql (ref_fhir_system + fhir_measure_report)
- test_fhir.py + fhir_resultat.tsv
- fhir_mappning_analys.md
- 5 designbeslut (D1–D5), 4 öppna punkter (U1–U3, U6)

Se katarakt_index.md för komplett fillista.
