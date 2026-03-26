# Claude Code-prompt: Bygg C#/SSIS FHIR-serialiserare

## Kontext

Du jobbar i repot `kchd-vantetid-katarakt`. KCHD bygger ALL kod.

Läs dessa filer FÖRST (obligatoriskt):
1. `docs/katarakt_index.md` — komplett index
2. `docs/fhir_serializer_spec.md` — C#-projektspec med kolumner, pseudokod, NuGet
3. `python/fhir_serializer.py` — Python-referensimplementation (gör exakt det C# ska göra)
4. `docs/fhir_bundle_example.json` — referens-JSON (C#-output ska vara identisk)

## Uppgift

Bygg ett C#-projekt som läser TSV-output från Denodos `fhir_measure_report`-vy
och producerar en FHIR R4 Bundle med MeasureReport-resurser.

### Steg

1. Skapa `csharp/KchdFhirSerializer/KchdFhirSerializer.csproj` med:
   - `Hl7.Fhir.R4` (version 5.*)
   - `System.Data.Odbc` (version 8.*)
   - TargetFramework: net8.0

2. Skapa `csharp/KchdFhirSerializer/Program.cs`:
   - Läser TSV (tab-separerad) eller ODBC
   - Grupperar per (measure_url, period_start, period_end, reporter_value)
   - Bygger MeasureReport-resurser exakt som fhir_serializer.py gör
   - Skriver FHIR Bundle JSON

3. Skapa `csharp/KchdFhirSerializer/TsvReader.cs`:
   - Läser TSV med multi-separator (tab, semikolon, komma)

4. Skapa `csharp/KchdFhirSerializer/MeasureReportBuilder.cs`:
   - Totalrader → group[], population[], measureScore, stratifiers
   - Per-dimension-rader → extra stratifier[] per dimension_type

5. Testa:
   ```bash
   cd csharp/KchdFhirSerializer
   dotnet run -- ../../resultat/steg6_fhir_tabell.tsv -o test_output.json
   ```
   Jämför output mot `docs/fhir_bundle_example.json`:
   ```bash
   python3 -c "
   import json
   a = json.load(open('test_output.json'))
   b = json.load(open('../../docs/fhir_bundle_example.json'))
   print('MeasureReports:', len(a['entry']), '==', len(b['entry']))
   print('Match:', json.dumps(a, sort_keys=True) == json.dumps(b, sort_keys=True))
   "
   ```

### Regler

- EN FIX I TAGET. Testa efter varje ändring.
- Kör pipeline_runner.py FÖRST för att generera steg6_fhir_tabell.tsv.
- C#-output ska vara IDENTISK med Python-referensens output (fhir_bundle_example.json).
- Svenska kommentarer i koden.
- Om du inte vet, fråga. Gissa inte.

### Nyckellogik (se fhir_serializer_spec.md §6)

```
andel lagras som 0.0–1.0 i TSV → multipliceras till 0–100 i FHIR JSON
dimension_type == NULL → totalrad (kön/ålder/intervall som breda kolumner)
dimension_type != NULL → per-dimension-rad → extra stratifier i group[0]
```
