using System;
using System.IO;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using WINGS.Data;
using WINGS.Models;
using WINGS.Library;

namespace WINGS.Services
{
  public class TelemetryService : ITelemetryService
  {
    private readonly ITmPacketManager _tmPacketManager;
    private readonly ITelemetryLogRepository _logRepository;
    private readonly IDbRepository<TelemetryPacket> _dbRepository;

    public TelemetryService(ITmPacketManager tmPacketManager,
                            ITelemetryLogRepository logRepository,
                            IDbRepository<TelemetryPacket> dbRepository)
    {
      _tmPacketManager = tmPacketManager;
      _logRepository = logRepository;
      _dbRepository = dbRepository;
    }

    public LatestTelemetry GetLatestTelemetry(string opid, string refTlmTime)
    {
      return _tmPacketManager.GetLatestTelemetry(opid, refTlmTime);
    }

    public IEnumerable<TelemetryPacketHistory> GetTelemetryHistory(string opid)
    {
      return _logRepository.GetTelemetryHistory(opid, _tmPacketManager.GetTelemetryDb(opid));
    }

    public List<string> GetPacketsWithData(string opid)
    {
      return _logRepository.GetPacketsWithData(opid);
    }
    public List<string> GetRecordPacketsWithData(string opid)
    {
      return _logRepository.GetRecordPacketsWithData(opid);
    }

    public async Task<bool> ConfigureTelemetryDbAsync(Operation operation, TlmCmdFileConfig config)
    {
      try
      {
        var telemetryDb = await _dbRepository.LoadAllFilesAsync(config);
        _tmPacketManager.SetTelemetryDb(operation.Id, telemetryDb.ToList());
        _logRepository.InitializeLogFiles(operation.Id, telemetryDb.ToList());
        return true;
      }
      catch (Exception ex)
      {
        Console.WriteLine(ex.Message);
        return false;
      } 
    }

    public Stream GetTelemetryLogStream(string opid, List<string> packetNames)
    {
      var zipItems = new List<ZipItem>();
      foreach(var packetName in packetNames)
      {
        zipItems.Add(new ZipItem(){
          Name = packetName + ".csv",
          Content = _logRepository.GetLogFileStream(opid, packetName)
        });
      }
      return Zipper.GetZipStream(zipItems);
    }
    public Stream GetRecordTelemetryLogStream(string opid, List<string> packetNames)
    {
      var zipItems = new List<ZipItem>();
      foreach(var packetName in packetNames)
      {
        zipItems.Add(new ZipItem(){
          Name = packetName + ".csv",
          Content = _logRepository.GetRecordLogFileStream(opid, packetName)
        });
      }
      return Zipper.GetZipStream(zipItems);
    }
  }
}
