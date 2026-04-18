# KCHD — Plan: Plattformsvarianter av beräkningspaket

## Mål, omfattning och testplan

**Version:** 1.0.0
**Datum:** 2026-04-07
**Syfte:** Göra alla KCHD-paket körbara för regioner med SQL Server, PostgreSQL eller Python — inte bara Denodo.
**Prioriteringsgrund:** ~17–19 av 21 regioner kör Cosmic på SQL Server. Denodo är ovanligt (VGR). PostgreSQL växer.

---

## Versionshistorik

| Version | Datum | Ändring |
|---------|-------|---------|
| 1.0.0 | 2026-04-07 | Första version. |

---

## Innehåll

1. [Nuläge](#1-nuläge)
2. [Målbild](#2-målbild)
3. [Syntaxskillnader](#3-syntaxskillnader)
4. [Uppgifter per paket](#4-uppgifter-per-paket)
5. [Testplan](#5-testplan)
6. [Prioriteringsordning](#6-prioriteringsordning)

---

## 1. Nuläge

Alla paket är idag skrivna för Denodo (VQL) och SSIS.

| Paket | Repo | Plattform idag | Status |
|-------|------|----------------|--------|
| vantetid-katarakt | kchd-se/vantetid-katarakt | VQL (Denodo) | ✅ Implementerad hos VGR |
| vantetid-katarakt-fhir | kchd-se/vantetid-katarakt-fhir | VQL + C# (.exe) | ✅ Implementerad hos VGR |
| vantetid-katarakt-fhir-send | kchd-se/vantetid-katarakt-fhir-send | SSIS Script Task (C#) | ✅ Klar |
| pipeline_runner.py | pederhofmanbang/POC_KCHD | Python | ✅ Klar (intern testsvit) |

---

## 2. Målbild

Varje paket ska finnas i tre plattformsvarianter. En region väljer den som matchar deras miljö.

| Paket | Denodo (VQL) | SQL Server (T-SQL) | PostgreSQL | Python |
|-------|---|---|---|---|
| **Beräkning** (15 vyer) | ✅ Klart | Översätt | Översätt | ✅ Finns (pipeline_runner.py) |
| **Verifiering** (1 vy) | ✅ Klart | Översätt | Översätt | Lägg till i pipeline_runner.py |
| **Kvalitet** (1 vy) | ✅ Klart | Översätt | Översätt | ✅ Finns (test_dq.py) |
| **FHIR-paket** (2 vyer) | ✅ Klart | Översätt | Översätt | ✅ Finns (test_fhir.py) |
| **C#-serialiserare** | ✅ Klart | Verifiera --schema | Verifiera --schema | — (Python-referens finns) |
| **Sändning** | ✅ SSIS klart | ✅ Samma SSIS | — | Nytt: send_fhir.py |
| **README + guide** | ✅ Klart | Ny | Ny | Ny |

### Repostruktur efter genomförande

```
vantetid-katarakt/
├── vql/           ← Denodo (befintlig)
├── tsql/          ← SQL Server (ny)
├── pgsql/         ← PostgreSQL (ny)
├── python/        ← Python-variant (ny, baserad på pipeline_runner.py)
└── tests/         ← Plattformsoberoende testdata + förväntade resultat

vantetid-katarakt-fhir/
├── vql/           ← Denodo (befintlig)
├── tsql/          ← SQL Server (ny)
├── pgsql/         ← PostgreSQL (ny)
├── csharp/        ← C#-serialiserare (befintlig, oförändrad)
└── tests/

vantetid-katarakt-fhir-send/
├── ssis/          ← SSIS Script Task (befintlig, flytta hit)
├── python/        ← Python-variant (ny)
└── README.md
```

---

## 3. Syntaxskillnader

### 3.1 Funktioner som behöver översättas

| Funktion | VQL (Denodo) | T-SQL (SQL Server) | PostgreSQL |
|----------|---|---|---|
| Dagar mellan datum | `GETDAYSBETWEEN(d1, d2)` | `DATEDIFF(day, d1, d2)` | `(d2 - d1)` (returnerar integer) |
| Extrahera år | `GETYEAR(d)` | `YEAR(d)` | `EXTRACT(YEAR FROM d)` |
| Sista dagen i månad | `LASTDAYOFMONTH(d)` | `EOMONTH(d)` | `(date_trunc('month', d) + interval '1 month - 1 day')::date` |
| Vänster substring | `LEFT(s, n)` | `LEFT(s, n)` | `LEFT(s, n)` (identisk) |
| Median | `MEDIAN(col)` | `PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY col) OVER ()` | `PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY col)` |
| CAST till decimal | `CAST(x AS DOUBLE)` | `CAST(x AS FLOAT)` | `CAST(x AS DOUBLE PRECISION)` |
| UNION ALL | `SQL UNION ALL` (Denodo-specifik) | `UNION ALL` | `UNION ALL` |
| Schema-prefix | `"Schema".vy` | `[Schema].vy` eller `"Schema".vy` (med QUOTED_IDENTIFIER ON) | `schema.vy` (lowercase, inga fnuttar) |
| CREATE VIEW | `CREATE OR REPLACE VIEW` | `CREATE OR ALTER VIEW` (SQL Server 2016+) | `CREATE OR REPLACE VIEW` |

### 3.2 Median — specialfall

Median i T-SQL kräver en annan syntax än Denodo/PostgreSQL:

**Denodo:**
```sql
MEDIAN(vantetid_dagar)
```

**T-SQL (SQL Server):**
```sql
-- I en aggregerad vy med GROUP BY krävs subquery eller window function:
(SELECT DISTINCT PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY vantetid_dagar) OVER ()
 FROM calc_vantetid_genomford WHERE ...)
```

**PostgreSQL:**
```sql
PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY vantetid_dagar)
```

T-SQL-varianten kräver mest omskrivning här — PERCENTILE_CONT i SQL Server är en window function, inte en aggregatfunktion. Varje vy med MEDIAN i GROUP BY behöver anpassas.

### 3.3 Denodo-specifikt som INTE finns i SQL/PG

| VQL-konstruktion | Lösning i T-SQL/PG |
|---|---|
| `CREATE OR REPLACE VIEW` | T-SQL: `CREATE OR ALTER VIEW`. PG: identiskt. |
| `SQL UNION ALL` (Denodo-prefix) | Bara `UNION ALL` i T-SQL/PG. |
| `GETDAYSBETWEEN` | Se tabellen ovan. |
| Databas-prefix `"Schema".vy` | T-SQL: `[dbo].vy` eller schema efter regionens setup. PG: `schema.vy`. |

---

## 4. Uppgifter per paket

### 4.1 vantetid-katarakt — T-SQL-variant

| Nr | Uppgift | Filer | Status |
|----|---------|-------|--------|
| 1.1 | Skapa `tsql/00_kodverk/` — översätt ref_kva_katarakt | 1 fil | ☐ |
| 1.2 | Översätt ref_avvikelsekoder till T-SQL | 1 fil | ☐ |
| 1.3 | Översätt ref_filter_region till T-SQL | 1 fil | ☐ |
| 1.4 | Skapa `tsql/01_basvy/` — src_genomford mall (T-SQL) | 1 fil | ☐ |
| 1.5 | src_vantande mall (T-SQL) | 1 fil | ☐ |
| 1.6 | Skapa `tsql/02_berakning/` — calc_vantetid_genomford | 1 fil | ☐ |
| 1.7 | calc_vantande | 1 fil | ☐ |
| 1.8 | Skapa `tsql/03_resultatvy/` — res_kpi_manad (inkl. MEDIAN-omskrivning) | 1 fil | ☐ |
| 1.9 | res_kpi_per_yrke | 1 fil | ☐ |
| 1.10 | res_kpi_per_kontaktform | 1 fil | ☐ |
| 1.11 | res_kpi_per_bokning | 1 fil | ☐ |
| 1.12 | res_kpi_per_remittent | 1 fil | ☐ |
| 1.13 | res_kpi_per_kommun | 1 fil | ☐ |
| 1.14 | res_genomford_detalj | 1 fil | ☐ |
| 1.15 | res_vantande_detalj | 1 fil | ☐ |
| 1.16 | Skapa `tsql/04_verifiering/` — verif_jamforelse | 1 fil | ☐ |
| 1.17 | Skapa `tsql/05_kvalitet/` — dq_rapport_data | 1 fil | ☐ |
| 1.18 | Skapa `tsql/README.md` med T-SQL-specifika instruktioner | 1 fil | ☐ |
| **TEST** | **Se testplan 5.1** | | |

### 4.2 vantetid-katarakt — PostgreSQL-variant

| Nr | Uppgift | Filer | Status |
|----|---------|-------|--------|
| 2.1–2.17 | Samma 17 vyer som 1.1–1.17 men i PostgreSQL-syntax | 17 filer | ☐ |
| 2.18 | Skapa `pgsql/README.md` med PG-specifika instruktioner | 1 fil | ☐ |
| **TEST** | **Se testplan 5.2** | | |

### 4.3 vantetid-katarakt — Python-variant

| Nr | Uppgift | Filer | Status |
|----|---------|-------|--------|
| 3.1 | Paketera pipeline_runner.py som egen variant (kopiera från POC_KCHD, rensa interna detaljer) | 1 fil | ☐ |
| 3.2 | Verifiera att verifieringssteget (verif_jamforelse-motsvarighet) ingår | — | ☐ |
| 3.3 | Verifiera att DQ-steget (dq_rapport_data-motsvarighet) ingår | — | ☐ |
| 3.4 | Skapa `python/README.md` — instruktioner (kräver Python 3.8+, inga externa beroenden) | 1 fil | ☐ |
| 3.5 | Skapa `python/requirements.txt` (tom eller minimal) | 1 fil | ☐ |
| **TEST** | **Se testplan 5.3** | | |

### 4.4 vantetid-katarakt-fhir — T-SQL-variant

| Nr | Uppgift | Filer | Status |
|----|---------|-------|--------|
| 4.1 | Översätt ref_fhir_system till T-SQL | 1 fil | ☐ |
| 4.2 | Översätt fhir_measure_report till T-SQL (30 SELECT-block) | 1 fil | ☐ |
| 4.3 | Verifiera C# --schema mot SQL Server (`[schema].vy`-syntax) | — | ☐ |
| 4.4 | Uppdatera README med T-SQL-instruktioner | 1 fil | ☐ |
| **TEST** | **Se testplan 5.4** | | |

### 4.5 vantetid-katarakt-fhir — PostgreSQL-variant

| Nr | Uppgift | Filer | Status |
|----|---------|-------|--------|
| 5.1 | Översätt ref_fhir_system till PostgreSQL | 1 fil | ☐ |
| 5.2 | Översätt fhir_measure_report till PostgreSQL | 1 fil | ☐ |
| 5.3 | Verifiera C# --schema mot PostgreSQL (`schema.vy`-syntax) | — | ☐ |
| 5.4 | Uppdatera README med PG-instruktioner | 1 fil | ☐ |
| **TEST** | **Se testplan 5.5** | | |

### 4.6 vantetid-katarakt-fhir-send — Python-variant

| Nr | Uppgift | Filer | Status |
|----|---------|-------|--------|
| 6.1 | Skapa `python/send_fhir.py` — läser JSON, POST till hub API med X-API-Key | 1 fil | ☐ |
| 6.2 | Skapa `python/appsettings.example.json` — konfiguration (API-URL, nyckel, filsökväg) | 1 fil | ☐ |
| 6.3 | Skapa `python/README.md` — instruktioner | 1 fil | ☐ |
| **TEST** | **Se testplan 5.6** | | |

### 4.7 Övergripande

| Nr | Uppgift | Status |
|----|---------|--------|
| 7.1 | Skapa `tests/expected/` i vantetid-katarakt med förväntade resultat (plattformsoberoende) | ☐ |
| 7.2 | Skapa testdata i SQL-format (INSERT INTO) för T-SQL och PG | ☐ |
| 7.3 | Uppdatera katarakt_index.md med alla nya filer | ☐ |
| 7.4 | Uppdatera kchd_vantetider_katarakt_master.md | ☐ |
| 7.5 | Uppdatera kchd_paketdistribution_dokumentation.md med flerplattformsstrategi | ☐ |

---

## 5. Testplan

### Princip

Alla plattformsvarianter ska producera **identiska resultat** givet samma indata. Vi testar genom att köra samma testdata (100 VGR-patienter) genom varje variant och jämföra output mot en gemensam facit.

**Facit:** pipeline_runner.py:s output — redan verifierad och testad. Specifikt:
- steg4_kpi_total.tsv (16 KPI:er per sjukhus)
- steg5_dq.tsv (10 DQ-kontroller)
- steg6_fhir_tabell.tsv (440 FHIR-rader)
- steg7_fhir_bundle.json (12 MeasureReports)

### 5.1 Test: T-SQL beräkning + verifiering + kvalitet

| Test | Vad | Förväntat resultat | Status |
|------|-----|-------------------|--------|
| T1.1 | Ladda testdata i SQL Server (INSERT INTO) | 100 rader | ☐ |
| T1.2 | Skapa alla 17 vyer i ordning (00→01→02→03→04→05) | Inga fel | ☐ |
| T1.3 | `SELECT COUNT(*) FROM calc_vantetid_genomford` | Matchar Python-facit (70 rader) | ☐ |
| T1.4 | `SELECT COUNT(*) FROM calc_vantande` | Matchar Python-facit (30 rader) | ☐ |
| T1.5 | Exportera res_kpi_manad till TSV, jämför mot steg4_kpi_total.tsv | Identiska KPI:er (antal, median, medel, andel, patientresa) | ☐ |
| T1.6 | Exportera dq_rapport_data, jämför mot steg5_dq.tsv | Alla DQ0–DQ3 OK | ☐ |
| T1.7 | Exportera verif_jamforelse | Rimliga värden, samma struktur som VQL-varianten | ☐ |
| T1.8 | Testa med SQL Server 2019 (VGR:s version) | Inga syntaxfel | ☐ |

**Testmiljö:** Docker (`mcr.microsoft.com/mssql/server:2019-latest`) eller Azure SQL.

### 5.2 Test: PostgreSQL beräkning + verifiering + kvalitet

| Test | Vad | Förväntat resultat | Status |
|------|-----|-------------------|--------|
| T2.1 | Ladda testdata i PostgreSQL (INSERT INTO) | 100 rader | ☐ |
| T2.2 | Skapa alla 17 vyer i ordning | Inga fel | ☐ |
| T2.3 | `SELECT COUNT(*) FROM calc_vantetid_genomford` | 70 rader | ☐ |
| T2.4 | `SELECT COUNT(*) FROM calc_vantande` | 30 rader | ☐ |
| T2.5 | Exportera res_kpi_manad, jämför mot facit | Identiska KPI:er | ☐ |
| T2.6 | Exportera dq_rapport_data, jämför mot facit | Alla DQ OK | ☐ |
| T2.7 | Exportera verif_jamforelse | Rimliga värden | ☐ |
| T2.8 | Testa med PostgreSQL 14+ | Inga syntaxfel | ☐ |

**Testmiljö:** Docker (`postgres:14`) eller hubbens Railway-PostgreSQL.

### 5.3 Test: Python-variant

| Test | Vad | Förväntat resultat | Status |
|------|-----|-------------------|--------|
| T3.1 | Kör `python3 pipeline_runner.py testdata.csv resultat/` | "HELA KEDJAN GRÖN" | ☐ |
| T3.2 | Jämför resultat/steg4_kpi_total.tsv mot facit | Identiska | ☐ |
| T3.3 | Jämför resultat/steg5_dq.tsv mot facit | Identiska | ☐ |
| T3.4 | Jämför resultat/steg6_fhir_tabell.tsv mot facit | 440 rader, identiska | ☐ |
| T3.5 | Verifiera att verifierings-steget producerar jämförelsedata | Finns i output | ☐ |
| T3.6 | Testa med Python 3.8, 3.10, 3.12 | Inga fel | ☐ |
| T3.7 | Testa utan externa beroenden (bara standardbiblioteket) | Kör utan pip install | ☐ |

### 5.4 Test: T-SQL FHIR-paket

| Test | Vad | Förväntat resultat | Status |
|------|-----|-------------------|--------|
| T4.1 | Skapa 2 FHIR-vyer i SQL Server (kräver att beräkningsvyer finns) | Inga fel | ☐ |
| T4.2 | `SELECT COUNT(*) FROM fhir_measure_report` | 440 rader | ☐ |
| T4.3 | Exportera fhir_measure_report till TSV | Matchar steg6_fhir_tabell.tsv (kolumnnamn + värden) | ☐ |
| T4.4 | Kör C#-serialiseraren mot TSV:en | 12 MeasureReports, Validering OK | ☐ |
| T4.5 | Kör C#-serialiseraren med `--schema dbo` mot SQL Server via ODBC | 12 MeasureReports | ☐ |
| T4.6 | Jämför JSON-output mot Python-facit (steg7_fhir_bundle.json) | Semantiskt identiskt | ☐ |

### 5.5 Test: PostgreSQL FHIR-paket

| Test | Vad | Förväntat resultat | Status |
|------|-----|-------------------|--------|
| T5.1 | Skapa 2 FHIR-vyer i PostgreSQL | Inga fel | ☐ |
| T5.2 | `SELECT COUNT(*) FROM fhir_measure_report` | 440 rader | ☐ |
| T5.3 | Exportera till TSV, matcha mot facit | Identiskt | ☐ |
| T5.4 | Kör C#-serialiseraren med `--schema public` mot PG via ODBC | 12 MeasureReports | ☐ |
| T5.5 | Jämför JSON mot facit | Semantiskt identiskt | ☐ |

### 5.6 Test: Python sändning

| Test | Vad | Förväntat resultat | Status |
|------|-----|-------------------|--------|
| T6.1 | Kör send_fhir.py med testbundle (1 MeasureReport) mot hubbens API | 200 OK | ☐ |
| T6.2 | Kör med stor bundle (12 MeasureReports) | 200 OK, sparad i landing_zone | ☐ |
| T6.3 | Kör utan API-nyckel | 401 Unauthorized | ☐ |
| T6.4 | Kör med felaktig JSON | 422 Unprocessable Entity | ☐ |
| T6.5 | Verifiera att GET /api/receive/batches visar den nya batchen | Batch synlig | ☐ |
| T6.6 | Testa med Python 3.8+ utan externa beroenden (bara urllib) | Fungerar | ☐ |

### 5.7 Test: Korsvalidering (alla varianter mot samma facit)

| Test | Vad | Förväntat resultat | Status |
|------|-----|-------------------|--------|
| T7.1 | Alla 4 varianter (VQL, T-SQL, PG, Python) → res_kpi_manad | Identiska KPI:er | ☐ |
| T7.2 | Alla 4 → dq_rapport_data | Identiska DQ-resultat | ☐ |
| T7.3 | Alla 4 → fhir_measure_report (440 rader) | Identiska | ☐ |
| T7.4 | Alla 4 → FHIR Bundle JSON (via C# eller Python-serialiserare) | 12 MeasureReports vardera | ☐ |
| T7.5 | Alla 2 sändningsvarianter (SSIS, Python) → hubb-API | 200 OK båda | ☐ |

**T7-testen är avgörande** — de bekräftar att alla varianter är funktionellt identiska.

---

## 6. Prioriteringsordning

| Prio | Uppgifter | Blockerar | Uppskattning |
|------|-----------|-----------|---|
| **1** | T-SQL beräkning + verifiering + kvalitet (1.1–1.18) + test (T1.1–T1.8) | Inget | Största insatsen — 17 vyer, MEDIAN-omskrivning |
| **2** | Python sändning (6.1–6.3) + test (T6.1–T6.6) | Inget | Liten insats — ett script, ~30 rader |
| **3** | T-SQL FHIR-paket (4.1–4.4) + test (T4.1–T4.6) | Kräver prio 1 | Medel — 2 vyer med 30 UNION-block |
| **4** | PostgreSQL beräkning + verifiering + kvalitet (2.1–2.18) + test (T2.1–T2.8) | Inget | Medel — enklare syntax än T-SQL |
| **5** | PostgreSQL FHIR-paket (5.1–5.4) + test (T5.1–T5.5) | Kräver prio 4 | Liten — PG-syntax nära VQL |
| **6** | Python-variant av beräkningspaket (3.1–3.5) + test (T3.1–T3.7) | Inget | Liten — paketera befintlig kod |
| **7** | Korsvalidering (T7.1–T7.5) | Kräver prio 1–6 | Liten — kör tester |
| **8** | Övergripande dokumentation (7.1–7.5) | Kräver prio 1–7 | Medel |

---

## Sammanfattning

| Mått | Antal |
|------|-------|
| Nya filer att skapa | ~45 (17+17 SQL-vyer, 2+2 FHIR-vyer, 3 Python, 4 README) |
| Tester att köra | 43 (T1–T7) |
| Befintlig kod att paketera om | 3 (pipeline_runner.py, test_dq.py, test_fhir.py) |
| Befintlig kod som inte ändras | C#-serialiserare, SSIS-sändning, dq_rapport.html |
