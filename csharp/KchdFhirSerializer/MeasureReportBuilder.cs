using System.Text.Json;
using System.Text.Json.Nodes;

namespace KchdFhirSerializer;

/// <summary>
/// Bygger FHIR R4 MeasureReport-resurser från fhir_measure_report-rader.
/// Producerar rå JSON (utan Hl7.Fhir.R4-modellen) för att matcha
/// Python-referensens output exakt.
/// </summary>
public static class MeasureReportBuilder
{
    // Hjälpmetoder för säker konvertering
    private static double? SafeDouble(string? v)
    {
        if (string.IsNullOrWhiteSpace(v)) return null;
        return double.TryParse(v, System.Globalization.CultureInfo.InvariantCulture, out var d) ? d : null;
    }

    private static int? SafeInt(string? v)
    {
        if (string.IsNullOrWhiteSpace(v)) return null;
        var d = SafeDouble(v);
        return d.HasValue ? (int)d.Value : null;
    }

    private static string Get(Dictionary<string, string> row, string key)
        => row.TryGetValue(key, out var v) ? v : "";

    /// <summary>Bygger FHIR Bundle JSON från rader.</summary>
    public static JsonObject BuildBundle(List<Dictionary<string, string>> rows, string reportDate = "2026-03-26")
    {
        // Gruppera per (measure_url, period_start, period_end, reporter_value)
        var reports = new Dictionary<string, (List<Dictionary<string, string>> totals,
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

        var entries = new JsonArray();

        // Sortera nycklar (matchar Pythons sorted())
        foreach (var key in reports.Keys.OrderBy(k => k))
        {
            var (totals, dims) = reports[key];
            if (totals.Count == 0) continue;

            var first = totals[0];
            var mr = new JsonObject
            {
                ["resourceType"] = "MeasureReport",
                ["status"] = "complete",
                ["type"] = "summary",
                ["measure"] = Get(first, "measure_url"),
                ["subject"] = new JsonObject
                {
                    ["identifier"] = new JsonObject
                    {
                        ["system"] = Get(first, "subject_system"),
                        ["value"] = Get(first, "subject_value")
                    }
                },
                ["date"] = reportDate,
                ["reporter"] = new JsonObject
                {
                    ["identifier"] = new JsonObject
                    {
                        ["system"] = Get(first, "reporter_system"),
                        ["value"] = Get(first, "reporter_value")
                    },
                    ["display"] = Get(first, "reporter_display")
                },
                ["period"] = new JsonObject
                {
                    ["start"] = Get(first, "period_start"),
                    ["end"] = Get(first, "period_end")
                },
                ["group"] = new JsonArray()
            };

            // improvementNotation för proportion
            if (Get(first, "scoring") == "proportion")
            {
                mr["improvementNotation"] = new JsonObject
                {
                    ["coding"] = new JsonArray
                    {
                        new JsonObject
                        {
                            ["system"] = "http://terminology.hl7.org/CodeSystem/measure-improvement-notation",
                            ["code"] = "increase"
                        }
                    }
                };
            }

            // Groups från totalrader
            var groupArray = (JsonArray)mr["group"]!;
            foreach (var t in totals)
            {
                var group = new JsonObject
                {
                    ["code"] = new JsonObject
                    {
                        ["coding"] = new JsonArray
                        {
                            new JsonObject { ["code"] = Get(t, "group_code") }
                        }
                    }
                };

                // Populations
                var pops = new JsonArray();
                var popInit = SafeInt(Get(t, "pop_initial"));
                if (popInit.HasValue) pops.Add(MakePop("initial-population", popInit.Value));
                var popDenom = SafeInt(Get(t, "pop_denominator"));
                if (popDenom.HasValue) pops.Add(MakePop("denominator", popDenom.Value));
                var popNum = SafeInt(Get(t, "pop_numerator"));
                if (popNum.HasValue) pops.Add(MakePop("numerator", popNum.Value));
                if (pops.Count > 0) group["population"] = pops;

                // MeasureScore
                var score = MakeScore(Get(t, "measure_score"), Get(t, "measure_score_unit"));
                if (score != null) group["measureScore"] = score;

                // Inbäddade stratifiers (kön, ålder, väntetidsintervall)
                var stratifiers = new JsonArray();

                // Kön
                var man = SafeInt(Get(t, "strat_kon_man"));
                var kvinna = SafeInt(Get(t, "strat_kon_kvinna"));
                if (man.HasValue && kvinna.HasValue)
                {
                    stratifiers.Add(new JsonObject
                    {
                        ["code"] = new JsonArray
                        {
                            new JsonObject { ["coding"] = new JsonArray { new JsonObject { ["code"] = "kon" } } }
                        },
                        ["stratum"] = new JsonArray
                        {
                            new JsonObject
                            {
                                ["value"] = new JsonObject { ["coding"] = new JsonArray { new JsonObject { ["code"] = "1", ["display"] = "Man" } } },
                                ["population"] = new JsonArray { MakePop("initial-population", man.Value) }
                            },
                            new JsonObject
                            {
                                ["value"] = new JsonObject { ["coding"] = new JsonArray { new JsonObject { ["code"] = "2", ["display"] = "Kvinna" } } },
                                ["population"] = new JsonArray { MakePop("initial-population", kvinna.Value) }
                            }
                        }
                    });
                }

                // Åldersgrupp
                var ageStrata = new JsonArray();
                foreach (var (col, label) in new[] {
                    ("strat_age_under_50", "<50"), ("strat_age_50_64", "50-64"),
                    ("strat_age_65_74", "65-74"), ("strat_age_75_84", "75-84"),
                    ("strat_age_85_plus", "85+") })
                {
                    var v = SafeInt(Get(t, col));
                    if (v.HasValue)
                    {
                        ageStrata.Add(new JsonObject
                        {
                            ["value"] = new JsonObject { ["coding"] = new JsonArray { new JsonObject { ["code"] = label } } },
                            ["population"] = new JsonArray { MakePop("initial-population", v.Value) }
                        });
                    }
                }
                if (ageStrata.Count > 0)
                {
                    stratifiers.Add(new JsonObject
                    {
                        ["code"] = new JsonArray { new JsonObject { ["coding"] = new JsonArray { new JsonObject { ["code"] = "aldersgrupp" } } } },
                        ["stratum"] = ageStrata
                    });
                }

                // Väntetidsintervall
                var vtStrata = new JsonArray();
                foreach (var (col, label) in new[] {
                    ("strat_vt_0_30", "0-30"), ("strat_vt_31_60", "31-60"),
                    ("strat_vt_61_90", "61-90"), ("strat_vt_91_120", "91-120"),
                    ("strat_vt_121_180", "121-180"), ("strat_vt_over_180", ">180") })
                {
                    var v = SafeInt(Get(t, col));
                    if (v.HasValue)
                    {
                        vtStrata.Add(new JsonObject
                        {
                            ["value"] = new JsonObject { ["coding"] = new JsonArray { new JsonObject { ["code"] = label } } },
                            ["population"] = new JsonArray { MakePop("initial-population", v.Value) }
                        });
                    }
                }
                if (vtStrata.Count > 0)
                {
                    stratifiers.Add(new JsonObject
                    {
                        ["code"] = new JsonArray { new JsonObject { ["coding"] = new JsonArray { new JsonObject { ["code"] = "vantetidsintervall" } } } },
                        ["stratum"] = vtStrata
                    });
                }

                if (stratifiers.Count > 0) group["stratifier"] = stratifiers;
                groupArray.Add(group);
            }

            // Per-dimension stratifiers → group[0]
            foreach (var dimType in dims.Keys.OrderBy(k => k))
            {
                var dimRows = dims[dimType].OrderBy(r => Get(r, "dimension_value")).ToList();
                var strata = new JsonArray();
                foreach (var dr in dimRows)
                {
                    var stratum = new JsonObject
                    {
                        ["value"] = new JsonObject
                        {
                            ["coding"] = new JsonArray { new JsonObject { ["code"] = Get(dr, "dimension_value") } }
                        }
                    };

                    var pops = new JsonArray();
                    var pi = SafeInt(Get(dr, "pop_initial"));
                    if (pi.HasValue) pops.Add(MakePop("initial-population", pi.Value));
                    var pd = SafeInt(Get(dr, "pop_denominator"));
                    if (pd.HasValue) pops.Add(MakePop("denominator", pd.Value));
                    var pn = SafeInt(Get(dr, "pop_numerator"));
                    if (pn.HasValue) pops.Add(MakePop("numerator", pn.Value));
                    if (pops.Count > 0) stratum["population"] = pops;

                    var s = MakeScore(Get(dr, "measure_score"), Get(dr, "measure_score_unit"));
                    if (s != null) stratum["measureScore"] = s;

                    strata.Add(stratum);
                }

                if (strata.Count > 0 && groupArray.Count > 0)
                {
                    var targetGroup = (JsonObject)groupArray[0]!;
                    if (!targetGroup.ContainsKey("stratifier"))
                        targetGroup["stratifier"] = new JsonArray();
                    ((JsonArray)targetGroup["stratifier"]!).Add(new JsonObject
                    {
                        ["code"] = new JsonArray { new JsonObject { ["coding"] = new JsonArray { new JsonObject { ["code"] = dimType } } } },
                        ["stratum"] = strata
                    });
                }
            }

            entries.Add(new JsonObject { ["resource"] = mr });
        }

        return new JsonObject
        {
            ["resourceType"] = "Bundle",
            ["type"] = "collection",
            ["entry"] = entries
        };
    }

    private static JsonObject MakeScore(string? valStr, string? unit)
    {
        var v = SafeDouble(valStr);
        if (!v.HasValue) return null!;

        if (unit == "%")
        {
            return new JsonObject
            {
                ["value"] = Math.Round(v.Value * 100, 1),
                ["unit"] = "%",
                ["system"] = "http://unitsofmeasure.org",
                ["code"] = "%"
            };
        }
        return new JsonObject
        {
            ["value"] = v.Value,
            ["unit"] = "dagar",
            ["system"] = "http://unitsofmeasure.org",
            ["code"] = "d"
        };
    }

    private static JsonObject MakePop(string code, int count)
    {
        return new JsonObject
        {
            ["code"] = new JsonObject
            {
                ["coding"] = new JsonArray
                {
                    new JsonObject
                    {
                        ["system"] = "http://terminology.hl7.org/CodeSystem/measure-population",
                        ["code"] = code
                    }
                }
            },
            ["count"] = count
        };
    }
}
