using System.Text.Json.Nodes;

namespace KchdFhirSerializer;

/// <summary>
/// Grundläggande FHIR-validering av bundlen.
/// Matchar Python-referensens validate_bundle().
/// </summary>
public static class FhirValidator
{
    public static List<string> Validate(JsonObject bundle)
    {
        var errors = new List<string>();
        var entries = bundle["entry"]?.AsArray();
        if (entries == null) { errors.Add("Ingen 'entry' i bundle"); return errors; }

        for (int i = 0; i < entries.Count; i++)
        {
            var mr = entries[i]?.AsObject()?["resource"]?.AsObject();
            if (mr == null) { errors.Add($"Entry {i}: resource saknas"); continue; }

            if (mr["resourceType"]?.GetValue<string>() != "MeasureReport")
                errors.Add($"Entry {i}: resourceType != MeasureReport");
            if (mr["status"]?.GetValue<string>() != "complete")
                errors.Add($"Entry {i}: status != complete");
            if (mr["type"]?.GetValue<string>() != "summary")
                errors.Add($"Entry {i}: type != summary");
            if (string.IsNullOrEmpty(mr["measure"]?.GetValue<string>()))
                errors.Add($"Entry {i}: measure saknas");

            var periodStart = mr["period"]?["start"]?.GetValue<string>();
            if (string.IsNullOrEmpty(periodStart))
                errors.Add($"Entry {i}: period.start saknas");

            var reporterValue = mr["reporter"]?["identifier"]?["value"]?.GetValue<string>();
            if (string.IsNullOrEmpty(reporterValue))
                errors.Add($"Entry {i}: reporter.identifier.value saknas");

            var groups = mr["group"]?.AsArray();
            if (groups != null)
            {
                for (int j = 0; j < groups.Count; j++)
                {
                    var g = groups[j]?.AsObject();
                    var coding = g?["code"]?["coding"]?.AsArray();
                    if (coding == null || coding.Count == 0)
                        errors.Add($"Entry {i} group {j}: code saknas");
                }
            }

            // Proportion: score 0-100
            var measure = mr["measure"]?.GetValue<string>() ?? "";
            if (measure.Contains("vardgaranti") && groups != null)
            {
                foreach (var g in groups)
                {
                    var sv = g?["measureScore"]?["value"];
                    if (sv != null)
                    {
                        var val = sv.GetValue<double>();
                        if (val < 0 || val > 100)
                            errors.Add($"Entry {i}: measureScore {val} utanför 0-100%");
                    }
                }
            }
        }

        return errors;
    }
}
