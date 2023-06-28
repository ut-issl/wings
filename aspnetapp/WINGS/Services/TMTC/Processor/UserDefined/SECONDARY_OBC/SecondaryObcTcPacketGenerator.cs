using System;
using System.Collections.Generic;
using WINGS.Data;
using WINGS.Models;
using WINGS.Library;

namespace WINGS.Services
{
  public class SecondaryObcTcPacketGenerator : TcPacketGeneratorBase, ITcPacketGenerator
  {
    // static readonly int
    // User Data
    private static readonly int UserDataHdrLen = 8;
    // TC Packet
    private static readonly int TcPktPriHdrLen = 6;
    private static readonly int TcPktSecHdrLen = 1;
    // ISSL Format
    private static readonly int IsslFormatHdrLen = 4;
    private static readonly int CrcLen = 2;
    private static readonly int IsslFormatFtrLen = 2;
    // pos
    private static readonly int TcTrsFrmPos = 0;
    private static readonly int TcPktPos = TcTrsFrmPos + IsslFormatHdrLen;
    private static readonly int UserDataPos = TcPktPos +  TcPktPriHdrLen + TcPktSecHdrLen;

    // enum
    // User Data
    private enum UdCmdType { Unknown = 0, Dc = 1, Sm = 2 }
    private enum UdExeType { Realtime = 0, Timeline = 1, Macro = 2 ,UnixTimeline = 4 }

    // TC Packet
    private enum TcpVer { Ver1 = 0 }
    private enum TcpType { Tlm = 0, Cmd = 1 }
    private enum TcpSecHdrFlag { Absent = 0, Present = 1 }
    private enum TcpApid { MobcCmd = 0x210, AobcCmd = 0x211, TobcCmd = 0x212 }
    private enum TcpSeqFlag { Cont = 0, First = 1, Last = 2, Single = 3 }
    private enum TcpSeqCnt { Default = 0 }
    private enum TcpSecondaryHeaderVer { Unknown = 0, Version1 = 1 }

    protected override byte[] GeneratePacket(Command command, byte cmdType, byte cmdWindow)
    {
      int paramsLen = GetParamsByteLength(command);
      var tcpPktLen = (UInt16)(TcPktSecHdrLen + UserDataHdrLen + paramsLen);
      var isslUserPktLen = (UInt16)(TcPktPriHdrLen + tcpPktLen);
      var isslPktLen = (UInt16)(IsslFormatHdrLen + isslUserPktLen + CrcLen + IsslFormatFtrLen);
      var packet = new byte[isslPktLen];

      var channelId = GetChannelId(command);
      var exeType = GetExeType(command);

      // ISSL Format Header
      // STX
      packet[0] = 0xeb;
      packet[1] = 0x90;
      // Length
      SetIsslFormatLen(packet, isslUserPktLen);
      
      // TC Packet
      SetTcpVerNum(packet, TcpVer.Ver1);
      SetTcpType(packet, TcpType.Cmd);
      SetTcpSecHdrFlag(packet, TcpSecHdrFlag.Present);
      SetTcpApid(packet, TcpApid.AobcCmd);
      SetTcpSeqFlag(packet, TcpSeqFlag.Single);
      SetTcpSeqCnt(packet, TcpSeqCnt.Default);
      SetTcpPktLen(packet, tcpPktLen);
      SetTcpSecondaryHeaderVer(packet, TcpSecondaryHeaderVer.Version1);

      // User Data
      SetUdCmdType(packet, UdCmdType.Unknown);
      SetUdChannelId(packet, channelId);
      SetUdExeType(packet, exeType);
      SetUdTi(packet, exeType, command);
      SetParams(packet, command.Params, UserDataPos + UserDataHdrLen);

      // CRC
      SetTctfCrc(packet, (UInt16)(IsslFormatHdrLen + isslUserPktLen)); 
      
      // EXT
      packet[isslPktLen-2] = 0xc5;
      packet[isslPktLen-1] = 0x79;
      
      return packet;
    }

    // MOBCの関数を微修正したもの
    private void SetIsslFormatLen(byte[] packet, UInt16 len)
    {
      int pos = TcTrsFrmPos + 2;
      byte val = (byte)(len >> 8);
      packet[pos] = val;
      val = (byte)(len & 0xff);
      packet[pos+1] = val;
    }

    // TODO: 以下，MOBCからコピペなので本来はうまく使いまわすようにしたい
    private UInt16 GetChannelId(Command command)
    {
      return UInt16.Parse(command.Code.Remove(0,2), System.Globalization.NumberStyles.HexNumber);
    }
    private UdExeType GetExeType(Command command)
    {
      if (command.ExecType == CmdExecType.RT)
      {
        return UdExeType.Realtime;
      }
      else if (command.ExecType == CmdExecType.TL)
      {
        return UdExeType.Timeline;
      }
      else if (command.ExecType == CmdExecType.BL)
      {
        return UdExeType.Macro;
      }
      else if (command.ExecType == CmdExecType.UTL)
      {
        return UdExeType.UnixTimeline;
      }
      return  UdExeType.Realtime; // error
    }
    private uint GetTi(Command command)
    {
      return command.ExecTimeInt;
    }
    private double GetUnixTi(Command command)
    {
      return command.ExecTimeDouble;
    }

    private void SetTcpVerNum(byte[] packet, TcpVer ver)
    {
      int pos = TcPktPos;
      byte mask = 0b_1110_0000;
      byte val = (byte)((byte)ver << 5);
      packet[pos] &= (byte)(~mask);
      packet[pos] |= val;
    }
    private void SetTcpType(byte[] packet, TcpType type)
    {
      int pos = TcPktPos;
      byte mask = 0b_0001_0000;
      byte val = (byte)((byte)type << 4);
      packet[pos] &= (byte)(~mask);
      packet[pos] |= val;
    }
    private void SetTcpSecHdrFlag(byte[] packet, TcpSecHdrFlag flag)
    {
      int pos = TcPktPos;
      byte mask = 0b_0000_1000;
      byte val = (byte)((byte)flag << 3);
      packet[pos] &= (byte)(~mask);
      packet[pos] |= val;
    }
    private void SetTcpApid(byte[] packet, TcpApid apid)
    {
      int pos = TcPktPos;
      byte mask = 0b_0000_0111;
      byte val = (byte)((UInt16)apid >> 8 & mask);
      packet[pos] &= (byte)(~mask);
      packet[pos] |= val;
      val = (byte)((UInt16)apid & 0xff);
      packet[pos+1] = val;
    }
    private void SetTcpSeqFlag(byte[] packet, TcpSeqFlag flag)
    {
      int pos = TcPktPos + 2;
      byte mask = 0b_1100_0000;
      byte val = (byte)((byte)flag << 6);
      packet[pos] &= (byte)(~mask);
      packet[pos] |= val;
    }
    private void SetTcpSeqCnt(byte[] packet, TcpSeqCnt cnt)
    {
      int pos = TcPktPos + 2;
      byte mask = 0b_0011_1111;
      byte val = (byte)((UInt16)cnt >> 8 & mask);
      packet[pos] &= (byte)(~mask);
      packet[pos] |= val;
      val = (byte)((UInt16)cnt & 0xff);
      packet[pos+1] = val;
    }
    private void SetTcpPktLen(byte[] packet, UInt16 len)
    {
      int pos = TcPktPos + 4;
      UInt16 z_origin = (UInt16)(len - 1); // TCPacketのLengthは0起算表記なので1起算に変換
      byte val = (byte)(z_origin >> 8);
      packet[pos] = val;
      val = (byte)(z_origin & 0xff);
      packet[pos+1] = val;
    }
    private void SetTcpSecondaryHeaderVer(byte[] packet, TcpSecondaryHeaderVer id)
    {
      int pos = TcPktPos + 6;
      packet[pos] = (byte)id;
    }
    private void SetUdCmdType(byte[] packet, UdCmdType type)
    {
      int pos = UserDataPos;
      packet[pos] = (byte)type;
    }
    private void SetUdChannelId(byte[] packet, UInt16 id)
    {
      int pos = UserDataPos + 1;
      byte val = (byte)(id >> 8);
      packet[pos] = val;
      val = (byte)(id & 0xff);
      packet[pos+1] = val;
    }
    private void SetUdExeType(byte[] packet, UdExeType type)
    {
      int pos = UserDataPos + 3;
      packet[pos] = (byte)type;
    }
    private void SetUdTi(byte[] packet, UdExeType type, Command command)
    {
      int pos = UserDataPos + 4;
      if(type == UdExeType.UnixTimeline)
      {
        double epoch_unix_time = 1577836800; // UNIX TIME of 2020/1/1 00:00:00(UTC)
        uint converted_unix_time = 0;
        double unixTi = GetUnixTi(command);
        if (unixTi - epoch_unix_time > 0)
        {
          converted_unix_time = (uint) Math.Round((unixTi - epoch_unix_time)*10);
        }
        byte val = (byte)(converted_unix_time >> 24);
        packet[pos] = val;
        val = (byte)(converted_unix_time >> 16 & 0xff);
        packet[pos + 1] = val;
        val = (byte)(converted_unix_time >> 8 & 0xff);
        packet[pos + 2] = val;
        val = (byte)(converted_unix_time & 0xff);
        packet[pos + 3] = val;
      }
      else
      {
        uint ti = GetTi(command);
        byte val = (byte)(ti >> 24);
        packet[pos] = val;
        val = (byte)(ti >> 16 & 0xff);
        packet[pos+1] = val;
        val = (byte)(ti >> 8 & 0xff);
        packet[pos+2] = val;
        val = (byte)(ti & 0xff);
        packet[pos+3] = val;
      }
    }

    private void SetTctfCrc(byte[] packet, UInt16 tctfPktLen)
    {
      int pos = packet.Length - 4;
      UInt16 crc_tmp = CRC.CRC16CCITTLeftCalc(packet[4..^4], 0xffff);
      byte val = (byte)(crc_tmp >> 8);
      packet[pos] = val;
      val = (byte)(crc_tmp & 0xff);
      packet[pos + 1] = val;
    }
  }
}
