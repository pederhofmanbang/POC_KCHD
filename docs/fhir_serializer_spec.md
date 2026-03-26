# KCHD Fas 3: FHIR-serialiserare — Projektspec
## C#/.NET implementation för KCHD/VGR

**Datum:** 2026-03-26
**Status:** Spec klar. Python-referensimplementation testad. KCHD bygger C#-versionen.

---

## 1. VAD SKA BYGGAS

Ett C#-program som:
1. Läser tabelldata från Denodos `fhir_measure_report`-vy (via ODBC eller CSV-export)
2. Bygger FHIR R4 MeasureReport-resurser
3. Producerar en FHIR Bundle (JSON)
4. Validerar output

**All domänlogik finns redan i VQL:en.** C#-koden bara serialiserar — den behöver
inte veta vad andel_inom_90 betyder eller hur median beräknas. Den läser kolumner
och bygger JSON-strukturer.

---

## 2. REFERENSIMPLEMENTATION (Python)

Filen `fhir_serializer.py` gör exakt det C#-koden ska göra. Testad och validerad:
- Input: fhir_resultat.tsv (104 rader)
- Output: fhir_bundle.json (12 MeasureReports, 114 KB)
- Validering: 0 fel

**Kör referensen:**
```bash
python3 fhir_serializer.py fhir_resultat.tsv --output bundle.json --validate
```

**Jämför C#-output mot Python-output:** Resultaten ska vara identiska (samma JSON-struktur).

---

## 3. KOLUMNER I fhir_measure_report

C#-koden läser dessa kolumner. Namnen matchar FHIR-element.

### Identifiering
| Kolumn | Typ | Beskrivning |
|--------|-----|-------------|
| measure_url | VARCHAR | Canonical URL för Measure (t.ex. https://kchd.se/fhir/Measure/vantetid-vardgaranti) |
| measure_type | VARCHAR | Kort namn: vardgaranti / vantetid / patientresa |
| scoring | VARCHAR | proportion / continuous-variable |
| group_code | VARCHAR | Identifierar group inom Measure (andel_inom_90, median_vantetid, etc.) |
| status | VARCHAR | Alltid 'complete' |
| report_type | VARCHAR | Alltid 'summary' |

### Period
| Kolumn | Typ | Beskrivning |
|--------|-----|-------------|
| period_start | VARCHAR | YYYY-MM-DD (första dagen i månaden) |
| period_end | VARCHAR | YYYY-MM-DD (sista dagen i månaden) |

### Reporter + Subject
| Kolumn | Typ | Beskrivning |
|--------|-----|-------------|
| reporter_system | VARCHAR | urn:oid:1.2.752.129.2.1.4.1 (HSA-id) |
| reporter_value | VARCHAR | HSA-id för sjukhuset/enheten |
| reporter_display | VARCHAR | Sjukhusnamn |
| subject_system | VARCHAR | urn:oid:1.2.752.129.2.1.4.1 |
| subject_value | VARCHAR | HSA-id för regionen |

### Measure Score
| Kolumn | Typ | Beskrivning |
|--------|-----|-------------|
| measure_score | DOUBLE | Beräknat värde (0.0-1.0 för andel, dagar för median) |
| measure_score_unit | VARCHAR | '%' eller 'dagar' |

### Populations
| Kolumn | Typ | Beskrivning |
|--------|-----|-------------|
| pop_initial | INTEGER | Antal i initial-population (alla genomförda) |
| pop_denominator | INTEGER | Antal i denominator (NULL för continuous-variable) |
| pop_numerator | INTEGER | Antal i numerator (NULL för continuous-variable) |

### Stratifiers (breda kolumner, bara i totalrader)
| Kolumn | Typ | Beskrivning |
|--------|-----|-------------|
| strat_kon_man | INTEGER | Antal män |
| strat_kon_kvinna | INTEGER | Antal kvinnor |
| strat_age_under_50..85_plus | INTEGER | Antal per åldersgrupp (5 kolumner) |
| strat_vt_0_30..over_180 | INTEGER | Antal per väntetidsintervall (6 kolumner) |

### Per-dimension (dimension_type != NULL)
| Kolumn | Typ | Beskrivning |
|--------|-----|-------------|
| dimension_type | VARCHAR | NULL=totalrad. Annars: yrkeskategori/kontaktform/bokningssatt/remittent/kommun |
| dimension_value | VARCHAR | Stratum-kod (t.ex. '2' för bokningssätt, LKF-kod för kommun) |
| dimension_display | VARCHAR | Visningsnamn |

---

## 4. C#-PROJEKTSTRUKTUR

```
KchdFhirSerializer/
├── KchdFhirSerializer.csproj
├── Program.cs
├── DenodoReader.cs          ← Läser TSV/ODBC
├── MeasureReportBuilder.cs  ← Bygger FHIR-resurser
├── FhirValidator.cs         ← Validerar output
└── appsettings.json         ← Konfiguration (ODBC-sträng, output-path)
```

### NuGet-beroenden
```xml
<PackageReference Include="Hl7.Fhir.R4" Version="5.*" />
<PackageReference Include="System.Data.Odbc" Version="8.*" />
```

---

## 5. PSEUDOKOD (matchar fhir_serializer.py exakt)

```csharp
// 1. Läs rader
var rows = DenodoReader.ReadFromOdbc(connectionString, "SELECT * FROM fhir_measure_report");
// ELLER
var rows = DenodoReader.ReadFromTsv("fhir_resultat.tsv");

// 2. Gruppera per MeasureReport
var groups = rows.GroupBy(r => (r.MeasureUrl, r.PeriodStart, r.PeriodEnd, r.ReporterValue));

// 3. Bygg MeasureReports
var bundle = new Bundle { Type = Bundle.BundleType.Collection };

foreach (var group in groups)
{
    var totalRows = group.Where(r => r.DimensionType == null);
    var dimRows = group.Where(r => r.DimensionType != null)
                       .GroupBy(r => r.DimensionType);

    var mr = new MeasureReport
    {
        Status = MeasureReport.MeasureReportStatus.Complete,
        Type = MeasureReport.MeasureReportType.Summary,
        Measure = group.Key.MeasureUrl,
        Period = new Period { Start = group.Key.PeriodStart, End = group.Key.PeriodEnd },
        Reporter = new ResourceReference
        {
            Identifier = new Identifier(first.ReporterSystem, first.ReporterValue),
            Display = first.ReporterDisplay
        }
    };

    // 3a. Groups från totalrader
    foreach (var t in totalRows)
    {
        var fhirGroup = new MeasureReport.GroupComponent
        {
            Code = new CodeableConcept { Coding = { new Coding { Code = t.GroupCode } } }
        };
        // Populations
        if (t.PopInitial.HasValue)
            fhirGroup.Population.Add(MakePop("initial-population", t.PopInitial.Value));
        if (t.PopDenominator.HasValue)
            fhirGroup.Population.Add(MakePop("denominator", t.PopDenominator.Value));
        if (t.PopNumerator.HasValue)
            fhirGroup.Population.Add(MakePop("numerator", t.PopNumerator.Value));
        // MeasureScore
        fhirGroup.MeasureScore = MakeScore(t.MeasureScore, t.MeasureScoreUnit);
        // Stratifiers (kön, ålder, intervall)
        fhirGroup.Stratifier.AddRange(BuildInlineStratifiers(t));
        mr.Group.Add(fhirGroup);
    }

    // 3b. Per-dimension stratifiers → first group
    foreach (var dimGroup in dimRows)
    {
        var stratifier = BuildDimensionStratifier(dimGroup.Key, dimGroup.ToList());
        mr.Group[0].Stratifier.Add(stratifier);
    }

    bundle.Entry.Add(new Bundle.EntryComponent { Resource = mr });
}

// 4. Serialisera
var serializer = new FhirJsonSerializer(new SerializerSettings { Pretty = true });
File.WriteAllText(outputPath, serializer.SerializeToString(bundle));

// 5. Validera
var errors = FhirValidator.Validate(bundle);
```

---

## 6. NYCKELLOGIK I C#

### 6a. Avgör radtyp
```csharp
if (string.IsNullOrEmpty(row.DimensionType))
    // Totalrad → group + populations + score + inbäddade stratifiers
else
    // Per-dimension-rad → extra stratifier i group[0]
```

### 6b. MeasureScore
```csharp
Quantity MakeScore(double? value, string unit) =>
    value.HasValue
        ? new Quantity { Value = unit == "%" ? Math.Round(value.Value * 100, 1) : value.Value,
                         Unit = unit == "%" ? "%" : "dagar",
                         System = "http://unitsofmeasure.org",
                         Code = unit == "%" ? "%" : "d" }
        : null;
```

**OBS: andel lagras som 0.0–1.0 i VQL, multipliceras till 0–100 i FHIR JSON.**

### 6c. Population
```csharp
MeasureReport.PopulationComponent MakePop(string code, int count) =>
    new() { Code = new CodeableConcept("http://terminology.hl7.org/CodeSystem/measure-population", code),
            Count = count };
```

---

## 7. SSIS/SSIS-INTEGRATION

Om VGR vill köra detta som ett SSIS-paket istället för ett fristående program:

1. **Data Flow Task**: Läs från Denodo via ODBC-källa (fhir_measure_report)
2. **Script Component** (C#): Ovanstående logik i ProcessInput()
3. **Flat File Destination**: Skriv JSON till fil
4. **Alternativt**: Execute Process Task som kör KchdFhirSerializer.exe

Rekommendation: Börja som konsol-app, migrera till SSIS-paket senare om det behövs.

---

## 8. TESTNING

### Steg 1: Jämför mot referens-JSON
```bash
# Kör Python-referensen
python3 fhir_serializer.py fhir_resultat.tsv -o reference.json -v

# Kör C#-versionen
dotnet run -- fhir_resultat.tsv -o csharp.json

# Jämför (bortse från ordning)
diff <(python3 -c "import json; print(json.dumps(json.load(open('reference.json')), sort_keys=True, indent=2))") \
     <(python3 -c "import json; print(json.dumps(json.load(open('csharp.json')), sort_keys=True, indent=2))")
```

### Steg 2: FHIR-validering
```bash
# Installera FHIR validator (Java)
java -jar validator_cli.jar csharp.json -version 4.0.1
```

### Steg 3: Prod-körning
```bash
# Kör mot Denodo (ODBC)
dotnet run -- --odbc "DSN=DenodoVGR" --query "SELECT * FROM fhir_measure_report" -o prod.json -v
```

---

## 9. LEVERANSLISTA

| Fil | Syfte | Status |
|-----|-------|--------|
| fhir_serializer.py | Python-referensimplementation (testad, validerad) | ✅ Klar |
| fhir_bundle_example.json | Referens-JSON (12 MeasureReports, 114 KB) | ✅ Klar |
| fhir_paket.vql | VQL som producerar tabelldata | ✅ Klar |
| fhir_resultat.tsv | Testdata-output (104 rader) | ✅ Klar |
| fhir_serializer_spec.md | Denna spec | ✅ Klar |
| KchdFhirSerializer/ (C#) | KCHD bygger baserat på denna spec | 📋 Ej byggt |
