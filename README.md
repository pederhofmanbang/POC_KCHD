# KCHD Väntetidspaket — Katarakt (VGR)

Kompetenscentrum Hälsodata (KCHD) × Västra Götalandsregionen.
Väntetidsberäkning för katarakt (gråstarr), från journalsystem till FHIR.

## Snabbstart

```bash
# Kör hela kedjan mot testdata
python3 python/pipeline_runner.py testdata/katarakt_testdata_100__1__VGR.csv resultat/
```

Om det avslutas med **HELA KEDJAN GRÖN** fungerar allt.

## Vad finns här

```
vql/                    Denodo-vyer (VQL) — beräkning, kvalitet, FHIR
python/                 Pipeline, serialiserare, testsviter
docs/                   Mappningsanalys, FHIR-register, C#-spec, index
demo/                   JSX-visualiseringar för demo/presentation
testdata/               100 syntetiska VGR-patienter
resultat/               Genereras av pipeline_runner.py (gitignore:d)
```

## Pipeline (8 steg)

| Steg | Vad | Ut |
|------|-----|----|
| 1 | Läs rådata | 100 rader × 35 kolumner |
| 2 | Filtrera katarakt | 70 genomförda + 30 väntande |
| 3 | Beräkna väntetider | 70 patienter × 4 beräkningar |
| 4 | Aggregera KPI:er | 16 KPI:er × 4 sjukhus |
| 5 | Kvalitetskontroll | DQ0-DQ6, 10 kontroller |
| 6 | FHIR-tabell | 440 rader |
| 7 | FHIR JSON | 12 MeasureReports (214 KB) |
| 8 | Skicka till hubb | Simulerad kvittens |

## Status

- ✅ VQL-vyer (beräkning + kvalitet + verifiering + FHIR) — klara och testade
- ✅ Python pipeline + serialiserare — fungerar
- ❌ C#/SSIS-serialiserare — spec klar, kod ej byggd (se docs/fhir_serializer_spec.md)
- 📋 FHIR per patient (Observation) — design klar, kod ej påbörjad

## Dokumentation

Se **docs/katarakt_index.md** för komplett förteckning av alla filer, designbeslut,
system-URI:er, öppna punkter och recovery-instruktioner.

## Krav

- Python 3.10+
- Inga externa beroenden (bara standardbibliotek)
