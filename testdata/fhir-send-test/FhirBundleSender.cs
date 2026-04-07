/*
 * FhirBundleSender - Skickar FHIR MeasureReport till Nationella Hubben
 *
 * SYFTE:
 * Denna kod läser en FHIR Bundle JSON-fil och
 * skickar den till Nationella Hubbens MeasureReport-endpoint.
 *
 * KONFIGURATION:
 * ALL konfiguration läses från appsettings.json som måste ligga i samma katalog.
 * INGA värden är hårdkodade i koden.
 *
 * Version: 1.0.0
 */

using System;
using System.IO;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

public class AppSettings
{
    public string HubUrl { get; set; }
    public string ApiEndpoint { get; set; }
    public string ApiKey { get; set; }
    public string SourceRegion { get; set; }
    public string SourceRegionName { get; set; }
    public string SourceRegionId { get; set; }
    public string InputBundlePath { get; set; }
    public int TimeoutSeconds { get; set; } = 120;
    public string Encoding { get; set; } = "utf-8";
}

public class HubSuccessResponse
{
    public string Status { get; set; }
    public string Message { get; set; }
    public int? Measure_reports_received { get; set; }
    public string Period { get; set; }
    public string Source_region { get; set; }
    public string Timestamp { get; set; }
}

public class HubErrorResponse
{
    public string Status { get; set; }
    public string Message { get; set; }
    public string Error_code { get; set; }
}

public class FhirBundleSender
{
    private readonly AppSettings _settings;
    private readonly Action<string> _logInfo;
    private readonly Action<string> _logError;

    public FhirBundleSender(string settingsPath, Action<string> logInfo, Action<string> logError)
    {
        _logInfo = logInfo ?? Console.WriteLine;
        _logError = logError ?? Console.Error.WriteLine;
        _settings = LoadSettings(settingsPath);
    }

    private AppSettings LoadSettings(string settingsPath)
    {
        _logInfo($"Läser konfiguration från: {settingsPath}");

        if (!File.Exists(settingsPath))
        {
            throw new FileNotFoundException(
                $"FEL: Konfigurationsfilen hittades inte: {settingsPath}\n" +
                "     Kontrollera att appsettings.json ligger i samma katalog.");
        }

        string json = File.ReadAllText(settingsPath, System.Text.Encoding.UTF8);
        var settings = JsonConvert.DeserializeObject<AppSettings>(json);

        if (settings == null)
        {
            throw new InvalidOperationException(
                "FEL: appsettings.json kunde inte tolkas.\n" +
                "     Kontrollera att filen innehåller giltig JSON.");
        }

        ValidateSettings(settings);

        _logInfo("Konfiguration laddad:");
        _logInfo($"  HubUrl: {settings.HubUrl}");
        _logInfo($"  ApiEndpoint: {settings.ApiEndpoint}");
        _logInfo($"  SourceRegion: {settings.SourceRegion}");
        _logInfo($"  SourceRegionName: {settings.SourceRegionName}");
        _logInfo($"  InputBundlePath: {settings.InputBundlePath}");
        _logInfo($"  TimeoutSeconds: {settings.TimeoutSeconds}");

        return settings;
    }

    private void ValidateSettings(AppSettings settings)
    {
        if (string.IsNullOrWhiteSpace(settings.HubUrl))
            throw new InvalidOperationException("FEL: HubUrl saknas i appsettings.json");

        if (string.IsNullOrWhiteSpace(settings.ApiEndpoint))
            throw new InvalidOperationException("FEL: ApiEndpoint saknas i appsettings.json");

        if (string.IsNullOrWhiteSpace(settings.ApiKey))
            throw new InvalidOperationException("FEL: ApiKey saknas i appsettings.json");

        if (settings.ApiKey == "BYTA_UT_MOT_RIKTIG_NYCKEL")
            throw new InvalidOperationException(
                "FEL: ApiKey i appsettings.json är fortfarande standardvärdet.\n" +
                "     Byt ut 'BYTA_UT_MOT_RIKTIG_NYCKEL' mot den riktiga nyckeln du fått från KCHD.");

        if (string.IsNullOrWhiteSpace(settings.SourceRegion))
            throw new InvalidOperationException("FEL: SourceRegion saknas i appsettings.json");

        if (string.IsNullOrWhiteSpace(settings.SourceRegionName))
            throw new InvalidOperationException("FEL: SourceRegionName saknas i appsettings.json");

        if (string.IsNullOrWhiteSpace(settings.SourceRegionId))
            throw new InvalidOperationException("FEL: SourceRegionId saknas i appsettings.json");

        if (string.IsNullOrWhiteSpace(settings.InputBundlePath))
            throw new InvalidOperationException("FEL: InputBundlePath saknas i appsettings.json");

        if (settings.TimeoutSeconds <= 0)
            throw new InvalidOperationException("FEL: TimeoutSeconds måste vara större än 0");
    }

    private JObject LoadBundle()
    {
        string bundlePath = _settings.InputBundlePath;
        _logInfo($"Läser FHIR Bundle från: {bundlePath}");

        if (!File.Exists(bundlePath))
        {
            throw new FileNotFoundException(
                $"FEL: Kunde inte läsa filen {bundlePath}\n" +
                "     Kontrollera att sökvägen i appsettings.json (InputBundlePath) stämmer\n" +
                "     och att filen existerar.");
        }

        string json = File.ReadAllText(bundlePath, System.Text.Encoding.UTF8);

        if (string.IsNullOrWhiteSpace(json))
        {
            throw new InvalidOperationException(
                $"FEL: Filen {bundlePath} är tom.\n" +
                "     Kontrollera att filen har skapats korrekt.");
        }

        var bundle = JObject.Parse(json);

        var resourceType = bundle["resourceType"]?.ToString();
        if (resourceType != "Bundle")
        {
            throw new InvalidOperationException(
                $"FEL: Filen innehåller inte en giltig FHIR Bundle.\n" +
                $"     Förväntade resourceType='Bundle', fick '{resourceType}'.");
        }

        var entries = bundle["entry"] as JArray;
        int entryCount = entries?.Count ?? 0;
        _logInfo($"Bundle laddad: {entryCount} entries");

        if (entries != null && entries.Count > 0)
        {
            var firstResource = entries[0]["resource"];
            var periodStart = firstResource?["period"]?["start"]?.ToString();
            var periodEnd = firstResource?["period"]?["end"]?.ToString();
            if (periodStart != null && periodEnd != null)
            {
                _logInfo($"Skickar data för period: {periodStart} till {periodEnd}");
            }
        }

        return bundle;
    }

    private object BuildRequestBody(JObject bundle)
    {
        return new
        {
            bundle = bundle,
            source_region = _settings.SourceRegion,
            metadata = new
            {
                uploaded_by = _settings.SourceRegionName,
                uploaded_by_id = _settings.SourceRegionId
            }
        };
    }

    public async Task<bool> SendAsync()
    {
        try
        {
            var bundle = LoadBundle();
            var requestBody = BuildRequestBody(bundle);
            string json = JsonConvert.SerializeObject(requestBody, Formatting.None);

            string fullUrl = _settings.HubUrl.TrimEnd('/') + _settings.ApiEndpoint;
            _logInfo($"Skickar till: {fullUrl}");

            using (var client = new HttpClient())
            {
                client.Timeout = TimeSpan.FromSeconds(_settings.TimeoutSeconds);

                var content = new StringContent(json, System.Text.Encoding.UTF8, "application/json");
                content.Headers.ContentType = new MediaTypeHeaderValue("application/json")
                {
                    CharSet = "utf-8"
                };

                client.DefaultRequestHeaders.Add("X-API-Key", _settings.ApiKey);

                _logInfo("Skickar request...");
                HttpResponseMessage response;

                try
                {
                    response = await client.PostAsync(fullUrl, content);
                }
                catch (TaskCanceledException)
                {
                    _logError(
                        $"FEL: Hubben svarade inte inom {_settings.TimeoutSeconds} sekunder.\n" +
                        "     Kontrollera att HubUrl i appsettings.json är korrekt\n" +
                        $"     och att nätverket fungerar. Nuvarande URL:\n" +
                        $"     {_settings.HubUrl}");
                    return false;
                }
                catch (HttpRequestException ex)
                {
                    _logError(
                        $"FEL: Nätverksfel vid anslutning till hubben.\n" +
                        $"     Detaljer: {ex.Message}\n" +
                        "     Kontrollera att HubUrl i appsettings.json är korrekt\n" +
                        $"     och att nätverket fungerar. Nuvarande URL:\n" +
                        $"     {_settings.HubUrl}");
                    return false;
                }

                string responseBody = await response.Content.ReadAsStringAsync();
                _logInfo($"HTTP-status: {(int)response.StatusCode} {response.StatusCode}");

                if (response.IsSuccessStatusCode)
                {
                    return HandleSuccessResponse(responseBody);
                }
                else
                {
                    return HandleErrorResponse(response.StatusCode, responseBody);
                }
            }
        }
        catch (FileNotFoundException ex)
        {
            _logError(ex.Message);
            return false;
        }
        catch (InvalidOperationException ex)
        {
            _logError(ex.Message);
            return false;
        }
        catch (Exception ex)
        {
            _logError(
                $"FEL: Ett oväntat fel uppstod.\n" +
                $"     Typ: {ex.GetType().Name}\n" +
                $"     Meddelande: {ex.Message}\n" +
                "     Kontakta KCHD om problemet kvarstår.");
            return false;
        }
    }

    private bool HandleSuccessResponse(string responseBody)
    {
        try
        {
            var settings = new JsonSerializerSettings
            {
                ContractResolver = new Newtonsoft.Json.Serialization.DefaultContractResolver
                {
                    NamingStrategy = new Newtonsoft.Json.Serialization.SnakeCaseNamingStrategy()
                }
            };

            var response = JsonConvert.DeserializeObject<HubSuccessResponse>(responseBody, settings);

            if (response == null)
            {
                var jobj = JObject.Parse(responseBody);
                _logInfo("Svar från hubben (raw JSON):");
                _logInfo(jobj.ToString(Formatting.Indented));
                return true;
            }

            _logInfo("========================================");
            _logInfo("FRAMGÅNG! Bundle mottagen av hubben.");
            _logInfo("========================================");
            _logInfo($"Status: {response.Status}");
            _logInfo($"Meddelande: {response.Message}");
            _logInfo($"Antal MeasureReports: {response.Measure_reports_received}");
            _logInfo($"Period: {response.Period}");
            _logInfo($"Region: {response.Source_region}");
            _logInfo($"Tidsstämpel: {response.Timestamp}");
            return true;
        }
        catch (JsonException)
        {
            _logInfo("Svar från hubben:");
            _logInfo(responseBody);
            return true;
        }
    }

    private bool HandleErrorResponse(HttpStatusCode statusCode, string responseBody)
    {
        _logError($"FEL: Hubben svarade med HTTP {(int)statusCode}");

        try
        {
            var jobj = JObject.Parse(responseBody);
            var detail = jobj["detail"];

            string message;
            string errorCode;

            if (detail != null && detail.Type == JTokenType.Object)
            {
                message = detail["message"]?.ToString();
                errorCode = detail["error_code"]?.ToString();
            }
            else if (detail != null && detail.Type == JTokenType.String)
            {
                message = detail.ToString();
                errorCode = null;
            }
            else
            {
                message = jobj["message"]?.ToString();
                errorCode = jobj["error_code"]?.ToString();
            }

            if (!string.IsNullOrEmpty(message))
            {
                _logError($"Felmeddelande: {message}");
            }
            if (!string.IsNullOrEmpty(errorCode))
            {
                _logError($"Felkod: {errorCode}");
            }

            switch (statusCode)
            {
                case HttpStatusCode.Unauthorized:
                    _logError(
                        "\nÅTGÄRD: Kontrollera att ApiKey i appsettings.json är korrekt.\n" +
                        "        Kontakta KCHD om du behöver en ny nyckel.");
                    break;

                case HttpStatusCode.BadRequest:
                    _logError(
                        "\nÅTGÄRD: Kontrollera att FHIR Bundle-filen är korrekt formaterad.\n" +
                        "        Se felmeddelandet ovan för detaljer.");
                    break;

                case HttpStatusCode.InternalServerError:
                    _logError(
                        "\nÅTGÄRD: Detta är ett serverfel. Försök igen om en stund.\n" +
                        "        Om problemet kvarstår, kontakta KCHD.");
                    break;

                default:
                    _logError("\nÅTGÄRD: Kontakta KCHD för hjälp med detta problem.");
                    break;
            }
        }
        catch (JsonException)
        {
            _logError($"Råsvar: {responseBody}");
        }

        return false;
    }

    public bool Send()
    {
        return SendAsync().GetAwaiter().GetResult();
    }
}
