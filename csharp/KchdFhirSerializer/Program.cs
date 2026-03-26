using System.Text.Json;
using System.Text.Json.Nodes;
using KchdFhirSerializer;

// KCHD FHIR-serialiserare — C#-implementation
// Läser fhir_measure_report (TSV) och producerar FHIR R4 Bundle JSON.
// Referens: python/fhir_serializer.py

var inputPath = "";
var outputPath = "fhir_bundle.json";
var validate = false;
var reportDate = "2026-03-26";

// Enkel arg-parsing (matchar Python-referensens CLI)
for (int i = 0; i < args.Length; i++)
{
    if (args[i] == "-o" || args[i] == "--output")
        outputPath = args[++i];
    else if (args[i] == "-v" || args[i] == "--validate")
        validate = true;
    else if (args[i] == "-d" || args[i] == "--date")
        reportDate = args[++i];
    else if (!args[i].StartsWith("-"))
        inputPath = args[i];
}

if (string.IsNullOrEmpty(inputPath))
{
    Console.Error.WriteLine("Användning: KchdFhirSerializer <input.tsv> [-o output.json] [-v] [-d datum]");
    return 1;
}

// 1. Läs rader
var rows = TsvReader.Read(inputPath);

// 2. Bygg FHIR Bundle
var bundle = MeasureReportBuilder.BuildBundle(rows, reportDate);

// 3. Serialisera till JSON
var options = new JsonSerializerOptions
{
    WriteIndented = true,
    Encoder = System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping
};
var json = bundle.ToJsonString(options);
File.WriteAllText(outputPath, json);

var entryCount = bundle["entry"]?.AsArray()?.Count ?? 0;
Console.WriteLine($"FHIR Bundle: {entryCount} MeasureReports, {json.Length:N0} tecken");

// 4. Validera
if (validate)
{
    var errors = FhirValidator.Validate(bundle);
    if (errors.Count > 0)
    {
        Console.WriteLine($"❌ {errors.Count} valideringsfel:");
        foreach (var e in errors)
            Console.WriteLine($"  {e}");
        return 1;
    }
    Console.WriteLine("✅ Validering OK");
}

return 0;
