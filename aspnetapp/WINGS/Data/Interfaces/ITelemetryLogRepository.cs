using System.IO;
using System.Collections.Generic;
using System.Threading.Tasks;
using WINGS.Models;

namespace WINGS.Data
{
  public interface ITelemetryLogRepository
  {
    Task AddHistoryAsync(string opid, TelemetryPacket packet);
    List<TelemetryPacketHistory> GetTelemetryHistory(string opid, List<TelemetryPacket> telemetryDb);
    List<string> GetPacketsWithData(string opid);
    List<string> GetRecordPacketsWithData(string opid);
    void InitializeLogFiles(string opid, List<TelemetryPacket> telemetryDb);
    Stream GetLogFileStream(string opid, string packetName);
    Stream GetRecordLogFileStream(string opid, string packetName);
  }
}
