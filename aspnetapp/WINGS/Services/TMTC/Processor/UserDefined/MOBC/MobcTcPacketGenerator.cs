using System;
using System.Collections.Generic;
using WINGS.Data;
using WINGS.Models;
using WINGS.Library;

namespace WINGS.Services
{
  public class MobcTcPacketGenerator : TcPacketGeneratorBase, ITcPacketGenerator
  {
    // static readonly int
    // User Data
    private static readonly int UserDataHdrLen = 8;
    // TC Packet
    private static readonly int TcPktPriHdrLen = 6;
    private static readonly int TcPktSecHdrLen = 1;
    // TC Segment
    private static readonly int TcSgmHdrLen = 1;
    // TC Transfer Frame
    private static readonly int TcTrsFrmPriHdrLen = 5;
    private static readonly int CrcLen = 2;
    // pos
    private static readonly int TcTrsFrmPos = 0;
    private static readonly int TcSgmPos = TcTrsFrmPos + TcTrsFrmPriHdrLen;
    private static readonly int TcPktPos = TcSgmPos + TcSgmHdrLen;
    private static readonly int UserDataPos = TcPktPos +  TcPktPriHdrLen + TcPktSecHdrLen;


    // enum
    // User Data
    private enum UdCmdType { Dc = 1, Sm = 2 }
    private enum UdExeType { Realtime = 0x00, Timeline = 0x01, Macro = 0x02, UnixTimeline = 0x04, MobcRealtime = 0x10, MobcTimeline = 0x11, MobcMacro = 0x12, MobcUnixTimeline = 0x14, AobcRealtime = 0x20, AobcTimeline = 0x21, AobcMacro = 0x22, AobcUnixTimeline = 0x24, TobcRealtime = 0x30, TobcTimeline = 0x31, TobcMacro = 0x32, TobcUnixTimeline = 0x34}

    // TC Packet
    private enum TcpVer { Ver1 = 0 }
    private enum TcpType { Tlm = 0, Cmd = 1 }
    private enum TcpSecHdrFlag { Absent = 0, Present = 1 }
    private enum TcpApid { MobcCmd = 0x210, AobcCmd = 0x211, TobcCmd = 0x212 }
    private enum TcpSeqFlag { Cont = 0, First = 1, Last = 2, Single = 3 }
    private enum TcpSeqCnt { Default = 0 }
    private enum TcpFmtId { Control = 1, User = 2, Memory = 3 }
    
    // TC Segment
    private enum TcsgmSeqFlag { First = 0b01, Continuing = 0b00, Last = 0b10, No = 0b11 }
    private enum TcsgmMltAccPntId { DhuHrdDcd = 0b000001, Normal = 0b000010, Long = 0b000100 }

    // TC Transfer Frame
    private enum TctfVer { Ver1 = 0b00 }
    private enum TctfBypsFlag { TypeA = 0b0, TypeB = 0b1 }
    private enum TctfCtlCmdFlag { Dmode = 0b0, Cmode = 0b1 }
    private enum TctfSpare { Fixed = 0b00 }
    private enum TctfScId { Default = 0x157 }
    private enum TctfVirChId { Default = 0b000000}
    private enum TctfSeq { TypeB = 0x00 }



    protected override byte[] GeneratePacket(Command command)
    {
      int paramsLen = GetParamsByteLength(command);
      var tctfPktLen = (UInt16)(TcTrsFrmPriHdrLen + TcSgmHdrLen + TcPktPriHdrLen + TcPktSecHdrLen + UserDataHdrLen + paramsLen + CrcLen);
      var packet = new byte[tctfPktLen];

      var tcpPktLen = (UInt16)(TcPktSecHdrLen + UserDataHdrLen + paramsLen); // "PACKET FIELD" Length
      var channelId = GetChannelId(command);
      var exeType = GetExeType(command);
      var apid = GetApid(command);

      //TC Transfer Frame (except CRC)
      SetTctfVer(packet, TctfVer.Ver1);
      SetTctfBypsFlag(packet, TctfBypsFlag.TypeB);
      SetTctfCtlCmdFlag(packet, TctfCtlCmdFlag.Dmode);
      SetTctfSpare(packet, TctfSpare.Fixed);
      SetTctfScId(packet, TctfScId.Default);
      SetTctfVirChId(packet, TctfVirChId.Default);
      SetTctfLen(packet, tctfPktLen);
      SetTctfSeq(packet, TctfSeq.TypeB);

      //TC Segment
      SetTcsgmSeqFlag(packet, TcsgmSeqFlag.No);
      SetTcsgmMltAccPntId(packet, TcsgmMltAccPntId.Normal);
      
      // TC Packet
      SetTcpVerNum(packet, TcpVer.Ver1);
      SetTcpType(packet, TcpType.Cmd);
      SetTcpSecHdrFlag(packet, TcpSecHdrFlag.Present);
      SetTcpApid(packet, apid);
      SetTcpSeqFlag(packet, TcpSeqFlag.Single);
      SetTcpSeqCnt(packet, TcpSeqCnt.Default);
      SetTcpPktLen(packet, tcpPktLen);
      SetTcpFmtId(packet, TcpFmtId.Control);

      // User Data
      SetUdCmdType(packet, UdCmdType.Sm);
      SetUdChannelId(packet, channelId);
      SetUdExeType(packet, exeType);
      SetUdTi(packet, exeType, command);
      SetParams(packet, command.Params, UserDataPos + UserDataHdrLen);

      //CRC
      SetTctfCrc(packet, tctfPktLen);   
      
      return packet;
    }

    private UInt16 GetChannelId(Command command)
    {
      return UInt16.Parse(command.Code.Remove(0,2), System.Globalization.NumberStyles.HexNumber);
    }
    private UdExeType GetExeType(Command command)
    {
      if (command.IsViaMobc)
      {
        switch (command.ExecType)
        {
          case CmdExecType.RT:
            return UdExeType.Realtime;
          case CmdExecType.TL:
            return UdExeType.Timeline;
          case CmdExecType.BL:
            return UdExeType.Macro;
          case CmdExecType.UTL:
            return UdExeType.UnixTimeline;
          default:
            return UdExeType.Realtime;
        }
      }
      else
      {
        switch (command.Component)
        {
          case "MOBC":
            switch (command.ExecType)
            {
              case CmdExecType.RT:
                return UdExeType.Realtime;
              case CmdExecType.TL:
                return UdExeType.Timeline;
              case CmdExecType.BL:
                return UdExeType.Macro;
              case CmdExecType.UTL:
                return UdExeType.UnixTimeline;
              default:
                return UdExeType.Realtime;
            }
          case "AOBC":
            switch (command.ExecType)
            {
              case CmdExecType.RT:
                return UdExeType.AobcRealtime;
              case CmdExecType.TL:
                return UdExeType.AobcTimeline;
              case CmdExecType.BL:
                return UdExeType.AobcMacro;
              case CmdExecType.UTL:
                return UdExeType.UnixTimeline;
              default:
                return UdExeType.AobcRealtime;
            }
          case "TOBC":
            switch (command.ExecType)
            {
              case CmdExecType.RT:
                return UdExeType.TobcRealtime;
              case CmdExecType.TL:
                return UdExeType.TobcTimeline;
              case CmdExecType.BL:
                return UdExeType.TobcMacro;
              case CmdExecType.UTL:
                return UdExeType.UnixTimeline;
              default:
                return UdExeType.TobcRealtime;
            }
          default:
            switch (command.ExecType)
            {
              case CmdExecType.RT:
                return UdExeType.Realtime;
              case CmdExecType.TL:
                return UdExeType.Timeline;
              case CmdExecType.BL:
                return UdExeType.Macro;
              case CmdExecType.UTL:
                return UdExeType.UnixTimeline;
              default:
                return UdExeType.Realtime;
            }
        }
      }
    }
    private TcpApid GetApid(Command command)
    {
      switch (command.Component)
      {
        case "MOBC":
          return TcpApid.MobcCmd;
        case "AOBC":
          return TcpApid.AobcCmd;
        case "TOBC":
          return TcpApid.TobcCmd;
        default:
          return TcpApid.MobcCmd;
      }
    }
    protected uint GetTi(Command command)
    {
      return command.ExecTimeInt;
    }

    protected double GetUnixTi(Command command)
    {
      return command.ExecTimeDouble;
    }

    private void SetTctfVer(byte[] packet, TctfVer ver)
    {
      int pos = TcTrsFrmPos;
      byte mask = 0b_1100_0000;
      byte val = (byte)((byte)ver << 6);
      packet[pos] &= (byte)(~mask);
      packet[pos] |= val;
    }

    private void SetTctfBypsFlag(byte[] packet, TctfBypsFlag flag)
    {
      int pos = TcTrsFrmPos;
      byte mask = 0b_0010_0000;
      byte val = (byte)((byte)flag << 5);
      packet[pos] &= (byte)(~mask);
      packet[pos] |= val;
    }

    private void SetTctfCtlCmdFlag(byte[] packet, TctfCtlCmdFlag flag)
    {
      int pos = TcTrsFrmPos;
      byte mask = 0b_0001_0000;
      byte val = (byte)((byte)flag << 4);
      packet[pos] &= (byte)(~mask);
      packet[pos] |= val;
    }

    private void SetTctfSpare(byte[] packet, TctfSpare spare)
    {
      int pos = TcTrsFrmPos;
      byte mask = 0b_0000_1100;
      byte val = (byte)((byte)spare << 2);
      packet[pos] &= (byte)(~mask);
      packet[pos] |= val;
    }

    private void SetTctfScId(byte[] packet, TctfScId id)
    {
      int pos = TcTrsFrmPos;
      byte mask = 0b_0000_0011;
      byte val = (byte)((UInt16)id >> 8 & mask);
      packet[pos] &= (byte)(~mask);
      packet[pos] |= val;
      val = (byte)((UInt16)id & 0xff);
      packet[pos+1] = val;
    }

    private void SetTctfVirChId(byte[] packet, TctfVirChId id)
    {
      int pos = TcTrsFrmPos + 2;
      byte mask = 0b_1111_1100;
      byte val = (byte)((byte)id << 2);
      packet[pos] &= (byte)(~mask);
      packet[pos] |= val;
    }

    private void SetTctfLen(byte[] packet, UInt16 len)
    {
      int pos = TcTrsFrmPos + 2;
      byte mask = 0b_0000_0011;
      UInt16 z_origin = (UInt16)(len - 1); // Total octets in the TC Transfer Frame - 1
      byte val = (byte)(z_origin >> 8 & mask);
      packet[pos] = val;
      val = (byte)(z_origin & 0xff);
      packet[pos+1] = val;
    }

    private void SetTctfSeq(byte[] packet, TctfSeq seq)
    {
      int pos = TcTrsFrmPos + 4;
      packet[pos] = (byte)seq;
    }

    private void SetTctfCrc(byte[] packet, UInt16 tctfPktLen)
    {
      int pos = packet.Length - 2;
      UInt16 crc_tmp = CRC.CRC16CCITTLeftCalc(packet[..^2], 0xffff);
      byte val = (byte)(crc_tmp >> 8);
      packet[pos] = val;
      val = (byte)(crc_tmp & 0xff);
      packet[pos + 1] = val;
    }

    private void SetTcsgmSeqFlag(byte[] packet, TcsgmSeqFlag flag)
    {
      int pos = TcSgmPos;
      byte mask = 0b_1100_0000;
      byte val = (byte)((byte)flag << 6);
      packet[pos] &= (byte)(~mask);
      packet[pos] |= val;
    }
    private void SetTcsgmMltAccPntId(byte[] packet, TcsgmMltAccPntId id)
    {
      int pos = TcSgmPos;
      byte mask = 0b_0011_1111;
      packet[pos] &= (byte)(~mask);
      packet[pos] |= (byte)id;
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
    private void SetTcpFmtId(byte[] packet, TcpFmtId id)
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
      if(type == UdExeType.UnixTimeline || type == UdExeType.AobcUnixTimeline || type == UdExeType.TobcUnixTimeline)
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
  }
}
