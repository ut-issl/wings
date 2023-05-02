using System;
using System.Linq;
using System.Collections.Generic;
using System.Threading.Tasks;
using WINGS.Data;
using WINGS.Models;

namespace WINGS.Services
{
  public abstract class TcPacketGeneratorBase
  {
    protected abstract byte[] GeneratePacket(Command command, byte cmdType, byte cmdWindow);

    public TcPacketData GetTcPacketData(string opid, Command command, byte cmdType, byte cmdWindow)
    {
      var packet = GeneratePacket(command, cmdType, cmdWindow);
      return new TcPacketData(){
        Opid = opid,
        TcPacket = packet
      };
    }

    protected int GetParamsByteLength(Command command)
    {
      int length = 0;
      foreach (var param in command.Params)
      {
        length += param.Type switch
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

          "raw" => GetRawLength(param.Value),

          _ => throw new Exception("Undefined data type")
        };
      }
      return length;
    }

    protected int GetRawLength(String val){
      val = val.Replace("0x", "");
      val = val.Replace("/", "");
      val = val.Replace("[", "");
      val = val.Replace("]", "");
      if (val.Length % 2 == 0)
      {
        return val.Length / 2;
      }
      else
      {
        throw new Exception("The value of \"raw\" should be in bytes.");
      }
    }

    protected void SetParams(byte[] packet, List<CommandParam> commandParams, int offset)
    {
      int pos = offset;
      foreach (var param in commandParams)
      {
        switch (param.Type)
        {
          case "uint8_t":
          case "uint8":
          {
            Byte val;
            if(param.Value.Contains("0x")){
              var param8bit = Convert.ToByte(param.Value, 16);
              val = Convert.ToByte(param8bit);
            }
            else{
              val = Convert.ToByte(param.Value);
            }
            packet[pos] = val;
            pos += sizeof(Byte);
            break;
          }
          case "int8_t":
          case "int8":
          {
            SByte val;
            if(param.Value.Contains("0x")){
              var param8bit = Convert.ToSByte(param.Value, 16);
              val = Convert.ToSByte(param8bit);
            }
            else{
              val = Convert.ToSByte(param.Value);
            }
            packet[pos] = (byte)val;
            pos += sizeof(SByte);
            break;
          }
          case "uint16_t":
          case "uint16":
          {
            UInt16 val;
            if(param.Value.Contains("0x")){
              var param16bit = Convert.ToUInt16(param.Value, 16);
              val = Convert.ToUInt16(param16bit);
            }
            else{
              val = Convert.ToUInt16(param.Value);
            }
            packet[pos]   = (byte)(val >> 8 & 0xff);
            packet[pos+1] = (byte)(val      & 0xff);
            pos += sizeof(UInt16);
            break;
          }
          case "int16_t":
          case "int16":
          {
            Int16 val;
            if(param.Value.Contains("0x")){
              var param16bit = Convert.ToInt16(param.Value, 16);
              val = Convert.ToInt16(param16bit);
            }
            else{
              val = Convert.ToInt16(param.Value);
            }
            packet[pos]   = (byte)(val >> 8 & 0xff);
            packet[pos+1] = (byte)(val      & 0xff);
            pos += sizeof(Int16);
            break;
          }
          case "uint32_t":
          case "uint32":
          {
            UInt32 val;
            if(param.Value.Contains("0x")){
              var param32bit = Convert.ToUInt32(param.Value, 16);
              val = Convert.ToUInt32(param32bit);
            }
            else{
              val = Convert.ToUInt32(param.Value);
            }
            packet[pos]   = (byte)(val >> 24 & 0xff);
            packet[pos+1] = (byte)(val >> 16 & 0xff);
            packet[pos+2] = (byte)(val >>  8 & 0xff);
            packet[pos+3] = (byte)(val       & 0xff);
            pos += sizeof(UInt32);
            break;
          }
          case "int32_t":
          case "int32":
          {
            Int32 val;
            if(param.Value.Contains("0x")){
              var param32bit = Convert.ToInt32(param.Value, 16);
              val = Convert.ToInt32(param32bit);
            }
            else{
              val = Convert.ToInt32(param.Value);
            }
            packet[pos]   = (byte)(val >> 24 & 0xff);
            packet[pos+1] = (byte)(val >> 16 & 0xff);
            packet[pos+2] = (byte)(val >>  8 & 0xff);
            packet[pos+3] = (byte)(val       & 0xff);
            pos += sizeof(Int32);
            break;
          }
          case "float":
          {
            Single val = Convert.ToSingle(param.Value);
            var bytes = BitConverter.GetBytes(val);
            for (int i = 0; i < sizeof(Single); i++)
            {
              packet[pos+i] = bytes[sizeof(Single)-i-1]; // To big endian
            }
            pos += sizeof(Single);
            break;
          }
          case "double":
          {
            Double val = Convert.ToDouble(param.Value);
            var bytes = BitConverter.GetBytes(val);
            for (int i = 0; i < sizeof(Double); i++)
            {
              packet[pos+i] = bytes[sizeof(Double)-i-1]; // To big endian
            }
            pos += sizeof(Double);
            break;
          }
          case "raw":
          {
            int rawlen = GetRawLength(param.Value);
            param.Value = param.Value.Replace("0x", "");
            param.Value = param.Value.Replace("/", "");
            param.Value = param.Value.Replace("[", "");
            param.Value = param.Value.Replace("]", "");
            for (int i = 0; i < rawlen; i++)
            {
              packet[pos+i] = Convert.ToByte(param.Value.Substring(i*2, 2), 16);
            }
            pos += rawlen;
            break;
          }
          default:
            throw new Exception("Undefined data type");
        }
      }
    }
  }
}
