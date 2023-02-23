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
      var apId = GetApId(data.TmPacket);
      var packetId = GetPacketId(data.TmPacket);
      var isRealtimeData = true;
      UInt32 TI = 0;
      return await SetTelemetryValuesAsync(data, apId, packetId, isRealtimeData, TI, prevTelemetry);
    }

    private UInt16 CombiteBytes(byte[] bytes, int pos)
    {
      UInt16 byte1 = (UInt16)bytes[pos];
      UInt16 byte2 = (UInt16)bytes[pos + 1];
      UInt16 byte1s = (UInt16)(byte1 << 8);
      return (UInt16)(byte1s + byte2);
    }

    private string GetApId(byte[] packet)
    {
      //packet : CCSDS Packet
      int pos = 0;
      return string.Format("0x{0:x3}", CombiteBytes(packet, pos) & 0b_0000_0111_1111_1111);
    }

    public override byte GetCmdWindow()
    {
      return 0x00;
    }

    public override bool GetRetransmitFlag()
    {
      return false;
    }

    private string GetPacketId(byte[] packet)
    {
      int pos = 6;
      return string.Format("0x{0:x2}", packet[pos]);
    }
  }
}
