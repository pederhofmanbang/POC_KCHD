#!/bin/bash
# KCHD FHIR-serialiserare — Bygg- och testskript
# Kör detta efter att .NET 8 SDK är installerat.
#
# Användning:
#   chmod +x test_csharp.sh
#   ./test_csharp.sh

set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
PROJECT_DIR="$SCRIPT_DIR"
TSV_INPUT="$REPO_ROOT/resultat/steg6_fhir_tabell.tsv"
REFERENCE_JSON="$REPO_ROOT/docs/fhir_bundle_example.json"
OUTPUT_JSON="$PROJECT_DIR/test_output.json"

echo "══════════════════════════════════════════"
echo "KCHD FHIR-serialiserare — Bygg & test"
echo "══════════════════════════════════════════"

# Kontrollera att .NET SDK finns
if ! command -v dotnet &> /dev/null; then
    echo "❌ dotnet hittades inte. Installera .NET 8 SDK först."
    echo "   macOS:   brew install dotnet@8"
    echo "   Windows: winget install Microsoft.DotNet.SDK.8"
    echo "   Linux:   sudo apt-get install dotnet-sdk-8.0"
    exit 1
fi
echo "✅ .NET SDK: $(dotnet --version)"

# Kontrollera att testdata finns
if [ ! -f "$TSV_INPUT" ]; then
    echo "⚠️  steg6_fhir_tabell.tsv saknas — kör pipeline först..."
    cd "$REPO_ROOT"
    python3 python/pipeline_runner.py testdata/katarakt_testdata_100__1__VGR.csv resultat/
    echo ""
fi

# Steg 1: Restore & Build
echo ""
echo "══ STEG 1: dotnet restore + build ══"
cd "$PROJECT_DIR"
dotnet restore
dotnet build --configuration Release --no-restore
echo "✅ Bygge OK"

# Steg 2: Kör serialiseraren
echo ""
echo "══ STEG 2: Kör serialiseraren ══"
dotnet run --configuration Release -- "$TSV_INPUT" -o "$OUTPUT_JSON" -v
echo ""

# Steg 3: Jämför mot referens-JSON
echo "══ STEG 3: Jämför mot referens-JSON ══"
python3 -c "
import json, sys

# Ladda båda
with open('$OUTPUT_JSON') as f:
    csharp = json.load(f)
with open('$REFERENCE_JSON') as f:
    ref = json.load(f)

# Grundkontroller
c_entries = len(csharp.get('entry', []))
r_entries = len(ref.get('entry', []))
print(f'  C# MeasureReports:  {c_entries}')
print(f'  Ref MeasureReports: {r_entries}')

if c_entries != r_entries:
    print(f'❌ Antal MeasureReports skiljer sig: {c_entries} vs {r_entries}')
    sys.exit(1)

# Normalisera och jämför
c_norm = json.dumps(csharp, sort_keys=True, ensure_ascii=False)
r_norm = json.dumps(ref, sort_keys=True, ensure_ascii=False)

if c_norm == r_norm:
    print('✅ EXAKT MATCH — C#-output är identisk med referens-JSON')
    sys.exit(0)

# Om inte exakt match — hitta skillnader
print('⚠️  Inte exakt match — analyserar skillnader...')
diffs = 0
for i, (ce, re) in enumerate(zip(csharp['entry'], ref['entry'])):
    c_s = json.dumps(ce, sort_keys=True)
    r_s = json.dumps(re, sort_keys=True)
    if c_s != r_s:
        diffs += 1
        mr_c = ce.get('resource', {})
        mr_r = re.get('resource', {})
        measure = mr_r.get('measure', '?')
        reporter = mr_r.get('reporter', {}).get('display', '?')
        print(f'  Entry {i}: {measure} / {reporter}')
        for key in sorted(set(list(mr_c.keys()) + list(mr_r.keys()))):
            ck = json.dumps(mr_c.get(key), sort_keys=True)
            rk = json.dumps(mr_r.get(key), sort_keys=True)
            if ck != rk:
                print(f'    ↳ {key} skiljer sig')
                # Visa detalj för group
                if key == 'group' and isinstance(mr_c.get(key), list):
                    for gi, (gc, gr) in enumerate(zip(mr_c[key], mr_r[key])):
                        if json.dumps(gc, sort_keys=True) != json.dumps(gr, sort_keys=True):
                            print(f'      group[{gi}]:')
                            for gk in sorted(set(list(gc.keys()) + list(gr.keys()))):
                                if json.dumps(gc.get(gk), sort_keys=True) != json.dumps(gr.get(gk), sort_keys=True):
                                    print(f'        {gk} skiljer sig')
                                    # Visa första diff-exemplet
                                    if gk == 'measureScore':
                                        print(f'          C#:  {gc.get(gk)}')
                                        print(f'          Ref: {gr.get(gk)}')
        if diffs >= 3:
            print(f'  ... ({diffs} entries skiljer sig totalt)')
            break

print(f'')
print(f'Totalt {diffs} av {c_entries} entries skiljer sig.')
print(f'Om skillnaderna är decimalformatering (61 vs 61.0) är det')
print(f'FhirJsonSerializer vs Pythons json.dump — semantiskt korrekt.')
sys.exit(1 if diffs > 0 else 0)
"

RESULT=$?
echo ""
if [ $RESULT -eq 0 ]; then
    echo "══════════════════════════════════════════"
    echo "✅ ALLA TESTER GRÖNA"
    echo "══════════════════════════════════════════"
else
    echo "══════════════════════════════════════════"
    echo "⚠️  Skillnader hittades — se analys ovan"
    echo "══════════════════════════════════════════"
fi
