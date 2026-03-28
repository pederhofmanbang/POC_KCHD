using System;
using System.Collections.Generic;
using System.Linq;
using Hl7.Fhir.Model;

namespace KchdFhirSerializer;

/// <summary>
/// Bygger FHIR R4 MeasureReport-resurser från fhir_measure_report-rader.
/// Använder Hl7.Fhir.R4 (Firely SDK) modellklasser.
/// Matchar python/fhir_serializer.py exakt.
/// </summary>
public static class MeasureReportBuilder
{
    private static decimal? SafeDecimal(string? v)
    {
        if (string.IsNullOrWhiteSpace(v)) return null;
        return decimal.TryParse(v, System.Globalization.CultureInfo.InvariantCulture, out var d) ? d : null;
    }

    private static int? SafeInt(string? v)
    {
        if (string.IsNullOrWhiteSpace(v)) return null;
        var d = SafeDecimal(v);
        return d.HasValue ? (int)d.Value : null;
    }

    private static string Get(Dictionary<string, string> row, string key)
        => row.TryGetValue(key, out var v) ? v : "";

    /// <summary>Bygger FHIR R4 Bundle från fhir_measure_report-rader.</summary>
    public static Bundle BuildBundle(List<Dictionary<string, string>> rows, string reportDate = "2026-03-26")
    {
        // Gruppera per (measure_url, period_start, period_end, reporter_value)
        var reports = new Dictionary<string, (
            List<Dictionary<string, string>> totals,
            Dictionary<string, List<Dictionary<string, string>>> dimensions)>();

        foreach (var r in rows)
        {
            var key = $"{Get(r, "measure_url")}|{Get(r, "period_start")}|{Get(r, "period_end")}|{Get(r, "reporter_value")}";

            if (!reports.ContainsKey(key))
                reports[key] = (new(), new());

            var dimType = Get(r, "dimension_type");
            if (!string.IsNullOrWhiteSpace(dimType))
            {
                if (!reports[key].dimensions.ContainsKey(dimType))
                    reports[key].dimensions[dimType] = new();
                reports[key].dimensions[dimType].Add(r);
            }
            else
            {
                reports[key].totals.Add(r);
            }
        }

        var bundle = new Bundle { Type = Bundle.BundleType.Collection };

        // Sortera nycklar (matchar Pythons sorted())
        foreach (var key in reports.Keys.OrderBy(k => k))
        {
            var (totals, dims) = reports[key];
            if (totals.Count == 0) continue;

            var first = totals[0];

            var mr = new MeasureReport
            {
                Status = MeasureReport.MeasureReportStatus.Complete,
                Type = MeasureReport.MeasureReportType.Summary,
                Measure = Get(first, "measure_url"),
                Subject = new ResourceReference
                {
                    Identifier = new Identifier(
                        Get(first, "subject_system"),
                        Get(first, "subject_value"))
                },
                Date = reportDate,
                Reporter = new ResourceReference
                {
                    Identifier = new Identifier(
                        Get(first, "reporter_system"),
                        Get(first, "reporter_value")),
                    Display = Get(first, "reporter_display")
                },
                Period = new Period
                {
                    Start = Get(first, "period_start"),
                    End = Get(first, "period_end")
                }
            };

            // improvementNotation för proportion
            if (Get(first, "scoring") == "proportion")
            {
                mr.ImprovementNotation = new CodeableConcept(
                    "http://terminology.hl7.org/CodeSystem/measure-improvement-notation",
                    "increase");
            }

            // Groups från totalrader
            foreach (var t in totals)
            {
                var fhirGroup = new MeasureReport.GroupComponent
                {
                    Code = new CodeableConcept
                    {
                        Coding = { new Coding { Code = Get(t, "group_code") } }
                    }
                };

                // Populations
                var popInit = SafeInt(Get(t, "pop_initial"));
                if (popInit.HasValue)
                    fhirGroup.Population.Add(MakePop("initial-population", popInit.Value));
                var popDenom = SafeInt(Get(t, "pop_denominator"));
                if (popDenom.HasValue)
                    fhirGroup.Population.Add(MakePop("denominator", popDenom.Value));
                var popNum = SafeInt(Get(t, "pop_numerator"));
                if (popNum.HasValue)
                    fhirGroup.Population.Add(MakePop("numerator", popNum.Value));

                // MeasureScore
                fhirGroup.MeasureScore = MakeScore(Get(t, "measure_score"), Get(t, "measure_score_unit"));

                // Inbäddade stratifiers (kön, ålder, väntetidsintervall)
                fhirGroup.Stratifier.AddRange(BuildInlineStratifiers(t));

                mr.Group.Add(fhirGroup);
            }

            // Per-dimension stratifiers → group[0]
            foreach (var dimType in dims.Keys.OrderBy(k => k))
            {
                var stratifier = BuildDimensionStratifier(dimType, dims[dimType]);
                mr.Group[0].Stratifier.Add(stratifier);
            }

            bundle.Entry.Add(new Bundle.EntryComponent { Resource = mr });
        }

        return bundle;
    }

    /// <summary>Bygger kön-, ålders- och väntetidsstratifiers från en totalrad.</summary>
    private static List<MeasureReport.StratifierComponent> BuildInlineStratifiers(Dictionary<string, string> t)
    {
        var stratifiers = new List<MeasureReport.StratifierComponent>();

        // Kön
        var man = SafeInt(Get(t, "strat_kon_man"));
        var kvinna = SafeInt(Get(t, "strat_kon_kvinna"));
        if (man.HasValue && kvinna.HasValue)
        {
            stratifiers.Add(new MeasureReport.StratifierComponent
            {
                Code = { new CodeableConcept { Coding = { new Coding { Code = "kon" } } } },
                Stratum =
                {
                    new MeasureReport.StratumComponent
                    {
                        Value = new CodeableConcept { Coding = { new Coding { Code = "1", Display = "Man" } } },
                        Population = { MakeStratPop("initial-population", man.Value) }
                    },
                    new MeasureReport.StratumComponent
                    {
                        Value = new CodeableConcept { Coding = { new Coding { Code = "2", Display = "Kvinna" } } },
                        Population = { MakeStratPop("initial-population", kvinna.Value) }
                    }
                }
            });
        }

        // Åldersgrupp
        var ageStrata = new List<MeasureReport.StratumComponent>();
        foreach (var (col, label) in new[]
        {
            ("strat_age_under_50", "<50"), ("strat_age_50_64", "50-64"),
            ("strat_age_65_74", "65-74"), ("strat_age_75_84", "75-84"),
            ("strat_age_85_plus", "85+")
        })
        {
            var v = SafeInt(Get(t, col));
            if (v.HasValue)
            {
                ageStrata.Add(new MeasureReport.StratumComponent
                {
                    Value = new CodeableConcept { Coding = { new Coding { Code = label } } },
                    Population = { MakeStratPop("initial-population", v.Value) }
                });
            }
        }
        if (ageStrata.Count > 0)
        {
            stratifiers.Add(new MeasureReport.StratifierComponent
            {
                Code = { new CodeableConcept { Coding = { new Coding { Code = "aldersgrupp" } } } },
                Stratum = ageStrata
            });
        }

        // Väntetidsintervall
        var vtStrata = new List<MeasureReport.StratumComponent>();
        foreach (var (col, label) in new[]
        {
            ("strat_vt_0_30", "0-30"), ("strat_vt_31_60", "31-60"),
            ("strat_vt_61_90", "61-90"), ("strat_vt_91_120", "91-120"),
            ("strat_vt_121_180", "121-180"), ("strat_vt_over_180", ">180")
        })
        {
            var v = SafeInt(Get(t, col));
            if (v.HasValue)
            {
                vtStrata.Add(new MeasureReport.StratumComponent
                {
                    Value = new CodeableConcept { Coding = { new Coding { Code = label } } },
                    Population = { MakeStratPop("initial-population", v.Value) }
                });
            }
        }
        if (vtStrata.Count > 0)
        {
            stratifiers.Add(new MeasureReport.StratifierComponent
            {
                Code = { new CodeableConcept { Coding = { new Coding { Code = "vantetidsintervall" } } } },
                Stratum = vtStrata
            });
        }

        return stratifiers;
    }

    /// <summary>Bygger stratifier från per-dimension-rader (yrkeskategori, kommun, etc.).</summary>
    private static MeasureReport.StratifierComponent BuildDimensionStratifier(
        string dimensionType, List<Dictionary<string, string>> dimRows)
    {
        var strata = new List<MeasureReport.StratumComponent>();

        foreach (var dr in dimRows.OrderBy(r => Get(r, "dimension_value")))
        {
            var stratum = new MeasureReport.StratumComponent
            {
                Value = new CodeableConcept
                {
                    Coding = { new Coding { Code = Get(dr, "dimension_value") } }
                }
            };

            // Populations
            var pi = SafeInt(Get(dr, "pop_initial"));
            if (pi.HasValue)
                stratum.Population.Add(MakeStratPop("initial-population", pi.Value));
            var pd = SafeInt(Get(dr, "pop_denominator"));
            if (pd.HasValue)
                stratum.Population.Add(MakeStratPop("denominator", pd.Value));
            var pn = SafeInt(Get(dr, "pop_numerator"));
            if (pn.HasValue)
                stratum.Population.Add(MakeStratPop("numerator", pn.Value));

            // MeasureScore
            stratum.MeasureScore = MakeScore(Get(dr, "measure_score"), Get(dr, "measure_score_unit"));

            strata.Add(stratum);
        }

        return new MeasureReport.StratifierComponent
        {
            Code = { new CodeableConcept { Coding = { new Coding { Code = dimensionType } } } },
            Stratum = strata
        };
    }

    /// <summary>MeasureScore: andel 0.0–1.0 → 0–100%, dagar som de är.</summary>
    private static Quantity? MakeScore(string? valStr, string? unit)
    {
        var v = SafeDecimal(valStr);
        if (!v.HasValue) return null;

        if (unit == "%")
        {
            return new Quantity
            {
                Value = Math.Round(v.Value * 100, 1),
                Unit = "%",
                System = "http://unitsofmeasure.org",
                Code = "%"
            };
        }
        return new Quantity
        {
            Value = v.Value,
            Unit = "dagar",
            System = "http://unitsofmeasure.org",
            Code = "d"
        };
    }

    /// <summary>Population för group-nivå.</summary>
    private static MeasureReport.PopulationComponent MakePop(string code, int count)
    {
        return new MeasureReport.PopulationComponent
        {
            Code = new CodeableConcept(
                "http://terminology.hl7.org/CodeSystem/measure-population", code),
            Count = count
        };
    }

    /// <summary>Population för stratum-nivå.</summary>
    private static MeasureReport.StratifierGroupPopulationComponent MakeStratPop(string code, int count)
    {
        return new MeasureReport.StratifierGroupPopulationComponent
        {
            Code = new CodeableConcept(
                "http://terminology.hl7.org/CodeSystem/measure-population", code),
            Count = count
        };
    }
}
