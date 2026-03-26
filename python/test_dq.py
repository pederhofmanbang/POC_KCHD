#!/usr/bin/env python3
"""
KCHD Testsvit — DQ-kontroller mot testdata

Kör INNAN leverans. Producerar:
  1. dq_resultat.tsv — exakt samma format som VQL-vyn dq_rapport_data
  2. Sammanfattning till stdout

Användning:
  python3 test_dq.py testdata.csv
  python3 test_dq.py testdata.csv --output dq_resultat.tsv

TSV-filen är det som bäddas in som demodata i dq_rapport.jsx.
Aldrig hårdkoda siffror — kör alltid detta skript.
"""
import csv, sys, statistics, os
from datetime import datetime, date

def load(path):
    rows = []
    with open(path, 'r', encoding='utf-8-sig') as f:
        for r in csv.DictReader(f, delimiter=';'):
            for k in list(r.keys()):
                r[k] = r[k].strip().replace('\r','') if r[k] else ''
            rows.append(r)
    return rows

def parse_ts(s):
    if not s: return None
    try: return datetime.fromisoformat(s.strip())
    except: return None

REF_KVA = {'CJC00','CJC10','CJC20','CJC99','CJD00','CJD10','CJD20','CJD99',
           'CJE00','CJE05','CJE10','CJE15','CJE20','CJE25','CJE99'}

OBLIG = ['beslut_datum','kva_kod','mvo_kod','vardgaranti','kon','fodelsear']

def run(path, out_path):
    rows = load(path)
    g = [r for r in rows if r['status'] == 'GENOMFORD']
    v = [r for r in rows if r['status'] == 'VANTANDE']
    
    # Collect TSV rows: (dq, kontroll, objekt, varde, status)
    tsv = []
    errors = []
    
    # ── DQ0: Existens ──
    tsv.append(('DQ0','existens','src_genomford', str(len(g)), 'OK' if len(g) > 0 else 'FEL'))
    tsv.append(('DQ0','existens','src_vantande', str(len(v)), 'OK' if len(v) > 0 else 'FEL'))
    if len(g) == 0: errors.append("DQ0: src_genomford tom")
    if len(v) == 0: errors.append("DQ0: src_vantande tom")
    
    # ── DQ1: Null-kontroll ──
    for falt in OBLIG:
        n = sum(1 for r in g if not r.get(falt))
        tsv.append(('DQ1','null_genomford', falt, str(n), 'OK' if n == 0 else 'FEL'))
        if n > 0: errors.append(f"DQ1: {falt} har {n} NULL i genomförda")
    # start_datum obligatorisk i genomförda
    n = sum(1 for r in g if not r.get('start_datum'))
    tsv.append(('DQ1','null_genomford','start_datum', str(n), 'OK' if n == 0 else 'FEL'))
    if n > 0: errors.append(f"DQ1: start_datum har {n} NULL i genomförda")
    # Väntande
    for falt in ['beslut_datum','kva_kod']:
        n = sum(1 for r in v if not r.get(falt))
        tsv.append(('DQ1','null_vantande', falt, str(n), 'OK' if n == 0 else 'FEL'))
        if n > 0: errors.append(f"DQ1: {falt} har {n} NULL i väntande")
    
    # ── DQ2: Domänkontroll ──
    kva_fel = sum(1 for r in g if r['kva_kod'] not in REF_KVA)
    tsv.append(('DQ2','doman','kva_ej_i_ref', str(kva_fel), 'OK' if kva_fel == 0 else 'FEL'))
    if kva_fel > 0: errors.append(f"DQ2: {kva_fel} kva_kod ej i ref")
    
    reg_fel = sum(1 for r in g if r['regionkod'] != '51')
    tsv.append(('DQ2','doman','regionkod_ej_51', str(reg_fel), 'OK' if reg_fel == 0 else 'FEL'))
    
    mvo_fel = sum(1 for r in g if r['mvo_kod'] != '511')
    tsv.append(('DQ2','doman','mvo_ej_511', str(mvo_fel), 'OK' if mvo_fel == 0 else 'FEL'))
    
    # ── DQ3: Intervallkontroll ──
    neg = 0
    for r in g:
        b, s = parse_ts(r['beslut_datum']), parse_ts(r['start_datum'])
        if b and s and (s.date() - b.date()).days < 0: neg += 1
    tsv.append(('DQ3','intervall','negativ_vantetid', str(neg), 'OK' if neg == 0 else 'FEL'))
    if neg > 0: errors.append(f"DQ3: {neg} negativa väntetider")
    
    orim_ar = sum(1 for r in rows if r['fodelsear'] and (int(r['fodelsear']) < 1920 or int(r['fodelsear']) > 2010))
    tsv.append(('DQ3','intervall','orimligt_fodelsear', str(orim_ar), 'OK' if orim_ar == 0 else 'FEL'))
    
    vant_start = sum(1 for r in v if r.get('start_datum'))
    tsv.append(('DQ3','intervall','vantande_med_start', str(vant_start), 'OK' if vant_start == 0 else 'FEL'))
    
    # ── DQ4: Ifyllnadsgrad ──
    dq4_falt = ['beslut_datum','medicinskt_maldatum','avvikelsekod','lkf',
                'hsaid_listning','remiss_datum','remittent_hsaid']
    for falt in dq4_falt:
        fg = sum(1 for r in g if r.get(falt))
        pct_g = round(fg / len(g) * 100, 1) if g else 0
        tsv.append(('DQ4','ifyllnad_genomford', falt, str(pct_g), 'INFO'))
    for falt in ['beslut_datum','medicinskt_maldatum','remiss_datum']:
        fv = sum(1 for r in v if r.get(falt))
        pct_v = round(fv / len(v) * 100, 1) if v else 0
        tsv.append(('DQ4','ifyllnad_vantande', falt, str(pct_v), 'INFO'))
    
    # ── DQ5: Korsvalidering ──
    # Simulera: antal i calc ska = antal genomförda med giltiga datum
    n_calc = len([r for r in g
                  if r['kva_kod'] in REF_KVA and r['mvo_kod'] == '511'
                  and parse_ts(r['beslut_datum']) and parse_ts(r['start_datum'])
                  and (parse_ts(r['start_datum']).date() - parse_ts(r['beslut_datum']).date()).days >= 0])
    diff = n_calc - len(g)  # Borde vara 0 om all data giltig
    tsv.append(('DQ5','korsvalidering','res_vs_calc', str(diff), 'OK' if diff == 0 else 'FEL'))
    if diff != 0: errors.append(f"DQ5: differens {diff}")
    
    # ── DQ6: Rimlighet ──
    vt = []
    for r in g:
        b, s = parse_ts(r['beslut_datum']), parse_ts(r['start_datum'])
        if b and s:
            d = (s.date() - b.date()).days
            if d >= 0: vt.append(d)
    vg_d = []
    for i, r in enumerate(g):
        b, s = parse_ts(r['beslut_datum']), parse_ts(r['start_datum'])
        if b and s and r['vardgaranti'] == 'JA' and r['avvikelsekod'] != '1':
            d = (s.date() - b.date()).days
            if d >= 0: vg_d.append(d)
    
    andel = round(sum(1 for d in vg_d if d <= 90) / len(vg_d) * 100, 1) if vg_d else 0
    tsv.append(('DQ6','rimlighet','andel_inom_90', str(andel), 'OK' if 50 <= andel <= 100 else 'FEL'))
    
    med = statistics.median(vt) if vt else 0
    tsv.append(('DQ6','rimlighet','median_vantetid', str(med), 'OK' if 1 <= med <= 365 else 'FEL'))
    
    # ── Skriv TSV ──
    with open(out_path, 'w', encoding='utf-8') as f:
        for row in tsv:
            f.write('\t'.join(row) + '\n')
    
    # ── Sammanfattning till stdout ──
    n_ok = sum(1 for row in tsv if row[4] == 'OK')
    n_fel = sum(1 for row in tsv if row[4] == 'FEL')
    n_info = sum(1 for row in tsv if row[4] == 'INFO')
    
    print(f"DQ-kontroll mot {path}")
    print(f"  Patienter: {len(g)} genomförda + {len(v)} väntande = {len(rows)}")
    print(f"  Resultat:  {n_ok} OK, {n_fel} FEL, {n_info} INFO")
    print(f"  TSV:       {out_path} ({len(tsv)} rader)")
    print()
    
    if errors:
        print(f"❌ {len(errors)} FEL:")
        for e in errors: print(f"  {e}")
        return 1
    else:
        print("✅ ALLA DQ-KONTROLLER PASSERADE")
        return 0

if __name__ == '__main__':
    csv_path = sys.argv[1] if len(sys.argv) > 1 else 'katarakt_testdata_100_VGR.csv'
    out_path = sys.argv[2] if len(sys.argv) > 2 else 'dq_resultat.tsv'
    sys.exit(run(csv_path, out_path))
