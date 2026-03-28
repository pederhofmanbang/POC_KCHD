# SKR:s väntetidsstatistik — fullständig kartläggning och analys

Nationell väntetidsstatistik presenteras idag via **17 statistiksidor** på SKR:s webbplats vantetider.se/extra.skr.se, kompletterat av **5 undersidor** hos Socialstyrelsen som delvis bygger på samma datakälla men med viktiga skillnader. Statistiken täcker primärvård, specialiserad vård, BUP, akutmottagningar, överbeläggningar och ledig kapacitet — men **upp till 9 av 21 regioner** saknas i riksberäkningarna på grund av pågående journalsystemsbyten, vilket gör att den nationella bilden under 2025–2026 är ofullständig. Hela insamlingsansvaret överförs från SKR till Socialstyrelsen, med parallellrapportering fram till mars 2026. Detta innebär att väntetidsdata befinner sig i en historisk övergångsfas — direkt relevant för KCHD:s arbete med vårddatahubben, där väntetidsdata är ett av de fem POC-användningsfallen.

---

## 1. Webbplatsens arkitektur och samtliga statistiksidor

SKR:s väntetidswebb finns på **extra.skr.se/vantetiderivarden** (domänen vantetider.se pekar till samma innehåll). Webbplatsen har fem huvudsektioner: *Väntetidsstatistik*, *Om väntetider*, *Rapportering och verktyg*, *För privatpersoner* och *Kontakt*. Under Väntetidsstatistik finns **17 statistiksidor** organiserade i fem kategorier. Det äldre "Kontaktkort"-gränssnittet (`vantetider.se/Kontaktkort/{Region}/{Sektion}`) är i stort sett avvecklat och returnerar 404.

**Primärvård (4 sidor):**

| Sida | URL-suffix | Huvudmått | Mätmetod |
|------|-----------|-----------|----------|
| Telefoni- och chattillgänglighet (ny) | telefoniochchattillganglighet.84210 | Andel besvarade samma dag (telefon) / inom 24 h (chatt) | Genomförda |
| Telefontillgänglighet | telefontillganglighet.54387 | Andel patienter med kontakt samma dag | Genomförda |
| Medicinsk bedömning | medicinskbedomning.54389 | Andel inom 3 dagar | Genomförda |
| Första linjen barn och unga | forstalinjenbarnochungamedpsykiskohalsa.54348 | Väntetid till psykisk ohälsa-insats, barn/unga | Genomförda |

**Specialiserad vård (6 sidor):**

| Sida | URL-suffix | Huvudmått | Mätmetod |
|------|-----------|-----------|----------|
| Utökad uppföljning specialiserad vård | utokaduppfoljningavspecialiseradvard.43536 | Andel inom 90 dagar, antal väntande, medianväntetid | Väntande + Genomförda |
| Uppskattad väntetid och ledig kapacitet | uppskattadvantetidochledigkapacitet.54353 | Skattad väntetid, ledig kapacitet (ja/nej) | Skattad av vårdgivare |
| Medel- och medianväntetid | medelochmedianvantetid.73770 | Medel/median baserat på automatisk data | Genomförda |
| Återbesök specialiserad vård | aterbesokispecialiseradvard.54397 | Andel inom medicinskt måldatum | Genomförda |
| Utskrivningsklara patienter | utskrivningsklarapatienter.54395 | Dagar/1 000 inv 65+ | Genomförda |
| Bild- och funktionsmedicin + neurofysiologi | bildochfunktionsmedicinsamtkliniskneurofysiologi.54420 | Medianväntetid per undersökningstyp (MR, DT, UL m.fl.) | Genomförda |

**BUP, akut och slutenvård (3 sidor):**

| Sida | URL-suffix | Huvudmått | Mätmetod |
|------|-----------|-----------|----------|
| Barn- och ungdomspsykiatri (BUP) | barnochungdomspsykiatribup.54393 | Andel inom 30 dagar (första bedömning + utredning/behandling) | Väntande (ögonblicksbild) |
| Akutmottagning | akutmottagning.54391 | Andel bedömda inom 1 h, andel med vistelsetid ≤4 h | Genomförda |
| Överbeläggningar och utlokaliseringar | overbelaggningarochutlokaliseradepatienter.54399 | Per 100 disponibla vårdplatser | Daglig rapportering |

**Övergripande vyer (2 sidor):**

| Sida | URL-suffix | Huvudmått | Visualisering |
|------|-----------|-----------|--------------|
| Aktuellt vårdgarantiläge | aktuelltvardgarantilage.46227 | Alla vårdgarantimått samlat | **Spindeldiagram** |
| Tillgänglighet över tid | tillganglighetovertid.44513 | Historisk måluppfyllelse sedan 2014/2019 | Tidsseriegrafer |

---

## 2. Utökad uppföljningsmodell — den mest detaljerade statistikvyn

Den centrala statistiksidan för KCHD:s ändamål är **"Utökad uppföljning av specialiserad vård"**, införd januari 2021 baserat på statens och SKR:s överenskommelse 2020. Denna modell ersatte den äldre, enklare uppföljningen och ger en väsentligt rikare bild av tillgängligheten.

**KPI:er som presenteras:**
Måluppfyllelse (andel inom **90 dagar**), antal väntande (ögonblicksbild sista dagen i månaden), antal genomförda kontakter, medel- och medianväntetid för genomförda, samt fördelning per tidsintervall (0–30, 31–60, 61–90, 91–120, 121–180, 181–365, 366+ dagar). Svarsfrekvens för rapporteringen visas också.

**Nedbrytningsdimensioner/filter:**
Kontaktstatus (väntande/genomförd), kontakttyp (första kontakt, operation/åtgärd, undersökning), **region** (alla 21), **sjukhus**, **klinik**, enskild vårdgivare (offentlig/privat), **specialitet/MVO**, **kontaktform** (mottagningsbesök, hembesök, telefonkontakt, digitalt besök), **vårdutbud/aktivitet**, **yrkeskategori** (läkare/annan legitimerad personal), **kön** och **åldersgrupp**. Från april 2023 tillkom ytterligare urvalsmöjligheter.

**Visualiseringar:** Två huvudvyer — en **13-månaders tidsseriegraf** och en **enmånadsjämförelse** (indikator per variabel för valda regioner/sjukhus). Interaktiva diagram renderas med JavaScript, vilket innebär att datavärden inte kan hämtas via enkel sidladdning utan kräver webbläsarinteraktion. Minimiunderlaget är **20 kontakter** — vid färre visas ingen statistik.

**Avvikelsehantering:** Patienter med **PvV exkluderas** från måluppfyllelseberäkningarna. MoV kan exkluderas vid redovisning av väntande. Åldersdata har känd kvalitetsbrist: "Statistiken för ålder kan vara missvisande — vissa regioner har skickat all sin data inom en åldersgrupp."

---

## 3. Vårdgarantiläget — spindeldiagrammet och dess beståndsdelar

Startsidan och sidan "Aktuellt vårdgarantiläge" visar ett **spindeldiagram (radardiagram)** med fem dimensioner som sammanfattar hela vårdgarantin:

1. **Kontakt med primärvården samma dag** (0 dagar) — mäts via telefontillgänglighet, genomförda kontakter
2. **Medicinsk bedömning inom 3 dagar** — genomförda kontakter i primärvården
3. **Första besök specialiserad vård inom 90 dagar** — väntande patienter
4. **Operation/åtgärd inom 90 dagar** — väntande patienter
5. **BUP inom 30 dagar** — väntande patienter (förstärkt vårdgaranti)

Spindeldiagrammet kan filtreras per enskild region jämfört med riksgenomsnittet. Primärvårdsmåtten baseras på **genomförda** kontakter medan specialiserad vård och BUP baseras på **väntande** — en viktig metodskillnad som påverkar tolkningen. Primärvårdsdata rapporteras av vissa regioner månadsvis, andra halvårsvis. Tidsserien för specialiserad vård börjar januari 2021.

---

## 4. Avvikelsekoder — PvV, MoV, SoV och VoV

Väntetidsdatabasen använder **fyra avvikelsekoder** som är avgörande för hur statistiken beräknas och tolkas:

**PvV (Patientvald väntan)** är den vanligaste avvikelsen. Den registreras när patienten erbjudits tid inom vårdgarantin men aktivt tackat nej — exempelvis för att träffa en viss läkare. Förutsättningar: vårdgivaren måste ha erbjudit datum och klockslag med god framförhållning, patienten måste ha informerats om vårdgarantin. Enbart ombokning eller uteblivet svar räknas **inte** som PvV. Kapacitetsbrist kan aldrig registreras som PvV. PvV-patienter **exkluderas** konsekvent från måluppfyllelseberäkningar på vantetider.se.

**MoV (Medicinskt orsakad väntan)** registreras när patientens hälsotillstånd förhindrar planerad vård — akut sjukdom, bakomliggande allvarlig diagnos, eller behandlingar i omgångar. Förberedande provtagning och kapacitetsbrist är däremot aldrig MoV. MoV förekommer **inte** i primärvårdens vårdgarantimätning. MoV kan exkluderas vid redovisning av väntande, eftersom dessa patienter inte är aktivt väntande.

**SoV (Särskilt orsakad väntan)** används **enbart inom BUP** och avser sociala situationer: familjekonflikt, förälders motstånd, behov av specifik behandlingsmiljö (skolmiljö), väntan på gruppbehandling med rätt sammansättning, eller att patienten behöver lång motivationsperiod. Regioner som tekniskt inte kan registrera SoV registrerar istället MoV.

**VoV (Verksamhetsorsakad väntan)** är en fjärde kod som används **enbart inom SVF-cancer** och enbart för lokal uppföljning — den rapporteras inte nationellt. VoV avser resursbrist, sjukdom hos personal, bristande rutiner och liknande.

**Hur detta påverkar statistikvyerna:** SKR:s standardpresentation exkluderar PvV från måluppfyllelse. Socialstyrelsen inkluderar PvV och MoV i **vissa** figurer, vilket kan ge en annorlunda bild av samma grunddata. Denna skillnad är en återkommande källa till förvirring vid jämförelser mellan SKR:s och Socialstyrelsens presentationer.

---

## 5. Flödesmodellen — 7 processteg och 7 mätpunkter

Hela väntetidsmätningen bygger på SKR:s **flödesmodell**, utvecklad sedan slutet av 1990-talet. Modellen definierar patientens väg genom vården i sju processteg (1–7) och sju mätpunkter (A–G):

**Mätpunkt A** = Beslut att framställa vårdbegäran → **B** = Vårdbegäran inkommen → **C** = Ställningstagande till vårdbegäran → **D** = Beslut att utföra aktivitet → **E** = Start av aktivitet → **F** = Beslut om avslut → **G** = Avslut av vårdåtagande.

Vårdgarantin mäts så här: **Förstabesök** = A till E (≤90 dagar). **Operation/åtgärd** = D till E (≤90 dagar). **Medicinsk bedömning primärvård** = inom 3 dagar. Denna modell är det tekniska fundament som all väntetidsdata vilar på och som definierar vilka datapunkter regionernas vårdinformationssystem måste leverera.

---

## 6. Jämförelse med Socialstyrelsens statistik — vad finns var?

Socialstyrelsen publicerar väntetidsstatistik via sin "Lägesbild" (uppdaterad 2:a torsdagen varje månad kl. 16:00) fördelat på fem undersidor. För primärvård, specialiserad vård och BUP är **datakällan identisk** — SKR:s väntetidsdatabas. Men det finns väsentliga skillnader i vad som presenteras och hur.

**Statistik som bara finns hos Socialstyrelsen:**

Socialstyrelsens **akutmottagningsstatistik** bygger på en helt **oberoende datakälla** — Patientregistret — och erbjuder individbaserad väntetidsdata med **median och 90:e percentil** för total vistelsetid och tid till läkarbedömning, per sjukhus, kön och ålder. SKR:s akutmottagningssida visar bara aggregerade andelar (inom 1 timme/4 timmar) och vissa regioner rapporterar inte alls. Socialstyrelsen har dessutom en interaktiv **statistikdatabas** (sdb.socialstyrelsen.se/if_avt_manad/) med data från 2016. **Utomlänsvård** — andel patienter som vårdats utanför hemregionen — finns enbart hos Socialstyrelsen och bygger på Patientregistret. Socialstyrelsen publicerar också en **integrerad lägesbild** som sammanväger akut, primärvård, specialiserad vård och BUP i en gemensam månatlig presentation.

**Statistik som bara finns hos SKR/vantetider.se:**

SKR erbjuder väsentligt **finare nedbrytning** för specialiserad vård: ner till klinik- och enskild vårdgivarnivå med filter för vårdutbud, yrkeskategori, kontaktform och specialitet. **Uppskattad väntetid och ledig kapacitet** — manuellt skattade uppgifter per enhet — finns enbart på SKR. Detsamma gäller **medel- och medianväntetid** baserat på automatiskt rapporterade data, **återbesök inom medicinskt måldatum**, **bild- och funktionsmedicin** (MR, DT, UL med specifika medianväntetider) samt den detaljerade **historiska tidsserien** tillbaka till 2014.

**Metodskillnad vid PvV/MoV:** Socialstyrelsen inkluderar PvV och MoV i vissa figurer, medan SKR:s standardpresentation konsekvent exkluderar PvV. Samma grunddata kan därför ge olika siffror beroende på källa.

---

## 7. Datakvalitetsproblem — nio regioner faller bort

Det mest akuta datakvalitetsproblemet i mars 2026 är att **upp till 9 regioner** har tagits bort ur Socialstyrelsens riksberäkningar på grund av pågående byten av vårdinformationssystem. Samtliga ingår i **SUSSA-samverkan** (Örebro, Norrbotten, Gävleborg, Dalarna, Sörmland, Västernorrland, Blekinge, Halland, Västerbotten) och byter till journalsystemet **Cosmic** (Cambio). Systembyten har genomförts etappvis under 2024–2025:

- **Region Örebro** (september 2024): relativt smärtfritt men rapporteringsproblem uppstod
- **Region Norrbotten** (november 2024): problem med manuell överföring, privata vårdcentraler påverkades
- **Region Västernorrland** (februari 2025): "enorm tröghet i systemet"
- **Region Dalarna**: uppskjutet införande pga. brister i produktionsmiljön
- **Halland, Gävleborg, Västerbotten**: missade statliga kökortningsmiljoner (~15 Mkr) eftersom pålitlig data inte kunde levereras

**Västra Götalandsregionen (VGR)** och Millennium-systemet (Oracle/Cerner) är ett separat datakvalitetsproblem. Millennium infördes 12 november 2024 i södra VGR men **pausades efter tre dagars drift** den 20 november 2024. Planerad öppenvård minskade med **50 % (13 000 färre besök)** under november, och regionfullmäktige beslutade 17 februari 2026 att inte återuppta Millennium. VGR har kunnat fortsätta rapportera via sitt gamla system, men händelsen illustrerar riskerna vid systembyten. Region Skåne har skjutit upp sitt Millennium-införande till hösten 2026.

**Övriga kvalitetsproblem:** BUP-åldersdata är missvisande i vissa regioner. Organisatoriska skillnader — exempelvis vad som klassas som "första linjen" vs. specialiserad BUP — påverkar jämförbarheten. Data före januari 2021 är **inte jämförbar** med nyare data pga. modellbytet. Stockholm saknar utskrivningsklara-data efter oktober 2022.

Med nio av 21 regioner borttagna representerar den visade nationella statistiken en **begränsad andel av Sveriges befolkning** — en kritisk begränsning för alla analyser baserade på rikssiffror.

---

## 8. Övergången till Socialstyrelsen och SVF-data — vad som väntar

Sedan 1 juli 2025 ska regioner rapportera till **Socialstyrelsen** istället för SKR, enligt ändring i hälso- och sjukvårdsförordningen (2017:80). Parallellrapportering pågår fram till mars 2026. Socialstyrelsen samlar in data via **sex delregister**: (1) tillgänglighet till första kontakt i primärvård, (2) genomförda kontakter primärvård, (3) genomförda kontakter specialiserad vård, (4) väntande kontakter specialiserad vård, (5) ledtider inom SVF cancer, och (6) uppgifter om vårdplatser i slutenvård (nytt från februari 2026).

**SVF-cancerdata** (Standardiserade vårdförlopp) mäts separat från mätpunkt "beslut om välgrundad misstanke" till behandlingsstart, med diagnosspecifika ledtider. Det finns idag ca **31 SVF**. Nationellt mål: 70 % inklusion och 80 % inom angiven ledtid. SVF-statistik redovisas på **cancercentrum.se**, inte på vantetider.se, trots att data finns i samma nationella databas. SVF-data ingår nu i Socialstyrelsens insamling som ett eget delregister.

Insamlingens infrastruktur går från SKR:s rapporteringsverktyg **Signe** och analysverktyg **QlikView** till Socialstyrelsens portal. Dataflödet idag: vårdinformationssystem → regionens datalager → nationella väntetidsdatabasen → vantetider.se. I den regiongemensamma **vårddatahubben** (med fem delprojekt SP1–SP5) är planen att regionernas datalager struktureras enligt nationella specifikationer och kopplas samman. Väntetidsdata är ett av de prioriterade användningsfallen.

---

## Slutsats — vad detta innebär för vårddatahubben

Den nationella väntetidsstatistiken vilar på ett **moget men fragmenterat** system. Styrkan är att det finns **ca 40 miljoner kontakter/år** (20M primärvård, 20M specialiserad vård) i databasen med rik dimensionalitet — ner till klinik-, specialist- och yrkeskategorinivå. Svagheterna är tre. **För det första:** övergången från SKR till Socialstyrelsen skapar en osäkerhetsperiod där dubbelrapportering, olika metodval (PvV/MoV-hantering) och nya system (Filip) riskerar datakvalitetsbrott. **För det andra:** SUSSA-regionernas systembyten och VGR:s Millennium-kollaps innebär att nästan hälften av regionerna har haft perioder utan tillförlitlig data. **För det tredje:** akutmottagningsdata ligger i en helt separat datakälla (Patientregistret) utan koppling till väntetidsdatabasen, SVF-data presenteras på en annan webbplats (cancercentrum.se), och flera statistikvyer använder JavaScript-renderade visualiseringar som försvårar programmatisk dataåtkomst.

För KCHD:s POC med väntetidsdata innebär detta att hubben bör stödja **alla sex delregister** i Socialstyrelsens nya insamlingsmodell, hantera de tre avvikelsekoderna (PvV/MoV/SoV) med tydlig dokumentation av inklusion/exklusion, samt etablera kvalitetsflaggor för regioner under systembyten. Den verkliga nyttan ligger i att integrera de idag separata dataströmmarna — väntetidsdatabasen, Patientregistret (akut), SVF-registret — i en sammanhållen bild som varken SKR eller Socialstyrelsen idag erbjuder.