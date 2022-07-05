using System.Collections.Generic;
using System.Threading.Tasks;
using WINGS.Models;

namespace WINGS.Services
{
  public interface ITmPacketManager
  {
    void RemoveOperation(string opid);
    void SetTelemetryDb(string opid, List<TelemetryPacket> telemetryDb);
    List<TelemetryPacket> GetTelemetryDb(string opid);
    LatestTelemetry GetLatestTelemetry(string opid, string refTlmTime);
    Task RegisterTelemetryAsync(TmPacketData data);
  }
}
