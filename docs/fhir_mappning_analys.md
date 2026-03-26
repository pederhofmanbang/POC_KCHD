# FHIR R4 Mappning — Katarakt väntetids-KPI:er
## Fas 2a: Analysunderlag

**Datum:** 2026-03-25
**Källa:** res_kpi_manad + res_kpi_dimension (16 KPI:er)
**Mål:** FHIR R4 Measure + MeasureReport
**Status:** UTKAST — kräver genomgång innan VQL skrivs

---

## Officiella källor använda

| Källa | URL | Status |
|-------|-----|--------|
| FHIR R4 Measure | https://hl7.org/fhir/R4/measure.html | ✅ Struktur bekräftad via sökning (robots.txt blockerar direkt fetch) |
| FHIR R4 MeasureReport | https://hl7.org/fhir/R4/measurereport.html | ✅ Struktur bekräftad via sökning |
| FHIR R4 Quality Reporting | https://hl7.org/fhir/R4/clinicalreasoning-quality-reporting.html | ✅ Hämtad |
| HAPI FHIR R4 API docs | https://hapifhir.io/hapi-fhir/apidocs/hapi-fhir-structures-r4/ | ✅ Hämtad |
| HL7 Sweden basprofiler-r4 CI Build | http://build.fhir.org/ig/HL7Sweden/basprofiler-r4/ | ✅ Hämtad — v1.1.0, R4 |
| HL7 Sweden GitHub issues | https://github.com/HL7Sweden/basprofiler-r4/issues/30 | ✅ Bekräftar: inga OID:er från SoS för verksamhetskoder |
| HL7 Terminology (THO) | https://terminology.hl7.org/ | ✅ Hämtad — KVÅ ej listad som registrerat externt kodsystem |
| HL7 Sweden simplifier.net | simplifier.net/packages/hl7se.fhir.base/1.1.0 | ✅ Genomsökt 2026-03-26 — inga NamingSystem-resurser för KVÅ/HSA/sjukhuskoder |
| commonprofiles.care | https://commonprofiles.care/ | ✅ Genomsökt — svensk branschgrupp (Cambio, Carasent m.fl.), inga NamingSystem för kodverk |
| commonprofiles.care GitHub | https://github.com/commonprofiles-care/fhir | ✅ OrganizationSEVendorLite använder HSA-id men definierar ingen URI |
| Inera Confluence identifierare | inera.atlassian.net/wiki/spaces/KINT/pages/468746902 | ✅ HSA-id OID bekräftad: 1.2.752.129.2.1.4.1 |

### Vad jag HITTADE:
- HL7 Sweden publicerar R4 basprofiler (SEBasePatient, SEBaseOrganization, SEBasePractitioner etc.)
- OID 1.2.752.116.1.3.6 = SOSNYK (yrkeskoder) — bekräftat i GitHub issue #13
- Inga OID:er från SoS för verksamhetskoder — bekräftat i GitHub issue #30
- HL7 Sweden tx.hl7.se repo finns men är fork av hl7-eu/tx.hl7europe.eu, verkar tomt/tidigt
- HSA verksamhetskoder (Organization.type) har OID: 1.2.752.129.2.2.1.3 — bekräftat i issue #30
- electronichealth.se-domänen är trasig sedan okt 2024 — bekräftat i HL7 Sweden mötesprotokoll
- commonprofiles.care (Cambio, Carasent, Doctrin, Chorus, ImagineCare) publicerar svenska FHIR-profiler men inga NamingSystem-resurser

### Vad jag INTE HITTADE (trots sökning i alla källor ovan):
- System-URI för KVÅ — **inte registrerat** i HL7 THO, HL7 Sweden, simplifier.net eller commonprofiles.care
- System-URI för SKR aktivitetskod — **finns inte** nånstans
- System-URI för sjukhuskoder — **finns inte** nånstans  
- Svenska FHIR-profiler för Measure/MeasureReport — **finns inte** i något svenskt projekt
- HSA-id: OID bekräftad (1.2.752.129.2.1.4.1) men ingen HTTP-URI definierad

---

## FHIR R4 Measure — bekräftad struktur

```
Measure
  .url                    canonical URI (globalt unik)
  .identifier[]           ytterligare identifierare
  .version                versionsstring
  .name                   maskinnamn
  .title                  mänskligt namn
  .status                 draft | active | retired
  .subject[x]             vad som mäts (CodeableConcept/Group)
  .date                   senast ändrad
  .publisher              utgivare
  .description            beskrivning
  .scoring                proportion | ratio | continuous-variable | cohort
  .improvementNotation    increase | decrease
  .group[]                en per KPI-grupp
    .code                 CodeableConcept — betydelse
    .description          beskrivning
    .population[]         populationskriterier
      .code               initial-population | numerator | denominator | ...
      .criteria           Expression (CQL/text)
    .stratifier[]         stratifieringskriterier
      .code               CodeableConcept
      .criteria           Expression
      .component[]        flervägs-stratifiering
```

## FHIR R4 MeasureReport — bekräftad struktur

```
MeasureReport
  .status                 complete | pending | error (obligatorisk)
  .type                   summary | individual | subject-list (obligatorisk)
  .measure                canonical(Measure) (obligatorisk)
  .subject                Reference — vem/vad rapporten gäller
  .date                   när rapporten genererades
  .reporter               Reference(Organization) — vem rapporterar
  .period                 Period (obligatorisk) — vilken period
  .group[]                en per grupp i Measure
    .code                 CodeableConcept — matchar Measure.group.code
    .population[]         populationsresultat
      .code               matchar Measure.group.population.code
      .count              integer — antal i populationen
    .measureScore         Quantity — det beräknade värdet
    .stratifier[]         stratifieringsresultat
      .code[]             matchar Measure.group.stratifier.code
      .stratum[]          ett per stratum-värde
        .value            CodeableConcept
        .population[]     populationsresultat per stratum
        .measureScore     Quantity
```

---

## Mappning: Våra 16 KPI:er → FHIR

### SÄKER MAPPNING (✅ bekräftat mot spec)

| # | VQL-kolumn | FHIR-element | Typ | Kommentar |
|---|-----------|-------------|-----|-----------|
| 1 | andel_inom_90 | MeasureReport.group[0].measureScore | Quantity (value=92.5, unit="%") | Scoring=proportion. improvementNotation=increase |
| 2 | namnare_vg | MeasureReport.group[0].population[denominator].count | integer (53) | code=denominator |
| 3 | taljare_vg | MeasureReport.group[0].population[numerator].count | integer (49) | code=numerator |
| 4 | antal_genomforda | MeasureReport.group[0].population[initial-population].count | integer (70) | Alla genomförda |
| 5 | ar, manad | MeasureReport.period | Period (start/end) | 2026-02-01 / 2026-02-28 |
| 6 | hsaid_vardenhet | MeasureReport.reporter | Reference(Organization) | HSA-id som identifierare |
| 7 | regionkod | MeasureReport.subject | Reference(Organization) | Region som subjekt |
| 8 | sjukhuskod | (inkluderas i reporter) | | |

### MAPPNING SOM KRÄVER DESIGNVAL (📋 diskutera)

| # | VQL-kolumn | Fråga | Alternativ | Rekommendation |
|---|-----------|-------|-----------|----------------|
| D1 | median_vantetid | Measure.scoring stöder proportion/ratio/continuous-variable/cohort. Median är continuous-variable, men andel_inom_90 är proportion. Kan de vara i samma Measure? | A: En Measure per KPI-typ (en för andel, en för median). B: En Measure med flera groups, varje med egen scoring. | **Behöver kontrolleras** — R4 spec säger scoring är på Measure-nivå, inte group-nivå. Det tyder på Alt A. |
| D2 | medel_vantetid | Samma fråga som D1 — medel vs andel i samma Measure? | Se D1 | Se D1 |
| D3 | n_0_30 ... n_over_180 | Väntetidsfördelning — detta är 6 buckets, inte en population. Hur representera? | A: Stratifier med stratum per intervall. B: Separata populations. C: Observation-resurser istället. | **Stratifier** verkar mest korrekt — spec stöder `stratum[].value` + `stratum[].population[].count`. Men vi behöver definiera ett ValueSet för intervallen. |
| D4 | antal_man/kvinna | Per kön — tydligt en stratifier | Stratifier med code=kön, stratum value=1/2 | ✅ Klar — R4 stöder detta direkt via stratifier |
| D5 | n_age_* | Per åldersgrupp — tydligt en stratifier | Stratifier med code=åldersgrupp, stratum value=<50/50-64/etc | ✅ Klar — samma mönster som D4 |
| D6 | median_total_patientresa | Mervärde-KPI (ej SKR). Ska detta vara en separat Measure eller en group i samma? | A: Separat Measure. B: Extra group. | Separat Measure — det har annan scoring (continuous-variable) |
| D7 | median_remiss_till_beslut | Samma som D6 | Se D6 | Se D6 |

### OSÄKER MAPPNING (⚠️ sökt men ej löst)

| # | Fråga | Sökresultat | Status |
|---|-------|------------|--------|
| U1 | System-URI för KVÅ | Sökt i: HL7 THO, HL7 Sweden basprofiler-r4, GitHub issues. **Ej registrerat i FHIR.** SoS OID-register har 1.2.752.116.1.3.2.1.4 för KVÅ. | ⚠️ ÖPPEN — fallback: urn:oid:1.2.752.116.1.3.2.1.4 men måste bekräftas med HL7 Sweden |
| U2 | System-URI för HSA-id | Sökt i: HL7 Sweden basprofiler-r4 IG. Ej explicit listat som NamingSystem. Inera OID-register: 1.2.752.129.2.1.4.1. | ⚠️ ÖPPEN — troligt: urn:oid:1.2.752.129.2.1.4.1 men ej verifierat |
| U3 | System-URI för SKR aktivitetskod 51101 | GitHub issue #30 bekräftar: **inga OID:er från SoS för verksamhetskoder.** | ⚠️ BEKRÄFTAT SAKNAS — kräver nytt system-URI eller mappning |
| U4 | Svenska FHIR-profiler för Measure/MeasureReport | Sökt i: basprofiler-r4. Täcker Patient, Organization, Practitioner. **Finns ej för Measure.** | ✅ BEKRÄFTAT SAKNAS — vi använder R4-basresurserna |
| U5 | Reporter-design (sjukhus/region) | HL7 Sweden SEBaseOrganization finns med HSA-id som identifier. | 📋 DESIGNVAL — contained Organization eller identifier-reference? |

---

## Rekommenderad FHIR-arkitektur

Baserat på bekräftade spec-element föreslår jag:

### Tre Measure-resurser:
1. **measure-vantetid-vardgaranti** (scoring=proportion)
   - group[0]: andel_inom_90
     - population: initial-population (alla), denominator (VG=JA ej PvV), numerator (<=90d)
     - stratifier: kön, åldersgrupp, väntetidsintervall
   
2. **measure-vantetid-median** (scoring=continuous-variable)
   - group[0]: median_vantetid
   - group[1]: medel_vantetid

3. **measure-vantetid-patientresa** (scoring=continuous-variable)
   - group[0]: median_total_patientresa
   - group[1]: median_remiss_till_beslut

### MeasureReport per körning:
- type = "summary"
- En MeasureReport per Measure × period × reporter
- period = den månad som matperiod anger
- reporter = Organization (sjukhus/klinik via HSA-id)

---

## DISKUSSIONSLOGG — BESLUTADE

| Nr | Punkt | Beslut | Datum |
|----|-------|--------|-------|
| D1 | Separata Measure-resurser | ✅ 3 st: vardgaranti (proportion), vantetid (continuous-variable), patientresa (continuous-variable). Motivering: scoring är Measure-nivå i R4. | 2026-03-26 |
| D2 | Väntetidsfördelning | ✅ Stratifier med stratum per intervall (0-30, 31-60, ..., >180). | 2026-03-26 |
| D3 | Kön och ålder | ✅ Stratifiers. Kön: stratum 1/2. Ålder: <50/50-64/65-74/75-84/85+. | 2026-03-26 |
| D4 | Reporter-design | ✅ Logical reference med HSA-id som identifier (ej contained). | 2026-03-26 |
| D5 | System-URI:er | ✅ urn:oid: för KVÅ/ICD-10-SE/HSA-id. Provisoriska kchd.se-URI:er för sjukhuskod/SKR. Alla i ref_fhir_system — bytbara. | 2026-03-26 |
| D6 | Per-dimensioner (yrke, kontaktform, bokning, remittent, kommun) | ✅ Stratifiers — inte separata MeasureReport-rader. Varje dimension = en stratifier med stratum per unikt värde. Se käll-analys nedan. | 2026-03-26 |
| D7 | Medelväntetid | ✅ Extra group i Measure 2 (vantetid-median). Scoring=continuous-variable stöder flera groups. | 2026-03-26 |
| D8 | Median remiss→beslut | ✅ Extra group i Measure 3 (vantetid-patientresa). Samma motivering som D7. | 2026-03-26 |

### Käll-analys för D6 (per-dimensioner som stratifiers)

Sökt 2026-03-26 i tre produktionsnära källor:

**1. FHIR HIV Indicators (WHO/OHIE) — R4 spec-exempel**
- URL: hl7.org/fhir/R4/measurereport-hiv-indicators.html
- Mönster: Sammansatta stratifiers med components. T.ex. stratifier code="AGE_GROUP:SEX",
  varje stratum har components [{code:AGE_GROUP, value:P0Y--P1Y}, {code:SEX, value:F}]
  och egen measureScore + population count.
- Slutsats: Per-dimensioner hanteras som stratifiers, inte separata rapportrader.

**2. Da Vinci DEQM Summary MeasureReport (USA:s kvalitetsrapportering)**
- URL: build.fhir.org/ig/HL7/davinci-deqm/StructureDefinition-summary-measurereport-deqm.html
- Mönster: Summary MeasureReport med stratifier.stratum.component.code + component.value.
  Populations (initial-population, numerator, denominator) kan anges PER stratum.
- Slutsats: Produktionsstandard i USA — bekräftar stratifier-mönstret.

**3. Da Vinci VBPR (Value-Based Performance Reporting)**
- URL: build.fhir.org/ig/HL7/davinci-vbpr/guidance.html
- Mönster: "to stratify by regions within an organization only, it will use facility as
  the stratifier code, then the stratifier.stratum.value would be selecting from a list
  of codes that represent the regions"
- Slutsats: Även entiteter (sjukhus, regioner) representeras som stratifier-värden.

### Beslutsmotivering D6
Alla tre källor använder stratifiers för per-dimensioner. Ingen använder separata
MeasureReport-rader per dimension. Mönstret är:
- Kategoriska (yrke, kontaktform, bokning): stratifier med kända kodvärden
- Entiteter (remittent, kommun): stratifier med entitetskod (HSA-id resp. LKF-kod)
- Varje stratum har population counts + (för proportion) measureScore

### Konsekvens för VQL
Per-dimensionerna representeras som EXTRA RADER i fhir_measure_report, en per
dimension × stratum-värde. C#-lagret läser kolumnen "dimension_type" för att
veta vilken stratifier det är, och "dimension_value" för stratum-värdet.

## DISKUSSIONSLOGG — ÖPPNA

| Nr | Punkt | Status |
|----|-------|--------|
| U1 | KVÅ system-URI: urn:oid:1.2.752.116.1.3.2.3.6 | Fallback — bevaka HL7 Sweden |
| U2 | HSA-id: urn:oid:1.2.752.129.2.1.4.1 | Trolig korrekt — bevaka Inera |
| U3 | SKR aktivitetskod: https://kchd.se/fhir/CodeSystem/skr-aktivitetskod | Provisorisk — finns inget officiellt |

---

## LEVERERAT (fas 2a)

| Fil | Typ | Innehåll |
|-----|-----|----------|
| fhir_paket.vql | VQL | ref_fhir_system + fhir_measure_report (2 vyer, 331 rader) |
| test_fhir.py | Testsvit | Simulerar VQL mot testdata → fhir_resultat.tsv |
| fhir_resultat.tsv | Testresultat | 12 rader (4 sjukhus × 3 Measures), 0 fel |
| fhir_mappning_analys.md | Dokumentation | Denna fil |

## TESTRESULTAT

Kört mot testdata (100 VGR-patienter, 70 genomförda, 4 sjukhus):
- 12 FHIR MeasureReport-rader genererade (3 per sjukhus)
- Alla andel-värden i intervallet 0.0–1.0 ✅
- Alla medianvärden i intervallet 1–365 ✅
- Kön-summor matchar totaler ✅

## NÄSTA STEG

1. **Peder granskar** — denna mappning + designbeslut
2. **Fas 2 klar** — VQL levereras till VGR (de kör det utan ändringar)
3. **Fas 3** — C#/SSIS-kod som läser fhir_measure_report och producerar FHIR JSON
4. **Fas 4** — Samma mönster för patientnivå (Procedure/ServiceRequest)

---

## VERIFIERING AV RADNIVÅ-MAPPNINGAR (fas 4, 2026-03-26)

Sökt i: hl7.org/fhir/R4/procedure.html, hl7.org/fhir/R4/servicerequest.html,
hl7.org/fhir/R4/patient.html, hl7.org/fhir/R4/encounter.html

### Korrigerade mappningar (5 st — var fel i tidigare version)

| Variabel | Fel mappning | Varför fel | Korrekt mappning |
|----------|-------------|-----------|-----------------|
| vardgaranti | ServiceRequest.priority | priority=routine/urgent/asap/stat, inte JA/NEJ | Extension (svenskt begrepp) |
| yrkeskategori | Procedure.performer.qual | performer har function+actor, inte qualification | PractitionerRole.code / Extension |
| lkf | Patient.address.postalCode | LKF=kommunkod 4 siffror, postalCode=postnr 5 siffror | Patient.address.district |
| ankomst_datum | ServiceRequest.occurrenceDateTime | occurrence="when SHOULD occur" (framåt), inte "when received" | Extension (remissankomst) |
| beslut_datum | Procedure.ext(beslutsdatum) | Inget R4-standardelement för behandlingsbeslut | Extension (korrekt, men var otydligt) |

### Variabler som kräver Extension (7 st, inget R4-standardelement)

beslut_datum, vardgaranti, avvikelsekod, bokningssatt, fas, aktivitetskod, ankomst_datum

### Bekräftade korrekta mappningar (21 st)

Se testresultat_komplett.jsx "Tre format"-fliken för komplett tabell.
Alla verifierade mot hl7.org/fhir/R4 definitionen av respektive resurs.

### Dataklassificering — vad lämnar regionen? (beslut D17)

| Nivå | FHIR-resurs | Datatyp | Till hubben? |
|------|------------|---------|-------------|
| Aggregerat | MeasureReport | Statistik (inga patienter) | ✅ Ja — fas 2 |
| Per patient (beräknat) | Observation | Patientnivå (beräknade värden) | ❌ Nej — stannar i regionen |
| Per patient (rå) | Procedure, ServiceRequest, Patient | Patientnivå (källdata) | ❌ Nej — stannar i regionen |

**Motivering:** Hubben får inte känslig data. Det som skickas måste vara
klassificerat som statistik. MeasureReport innehåller bara aggregerade
nyckeltal ("85.7% av 14 patienter"), aldrig enskilda patienters uppgifter.

De 4 per-patient-beräkningarna (Observation) och fas 4-resurserna (Procedure,
ServiceRequest) kan finnas som FHIR *inom* regionen, men de passerar aldrig
gränsen till hubben utan separat rättslig grund.
