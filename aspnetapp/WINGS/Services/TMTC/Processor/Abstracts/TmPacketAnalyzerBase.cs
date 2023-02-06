using System;
using System.Linq;
using System.Collections.Generic;
using System.Threading.Tasks;
using WINGS.Data;
using WINGS.Models;

namespace WINGS.Services
{
  public abstract class TmPacketAnalyzerBase
  {
    private readonly ITelemetryLogRepository _logRepository;

    public TmPacketAnalyzerBase(ITelemetryLogRepository logRepository)
    {
      _logRepository = logRepository;
    }

    public abstract Task<bool> AnalyzePacketAsync(TmPacketData data, List<TelemetryPacket> prevTelemetry);
    public virtual void RemoveOperation(string opid)
    {
    }

    protected async Task<bool> SetTelemetryListValuesAsync(List<TmPacketData> dataList, List<string> packetIdList, List<bool> realtimeFlagList, List<UInt32> TIList, List<TelemetryPacket> prevTelemetry)
    {
      for (int i = 0; i < dataList.Count(); i++)
      {
        await SetTelemetryValuesAsync(dataList[i], packetIdList[i], realtimeFlagList[i], TIList[i], prevTelemetry);
      }
      return true;
    }

    protected async Task<bool> SetTelemetryValuesAsync(TmPacketData data, string packetId, bool isRealtimeData, UInt32 TI, List<TelemetryPacket> prevTelemetry)
    {
      var opid = data.Opid;
      var target = prevTelemetry.FirstOrDefault(packet => (packet.PacketInfo.Id == packetId) && (packet.PacketInfo.IsRealtimeData == isRealtimeData));
      if (target == null && isRealtimeData == false)  // case for the first time of recordtlm packet
      {
        var targetRealtime = prevTelemetry.FirstOrDefault(packet => (packet.PacketInfo.Id == packetId) && (packet.PacketInfo.IsRealtimeData == true));

        var packetInfo = new PacketInfo(){
          Id = targetRealtime.PacketInfo.Id,
          Name = targetRealtime.PacketInfo.Name,
          IsRealtimeData = false
        };
        var telemetries = new List<Telemetry>(targetRealtime.Telemetries);
        foreach (var telemetry in telemetries)
        {
          telemetry.TelemetryValue = new TelemetryValue();
        }
        target = new TelemetryPacket(){
          PacketInfo = packetInfo,
          Telemetries = telemetries
        };

        prevTelemetry.Add(target);
      }
      var receivedTime = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss.f");
      foreach (var tlm in target.Telemetries)
      {
        tlm.TelemetryValue.Time = receivedTime;
        tlm.TelemetryValue.TI = TI;
        try
        {
          SetValue(tlm, data.TmPacket);
        }
        catch
        {
          return false;
        }
      }
      await _logRepository.AddHistoryAsync(opid, target);
      return true;
    }

    private void SetValue(Telemetry tlm, byte[] packet)
    {
      if (TypeTlmLenCheck(tlm.TelemetryInfo.Type, tlm.TelemetryInfo.BitLen))
      {
        switch (tlm.TelemetryInfo.Type)
        {
          case "uint8_t":
          case "uint8":
          {
            Byte raw = (Byte)packet[tlm.TelemetryInfo.OctetPos];
            tlm.TelemetryValue.Value = ConvertValue(raw, tlm);
            tlm.TelemetryValue.RawValue = raw.ToString();
            break;
          }
          case "int8_t":
          case "int8":
          {
            SByte raw = (SByte)packet[tlm.TelemetryInfo.OctetPos];
            tlm.TelemetryValue.Value = ConvertValue(raw, tlm);
            tlm.TelemetryValue.RawValue = raw.ToString();
            break;
          }
          case "uint16_t":
          case "uint16":
          {
            UInt16 raw = (UInt16)(packet[tlm.TelemetryInfo.OctetPos] << 8 | packet[tlm.TelemetryInfo.OctetPos+1]);
            tlm.TelemetryValue.Value = ConvertValue(raw, tlm);
            tlm.TelemetryValue.RawValue = raw.ToString();
            break;
          }
          case "int16_t":
          case "int16":
          {
            Int16 raw = (Int16)(packet[tlm.TelemetryInfo.OctetPos] << 8 | packet[tlm.TelemetryInfo.OctetPos + 1]);
            tlm.TelemetryValue.Value = ConvertValue(raw, tlm);
            tlm.TelemetryValue.RawValue = raw.ToString();
            break;
          }
          case "uint32_t":
          case "uint32":
          {
            UInt32 raw = (UInt32)(packet[tlm.TelemetryInfo.OctetPos] << 24 | packet[tlm.TelemetryInfo.OctetPos + 1] << 16 | packet[tlm.TelemetryInfo.OctetPos + 2] << 8 | packet[tlm.TelemetryInfo.OctetPos + 3]);
            tlm.TelemetryValue.Value = ConvertValue(raw, tlm);
            tlm.TelemetryValue.RawValue = raw.ToString();
            break;
          }
          case "int32_t":
          case "int32":
          {
            Int32 raw = (Int32)(packet[tlm.TelemetryInfo.OctetPos] << 24 | packet[tlm.TelemetryInfo.OctetPos + 1] << 16 | packet[tlm.TelemetryInfo.OctetPos + 2] << 8 | packet[tlm.TelemetryInfo.OctetPos + 3]);
            tlm.TelemetryValue.Value = ConvertValue(raw, tlm);
            tlm.TelemetryValue.RawValue = raw.ToString();
            break;
          }
          case "float":
          {
            var temp = new byte[]{packet[tlm.TelemetryInfo.OctetPos + 3], packet[tlm.TelemetryInfo.OctetPos + 2], packet[tlm.TelemetryInfo.OctetPos + 1], packet[tlm.TelemetryInfo.OctetPos]};
            Single raw = BitConverter.ToSingle(temp, 0);
            tlm.TelemetryValue.Value = ConvertValue(raw, tlm);
            tlm.TelemetryValue.RawValue = raw.ToString();
            break;
          }
          case "double":
          {
            var temp = new byte[]{packet[tlm.TelemetryInfo.OctetPos + 7], packet[tlm.TelemetryInfo.OctetPos + 6], packet[tlm.TelemetryInfo.OctetPos + 5], packet[tlm.TelemetryInfo.OctetPos + 4],
                                  packet[tlm.TelemetryInfo.OctetPos + 3], packet[tlm.TelemetryInfo.OctetPos + 2], packet[tlm.TelemetryInfo.OctetPos + 1], packet[tlm.TelemetryInfo.OctetPos]};
            Double raw = BitConverter.ToDouble(temp, 0);
            tlm.TelemetryValue.Value = ConvertValue(raw, tlm);
            tlm.TelemetryValue.RawValue = raw.ToString();
            break;
          }
          default:
            tlm.TelemetryValue.Value = "Error";
            tlm.TelemetryValue.RawValue = "Error";
            break;
        }
      }
      else
      {
        // int bytenum = (tlm.TelemetryInfo.BitPos + tlm.TelemetryInfo.BitLen - 1) / 8 + 1;
        if (tlm.TelemetryInfo.BitLen < 9)
        {
          Byte mask = (Byte)(((1 << tlm.TelemetryInfo.BitLen) - 1) << (8 - tlm.TelemetryInfo.BitPos - tlm.TelemetryInfo.BitLen));
          Byte defraw = (Byte)((Byte)(packet[tlm.TelemetryInfo.OctetPos] & mask) >> (8 - tlm.TelemetryInfo.BitPos - tlm.TelemetryInfo.BitLen));
          tlm.TelemetryValue.Value = ConvertValue(defraw, tlm);
          tlm.TelemetryValue.RawValue = defraw.ToString();
        }
        else if (tlm.TelemetryInfo.BitLen < 17) 
        {
          UInt16 mask = (UInt16)(((1 << tlm.TelemetryInfo.BitLen) - 1) << (16 - tlm.TelemetryInfo.BitPos - tlm.TelemetryInfo.BitLen));
          UInt16 raw = (UInt16)(packet[tlm.TelemetryInfo.OctetPos] << 8 | packet[tlm.TelemetryInfo.OctetPos + 1]);
          UInt16 defraw = (UInt16)((UInt16)(raw & mask) >> (16 - tlm.TelemetryInfo.BitPos - tlm.TelemetryInfo.BitLen));
          tlm.TelemetryValue.Value = ConvertValue(defraw, tlm);
          tlm.TelemetryValue.RawValue = defraw.ToString();
        }
        else
        {
          UInt32 mask = (UInt32)(((1 << tlm.TelemetryInfo.BitLen) - 1) << (16 - tlm.TelemetryInfo.BitPos - tlm.TelemetryInfo.BitLen));
          UInt32 raw = (UInt32)(packet[tlm.TelemetryInfo.OctetPos] << 24 | packet[tlm.TelemetryInfo.OctetPos + 1] << 16 | packet[tlm.TelemetryInfo.OctetPos + 2] << 8 | packet[tlm.TelemetryInfo.OctetPos + 3]);
          UInt32 defraw = (UInt32)((UInt32)(raw & mask) >> (16 - tlm.TelemetryInfo.BitPos - tlm.TelemetryInfo.BitLen));
          tlm.TelemetryValue.Value = ConvertValue(defraw, tlm);
          tlm.TelemetryValue.RawValue = defraw.ToString();
        }
        // support bytenum > 1 (e.g.: BitPos = 0, 8 < BitLen < 15)
        /*
        if (bytenum != 1)
        {
          var buf = (tlm.TelemetryInfo.BitLen - (8 - tlm.TelemetryInfo.BitPos)) % 8 + 1;
          for (var i = 0; i < bytenum ; i++)
          {
            if (i == 0)
            {
              mask = (Byte)((1 << (8 - tlm.TelemetryInfo.BitPos)) - 1);
              defraw += ((packet[tlm.TelemetryInfo.OctetPos] & mask) << (8 * (bytenum - 1))) >> (8 - buf);
            }
            else if (i == bytenum - 1)
            {
              mask = (Byte)(((1 << buf) - 1) << (8 - buf));
              defraw += ((packet[tlm.TelemetryInfo.OctetPos+i] & mask) << (8 * (bytenum - i))) >> (8 - buf);
            }
            else
            {
              mask = 0b_1111_1111;
              defraw += ((packet[tlm.TelemetryInfo.OctetPos+i] & mask) << (8 * (bytenum - i - 1))) >> (8 - buf);
            }
          }
        }
        */
      }
    }

    private string ConvertValue<T>(T raw, Telemetry tlm)
    {
      switch (tlm.TelemetryInfo.ConvType)
      {
        case "NONE":
          return raw.ToString();

        case "POLY":
          double x = Convert.ToDouble(raw);
          double value = 0;
          for (var i=0; i<6; i++)
          {
            value += tlm.TelemetryInfo.Poly[i]*Math.Pow(x,i);
          }
          return value.ToString();
          
        case "STATUS":
          var rawStr = raw.ToString();
          if (tlm.TelemetryInfo.Status.ContainsKey(rawStr))
          {
            return tlm.TelemetryInfo.Status[rawStr];
          }
          else if (tlm.TelemetryInfo.Status.ContainsKey("*"))
          {
            return tlm.TelemetryInfo.Status["*"];
          }
          else
          {
            return "Undefined(" + rawStr +")";
          }
        
        case "HEX":
          return HexConvertValue(raw, tlm);

        default:
          throw new Exception("Undefined conversion type");
      }      
    }

    private string HexConvertValue<T>(T raw, Telemetry tlm)
    {
      string hexraw;
      switch (tlm.TelemetryInfo.Type)
      {
        case "uint8_t":
        case "uint8":
        {
          Byte byteraw =  Convert.ToByte(raw);
          hexraw = "0x" + byteraw.ToString("x2");
          return hexraw;
        }
        case "int8_t":
        case "int8":
        {
          SByte sbyteraw =  Convert.ToSByte(raw);
          hexraw = "0x" + sbyteraw.ToString("x2");
          return hexraw;
        }
        case "uint16_t":
        case "uint16":
        {
          UInt16 uint16raw =  Convert.ToUInt16(raw);
          hexraw = "0x" + uint16raw.ToString("x4");
          return hexraw;
        }
        case "int16_t":
        case "int16":
        {
          Int16 int16raw =  Convert.ToInt16(raw);
          hexraw = "0x" + int16raw.ToString("x4");
          return hexraw;
        }
        case "uint32_t":
        case "uint32":
        {
          UInt32 uint32raw =  Convert.ToUInt32(raw);
          hexraw = "0x" + uint32raw.ToString("x8");
          return hexraw;
        }
        case "int32_t":
        case "int32":
        {
          Int32 int32raw =  Convert.ToInt32(raw);
          hexraw = "0x" + int32raw.ToString("x8");
          return hexraw;
        }
        default:
          throw new Exception("Unsupported data types for hexadecimal conversion");
      }
    }

    private bool TypeTlmLenCheck(string type, int bitlen)
    {
      int typelen = 0;
      typelen = type switch
      {
        "uint8_t" => sizeof(Byte),
        "uint8" => sizeof(Byte),

        "int8_t" => sizeof(SByte),
        "int8" => sizeof(SByte),

        "uint16_t" => sizeof(UInt16),
        "uint16" => sizeof(UInt16),

        "int16_t" => sizeof(Int16),
        "int16" => sizeof(Int16),

        "uint32_t" => sizeof(UInt32),
        "uint32" => sizeof(UInt32),

        "int32_t" => sizeof(Int32),
        "int32" => sizeof(Int32),
        
        "float" => sizeof(Single),
        "double" => sizeof(Double),

        _ => 0
      };
      return (typelen * 8 == bitlen);
    }
  }
}
