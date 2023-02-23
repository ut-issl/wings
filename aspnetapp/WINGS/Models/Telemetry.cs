using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace WINGS.Models
{

  public class LatestTelemetry
  {
    public string LatestTelemetryTime {get; set;}
    public List<TelemetryPacket> LatestTelemetryPackets {get; set;}
  }
  public class TelemetryPacket
  {
    public PacketInfo PacketInfo { get; set; }
    public List<Telemetry> Telemetries { get; set; }
  }
  public class PacketInfo
  {
    public string ApId { get; set; }
    public string Id { get; set; }
    public string CompoName { get; set; }
    public string Name { get; set; }
    public bool IsRealtimeData { get; set; }
    public bool IsRestricted { get; set; }
  }

  public class Telemetry
  {
    public TelemetryInfo TelemetryInfo { get; set; }
    public TelemetryValue TelemetryValue { get; set; }
  }


public class TelemetryInfo
  {
    public string Name { get; set; }
    public string Type { get; set; }
    public string Unit { get; set; }
    public int OctetPos { get; set; }
    public int BitPos { get; set; }
    public int BitLen { get; set; }
    public string ConvType { get; set; }
    public double[] Poly { get; set; }
    public Dictionary<string, string> Status { get; set; }
    public string Description { get; set; }
  }

  public class TelemetryValue
  {
    public string Time { get; set; }
    public UInt32 TI { get; set; }
    public string Value { get; set; }
    public string RawValue { get; set; }
  }

  public class TelemetryPacketHistory
  {
    public PacketInfo PacketInfo { get; set; }
    public List<TelemetryHistory> TelemetryHistories { get; set; }
  }

  public class TelemetryHistory
  {
    public TelemetryInfo TelemetryInfo { get; set; }
    public List<TelemetryValue> TelemetryValues { get; set; }
  }

}
