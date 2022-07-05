using System;
using System.Globalization;
using System.Linq;
using System.Collections.Generic;
using System.Threading.Tasks;
using WINGS.Models;
using WINGS.Data;

namespace WINGS.Services
{
  public class TmPacketManager : ITmPacketManager
  {
    private readonly ITmtcHandlerFactory _tmtcHandlerFactory;
    private Dictionary<string, List<TelemetryPacket>> _telemetryDbDict;
    private Dictionary<string, List<TelemetryPacket>> _latestTelemetryDict;

    public TmPacketManager(ITmtcHandlerFactory tmtcHandlerFactory)
    {
      _tmtcHandlerFactory = tmtcHandlerFactory;
      _telemetryDbDict = new Dictionary<string, List<TelemetryPacket>>();
      _latestTelemetryDict = new Dictionary<string, List<TelemetryPacket>>();
    }

    public void RemoveOperation(string opid)
    {
      _tmtcHandlerFactory.GetTmPacketAnalyzer(opid).RemoveOperation(opid);
      _telemetryDbDict.Remove(opid);
      _latestTelemetryDict.Remove(opid);
    }

    public void SetTelemetryDb(string opid, List<TelemetryPacket> telemetryDb)
    {
      _telemetryDbDict.Add(opid, telemetryDb);
      _latestTelemetryDict.Add(opid, telemetryDb);
    }

    public List<TelemetryPacket> GetTelemetryDb(string opid)
    {
      if (!_telemetryDbDict.TryGetValue(opid, out var telemetryDb))
      {
        throw new ResourceNotFoundException("The telemetry db of this operation is not found");
      }
      return telemetryDb;
    }

    public LatestTelemetry GetLatestTelemetry(string opid, string refTlmTime)
    {
      if (!_latestTelemetryDict.TryGetValue(opid, out var telemetryPackets))
      {
        throw new ResourceNotFoundException("The telemetry of this operation is not found");
      }
      var telemetryPacketsRealtimeOnly = telemetryPackets.FindAll(packet => packet.PacketInfo.IsRealtimeData == true);
      
      var latestTelemetry = new LatestTelemetry();
      List<TelemetryPacket> latestTelemetryPackets = new List<TelemetryPacket>(telemetryPacketsRealtimeOnly);
      List<DateTime> tlmTimeList = new List<DateTime>();
      CultureInfo ci = CultureInfo.CurrentCulture;
      DateTimeStyles dts = DateTimeStyles.None;
      DateTime refTlmDateTime;
      DateTime tlmDateTime;
      
      if (DateTime.TryParseExact(refTlmTime, "yyyy-MM-dd HH:mm:ss.f", ci, dts, out refTlmDateTime))
      {
        var tlmPackets = new List<TelemetryPacket>();
        
        foreach (var telemetryPacket in latestTelemetryPackets)
        {
          var tlmTime = telemetryPacket.Telemetries[0].TelemetryValue.Time;
          if (tlmTime == null)
          {
            continue;
          }
          else
          {
            if (DateTime.TryParseExact(tlmTime, "yyyy-MM-dd HH:mm:ss.f", ci, dts, out tlmDateTime))
            {
              if(tlmDateTime > refTlmDateTime)
              {
              tlmPackets.Add(telemetryPacket);
              }
            }
          }
        }
        latestTelemetry.LatestTelemetryPackets = tlmPackets;
      }
      else
      {
        latestTelemetry.LatestTelemetryPackets = latestTelemetryPackets;
      }

      foreach (var telemetryPacket in latestTelemetryPackets)
      {
        var tlmTime = telemetryPacket.Telemetries[0].TelemetryValue.Time;
        if (tlmTime == null)
        {
          continue;
        }
        else 
        {
          if (DateTime.TryParseExact(tlmTime, "yyyy-MM-dd HH:mm:ss.f", ci, dts, out tlmDateTime))
          {
            tlmTimeList.Add(tlmDateTime);
          }
        }
      }
      latestTelemetry.LatestTelemetryTime = (tlmTimeList.Count()!=0)?tlmTimeList.Max().ToString("yyyy-MM-dd HH:mm:ss.f"):"";

      return latestTelemetry;
    }

    public async Task RegisterTelemetryAsync(TmPacketData data)
    {
      var opid = data.Opid;
      var latestTelemetry = GetLatestTelemetryToUpdate(opid);
      await _tmtcHandlerFactory.GetTmPacketAnalyzer(opid).AnalyzePacketAsync(data, latestTelemetry);
    }

    private List<TelemetryPacket> GetLatestTelemetryToUpdate(string opid)
    {
      if (!_latestTelemetryDict.TryGetValue(opid, out var telemetryPackets))
      {
        throw new ResourceNotFoundException("The telemetry of this operation is not found");
      }
      return telemetryPackets;
    }
  }
}
