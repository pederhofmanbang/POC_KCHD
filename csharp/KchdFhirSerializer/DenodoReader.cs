using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Odbc;
using System.IO;
using System.Text;

namespace KchdFhirSerializer;

/// <summary>
/// Läser fhir_measure_report-data från Denodo (ODBC) eller TSV/CSV-fil.
/// Multi-separator: tab, semikolon, komma.
/// </summary>
public static class DenodoReader
{
    /// <summary>Läser rader via ODBC (Denodo-uppkoppling).</summary>
    public static List<Dictionary<string, string>> ReadFromOdbc(string connectionString, string query)
    {
        var rows = new List<Dictionary<string, string>>();

        using var conn = new OdbcConnection(connectionString);
        conn.Open();

        using var cmd = new OdbcCommand(query, conn);
        using var reader = cmd.ExecuteReader();

        var columns = new List<string>();
        for (int i = 0; i < reader.FieldCount; i++)
            columns.Add(reader.GetName(i));

        while (reader.Read())
        {
            var row = new Dictionary<string, string>();
            for (int i = 0; i < columns.Count; i++)
            {
                var val = reader.IsDBNull(i) ? "" : reader.GetValue(i)?.ToString() ?? "";
                row[columns[i]] = val;
            }
            rows.Add(row);
        }

        return rows;
    }

    /// <summary>Läser rader från TSV/CSV med auto-detekterad separator.</summary>
    public static List<Dictionary<string, string>> ReadFromTsv(string path)
    {
        var lines = File.ReadAllLines(path, Encoding.UTF8);
        if (lines.Length == 0)
            throw new InvalidOperationException("Tom fil: " + path);

        // Detektera separator från första raden (matchar Python-referensen)
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
                row[headers[j]] = j < values.Length ? values[j] : "";
            rows.Add(row);
        }

        return rows;
    }
}
