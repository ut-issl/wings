using System.IO;
using System.Threading.Tasks;
using System.Collections.Generic;
using WINGS.Models;

namespace WINGS.Services
{
  public interface ITelemetryService
  {
    LatestTelemetry GetLatestTelemetry(string opid, string refTlmTime);
    IEnumerable<TelemetryPacketHistory> GetTelemetryHistory(string opid);
    List<string> GetPacketsWithData(string opid);
    List<string> GetRecordPacketsWithData(string opid);
    Task<bool> ConfigureTelemetryDbAsync(Operation operation, TlmCmdFileConfig config);
    Stream GetTelemetryLogStream(string opid, List<string> packetNames);
    Stream GetRecordTelemetryLogStream(string opid, List<string> packetNames);
  }
}
