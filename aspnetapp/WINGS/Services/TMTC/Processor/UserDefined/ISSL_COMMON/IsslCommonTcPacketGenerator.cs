using System;
using WINGS.Models;

namespace WINGS.Services
{
  public class IsslCommonTcPacketGenerator : TcPacketGeneratorBase, ITcPacketGenerator
  {
    protected static readonly int TcPktCmmnHdrLen = 4;
    protected static readonly int TcPktCmdHdrLen = 4;
    protected static readonly int TcPktFtrLen = 4;
    protected static Byte command_count;

    static IsslCommonTcPacketGenerator()
    {
      command_count = 0;
    }

    protected override byte[] GeneratePacket(Command command, byte cmdType, byte cmdWindow)
    {
      int paramsLen = GetParamsByteLength(command);
      var tcPktBdyLen = (UInt16)(TcPktCmdHdrLen + paramsLen);
      var tcPktLen = (UInt16)(TcPktCmmnHdrLen + tcPktBdyLen + TcPktFtrLen);
      var packet = new byte[tcPktLen];

      // Header
      // STX
      packet[0] = 0xeb;
      packet[1] = 0x90;
      // Length
      byte val = (byte)(tcPktBdyLen >> 8);
      packet[2] = val;
      val = (byte)(tcPktBdyLen & 0xff);
      packet[3] = val;

      // Body
      // VERSION_ID
      packet[4] = 0x01;
      // CMMAND_COUNT
      command_count += 1;
      packet[5] = command_count;
      // COMMAND_ID
      UInt16 id_tmp = UInt16.Parse(command.Code.Remove(0, 2), System.Globalization.NumberStyles.HexNumber);
      val = (byte)(id_tmp >> 8);
      packet[6] = val;
      val = (byte)(id_tmp & 0xff);
      packet[7] = val;
      // ARGS
      SetParams(packet, command.Params, TcPktCmmnHdrLen + TcPktCmdHdrLen);

      // Footer
      // CRC
      var crc = CalcCRC(packet);
      packet[tcPktLen - TcPktFtrLen] = crc[0];
      packet[tcPktLen - TcPktFtrLen + 1] = crc[1];
      // ETX
      packet[tcPktLen - TcPktFtrLen + 2] = 0xc5;
      packet[tcPktLen - TcPktFtrLen + 3] = 0x79;

      return packet;
    }

    protected virtual byte[] CalcCRC(byte[] packet)
    {
      // CRCはこのクラスでは実装しない、継承先で実装する
      var crc = new byte[2];
      crc[0] = 0x00;
      crc[1] = 0x00;
      return crc;
    }
  }
}
