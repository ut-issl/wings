using System;
using System.Linq;
using System.IO;
using System.Text;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using WINGS.Models;

namespace WINGS.Data
{
  /// <summary>
  /// Provides methods for handling csv telemetry logs
  /// </summary>
  public class TelemetryLogRepository : ITelemetryLogRepository
  {
    private readonly IWebHostEnvironment _env;

    public TelemetryLogRepository(IWebHostEnvironment env)
    {
      _env = env;
    }

    /// <summary>
    /// Add the telemetry log to csv files per packet
    /// </summary>
    /// <param name="opid">Operation id</param>
    /// <param name="packet">Telemetry packet to save the logs</param>
    public async Task AddHistoryAsync(string opid, TelemetryPacket packet)
    {
      if (packet.PacketInfo.IsRealtimeData)
      { // for realtime tlm
        string filePath = Path.Combine(_env.ContentRootPath, "Logs", opid, "tlmlog", packet.PacketInfo.Name + ".csv");
        using (var sw = new StreamWriter(filePath, true))
        {
          var sb = new StringBuilder();
          sb.Append(packet.Telemetries.First().TelemetryValue.Time + ",");
          foreach (var tlm in packet.Telemetries)
          {
            sb.Append(tlm.TelemetryValue.Value + ",");
            sb.Append(tlm.TelemetryValue.RawValue + ",");
          }
          sb.Remove(sb.Length - 1, 1);
          sb.Append("\r\n");
          await sw.WriteAsync(sb.ToString());
        }
      }
      else
      { // for recorded tlm
        string filePath = Path.Combine(_env.ContentRootPath, "Logs", opid, "recordtlmlog", packet.PacketInfo.Name + ".csv");
        using (var sw = new StreamWriter(filePath, true))
        {
          var sb = new StringBuilder();
          sb.Append(packet.Telemetries.First().TelemetryValue.Time + ",");
          sb.Append(packet.Telemetries.First().TelemetryValue.TI + ",");
          foreach (var tlm in packet.Telemetries)
          {
            sb.Append(tlm.TelemetryValue.Value + ",");
            sb.Append(tlm.TelemetryValue.RawValue + ",");
          }
          sb.Remove(sb.Length - 1, 1);
          sb.Append("\r\n");
          await sw.WriteAsync(sb.ToString());
        }
      }
    }

    public List<TelemetryPacketHistory> GetTelemetryHistory(string opid, List<TelemetryPacket> telemetryDb)
    {
      string dirPath = Path.Combine(_env.ContentRootPath, "Logs", opid, "tlmlog");
      string[] fileNames = Directory.GetFiles(dirPath, "*.csv");
      var telemetryPacketHistories = new List<TelemetryPacketHistory>();

      foreach (var fileName in fileNames)
      {
        string[] cols;
        FileStream fs = new FileStream(fileName, FileMode.Open, FileAccess.Read, FileShare.ReadWrite);
        var sr = new StreamReader(fs);
        var telemetryPacketHistory = new TelemetryPacketHistory() { 
          PacketInfo = new PacketInfo(),
          TelemetryHistories = new List<TelemetryHistory>()
        };

        var packet = telemetryDb.Find(x => x.PacketInfo.Name == Path.GetFileNameWithoutExtension(fileName));
        telemetryPacketHistory.PacketInfo = packet.PacketInfo;
        foreach (var tlm in packet.Telemetries)
        {
          telemetryPacketHistory.TelemetryHistories.Add(new TelemetryHistory()
          {
            TelemetryInfo = tlm.TelemetryInfo,
            TelemetryValues = new List<TelemetryValue>()
          });
        }

        List<string> tlmNames = new List<string>(sr.ReadLine().Split(",")); // header
        tlmNames.RemoveAt(0); // remove time
        while (!sr.EndOfStream)
        {
          cols = sr.ReadLine().Split(",");
          var time = cols[0];
          for (int i = 0; i < tlmNames.Count; i++)
          {
            var tlmName = (tlmNames[i].IndexOf('[') > 0)? tlmNames[i].Substring(0, tlmNames[i].IndexOf('[')) : tlmNames[i];
            if (i%2 == 0) // skip raw values
            {
              telemetryPacketHistory.TelemetryHistories.Find(x => x.TelemetryInfo.Name == tlmName).TelemetryValues.Add(new TelemetryValue()
              {
                Time = time,
                Value = cols[i+1],
                RawValue = cols[i+2],
              });
            }
          }
        }
        telemetryPacketHistories.Add(telemetryPacketHistory);
      }
      return telemetryPacketHistories;
    }

    /// <summary>
    /// Lists the names of packets for which telemetry data exists in the csv files
    /// </summary>
    /// <param name="opid">Operation id</param>
    public List<string> GetPacketsWithData(string opid)
    {
      var packetNames = new List<string>();
      string dirPath = Path.Combine(_env.ContentRootPath, "Logs", opid, "tlmlog");
      string[] fileNames = Directory.GetFiles(dirPath, "*.csv");

      foreach (var fileName in fileNames)
      {
        var sr = new StreamReader(fileName);
        sr.ReadLine(); // header
        if (!sr.EndOfStream)
        {
          string packetName = Path.GetFileNameWithoutExtension(fileName);
          packetNames.Add(packetName);
        }
      }
      return packetNames;
    }
    public List<string> GetRecordPacketsWithData(string opid)
    {
      var packetNames = new List<string>();
      string dirPath = Path.Combine(_env.ContentRootPath, "Logs", opid, "recordtlmlog");
      string[] fileNames = Directory.GetFiles(dirPath, "*.csv");

      foreach (var fileName in fileNames)
      {
        var sr = new StreamReader(fileName);
        sr.ReadLine(); // header
        if (!sr.EndOfStream)
        {
          string packetName = Path.GetFileNameWithoutExtension(fileName);
          packetNames.Add(packetName);
        }
      }
      return packetNames;
    }

    /// <summary>
    /// Create new files and write headers to initialize log files
    /// </summary>
    /// <param name="opid">Operation id</param>
    /// <param name="telemetryDb">The definition of telemetry</param>
    public void InitializeLogFiles(string opid, List<TelemetryPacket> telemetryDb)
    {
      // for realtime tlm
      string dirPath = Path.Combine(_env.ContentRootPath, "Logs", opid, "tlmlog");
      Directory.CreateDirectory(dirPath);

      foreach (var packet in telemetryDb)
      {
        var sb = new StringBuilder();
        sb.Append("Time,");
        foreach (var tlm in packet.Telemetries)
        {
          sb.Append(tlm.TelemetryInfo.Name + "[" + tlm.TelemetryInfo.Unit + "],");
          sb.Append(tlm.TelemetryInfo.Name + "[" + tlm.TelemetryInfo.Unit + "](RawData),");
        }
        if (sb.Length > 0)
        {
          sb.Remove(sb.Length - 1, 1);
        }
        sb.Append("\r\n");
        string filePath = Path.Combine(dirPath, packet.PacketInfo.Name + ".csv");
        using (var sw = new StreamWriter(filePath))
        {
          sw.Write(sb.ToString());
        }
      }

      // for recorded tlm
      dirPath = Path.Combine(_env.ContentRootPath, "Logs", opid, "recordtlmlog");
      Directory.CreateDirectory(dirPath);
      foreach (var packet in telemetryDb)
      {
        var sb = new StringBuilder();
        sb.Append("Time,");  // Time when arrived at WINGS
        sb.Append("TI,");  // TI when recorded onboard
        foreach (var tlm in packet.Telemetries)
        {
          sb.Append(tlm.TelemetryInfo.Name + "[" + tlm.TelemetryInfo.Unit + "],");
          sb.Append(tlm.TelemetryInfo.Name + "[" + tlm.TelemetryInfo.Unit + "](RawData),");
        }
        if (sb.Length > 0)
        {
          sb.Remove(sb.Length - 1, 1);
        }
        sb.Append("\r\n");
        string filePath = Path.Combine(dirPath, packet.PacketInfo.Name + ".csv");
        using (var sw = new StreamWriter(filePath))
        {
          sw.Write(sb.ToString());
        }
      }
    }

    /// <summary>
    /// Returns a stream of the specified csv file
    /// </summary>
    /// <param name="opid">Operation id</param>
    /// <param name="packetName">Telemetry packet name</param>
    public Stream GetLogFileStream(string opid, string packetName)
    {
      string filePath = Path.Combine(_env.ContentRootPath, "Logs", opid, "tlmlog", packetName + ".csv");
      return File.OpenRead(filePath);
    }
    public Stream GetRecordLogFileStream(string opid, string packetName)
    {
      string filePath = Path.Combine(_env.ContentRootPath, "Logs", opid, "recordtlmlog", packetName + ".csv");
      return File.OpenRead(filePath);
    }
  }
}
