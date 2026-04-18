# KCHD POC — masterdokument

Katalog över alla masterdokument i KCHD:s interna arbetsmiljö (`POC_KCHD/docs/`). Dessa dokument följer med varje POC-session och uppdateras fortlöpande.

Det auktoritativa dokumentet är **`katarakt_index.md`** — metadokumentet som håller koll på alla andra. Vid osäkerhet, läs det först.

---

## Läsordning för en ny Claude-session

Om du är en ny Claude-session som precis fått dessa filer uppladdade: läs i denna ordning för att få rätt kontext snabbast:

1. **`katarakt_index.md`** — får överblick, status, designbeslut, öppna punkter
2. **`kchd_faktabas_research.md`** — får rätt ram för KCHD:s roll och mandat
3. **`kchd_vantetider_katarakt_master.md`** — får beräkningslogiken
4. Därefter: de dokument som är relevanta för sessionens uppgift

---

## Katarakt-POC:ens interna masterdokument

| Fil | Beskrivning |
|-----|-------------|
| `katarakt_index.md` | **Metadokumentet.** Alla filer, designbeslut (D1–D39), öppna punkter (U1–U33), vylista, roadmap, sessionssammanfattningar. Uppdateras varje session. |
| `kchd_vantetider_katarakt_master.md` | Beräkningslogik (v1.2.0). Urvalskriterier, formler, verifieringsmetod, QlikView-analys, gap-analys, kända serialiseringsfel (sektion 7). |
| `kchd_plattformsvarianter_plan.md` | Plan för T-SQL + PostgreSQL + Python-varianter av alla paket. 45 filer, 43 tester, prioriteringsordning. |
| `fhir_mappning_analys.md` | FHIR-mappning: bekräftade element, designbeslut, diskussionslogg. |
| `fhir_mappningsregister.md` | Alla URI:er, KPI-täckning, luckor, sökkällor. |
| `fhir_serializer_spec.md` | C#-projektspec: kolumnkontrakt, pseudokod, NuGet, SSIS-integration. Den tekniska fixen för serialiseringsbuggen (U31) dokumenteras här. |
| `prompt_fhir_mappning.md` | Återanvändbar prompt för FHIR-mappning till nya vårdutbud. |
| `kchd_paketdistribution_dokumentation.md` | Paketdistribution: repostruktur, branch-modell, versionshantering, regionspårning. |

## Bredare KCHD-kontext — masterdokument att ha med

| Fil | Beskrivning |
|-----|-------------|
| `kchd_faktabas_research.md` | **Kritisk kontextfil.** KCHD:s organisation (NAG, NSG HD), bakgrundsprojektets fem delprojekt, arbetspaket A–D, KCHD:s mandat, samverkansparter, EHDS-kontext, begrepp. Ska läsas av varje ny session. |
| `varddatastrategi_rar_beslutsunderlag.docx` | RAR:s beslutsunderlag om vårddatastrategi (2026-02-10). |
| `kchd_uppfoljning_rar_beslutsunderlag_v1_1.docx` | KCHD:s uppföljning av RAR-dokumentet (v1.1 med korrigerad KCHD/NAG/DiN-kontext). |

---

## Dokument som finns i andra mappar

| Fil | Placering | Syfte |
|-----|-----------|-------|
| `plan_katarakt_fas2.jsx` | `POC_KCHD/demo/` | Fasplan 0–4, principer, vylista, FHIR-arkitektur, audit |
| `kchd_poc_rackvidd.pptx` | `POC_KCHD/demo/` | Cirkel-visualisering av POC:ens räckvidd |
| `kchd_vitalis_slides.pptx` | `POC_KCHD/demo/` | Vitalis-slides |
| `fhir_decoder.py` | `POC_KCHD/python/tools/` | Dekoder för buggig FHIR-output (U31-tillfällig lösning) |
| `fhir_decoder_README.md` | `POC_KCHD/python/tools/` | Användarinstruktion till dekodern |

---

## Distribuerade paket — separata repon

Följande ligger **inte** här utan i separata kchd-se-repon. De är vad regionerna prenumererar på. Detaljer i `kchd_paketdistribution_dokumentation.md`.

| Repo | Innehåll |
|------|----------|
| `kchd-se/vantetid-katarakt` | Beräkningspaket (VQL i dag; T-SQL, PG, Python i framtiden enligt plattformsvariantsplanen) |
| `kchd-se/vantetid-katarakt-fhir` | FHIR-transform-paket + C#-serialiserare |
| `kchd-se/vantetid-katarakt-fhir-send` | SSIS-paket för sändning till hubben |

---

## Underhåll

När en POC-session avslutas är det sessionens ansvar att:

1. Uppdatera `katarakt_index.md` med nya designbeslut, öppna punkter och sessionssammanfattning.
2. Uppdatera berörda masterdokument (främst 4.1-listan ovan).
3. Uppdatera denna `README.md` om listan av dokument har förändrats (nya tillkommit, gamla arkiverats).
4. Commit:a ändringarna till `POC_KCHD/docs/` så att nästa session hittar rätt version.

---

*Senast uppdaterad: 2026-04-18*
