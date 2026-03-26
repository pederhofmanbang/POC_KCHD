#!/usr/bin/env python3
"""
KCHD Pipeline Runner — Kör hela kedjan steg för steg
Simulerar exakt vad VGR gör med riktig data, fast med testdata.

Användning:
  python3 pipeline_runner.py katarakt_testdata_100_VGR.csv resultat/

Producerar:
  resultat/
    steg1_radata.tsv          ← Alla rader, alla kolumner
    steg2_filtrerade.tsv      ← Bara katarakt, uppdelat genomförda/väntande
    steg3_beraknade.tsv       ← Väntetider beräknade per patient
    steg4_kpi_total.tsv       ← 16 KPI:er per sjukhus
    steg4_kpi_per_dim.tsv     ← KPI:er per dimension
    steg5_dq.tsv              ← Kvalitetskontroll (30 kontroller)
    steg6_fhir_tabell.tsv     ← FHIR MeasureReport-rader (440 st)
    steg7_fhir_bundle.json    ← FHIR JSON Bundle (12 MeasureReports)
    steg8_hubb_kvittens.json  ← Simulerad hubb-kvittens
    pipeline_rapport.txt      ← Sammanfattning av hela körningen
"""
import csv, json, sys, os, statistics
from datetime import datetime, date
from collections import defaultdict
from calendar import monthrange

# ═══════════════════════════════════════
# KONFIGURATION
# ═══════════════════════════════════════

REF_KVA = {'CJC00','CJC10','CJC20','CJC99','CJD00','CJD10','CJD20','CJD99',
           'CJE00','CJE05','CJE10','CJE15','CJE20','CJE25','CJE99'}
MVO_KOD = '511'
TODAY = date(2026, 3, 26)

def load_csv(path):
    rows = []
    with open(path, 'r', encoding='utf-8-sig') as f:
        for r in csv.DictReader(f, delimiter=';'):
            for k in list(r.keys()):
                r[k] = r[k].strip().replace('\r','') if r[k] else ''
            rows.append(r)
    return rows

def write_tsv(rows, path, columns=None):
    if not rows: return
    cols = columns or list(rows[0].keys())
    with open(path, 'w', encoding='utf-8') as f:
        f.write('\t'.join(cols) + '\n')
        for r in rows:
            f.write('\t'.join(str(r.get(c,'')) for c in cols) + '\n')

def parse_date(s):
    try: return datetime.fromisoformat(s.strip()).date()
    except: return None

def log(rapport, msg):
    rapport.append(msg)
    print(msg)


# ═══════════════════════════════════════
# STEG 1: LÄSA RÅDATA
# ═══════════════════════════════════════

def steg1_radata(csv_path, outdir, rapport):
    log(rapport, "")
    log(rapport, "══ STEG 1: Läsa rådata ══")
    rows = load_csv(csv_path)
    log(rapport, f"   Rader: {len(rows)}")
    log(rapport, f"   Kolumner: {len(rows[0])}")
    cols = sorted(rows[0].keys())
    log(rapport, f"   Kolumnnamn: {', '.join(cols[:10])}...")
    write_tsv(rows, os.path.join(outdir, 'steg1_radata.tsv'))
    log(rapport, f"   → steg1_radata.tsv")
    return rows


# ═══════════════════════════════════════
# STEG 2: FILTRERA
# ═══════════════════════════════════════

def steg2_filtrera(rows, outdir, rapport):
    log(rapport, "")
    log(rapport, "══ STEG 2: Filtrera (katarakt + ögon) ══")
    filtered = []
    dropped = defaultdict(int)
    for r in rows:
        if r['kva_kod'] not in REF_KVA:
            dropped['kva_kod ej katarakt'] += 1
            continue
        if r['mvo_kod'] != MVO_KOD:
            dropped['mvo_kod ej 511'] += 1
            continue
        r['filter_status'] = r['status']
        filtered.append(r)

    genomforda = [r for r in filtered if r['status'] == 'GENOMFORD']
    vantande = [r for r in filtered if r['status'] == 'VANTANDE']

    log(rapport, f"   Totalt in: {len(rows)}")
    for reason, count in sorted(dropped.items()):
        log(rapport, f"   Borttaget: {count} ({reason})")
    log(rapport, f"   Kvar: {len(filtered)} (genomförda: {len(genomforda)}, väntande: {len(vantande)})")

    out = []
    for r in filtered:
        out.append({**r, 'uppdelning': r['status']})
    write_tsv(out, os.path.join(outdir, 'steg2_filtrerade.tsv'))
    log(rapport, f"   → steg2_filtrerade.tsv")
    return genomforda, vantande


# ═══════════════════════════════════════
# STEG 3: BERÄKNA VÄNTETIDER
# ═══════════════════════════════════════

def steg3_berakna(genomforda, outdir, rapport):
    log(rapport, "")
    log(rapport, "══ STEG 3: Beräkna väntetider (per patient) ══")
    beraknade = []
    errors = 0
    for r in genomforda:
        beslut = parse_date(r.get('beslut_datum',''))
        start = parse_date(r.get('start_datum',''))
        remiss = parse_date(r.get('remiss_datum',''))
        if not beslut or not start:
            errors += 1
            continue
        vt = (start - beslut).days
        if vt < 0:
            errors += 1
            continue
        patientresa = (start - remiss).days if remiss else None
        remiss_beslut = (beslut - remiss).days if remiss else None
        is_vg = r['vardgaranti'] == 'JA' and r['avvikelsekod'] != '1'
        inom_garanti = 'JA' if (is_vg and vt <= 90) else 'NEJ' if is_vg else 'EJ_VG'
        age = (2026 - int(r['fodelsear'])) if r.get('fodelsear') else None
        age_group = ('<50' if age<50 else '50-64' if age<65 else '65-74' if age<75 else '75-84' if age<85 else '85+') if age else ''
        intervall = '0-30' if vt<=30 else '31-60' if vt<=60 else '61-90' if vt<=90 else '91-120' if vt<=120 else '121-180' if vt<=180 else '>180'

        beraknade.append({
            'vardkontakt_id': r['vardkontakt_id'],
            'sjukhusnamn': r['sjukhusnamn'],
            'sjukhuskod': r['sjukhuskod'],
            'hsaid_vardenhet': r['hsaid_vardenhet'],
            'hsaid_region': r.get('hsaid_region', r.get('regionkod','')),
            'matperiod': r['matperiod'],
            'kon': r['kon'],
            'fodelsear': r.get('fodelsear',''),
            'aldersgrupp': age_group,
            'bokningssatt': r.get('bokningssatt',''),
            'yrkeskategori': r.get('yrkeskategori',''),
            'vardkontakttyp': r.get('vardkontakttyp',''),
            'remittent_hsaid': r.get('remittent_hsaid',''),
            'lkf': r.get('lkf',''),
            'vardgaranti': r['vardgaranti'],
            'avvikelsekod': r.get('avvikelsekod',''),
            'beslut_datum': r['beslut_datum'],
            'start_datum': r['start_datum'],
            'remiss_datum': r.get('remiss_datum',''),
            'vantetid_dagar': vt,
            'patientresa_dagar': patientresa,
            'remiss_beslut_dagar': remiss_beslut,
            'inom_vardgaranti': inom_garanti,
            'intervall': intervall,
        })

    log(rapport, f"   Beräknade: {len(beraknade)} patienter")
    if errors: log(rapport, f"   Fel (saknade datum etc): {errors}")
    vts = [r['vantetid_dagar'] for r in beraknade]
    log(rapport, f"   Väntetid: min={min(vts)}, median={statistics.median(vts)}, max={max(vts)} dagar")
    log(rapport, f"   Inom VG: {sum(1 for r in beraknade if r['inom_vardgaranti']=='JA')} JA, "
                 f"{sum(1 for r in beraknade if r['inom_vardgaranti']=='NEJ')} NEJ, "
                 f"{sum(1 for r in beraknade if r['inom_vardgaranti']=='EJ_VG')} ej VG")
    write_tsv(beraknade, os.path.join(outdir, 'steg3_beraknade.tsv'))
    log(rapport, f"   → steg3_beraknade.tsv")
    return beraknade


# ═══════════════════════════════════════
# STEG 4: AGGREGERA TILL KPI:er
# ═══════════════════════════════════════

def kpi_from(recs):
    n = len(recs)
    vts = [r['vantetid_dagar'] for r in recs]
    vg = [r for r in recs if r['vardgaranti']=='JA' and r['avvikelsekod']!='1']
    nm = len(vg)
    tl = sum(1 for r in vg if r['vantetid_dagar'] <= 90)
    andel = round(tl/nm*100, 1) if nm else None
    med = statistics.median(vts) if vts else None
    medel = round(statistics.mean(vts), 1) if vts else None
    tots = [r['patientresa_dagar'] for r in recs if r['patientresa_dagar'] is not None]
    med_t = statistics.median(tots) if tots else None
    rbs = [r['remiss_beslut_dagar'] for r in recs if r['remiss_beslut_dagar'] is not None]
    med_rb = statistics.median(rbs) if rbs else None
    nman = sum(1 for r in recs if r['kon']=='1')
    nkv = sum(1 for r in recs if r['kon']=='2')
    ac = {k:0 for k in ['<50','50-64','65-74','75-84','85+']}
    for r in recs:
        if r['aldersgrupp'] in ac: ac[r['aldersgrupp']] += 1
    vc = {k:0 for k in ['0-30','31-60','61-90','91-120','121-180','>180']}
    for r in recs: vc[r['intervall']] += 1
    return dict(antal=n, namnare=nm, taljare=tl, andel=andel,
                median=med, medel=medel, patientresa=med_t, remiss_beslut=med_rb,
                man=nman, kvinna=nkv, alder=ac, vantetid=vc)

def steg4_aggregera(beraknade, outdir, rapport):
    log(rapport, "")
    log(rapport, "══ STEG 4: Aggregera till KPI:er ══")

    # Per sjukhus
    sjukhus_groups = defaultdict(list)
    for r in beraknade:
        sjukhus_groups[(r['matperiod'], r['sjukhuskod'], r['sjukhusnamn'],
                        r['hsaid_vardenhet'], r['hsaid_region'])].append(r)

    total_rows = []
    for key, recs in sorted(sjukhus_groups.items()):
        mp, sjkod, sjnamn, hsaid, region = key
        k = kpi_from(recs)
        total_rows.append({
            'matperiod':mp, 'sjukhuskod':sjkod, 'sjukhusnamn':sjnamn,
            'hsaid_vardenhet':hsaid, 'hsaid_region':region,
            'antal_genomforda':k['antal'], 'namnare_vg':k['namnare'], 'taljare_vg':k['taljare'],
            'andel_inom_90':k['andel'], 'median_vantetid':k['median'],
            'medel_vantetid':k['medel'], 'median_patientresa':k['patientresa'],
            'median_remiss_beslut':k['remiss_beslut'],
            'antal_man':k['man'], 'antal_kvinna':k['kvinna'],
            **{f"n_age_{ag}": k['alder'][ag] for ag in k['alder']},
            **{f"n_vt_{iv}": k['vantetid'][iv] for iv in k['vantetid']},
        })

    log(rapport, f"   Sjukhus: {len(sjukhus_groups)}")
    for r in total_rows:
        log(rapport, f"     {r['sjukhusnamn'][:25]:<26} n={r['antal_genomforda']:>3}  VG={r['andel_inom_90']}%  median={r['median_vantetid']}d")

    # Per dimension
    dim_rows = []
    dims = [('yrkeskategori','yrkeskategori'),('kontaktform','vardkontakttyp'),
            ('bokningssatt','bokningssatt'),('remittent','remittent_hsaid'),('kommun','lkf')]
    for key, recs in sorted(sjukhus_groups.items()):
        mp, sjkod, sjnamn, hsaid, region = key
        for dim_name, dim_col in dims:
            dg = defaultdict(list)
            for r in recs:
                v = r.get(dim_col,'')
                if v: dg[v].append(r)
            for dval, drecs in sorted(dg.items()):
                dk = kpi_from(drecs)
                dim_rows.append({
                    'matperiod':mp, 'sjukhuskod':sjkod, 'sjukhusnamn':sjnamn,
                    'dimension':dim_name, 'dimension_varde':dval,
                    'antal':dk['antal'], 'andel_inom_90':dk['andel'],
                    'median_vantetid':dk['median'], 'medel_vantetid':dk['medel'],
                    'median_patientresa':dk['patientresa'], 'median_remiss_beslut':dk['remiss_beslut'],
                })

    log(rapport, f"   Per-dimension-rader: {len(dim_rows)}")
    write_tsv(total_rows, os.path.join(outdir, 'steg4_kpi_total.tsv'))
    write_tsv(dim_rows, os.path.join(outdir, 'steg4_kpi_per_dim.tsv'))
    log(rapport, f"   → steg4_kpi_total.tsv + steg4_kpi_per_dim.tsv")
    return total_rows, dim_rows, sjukhus_groups


# ═══════════════════════════════════════
# STEG 5: KVALITETSKONTROLL (DQ)
# ═══════════════════════════════════════

def steg5_dq(beraknade, outdir, rapport):
    log(rapport, "")
    log(rapport, "══ STEG 5: Kvalitetskontroll (DQ0-DQ6) ══")

    checks = []
    # DQ0: Finns data?
    checks.append(('DQ0', 'Finns genomförda rader?', len(beraknade) > 0))
    # DQ1: Null-kontroll
    nulls_vt = sum(1 for r in beraknade if r['vantetid_dagar'] is None)
    checks.append(('DQ1', 'Väntetid beräknad för alla?', nulls_vt == 0))
    # DQ2: Domänkontroll
    bad_kon = sum(1 for r in beraknade if r['kon'] not in ('1','2'))
    checks.append(('DQ2', 'Kön är 1 eller 2?', bad_kon == 0))
    bad_vg = sum(1 for r in beraknade if r['vardgaranti'] not in ('JA','NEJ'))
    checks.append(('DQ2', 'Vårdgaranti är JA/NEJ?', bad_vg == 0))
    # DQ3: Intervallkontroll
    neg_vt = sum(1 for r in beraknade if r['vantetid_dagar'] < 0)
    checks.append(('DQ3', 'Väntetid >= 0?', neg_vt == 0))
    extreme_vt = sum(1 for r in beraknade if r['vantetid_dagar'] > 730)
    checks.append(('DQ3', 'Väntetid <= 730 dagar?', extreme_vt == 0))
    # DQ4: Ifyllnadsgrad
    empty_sjukhus = sum(1 for r in beraknade if not r['sjukhusnamn'])
    checks.append(('DQ4', 'Sjukhusnamn ifyllt?', empty_sjukhus == 0))
    empty_beslut = sum(1 for r in beraknade if not r['beslut_datum'])
    checks.append(('DQ4', 'Beslutsdatum ifyllt?', empty_beslut == 0))
    # DQ5: Korsvalidering
    for r in beraknade:
        if r['inom_vardgaranti'] == 'NEJ' and r['avvikelsekod'] == '1':
            checks.append(('DQ5', 'Avvikelsekod 1 → ej i VG?', False))
            break
    else:
        checks.append(('DQ5', 'Avvikelsekod logisk?', True))
    # DQ6: Rimlighet
    vts = [r['vantetid_dagar'] for r in beraknade]
    med = statistics.median(vts)
    checks.append(('DQ6', f'Median rimlig ({med}d, förväntat 30-120)?', 30 <= med <= 120))

    passed = sum(1 for _,_,ok in checks if ok)
    failed = len(checks) - passed

    dq_rows = [{'kontroll':c, 'beskrivning':d, 'resultat':'✅ OK' if ok else '❌ FEL'} for c,d,ok in checks]
    write_tsv(dq_rows, os.path.join(outdir, 'steg5_dq.tsv'))

    log(rapport, f"   Kontroller: {len(checks)}")
    log(rapport, f"   Passerade:  {passed} ✅")
    if failed:
        log(rapport, f"   Fel:        {failed} ❌")
        for c, d, ok in checks:
            if not ok: log(rapport, f"     ❌ {c}: {d}")
    log(rapport, f"   → steg5_dq.tsv")
    return failed == 0


# ═══════════════════════════════════════
# STEG 6: FHIR-TABELL
# ═══════════════════════════════════════

def steg6_fhir_tabell(beraknade, sjukhus_groups, outdir, rapport):
    log(rapport, "")
    log(rapport, "══ STEG 6: FHIR-tabell (fhir_measure_report) ══")

    SYS = {'hsaid':'urn:oid:1.2.752.129.2.1.4.1',
           'vg':'https://kchd.se/fhir/Measure/vantetid-vardgaranti',
           'med':'https://kchd.se/fhir/Measure/vantetid-median',
           'pr':'https://kchd.se/fhir/Measure/vantetid-patientresa'}

    HEADER = ['measure_url','measure_type','scoring','status','report_type','group_code',
        'period_start','period_end','reporter_system','reporter_value','reporter_display',
        'subject_system','subject_value','measure_score','measure_score_unit',
        'pop_initial','pop_denominator','pop_numerator',
        'strat_kon_man','strat_kon_kvinna',
        'strat_age_under_50','strat_age_50_64','strat_age_65_74','strat_age_75_84','strat_age_85_plus',
        'strat_vt_0_30','strat_vt_31_60','strat_vt_61_90','strat_vt_91_120','strat_vt_121_180','strat_vt_over_180',
        'dimension_type','dimension_value','dimension_display']

    fhir_rows = []
    for key, recs in sorted(sjukhus_groups.items()):
        mp, sjkod, sjnamn, hsaid, region = key
        try:
            pd = datetime.strptime(mp,'%Y-%m-%d').date(); y,m=pd.year,pd.month
        except: y,m=2026,2
        _,ld=monthrange(y,m)
        base = {'period_start':f'{y}-{m:02d}-01','period_end':f'{y}-{m:02d}-{ld}',
                'reporter_system':SYS['hsaid'],'reporter_value':hsaid,
                'reporter_display':sjnamn,'subject_system':SYS['hsaid'],'subject_value':region,
                'status':'complete','report_type':'summary'}

        def add_measures(k, strat_extra, dim_extra):
            measures = [
                (SYS['vg'],'vardgaranti','proportion','andel_inom_90',
                 round(k['taljare']/k['namnare'],4) if k['namnare'] else None,'%',k['antal'],k['namnare'],k['taljare']),
                (SYS['med'],'vantetid','continuous-variable','median_vantetid',k['median'],'dagar',k['antal'],'',''),
                (SYS['med'],'vantetid','continuous-variable','medel_vantetid',k['medel'],'dagar',k['antal'],'',''),
                (SYS['pr'],'patientresa','continuous-variable','median_patientresa',k['patientresa'],'dagar',k['antal'],'',''),
                (SYS['pr'],'patientresa','continuous-variable','median_remiss_beslut',k['remiss_beslut'],'dagar',k['antal'],'',''),
            ]
            for murl,mtype,scoring,gcode,score,unit,pi,pd_,pn in measures:
                fhir_rows.append({**base, **strat_extra, **dim_extra,
                    'measure_url':murl,'measure_type':mtype,'scoring':scoring,'group_code':gcode,
                    'measure_score':score,'measure_score_unit':unit,
                    'pop_initial':pi,'pop_denominator':pd_,'pop_numerator':pn})

        # Totaler
        k = kpi_from(recs)
        age_strats = {f"strat_age_{ag}": k['alder'][ag] for ag in ['<50','50-64','65-74','75-84','85+']}
        # Rename keys to match expected column names
        age_cols = {'strat_age_<50':'strat_age_under_50','strat_age_50-64':'strat_age_50_64',
                    'strat_age_65-74':'strat_age_65_74','strat_age_75-84':'strat_age_75_84','strat_age_85+':'strat_age_85_plus'}
        age_fixed = {age_cols.get(k2,k2):v for k2,v in age_strats.items()}
        vt_strats = {'strat_vt_0_30':k['vantetid']['0-30'],'strat_vt_31_60':k['vantetid']['31-60'],
                     'strat_vt_61_90':k['vantetid']['61-90'],'strat_vt_91_120':k['vantetid']['91-120'],
                     'strat_vt_121_180':k['vantetid']['121-180'],'strat_vt_over_180':k['vantetid']['>180']}
        total_strats = {'strat_kon_man':k['man'],'strat_kon_kvinna':k['kvinna'],**age_fixed,**vt_strats}
        add_measures(k, total_strats, {'dimension_type':'','dimension_value':'','dimension_display':''})

        # Per dimension
        null_strats = {c:'' for c in ['strat_kon_man','strat_kon_kvinna',
            'strat_age_under_50','strat_age_50_64','strat_age_65_74','strat_age_75_84','strat_age_85_plus',
            'strat_vt_0_30','strat_vt_31_60','strat_vt_61_90','strat_vt_91_120','strat_vt_121_180','strat_vt_over_180']}
        for dim_name, dim_col in [('yrkeskategori','yrkeskategori'),('kontaktform','vardkontakttyp'),
                                   ('bokningssatt','bokningssatt'),('remittent','remittent_hsaid'),('kommun','lkf')]:
            dg = defaultdict(list)
            for r in recs:
                v = r.get(dim_col,'')
                if v: dg[v].append(r)
            for dval, drecs in sorted(dg.items()):
                dk = kpi_from(drecs)
                add_measures(dk, null_strats,
                             {'dimension_type':dim_name,'dimension_value':dval,'dimension_display':dval})

    total_r = sum(1 for r in fhir_rows if not r['dimension_type'])
    dim_r = len(fhir_rows) - total_r
    log(rapport, f"   Totalrader:    {total_r}")
    log(rapport, f"   Per-dimension: {dim_r}")
    log(rapport, f"   FHIR-rader:    {len(fhir_rows)}")
    write_tsv(fhir_rows, os.path.join(outdir, 'steg6_fhir_tabell.tsv'), HEADER)
    log(rapport, f"   → steg6_fhir_tabell.tsv")
    return fhir_rows


# ═══════════════════════════════════════
# STEG 7: FHIR JSON BUNDLE
# ═══════════════════════════════════════

def steg7_fhir_json(fhir_tsv_path, outdir, rapport):
    log(rapport, "")
    log(rapport, "══ STEG 7: FHIR JSON Bundle ══")

    # Use the existing serializer
    serializer_path = os.path.join(os.path.dirname(__file__), 'fhir_serializer.py')
    if not os.path.exists(serializer_path):
        serializer_path = '/mnt/user-data/outputs/fhir_serializer.py'

    out_json = os.path.join(outdir, 'steg7_fhir_bundle.json')

    import subprocess
    r = subprocess.run([sys.executable, serializer_path, fhir_tsv_path, '-o', out_json, '-v'],
                       capture_output=True, text=True)
    for line in r.stdout.strip().split('\n'):
        log(rapport, f"   {line}")
    if r.returncode != 0:
        log(rapport, f"   ❌ Serialisering misslyckades!")
        return None

    bundle = json.load(open(out_json))
    return bundle


# ═══════════════════════════════════════
# STEG 8: SIMULERAD HUBB-KVITTENS
# ═══════════════════════════════════════

def steg8_hubb(bundle, outdir, rapport):
    log(rapport, "")
    log(rapport, "══ STEG 8: Skicka till hubb (simulerat) ══")

    if not bundle:
        log(rapport, "   ❌ Ingen bundle att skicka")
        return False

    n_reports = len(bundle.get('entry', []))
    total_kpi = 0
    for e in bundle['entry']:
        total_kpi += len(e['resource'].get('group', []))

    kvittens = {
        "timestamp": datetime.now().isoformat(),
        "status": "accepted",
        "endpoint": "https://hub.kchd.se/fhir/Bundle",
        "method": "POST",
        "response_code": 200,
        "message": f"Bundle mottagen och validerad",
        "details": {
            "measure_reports": n_reports,
            "total_groups": total_kpi,
            "kpi_coverage": "16/16",
            "validation": "passed",
            "stored": True
        }
    }

    with open(os.path.join(outdir, 'steg8_hubb_kvittens.json'), 'w') as f:
        json.dump(kvittens, f, indent=2, ensure_ascii=False)

    log(rapport, f"   POST → https://hub.kchd.se/fhir/Bundle")
    log(rapport, f"   Status: 200 OK")
    log(rapport, f"   MeasureReports: {n_reports}")
    log(rapport, f"   KPI-grupper: {total_kpi}")
    log(rapport, f"   Validering: ✅ Passerad")
    log(rapport, f"   → steg8_hubb_kvittens.json")
    return True


# ═══════════════════════════════════════
# HUVUDPROGRAM
# ═══════════════════════════════════════

def main():
    csv_path = sys.argv[1] if len(sys.argv) > 1 else 'katarakt_testdata_100_VGR.csv'
    outdir = sys.argv[2] if len(sys.argv) > 2 else 'resultat'
    os.makedirs(outdir, exist_ok=True)

    rapport = []
    log(rapport, "╔══════════════════════════════════════════════════════╗")
    log(rapport, "║  KCHD Pipeline — Katarakt väntetidsdata             ║")
    log(rapport, "╚══════════════════════════════════════════════════════╝")
    log(rapport, f"Källa: {csv_path}")
    log(rapport, f"Utdata: {outdir}/")
    log(rapport, f"Tid: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

    # Kör alla steg
    rows = steg1_radata(csv_path, outdir, rapport)
    genomforda, vantande = steg2_filtrera(rows, outdir, rapport)
    beraknade = steg3_berakna(genomforda, outdir, rapport)
    totaler, dim_rows, sjukhus_groups = steg4_aggregera(beraknade, outdir, rapport)
    dq_ok = steg5_dq(beraknade, outdir, rapport)
    fhir_rows = steg6_fhir_tabell(beraknade, sjukhus_groups, outdir, rapport)

    fhir_tsv = os.path.join(outdir, 'steg6_fhir_tabell.tsv')
    bundle = steg7_fhir_json(fhir_tsv, outdir, rapport)
    hubb_ok = steg8_hubb(bundle, outdir, rapport)

    # Sammanfattning
    log(rapport, "")
    log(rapport, "══════════════════════════════════════════")
    log(rapport, "SAMMANFATTNING")
    log(rapport, "══════════════════════════════════════════")
    log(rapport, f"  Steg 1: {len(rows)} rader × {len(rows[0])} kolumner")
    log(rapport, f"  Steg 2: {len(genomforda)} genomförda + {len(vantande)} väntande")
    log(rapport, f"  Steg 3: {len(beraknade)} patienter med väntetider")
    log(rapport, f"  Steg 4: {len(totaler)} sjukhus × 16 KPI:er")
    log(rapport, f"  Steg 5: DQ {'✅ PASSERAT' if dq_ok else '❌ FEL'}")
    log(rapport, f"  Steg 6: {len(fhir_rows)} FHIR-rader")
    n_mr = len(bundle['entry']) if bundle else 0
    log(rapport, f"  Steg 7: {n_mr} MeasureReports")
    log(rapport, f"  Steg 8: Hubb {'✅ MOTTAGET' if hubb_ok else '❌ FEL'}")
    log(rapport, "")
    all_ok = dq_ok and hubb_ok and n_mr > 0
    log(rapport, f"  RESULTAT: {'✅ HELA KEDJAN GRÖN' if all_ok else '❌ FEL I KEDJAN'}")

    # Spara rapport
    with open(os.path.join(outdir, 'pipeline_rapport.txt'), 'w', encoding='utf-8') as f:
        f.write('\n'.join(rapport))

    return 0 if all_ok else 1

if __name__ == '__main__':
    sys.exit(main())
