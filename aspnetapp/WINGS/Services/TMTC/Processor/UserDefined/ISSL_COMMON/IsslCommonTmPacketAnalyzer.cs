using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using WINGS.Data;
using WINGS.Models;

namespace WINGS.Services
{
  public class IsslCommonTmPacketAnalyzer : TmPacketAnalyzerBase, ITmPacketAnalyzer
  {
    public IsslCommonTmPacketAnalyzer(ITelemetryLogRepository logRepository) : base(logRepository)
    {
    }

    public override async Task<bool> AnalyzePacketAsync(TmPacketData data, List<TelemetryPacket> prevTelemetry)
    {
      var packetId = GetPacketId(data.TmPacket);
      var isRealtimeData = true;
      UInt32 TI = 0;
      return await SetTelemetryValuesAsync(data, packetId, isRealtimeData, TI, prevTelemetry);
    }

    private string GetPacketId(byte[] packet)
    {
      int pos = 6;
      return string.Format("0x{0:x2}", packet[pos]);
    }
  }
}
