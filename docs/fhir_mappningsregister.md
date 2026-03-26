# KCHD FHIR-mappningsregister
## Nationell referens för väntetidsdata → FHIR R4

**Syfte:** Spåra alla mappningar vi gör, särskilt de som går utanför
befintlig svensk FHIR-standard. Detta register kan bli grunden för
en gemensam nationell mappningsdatabas för regionerna.

**Senast uppdaterad:** 2026-03-26
**Ansvarig:** KCHD (Kompetenscentrum Hälsodata)

---

## 1. PROVISORISKA SYSTEM-URI:ER (definierade av KCHD)

Dessa URI:er har skapats av KCHD eftersom det saknas officiella.
De ska bytas ut när HL7 Sweden, Socialstyrelsen eller annan
auktoritet publicerar formella URI:er.

| URI | Kodverk | Varför provisorisk | Bevaka |
|-----|---------|-------------------|--------|
| `https://kchd.se/fhir/CodeSystem/skr-aktivitetskod` | SKR:s vårdutbudsförteckning (t.ex. 51101=Gråstarr) | SKR har inte publicerat vare sig OID eller FHIR-URI. Bekräftat i HL7 Sweden GitHub #30. | SKR, HL7 Sweden |
| `https://kchd.se/fhir/CodeSystem/sjukhuskod` | Socialstyrelsens sjukhuskoder (t.ex. 501010=Sahlgrenska) | SoS publicerar kodlistan som PDF men har ingen OID. Bekräftat i HL7 Sweden GitHub #30. | Socialstyrelsen, HL7 Sweden |
| `https://kchd.se/fhir/Measure/vantetid-vardgaranti` | Measure-definition: andel inom 90 dagar | Inga svenska Measure-profiler finns. Vi definierar egna Measure-URL:er. | HL7 Sweden, Socialstyrelsen (ny väntetidsrapportering) |
| `https://kchd.se/fhir/Measure/vantetid-median` | Measure-definition: medianväntetid | Se ovan | Se ovan |
| `https://kchd.se/fhir/Measure/vantetid-patientresa` | Measure-definition: total patientresa | Se ovan | Se ovan |

### Policy för provisoriska URI:er
- Alla under `https://kchd.se/fhir/` — tydligt att KCHD äger dem
- Alla samlade i ref_fhir_system (VQL) — bytbara på ett ställe
- Alla dokumenterade här med motivering och bevakningspunkt
- När officiell URI publiceras: byt i ref_fhir_system, uppdatera detta register

---

## 2. KPI-MAPPNING — FULLSTÄNDIG TÄCKNING

### Mappade till FHIR MeasureReport (12 rader per körning)

| # | KPI | FHIR-resurs | FHIR-element | Testat |
|---|-----|-------------|-------------|--------|
| 1 | Andel inom 90 dagar | Measure: vantetid-vardgaranti | group[andel_inom_90].measureScore (Quantity, %) | ✅ |
| 2 | Nämnare VG | samma | group[andel_inom_90].population[denominator].count | ✅ |
| 3 | Täljare VG | samma | group[andel_inom_90].population[numerator].count | ✅ |
| 4 | Antal genomförda | samma | group[andel_inom_90].population[initial-population].count | ✅ |
| 5 | Medianväntetid | Measure: vantetid-median | group[median_vantetid].measureScore (Quantity, dagar) | ✅ |
| 6 | Median total patientresa | Measure: vantetid-patientresa | group[median_patientresa].measureScore (Quantity, dagar) | ✅ |
| 7 | Antal man / kvinna | alla tre | group.stratifier[kön].stratum[].count | ✅ |
| 8 | Åldersfördelning | alla tre | group.stratifier[ålder].stratum[].count | ✅ |
| 9 | Väntetidsfördelning | alla tre | group.stratifier[intervall].stratum[].count | ✅ |
| 10 | Medelväntetid | Measure: vantetid-median | group[medel_vantetid].measureScore (Quantity, dagar) — D7 | ✅ |
| 11 | Per yrkeskategori | alla tre Measures | stratifier[yrkeskategori] × alla 5 group_codes — D6 | ✅ |
| 12 | Per kontaktform | alla tre Measures | stratifier[kontaktform] × alla 5 group_codes — D6 | ✅ |
| 13 | Per bokningssätt | alla tre Measures | stratifier[bokningssatt] × alla 5 group_codes — D6 | ✅ |
| 14 | Per remittent | alla tre Measures | stratifier[remittent] × alla 5 group_codes — D6 | ✅ |
| 15 | Per kommun (LKF) | alla tre Measures | stratifier[kommun] × alla 5 group_codes — D6 | ✅ |
| 16 | Median remiss→beslut | Measure: vantetid-patientresa | group[median_remiss_beslut].measureScore — D8 | ✅ |

### Testresultat v3 (2026-03-26)

Testat mot 100 VGR-patienter (70 genomförda, 4 sjukhus, period 2026-02):
- 20 totalrader (5 mått × 4 sjukhus)
- 420 per-dimension-rader (5 dimensioner × 5 mått × varierande antal strata)
- 440 FHIR-rader totalt, 0 fel
- Serialiserat: 12 MeasureReports, 214 KB FHIR Bundle JSON, validerat

---

## 3. VERIFIERADE SYSTEM-URI:ER (officiella, ej provisoriska)

| Kodverk | URI | OID | Källa | Verifierad |
|---------|-----|-----|-------|-----------|
| KVÅ | urn:oid:1.2.752.116.1.3.2.3.6 | 1.2.752.116.1.3.2.3.6 | Socialstyrelsens OID-serie (KKÅ-filen) | ✅ 2026-03-26 |
| ICD-10-SE | urn:oid:1.2.752.116.1.1.1 | 1.2.752.116.1.1.1 | Socialstyrelsens OID-serie | ✅ 2026-03-26 |
| HSA-id | urn:oid:1.2.752.129.2.1.4.1 | 1.2.752.129.2.1.4.1 | Inera Confluence | ✅ 2026-03-26 |
| HSA verksamhetskod | urn:oid:1.2.752.129.2.2.1.3 | 1.2.752.129.2.2.1.3 | HL7 Sweden GitHub #30 | ✅ 2026-03-26 |
| SOSNYK (yrkeskoder) | urn:oid:1.2.752.116.1.3.6 | 1.2.752.116.1.3.6 | HL7 Sweden GitHub #13 | ✅ 2026-03-26 |
| Personnummer | urn:oid:1.2.752.129.2.1.3.1 | 1.2.752.129.2.1.3.1 | Inera Confluence | ✅ 2026-03-26 |
| Samordningsnummer | urn:oid:1.2.752.129.2.1.3.3 | 1.2.752.129.2.1.3.3 | Inera Confluence | ✅ 2026-03-26 |

---

## 4. SÖKKÄLLOR (genomsökta utan resultat)

Följande källor har genomsökts för svenska FHIR system-URI:er
utan att hitta NamingSystem/CodeSystem-resurser för KVÅ,
sjukhuskoder eller SKR aktivitetskoder:

| Källa | URL | Datum |
|-------|-----|-------|
| HL7 Terminology (THO) | terminology.hl7.org | 2026-03-26 |
| HL7 Sweden basprofiler-r4 v1.1.0 | build.fhir.org/ig/HL7Sweden/basprofiler-r4/ | 2026-03-26 |
| HL7 Sweden simplifier.net paket | simplifier.net/packages/hl7se.fhir.base/1.1.0 | 2026-03-26 |
| HL7 Sweden GitHub (alla 5 repos) | github.com/HL7Sweden | 2026-03-26 |
| commonprofiles.care | commonprofiles.care + GitHub | 2026-03-26 |
| Inera Confluence | inera.atlassian.net | 2026-03-26 |
| Socialstyrelsen OID-register | socialstyrelsen.se/.../oid/ | 2026-03-26 |
| E-hälsomyndigheten (NLL) | simplifier.net SwedishNationalMedicationList | 2026-03-26 |

**electronichealth.se** — Tidigare använd av HL7 Sweden som namnrymd
(http://electronichealth.se/fhir/...) men domänen resolvar inte sedan
oktober 2024. HL7 Sweden har skapat ärende för att lösa detta.

---

## 5. FRAMTIDA VISION: NATIONELL MAPPNINGSDATABAS

Det här registret kan växa till en gemensam resurs för alla regioner:

1. **Varje nytt vårdutbud** (höftprotes, knäprotes, hjärtinfarkt etc.)
   lägger till sina KPI:er och mappningar i samma format som ovan

2. **Provisoriska URI:er** spåras centralt så att alla regioner
   använder samma — inga parallella uppfinningar

3. **När officiella URI:er publiceras** behöver bara detta register
   och ref_fhir_system uppdateras — koden fungerar direkt

4. **Mappningsluckorna** (sektion 2, "ej mappade") visar exakt
   vad som behöver lösas nationellt — input till HL7 Sweden

5. **Registret publiceras** på hubbens GitHub och kchd.se —
   tillgängligt för alla regioner och leverantörer

### Koppling till EHDS
EHDS (EU 2025/327) kräver att data kan utbytas i internationella
standarder. Detta register dokumenterar exakt var Sverige står
och vad som saknas — direkt användbart i EHDS-förberedelser.
