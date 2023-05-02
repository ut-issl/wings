using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using WINGS.Models;

namespace WINGS.Services
{
  public interface ITmPacketAnalyzer
  {
    Task<bool> AnalyzePacketAsync(TmPacketData data, List<TelemetryPacket> prevTelemetry);
    public byte GetCmdWindow();
    public bool GetRetransmitFlag();
    void RemoveOperation(string opid);
  }
}
