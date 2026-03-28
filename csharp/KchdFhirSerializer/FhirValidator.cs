using System.Collections.Generic;
using Hl7.Fhir.Model;

namespace KchdFhirSerializer;

/// <summary>
/// FHIR-validering av MeasureReport-bundlen.
/// Kontrollerar obligatoriska fält och värdeintervall.
/// Matchar Python-referensens validate_bundle().
/// </summary>
public static class FhirValidator
{
    public static List<string> Validate(Bundle bundle)
    {
        var errors = new List<string>();

        for (int i = 0; i < bundle.Entry.Count; i++)
        {
            var resource = bundle.Entry[i].Resource;
            if (resource is not MeasureReport mr)
            {
                errors.Add($"Entry {i}: resourceType != MeasureReport");
                continue;
            }

            if (mr.Status != MeasureReport.MeasureReportStatus.Complete)
                errors.Add($"Entry {i}: status != complete");
            if (mr.Type != MeasureReport.MeasureReportType.Summary)
                errors.Add($"Entry {i}: type != summary");
            if (string.IsNullOrEmpty(mr.Measure))
                errors.Add($"Entry {i}: measure saknas");
            if (string.IsNullOrEmpty(mr.Period?.Start))
                errors.Add($"Entry {i}: period.start saknas");
            if (string.IsNullOrEmpty(mr.Reporter?.Identifier?.Value))
                errors.Add($"Entry {i}: reporter.identifier.value saknas");

            for (int j = 0; j < mr.Group.Count; j++)
            {
                var g = mr.Group[j];
                if (g.Code?.Coding == null || g.Code.Coding.Count == 0)
                    errors.Add($"Entry {i} group {j}: code saknas");
            }

            // Proportion: score 0-100
            if (mr.Measure?.Contains("vardgaranti") == true)
            {
                foreach (var g in mr.Group)
                {
                    if (g.MeasureScore?.Value is decimal sv)
                    {
                        if (sv < 0 || sv > 100)
                            errors.Add($"Entry {i}: measureScore {sv} utanför 0-100%");
                    }
                }
            }
        }

        return errors;
    }
}
