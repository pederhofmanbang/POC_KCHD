using System.Text;

namespace KchdFhirSerializer;

/// <summary>
/// Läser TSV/CSV med multi-separator (tab, semikolon, komma).
/// Matchar Python-referensens separator-detektion.
/// </summary>
public static class TsvReader
{
    public static List<Dictionary<string, string>> Read(string path)
    {
        var lines = File.ReadAllLines(path, Encoding.UTF8);
        if (lines.Length == 0)
            throw new InvalidOperationException("Tom fil: " + path);

        // Detektera separator från första raden (samma logik som Python)
        var firstLine = lines[0];
        char sep = firstLine.Contains('\t') ? '\t'
                 : firstLine.Contains(';')  ? ';'
                 : ',';

        var headers = firstLine.Split(sep);
        var rows = new List<Dictionary<string, string>>();

        for (int i = 1; i < lines.Length; i++)
        {
            if (string.IsNullOrWhiteSpace(lines[i]))
                continue;

            var values = lines[i].Split(sep);
            var row = new Dictionary<string, string>();
            for (int j = 0; j < headers.Length; j++)
            {
                row[headers[j]] = j < values.Length ? values[j] : "";
            }
            rows.Add(row);
        }

        return rows;
    }
}
