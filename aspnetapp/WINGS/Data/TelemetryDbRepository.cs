using System;
using System.IO;
using System.Linq;
using System.Threading;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using WINGS.Models;
using WINGS.Library;
using System.Text;

namespace WINGS.Data
{
  /// <summary>
  /// Provides methods for reading telemetry db files
  /// </summary>
  public class TelemetryDbRepository : IDbRepository<TelemetryPacket>
  {
    private readonly IWebHostEnvironment _env;
    
    public TelemetryDbRepository(IWebHostEnvironment env)
    {
      _env = env;
    }

    /// <summary>
    /// Reads the telemetry db files defined in config and parses to the TelemetryPacket objects
    /// </summary>
    /// <param name="config">Config of the db files</param>
    /// <returns>Returns an enumerable collection of telemetry definitions that are read from telemetry db files</returns>
    /// <exception cref="ArgumentException">Undefined config of the file</exception>
    public async Task<IEnumerable<TelemetryPacket>> LoadAllFilesAsync(TlmCmdFileConfig config)
    {
      var telemetryDb = new List<TelemetryPacket>();

      // Parallel file loading
      var sem = new SemaphoreSlim(10); // Maximum number of parallel excecution

      foreach (var c in config.TlmDBInfo)
      {
        var filePaths = await GetDbFilePathsAsync(config.Location, c);
        var loadTasks = filePaths.Select(async filePath =>
        {
          await sem.WaitAsync();
          try
          {
            return await LoadFileAsync(config.Location, c, filePath, config.TlmConfigInfo);
          }
          finally
          {
            sem.Release();
          }
        });
        var packets = await Task.WhenAll(loadTasks);

        foreach (var packet in packets)
        {
          if (packet.PacketInfo != null) // Add only "ENABLE"
          {
            telemetryDb.Add(packet);
          }
        }
      }
      return telemetryDb;
    }

    private async Task<TelemetryPacket> LoadFileAsync(TlmCmdFileLocation location, TlmCmdFileLocationInfo tlmDBInfo, string filePath, List<TlmConfigurationInfo> tlmConfigInfo)
    {
      string[] cols;
      var reader = await GetDbFileReaderAsync(location, tlmDBInfo, filePath);
      var telemetries = new List<Telemetry>();

      reader.ReadLine(); // APID
      
      // Packet Info
      cols = reader.ReadLine().Split(",");
      var packetId = cols[2];
      var packetName = Path.GetFileNameWithoutExtension(filePath);
      var tlmConfig = tlmConfigInfo.Find(tlmConfig => packetName.Contains(tlmConfig.CompoName));
      if (packetName.IndexOf("_TLM_DB_") != -1)
      {
        packetName = packetName.Substring(packetName.IndexOf("_TLM_DB_") + 8);
      }
      var packetInfo = new PacketInfo(){
        TlmApid = tlmConfig.TlmApid,
        Id = packetId,
        CompoName = tlmConfig.CompoName,
        Name = packetName,
        IsRealtimeData = true, // add packet only for realtime tlm (record tlms are registered when SetTelemetryValuesAsync() in TmPacketAnalyzerBase.cs is called)
        IsRestricted = false
      };

      // ENA/DIS
      cols = reader.ReadLine().Split(",");
      if (cols[2] == "DISABLE")
      {
        return new TelemetryPacket();
      }

      // IsRestricted
      cols = reader.ReadLine().Split(",");
      if (cols[2] == "TRUE")
      {
        packetInfo.IsRestricted = true;
      }

      for (int i = 0; i < 4; i++)
      {
        reader.ReadLine();
      }

      using (var parser = new TextFieldParser(reader))
      {
        parser.SetDelimiters(",");
        parser.HasFieldsEnclosedInQuotes = true;
        parser.TrimWhiteSpace = true;

        while (!parser.EndOfData)
        {
          cols = parser.ReadFields();
          if (cols.All( x => x == "")) { break; }

          var convType = cols[8].ToString();
          var poly = new double[]{0,0,0,0,0,0};
          var statusStr = "";
          var status = new Dictionary<string, string>();

          switch (convType)
          {
            case "POLY":
              for (var i=0; i<6; i++)
              {
                poly[i] = cols[i+9] == "" ? 0 : Convert.ToDouble(cols[i+9]);
              }
              break;

            case "STATUS":
              statusStr = cols[15].ToString();
              status = ParseStatus(statusStr);
              break;

            default:
              break;
          }

          telemetries.Add(new Telemetry()
          {
            TelemetryInfo = new TelemetryInfo()
            {
              Name = packetName + "." + cols[1],
              Type = cols[2],
              Unit = cols[3],
              OctetPos = Convert.ToInt32(cols[5]),
              BitPos = Convert.ToInt32(cols[6]),
              BitLen = Convert.ToInt32(cols[7]),
              ConvType = convType,
              Poly = poly,
              Status = status,
              Description = cols[16]
            },
            TelemetryValue = new TelemetryValue()
          });
        }
      }     

      return new TelemetryPacket(){
        PacketInfo = packetInfo,
        Telemetries = telemetries
      };
    }
    
    private Dictionary<string, string> ParseStatus(string statusStr)
    {
      var status = new Dictionary<string, string>();
      string[] defs;
      if (statusStr == "")
      {
        return status;
      }
      else if (statusStr.Contains("@@"))
      {
        defs = statusStr.Split("@@");
        for (var i = 0; i < defs.Length; i++)
        {
          defs[i] = defs[i].Trim();
        }
      }
      else{
        defs = statusStr.Split(", ");
        for (var i = 0; i < defs.Length; i++)
        {
          defs[i] = defs[i].Trim();
        }
      }
      foreach (var def in defs)
      {
        var vals = def.Split("=");
        if (vals[0].Contains("0x"))
        {
          vals[0] = vals[0].Replace("0x", "").Trim();
          var valnum = Convert.ToUInt32(vals[0], 16);
          vals[0] = Convert.ToString(valnum);
        }
        status.Add(vals[0].Trim(), vals[1].Trim());
      }
      return status;
    }

    private Task<IEnumerable<string>> GetDbFilePathsAsync(TlmCmdFileLocation location, TlmCmdFileLocationInfo tlmDBInfo)
    {
      switch (location)
      {
        case TlmCmdFileLocation.Local:
          string dirPath = Path.Combine(_env.ContentRootPath, tlmDBInfo.DirPath, "tlmdb");
          return Task.FromResult(Directory.EnumerateFiles(dirPath, "*.csv", SearchOption.TopDirectoryOnly));
        default:
          throw new ArgumentException("Undefined file location");
      }
    }

    private Task<StreamReader> GetDbFileReaderAsync(TlmCmdFileLocation location, TlmCmdFileLocationInfo tlmDBInfo, string filePath)
    {
      switch (location)
      {
        case TlmCmdFileLocation.Local:
          Encoding.RegisterProvider(CodePagesEncodingProvider.Instance);
          return Task.FromResult(new StreamReader(filePath, Encoding.GetEncoding("utf-8")));
        default:
          throw new ArgumentException("Undefined file location");
      }
    }
  }
}
