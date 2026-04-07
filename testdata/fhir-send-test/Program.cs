using System;

class Program
{
    static void Main(string[] args)
    {
        string settingsPath = args.Length > 0 ? args[0] : "appsettings.json";

        Console.WriteLine("=== FhirBundleSender Test ===");
        Console.WriteLine($"Datum: {DateTime.Now:yyyy-MM-dd HH:mm:ss}");
        Console.WriteLine();

        var sender = new FhirBundleSender(
            settingsPath,
            Console.WriteLine,
            msg => { Console.ForegroundColor = ConsoleColor.Red; Console.WriteLine(msg); Console.ResetColor(); }
        );

        bool success = sender.Send();

        Console.WriteLine();
        Console.WriteLine(success ? "=== SLUTFÖRT ===" : "=== MISSLYCKADES ===");

        Environment.Exit(success ? 0 : 1);
    }
}
