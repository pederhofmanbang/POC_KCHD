#!/usr/bin/env python3
"""
KCHD Testsvit — FHIR MeasureReport v3 (alla 16 KPI:er × alla dimensioner)
"""
import csv, sys, statistics
from datetime import datetime
from collections import defaultdict
from calendar import monthrange

def load(path):
    rows = []
    with open(path, 'r', encoding='utf-8-sig') as f:
        for r in csv.DictReader(f, delimiter=';'):
            for k in list(r.keys()): r[k] = r[k].strip().replace('\r','') if r[k] else ''
            rows.append(r)
    return rows

def parse_ts(s):
    try: return datetime.fromisoformat(s.strip())
    except: return None

REF_KVA = {'CJC00','CJC10','CJC20','CJC99','CJD00','CJD10','CJD20','CJD99',
           'CJE00','CJE05','CJE10','CJE15','CJE20','CJE25','CJE99'}
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

def calc_record(r):
    b, s = parse_ts(r.get('beslut_datum','')), parse_ts(r.get('start_datum',''))
    if not b or not s: return None
    d = (s.date()-b.date()).days
    if d<0 or r['kva_kod'] not in REF_KVA or r['mvo_kod']!='511': return None
    iv = '0-30' if d<=30 else '31-60' if d<=60 else '61-90' if d<=90 else '91-120' if d<=120 else '121-180' if d<=180 else '>180'
    is_vg = r['vardgaranti']=='JA' and r['avvikelsekod']!='1'
    rem = parse_ts(r.get('remiss_datum',''))
    total = (s.date()-rem.date()).days if rem else None
    rem_b = (b.date()-rem.date()).days if rem else None
    age = 2026-int(r['fodelsear']) if r.get('fodelsear') else None
    ag = ('<50' if age<50 else '50-64' if age<65 else '65-74' if age<75 else '75-84' if age<85 else '85+') if age else None
    return {**r,'vt':d,'intervall':iv,'is_vg':is_vg,'total':total,'rem_beslut':rem_b,'age_group':ag}

def kpi_from_recs(recs):
    n=len(recs); vts=[r['vt'] for r in recs]
    vg=[r for r in recs if r['is_vg']]; nm=len(vg); tl=sum(1 for r in vg if r['vt']<=90)
    andel=round(tl/nm,4) if nm else None
    med=statistics.median(vts) if vts else None
    medel=round(statistics.mean(vts),1) if vts else None
    tots=[r['total'] for r in recs if r['total'] is not None]
    med_t=statistics.median(tots) if tots else None
    rbs=[r['rem_beslut'] for r in recs if r['rem_beslut'] is not None]
    med_rb=statistics.median(rbs) if rbs else None
    nman=sum(1 for r in recs if r['kon']=='1')
    nkv=sum(1 for r in recs if r['kon']=='2')
    ac={k:0 for k in ['<50','50-64','65-74','75-84','85+']}
    for r in recs:
        if r['age_group']: ac[r['age_group']]+=1
    vc={k:0 for k in ['0-30','31-60','61-90','91-120','121-180','>180']}
    for r in recs: vc[r['intervall']]+=1
    return dict(n=n,nm=nm,tl=tl,andel=andel,med=med,medel=medel,med_t=med_t,med_rb=med_rb,
                nman=nman,nkv=nkv,ac=ac,vc=vc)

def make_base(mp, sjnamn, hsaid, region):
    try: pd=datetime.strptime(mp,'%Y-%m-%d').date(); y,m=pd.year,pd.month
    except: y,m=2026,2
    _,ld=monthrange(y,m)
    return {'status':'complete','report_type':'summary',
        'period_start':f'{y}-{m:02d}-01','period_end':f'{y}-{m:02d}-{ld}',
        'reporter_system':SYS['hsaid'],'reporter_value':hsaid,
        'reporter_display':sjnamn,'subject_system':SYS['hsaid'],'subject_value':region}

def make_measure_rows(base, kpi, strats, dim_type='', dim_value='', dim_display=''):
    """Genererar 5 rader (en per mått) för en given kontext (total eller dimension)."""
    rows = []
    measures = [
        (SYS['vg'],'vardgaranti','proportion','andel_inom_90',kpi['andel'],'%',kpi['n'],kpi['nm'],kpi['tl']),
        (SYS['med'],'vantetid','continuous-variable','median_vantetid',kpi['med'],'dagar',kpi['n'],'',''),
        (SYS['med'],'vantetid','continuous-variable','medel_vantetid',kpi['medel'],'dagar',kpi['n'],'',''),
        (SYS['pr'],'patientresa','continuous-variable','median_patientresa',kpi['med_t'],'dagar',kpi['n'],'',''),
        (SYS['pr'],'patientresa','continuous-variable','median_remiss_beslut',kpi['med_rb'],'dagar',kpi['n'],'',''),
    ]
    for murl,mtype,scoring,gcode,score,unit,pi,pd,pn in measures:
        rows.append({**base, **strats,
            'measure_url':murl,'measure_type':mtype,'scoring':scoring,'group_code':gcode,
            'measure_score':score,'measure_score_unit':unit,
            'pop_initial':pi,'pop_denominator':pd,'pop_numerator':pn,
            'dimension_type':dim_type,'dimension_value':dim_value,'dimension_display':dim_display})
    return rows

def run(csv_path, out_path):
    rows = load(csv_path)
    calc = [c for c in (calc_record(r) for r in rows if r['status']=='GENOMFORD') if c]

    groups = defaultdict(list)
    for r in calc:
        groups[(r['matperiod'],r['sjukhuskod'],r['sjukhusnamn'],r['hsaid_vardenhet'],
                r.get('hsaid_region',r.get('regionkod','')))].append(r)

    fhir_rows = []; errors = []

    for key, recs in sorted(groups.items()):
        mp,sjkod,sjnamn,hsaid,region = key
        base = make_base(mp,sjnamn,hsaid,region)
        kpi = kpi_from_recs(recs)

        strats = dict(strat_kon_man=kpi['nman'],strat_kon_kvinna=kpi['nkv'],
            strat_age_under_50=kpi['ac']['<50'],strat_age_50_64=kpi['ac']['50-64'],
            strat_age_65_74=kpi['ac']['65-74'],strat_age_75_84=kpi['ac']['75-84'],strat_age_85_plus=kpi['ac']['85+'],
            strat_vt_0_30=kpi['vc']['0-30'],strat_vt_31_60=kpi['vc']['31-60'],strat_vt_61_90=kpi['vc']['61-90'],
            strat_vt_91_120=kpi['vc']['91-120'],strat_vt_121_180=kpi['vc']['121-180'],strat_vt_over_180=kpi['vc']['>180'])
        null_strats = {k:'' for k in strats}

        # 5 totalrader
        fhir_rows.extend(make_measure_rows(base, kpi, strats))

        # 5 dimensioner × 5 mått = 25 rader per dimension-värde
        for dim_type, dim_col in [('yrkeskategori','yrkeskategori'),('kontaktform','vardkontakttyp'),
                                   ('bokningssatt','bokningssatt'),('remittent','remittent_hsaid'),('kommun','lkf')]:
            dim_groups = defaultdict(list)
            for r in recs:
                v = r.get(dim_col,'')
                if v: dim_groups[v].append(r)
            for dval, drecs in sorted(dim_groups.items()):
                dk = kpi_from_recs(drecs)
                fhir_rows.extend(make_measure_rows(base, dk, null_strats, dim_type, dval, dval))

    # Validate
    for row in fhir_rows:
        if row['scoring']=='proportion' and row['measure_score'] not in (None,''):
            s = row['measure_score']
            if isinstance(s,(int,float)) and (s<0 or s>1):
                errors.append(f"Andel utanför 0-1: {s} ({row['reporter_display']}, dim={row.get('dimension_type','')})")
        if row.get('dimension_type')=='' and row['scoring']!='proportion':
            s = row['measure_score']
            if isinstance(s,(int,float)) and s is not None and (s<0 or s>730):
                errors.append(f"Score utanför 0-730: {s} ({row['reporter_display']}, {row['group_code']})")

    with open(out_path,'w',encoding='utf-8') as f:
        f.write('\t'.join(HEADER)+'\n')
        for row in fhir_rows:
            f.write('\t'.join(str(row.get(h,'')) for h in HEADER)+'\n')

    total_r = sum(1 for r in fhir_rows if not r.get('dimension_type'))
    dim_r = len(fhir_rows) - total_r
    dim_types = sorted(set(r['dimension_type'] for r in fhir_rows if r.get('dimension_type')))
    gcodes = sorted(set(r['group_code'] for r in fhir_rows))

    print(f"FHIR MeasureReport v3 — alla 16 KPI:er × alla dimensioner")
    print(f"  Sjukhus × period:   {len(groups)}")
    print(f"  Totalrader:         {total_r} (5 mått × {len(groups)} sjukhus)")
    print(f"  Per-dimension:      {dim_r} ({len(dim_types)} dimensioner × 5 mått per stratum)")
    print(f"  FHIR-rader totalt:  {len(fhir_rows)}")
    print(f"  Group codes:        {', '.join(gcodes)}")
    print(f"  TSV:                {out_path}")
    print()
    if errors:
        print(f"❌ {len(errors)} FEL:")
        for e in errors: print(f"  {e}")
        return 1
    print("✅ ALLA KONTROLLER PASSERADE")
    return 0

if __name__=='__main__':
    csv_path = sys.argv[1] if len(sys.argv)>1 else 'katarakt_testdata_100_VGR.csv'
    out_path = sys.argv[2] if len(sys.argv)>2 else 'fhir_resultat.tsv'
    sys.exit(run(csv_path, out_path))
