using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using WINGS.Data;
using WINGS.Models;

namespace WINGS.Services
{
  
  public class ChuTmPacketAnalyzer : TmPacketAnalyzerBase, ITmPacketAnalyzer
  {
    public ChuTmPacketAnalyzer(ITelemetryLogRepository logRepository) : base(logRepository)
    {
    }

    public override async Task<bool> AnalyzePacketAsync(TmPacketData data, List<TelemetryPacket> prevTelemetry)
    {
      const int isslCommonHeaderLen = 4;
      const int isslCommonFooterLen = 4;
      int ccsdstmPacketLen = data.TmPacket.Length - isslCommonHeaderLen - isslCommonFooterLen;
      
      byte[] ccsdstmPacket= new byte[ccsdstmPacketLen];
      Array.Copy(data.TmPacket, isslCommonHeaderLen, ccsdstmPacket, 0, ccsdstmPacketLen);
      TmPacketData ccsdsdata = new TmPacketData{ Opid = data.Opid, TmPacket = ccsdstmPacket };

      var packetId = GetPacketId(ccsdsdata.TmPacket);
      var isRealtimeData = true;
      UInt32 TI = 0;
      return await SetTelemetryValuesAsync(ccsdsdata, packetId, isRealtimeData, TI, prevTelemetry);
    }

    // private functions
    private string GetPacketId(byte[] packet)
    {
      //packet : CCSDS Packet
      int pos = 11;
      return string.Format("0x{0:x2}", packet[pos]);
    }
  }
}
