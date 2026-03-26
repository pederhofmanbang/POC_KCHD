using Hl7.Fhir.Model;
using Hl7.Fhir.Serialization;
using KchdFhirSerializer;

// KCHD FHIR-serialiserare — C#-implementation
// Läser fhir_measure_report (TSV/ODBC) och producerar FHIR R4 Bundle JSON.
// Referens: python/fhir_serializer.py

var inputPath = "";
var outputPath = "fhir_bundle.json";
var validate = false;
var reportDate = "2026-03-26";
string? odbcConnection = null;
string query = "SELECT * FROM fhir_measure_report";

for (int i = 0; i < args.Length; i++)
{
    if (args[i] is "-o" or "--output")
        outputPath = args[++i];
    else if (args[i] is "-v" or "--validate")
        validate = true;
    else if (args[i] is "-d" or "--date")
        reportDate = args[++i];
    else if (args[i] is "--odbc")
        odbcConnection = args[++i];
    else if (args[i] is "--query")
        query = args[++i];
    else if (!args[i].StartsWith("-"))
        inputPath = args[i];
}

// 1. Läs rader — ODBC eller TSV
List<Dictionary<string, string>> rows;

if (!string.IsNullOrEmpty(odbcConnection))
{
    Console.WriteLine($"Läser från Denodo via ODBC...");
    rows = DenodoReader.ReadFromOdbc(odbcConnection, query);
}
else if (!string.IsNullOrEmpty(inputPath))
{
    rows = DenodoReader.ReadFromTsv(inputPath);
}
else
{
    Console.Error.WriteLine("Användning:");
    Console.Error.WriteLine("  KchdFhirSerializer <input.tsv> [-o output.json] [-v] [-d datum]");
    Console.Error.WriteLine("  KchdFhirSerializer --odbc \"DSN=DenodoVGR\" [--query \"SELECT...\"] [-o output.json] [-v]");
    return 1;
}

Console.WriteLine($"Rader: {rows.Count}");

// 2. Bygg FHIR Bundle
var bundle = MeasureReportBuilder.BuildBundle(rows, reportDate);

// 3. Serialisera till JSON med Hl7.Fhir.R4
var serializer = new FhirJsonSerializer(new SerializerSettings { Pretty = true });
var json = serializer.SerializeToString(bundle);
File.WriteAllText(outputPath, json);

Console.WriteLine($"FHIR Bundle: {bundle.Entry.Count} MeasureReports, {json.Length:N0} tecken");
Console.WriteLine($"Output: {outputPath}");

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
