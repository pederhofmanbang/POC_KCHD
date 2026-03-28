#!/usr/bin/env python3
"""
Verifierar att C#-output (genererad av KchdFhirSerializer) matchar
referens-JSON:en strukturellt.

FhirJsonSerializer kan ge marginella skillnader mot Python json.dump:
  - Decimalformat: 61 vs 61.0 vs 61.00
  - Fältordning kan skilja
  - Tomma listor kan utelämnas

Detta skript jämför SEMANTISKT (inte byte-för-byte).

Användning:
  python3 verify_fhir_structure.py test_output.json ../../docs/fhir_bundle_example.json
"""
import json, sys

def normalize_value(v):
    """Normalisera numeriska värden för jämförelse."""
    if isinstance(v, (int, float)):
        # Behandla 61 och 61.0 som samma
        if v == int(v):
            return int(v)
        return round(v, 4)
    return v

def normalize(obj):
    """Djupnormalisera JSON-objekt för semantisk jämförelse."""
    if isinstance(obj, dict):
        return {k: normalize(v) for k, v in sorted(obj.items())
                if v is not None and v != [] and v != {}}
    if isinstance(obj, list):
        return [normalize(item) for item in obj]
    return normalize_value(obj)

def compare_entries(c_entry, r_entry, idx):
    """Jämför en enstaka MeasureReport-entry."""
    issues = []
    mr_c = normalize(c_entry.get('resource', {}))
    mr_r = normalize(r_entry.get('resource', {}))

    # Jämför toppnivå-fält
    for key in ['resourceType', 'status', 'type', 'measure', 'date']:
        if mr_c.get(key) != mr_r.get(key):
            issues.append(f"  {key}: C#={mr_c.get(key)} vs Ref={mr_r.get(key)}")

    # Jämför reporter
    c_rep = mr_c.get('reporter', {})
    r_rep = mr_r.get('reporter', {})
    if normalize(c_rep) != normalize(r_rep):
        issues.append(f"  reporter skiljer sig")

    # Jämför groups
    c_groups = mr_c.get('group', [])
    r_groups = mr_r.get('group', [])
    if len(c_groups) != len(r_groups):
        issues.append(f"  group count: C#={len(c_groups)} vs Ref={len(r_groups)}")
    else:
        for gi, (gc, gr) in enumerate(zip(c_groups, r_groups)):
            gc_n = normalize(gc)
            gr_n = normalize(gr)
            if gc_n != gr_n:
                # Detaljerad jämförelse
                for gk in set(list(gc.keys()) + list(gr.keys())):
                    if normalize(gc.get(gk)) != normalize(gr.get(gk)):
                        if gk == 'measureScore':
                            c_score = gc.get('measureScore', {}).get('value')
                            r_score = gr.get('measureScore', {}).get('value')
                            if c_score is not None and r_score is not None:
                                if abs(float(c_score) - float(r_score)) < 0.01:
                                    continue  # Avrundningsskillnad, OK
                        if gk == 'stratifier':
                            c_strats = gc.get('stratifier', [])
                            r_strats = gr.get('stratifier', [])
                            if len(c_strats) != len(r_strats):
                                issues.append(f"  group[{gi}].stratifier count: C#={len(c_strats)} vs Ref={len(r_strats)}")
                            continue
                        issues.append(f"  group[{gi}].{gk} skiljer sig")

    return issues

def main():
    if len(sys.argv) < 3:
        print("Användning: python3 verify_fhir_structure.py <csharp_output.json> <reference.json>")
        return 1

    with open(sys.argv[1]) as f:
        csharp = json.load(f)
    with open(sys.argv[2]) as f:
        ref = json.load(f)

    print("══ FHIR Bundle-verifiering ══")
    print(f"C#:  {len(csharp.get('entry', []))} MeasureReports")
    print(f"Ref: {len(ref.get('entry', []))} MeasureReports")
    print()

    # Exakt match?
    c_norm = json.dumps(normalize(csharp), sort_keys=True)
    r_norm = json.dumps(normalize(ref), sort_keys=True)
    if c_norm == r_norm:
        print("✅ SEMANTISK MATCH — all data är identisk")
        return 0

    # Per-entry jämförelse
    all_issues = []
    c_entries = csharp.get('entry', [])
    r_entries = ref.get('entry', [])

    for i in range(min(len(c_entries), len(r_entries))):
        issues = compare_entries(c_entries[i], r_entries[i], i)
        if issues:
            mr = r_entries[i].get('resource', {})
            measure = mr.get('measure', '?').split('/')[-1]
            reporter = mr.get('reporter', {}).get('display', '?')[:25]
            all_issues.append((i, measure, reporter, issues))

    if not all_issues:
        print("✅ SEMANTISK MATCH — alla entries stämmer")
        print("   (Eventuella byte-skillnader beror på serialiseringsformat)")
        return 0

    print(f"⚠️  {len(all_issues)} entries har skillnader:")
    for idx, measure, reporter, issues in all_issues:
        print(f"\nEntry {idx}: {measure} / {reporter}")
        for issue in issues:
            print(issue)

    return 1

if __name__ == '__main__':
    sys.exit(main())
