# KCHD FHIR-serialiserare (C#)

Läser tabelldata från Denodos `fhir_measure_report`-vy och producerar en
FHIR R4 Bundle med MeasureReport-resurser.

## Förutsättningar

- .NET 8 SDK (`dotnet --version` → 8.x)
- Python 3.8+ (för pipeline och testjämförelse)

## Snabbstart

```bash
# 1. Generera testdata (från repo-roten)
python3 python/pipeline_runner.py testdata/katarakt_testdata_100__1__VGR.csv resultat/

# 2. Bygg och kör
cd csharp/KchdFhirSerializer
dotnet restore
dotnet run -- ../../resultat/steg6_fhir_tabell.tsv -o test_output.json -v

# 3. Automatiskt test (bygg + kör + jämför mot referens)
./test_csharp.sh
```

## Användning

### Från TSV-fil (test/utveckling)
```bash
dotnet run -- <input.tsv> -o <output.json> -v
```

### Från Denodo via ODBC (produktion)
```bash
dotnet run -- --odbc "DSN=DenodoVGR" -o fhir_bundle.json -v
```

### Alla flaggor
| Flagga | Beskrivning |
|--------|-------------|
| `<fil>` | TSV/CSV-input |
| `--odbc <sträng>` | ODBC-anslutningssträng |
| `--query <SQL>` | SQL-fråga (default: `SELECT * FROM fhir_measure_report`) |
| `-o, --output` | Output-fil (default: `fhir_bundle.json`) |
| `-v, --validate` | Validera FHIR-output |
| `-d, --date` | Rapportdatum (default: `2026-03-26`) |

## Projektstruktur

| Fil | Syfte |
|-----|-------|
| `Program.cs` | CLI, serialisering med `FhirJsonSerializer` |
| `DenodoReader.cs` | Läser data via ODBC eller TSV (multi-separator) |
| `MeasureReportBuilder.cs` | Bygger `Bundle`/`MeasureReport` med Hl7.Fhir.R4 |
| `FhirValidator.cs` | Validerar obligatoriska fält och värdeintervall |
| `appsettings.json` | ODBC-konfiguration |
| `test_csharp.sh` | Automatiskt bygg- och testskript |

## NuGet-beroenden

- `Hl7.Fhir.R4` 5.x (Firely SDK)
- `System.Data.Odbc` 8.x

## Referens

- **Python-referens:** `python/fhir_serializer.py` (identisk logik)
- **Referens-JSON:** `docs/fhir_bundle_example.json` (12 MeasureReports)
- **Spec:** `docs/fhir_serializer_spec.md`
- **Kolumnlista:** Se spec §3

## SSIS-integration (SQL Server 2019)

VGR kör SQL Server 2019 utan separat .NET 8 runtime.
Lösning: **self-contained .exe** via Execute Process Task.

### Publicera för Windows

```bash
dotnet publish KchdFhirSerializer.csproj -c Release -r win-x64 --self-contained -o publish/
```

Detta ger en mapp `publish/` med `KchdFhirSerializer.exe` + alla beroenden (~70 MB).
Inga förkunskaper krävs på servern — .NET runtime ingår i .exe:n.

### Konfigurera i SSIS

1. Lägg till ett **Execute Process Task** i SSIS-paketet
2. Konfiguration:
   - **Executable:** `C:\sökväg\KchdFhirSerializer\KchdFhirSerializer.exe`
   - **Arguments:** `--odbc "DSN=DenodoVGR" -o C:\output\fhir_bundle.json -v`
   - **WorkingDirectory:** `C:\sökväg\KchdFhirSerializer\`
3. Programmet läser från Denodos `fhir_measure_report`-vy, bygger FHIR Bundle, validerar, och skriver JSON

### Leveranspaket

```
KchdFhirSerializer/
├── KchdFhirSerializer.exe    ← Kör denna
├── *.dll                     ← Beroenden (kopieras automatiskt)
├── appsettings.json          ← ODBC-konfiguration
└── README.md                 ← Denna fil
```

## Förväntat resultat

```
Rader: 440
FHIR Bundle: 12 MeasureReports, ~219,000 tecken
✅ Validering OK
```
