#!/usr/bin/env python3
"""
KCHD FHIR-serialiserare — Referensimplementation
Läser fhir_measure_report (TSV/CSV) och producerar FHIR R4 Bundle JSON.

Detta är referensimplementationen som bekräftar korrekt FHIR-output.
VGR:s C#/SSIS-implementation ska producera identisk JSON.

Användning:
  python3 fhir_serializer.py fhir_resultat.tsv --output bundle.json
  python3 fhir_serializer.py fhir_resultat.tsv --validate
"""
import csv, json, sys, argparse
from collections import defaultdict

def safe_float(v):
    try: return float(v)
    except: return None

def safe_int(v):
    try: return int(float(v))
    except: return None

def make_score(val_str, unit):
    v = safe_float(val_str)
    if v is None: return None
    if unit == '%':
        return {"value": round(v * 100, 1), "unit": "%",
                "system": "http://unitsofmeasure.org", "code": "%"}
    return {"value": v, "unit": "dagar",
            "system": "http://unitsofmeasure.org", "code": "d"}

def make_pop(code, count_str):
    c = safe_int(count_str)
    if c is None: return None
    return {"code": {"coding": [{"system": "http://terminology.hl7.org/CodeSystem/measure-population",
                                  "code": code}]}, "count": c}

def build_bundle(rows, report_date="2026-03-26"):
    """Bygger FHIR R4 Bundle från fhir_measure_report-rader."""
    reports = defaultdict(lambda: {'totals': [], 'dimensions': defaultdict(list)})
    for r in rows:
        key = (r['measure_url'], r['period_start'], r['period_end'], r['reporter_value'])
        if r.get('dimension_type'):
            reports[key]['dimensions'][r['dimension_type']].append(r)
        else:
            reports[key]['totals'].append(r)

    bundle = {"resourceType": "Bundle", "type": "collection", "entry": []}

    for key, data in sorted(reports.items()):
        murl, pstart, pend, reporter_val = key
        totals = data['totals']
        dims = data['dimensions']
        if not totals:
            continue
        first = totals[0]

        mr = {
            "resourceType": "MeasureReport",
            "status": "complete",
            "type": "summary",
            "measure": murl,
            "subject": {"identifier": {"system": first['subject_system'],
                                        "value": first['subject_value']}},
            "date": report_date,
            "reporter": {"identifier": {"system": first['reporter_system'],
                                         "value": first['reporter_value']},
                          "display": first['reporter_display']},
            "period": {"start": pstart, "end": pend},
            "group": []
        }

        if first['scoring'] == 'proportion':
            mr["improvementNotation"] = {
                "coding": [{"system": "http://terminology.hl7.org/CodeSystem/measure-improvement-notation",
                            "code": "increase"}]}

        # Groups from total rows
        for t in totals:
            group = {"code": {"coding": [{"code": t['group_code']}]}}
            pops = [p for p in [make_pop("initial-population", t['pop_initial']),
                                 make_pop("denominator", t['pop_denominator']),
                                 make_pop("numerator", t['pop_numerator'])] if p]
            if pops:
                group["population"] = pops
            s = make_score(t['measure_score'], t['measure_score_unit'])
            if s:
                group["measureScore"] = s

            stratifiers = []

            # Kön
            m, k = safe_int(t.get('strat_kon_man', '')), safe_int(t.get('strat_kon_kvinna', ''))
            if m is not None and k is not None:
                stratifiers.append({
                    "code": [{"coding": [{"code": "kon"}]}],
                    "stratum": [
                        {"value": {"coding": [{"code": "1", "display": "Man"}]},
                         "population": [make_pop("initial-population", m)]},
                        {"value": {"coding": [{"code": "2", "display": "Kvinna"}]},
                         "population": [make_pop("initial-population", k)]}
                    ]})

            # Åldersgrupp
            age_strata = []
            for col, lbl in [('strat_age_under_50', '<50'), ('strat_age_50_64', '50-64'),
                             ('strat_age_65_74', '65-74'), ('strat_age_75_84', '75-84'),
                             ('strat_age_85_plus', '85+')]:
                v = safe_int(t.get(col, ''))
                if v is not None:
                    age_strata.append({"value": {"coding": [{"code": lbl}]},
                                       "population": [make_pop("initial-population", v)]})
            if age_strata:
                stratifiers.append({"code": [{"coding": [{"code": "aldersgrupp"}]}],
                                     "stratum": age_strata})

            # Väntetidsintervall
            vt_strata = []
            for col, lbl in [('strat_vt_0_30', '0-30'), ('strat_vt_31_60', '31-60'),
                             ('strat_vt_61_90', '61-90'), ('strat_vt_91_120', '91-120'),
                             ('strat_vt_121_180', '121-180'), ('strat_vt_over_180', '>180')]:
                v = safe_int(t.get(col, ''))
                if v is not None:
                    vt_strata.append({"value": {"coding": [{"code": lbl}]},
                                      "population": [make_pop("initial-population", v)]})
            if vt_strata:
                stratifiers.append({"code": [{"coding": [{"code": "vantetidsintervall"}]}],
                                     "stratum": vt_strata})

            if stratifiers:
                group["stratifier"] = stratifiers
            mr["group"].append(group)

        # Per-dimension stratifiers → first group
        for dim_type, dim_rows in sorted(dims.items()):
            strata = []
            for dr in sorted(dim_rows, key=lambda x: x['dimension_value']):
                stratum = {"value": {"coding": [{"code": dr['dimension_value']}]}}
                pops = [p for p in [make_pop("initial-population", dr['pop_initial']),
                                     make_pop("denominator", dr['pop_denominator']),
                                     make_pop("numerator", dr['pop_numerator'])] if p]
                if pops:
                    stratum["population"] = pops
                s = make_score(dr['measure_score'], dr['measure_score_unit'])
                if s:
                    stratum["measureScore"] = s
                strata.append(stratum)
            if strata and mr["group"]:
                tgt = mr["group"][0]
                if "stratifier" not in tgt:
                    tgt["stratifier"] = []
                tgt["stratifier"].append({
                    "code": [{"coding": [{"code": dim_type}]}],
                    "stratum": strata})

        bundle["entry"].append({"resource": mr})

    return bundle


def validate_bundle(bundle):
    """Grundläggande validering av FHIR-bundlen."""
    errors = []
    for i, entry in enumerate(bundle.get('entry', [])):
        mr = entry.get('resource', {})
        if mr.get('resourceType') != 'MeasureReport':
            errors.append(f"Entry {i}: resourceType != MeasureReport")
        if mr.get('status') != 'complete':
            errors.append(f"Entry {i}: status != complete")
        if mr.get('type') != 'summary':
            errors.append(f"Entry {i}: type != summary")
        if not mr.get('measure'):
            errors.append(f"Entry {i}: measure saknas")
        if not mr.get('period', {}).get('start'):
            errors.append(f"Entry {i}: period.start saknas")
        if not mr.get('reporter', {}).get('identifier', {}).get('value'):
            errors.append(f"Entry {i}: reporter.identifier.value saknas")
        for j, g in enumerate(mr.get('group', [])):
            if not g.get('code', {}).get('coding'):
                errors.append(f"Entry {i} group {j}: code saknas")
        # Proportion: score 0-100
        if 'vardgaranti' in mr.get('measure', ''):
            for g in mr.get('group', []):
                sv = g.get('measureScore', {}).get('value')
                if sv is not None and (sv < 0 or sv > 100):
                    errors.append(f"Entry {i}: measureScore {sv} utanför 0-100%")
    return errors


def main():
    parser = argparse.ArgumentParser(description='KCHD FHIR-serialiserare')
    parser.add_argument('input', help='TSV/CSV från fhir_measure_report')
    parser.add_argument('--output', '-o', default='fhir_bundle.json', help='Output JSON')
    parser.add_argument('--validate', '-v', action='store_true', help='Validera output')
    parser.add_argument('--date', '-d', default='2026-03-26', help='Rapportdatum')
    args = parser.parse_args()

    # Detect separator
    with open(args.input, 'r', encoding='utf-8-sig') as f:
        first_line = f.readline()
    sep = '\t' if '\t' in first_line else ';' if ';' in first_line else ','

    with open(args.input, 'r', encoding='utf-8-sig') as f:
        rows = list(csv.DictReader(f, delimiter=sep))

    bundle = build_bundle(rows, args.date)

    with open(args.output, 'w', encoding='utf-8') as f:
        json.dump(bundle, f, indent=2, ensure_ascii=False)

    n = len(bundle['entry'])
    sz = len(json.dumps(bundle, ensure_ascii=False))
    print(f"FHIR Bundle: {n} MeasureReports, {sz:,} tecken")

    if args.validate:
        errs = validate_bundle(bundle)
        if errs:
            print(f"❌ {len(errs)} valideringsfel:")
            for e in errs:
                print(f"  {e}")
            return 1
        else:
            print("✅ Validering OK")
    return 0


if __name__ == '__main__':
    sys.exit(main())
PYEOF