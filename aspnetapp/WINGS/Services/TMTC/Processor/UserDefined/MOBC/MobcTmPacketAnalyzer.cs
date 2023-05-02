using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using WINGS.Data;
using WINGS.Models;

namespace WINGS.Services
{
  
  public class MobcTmPacketAnalyzer : TmPacketAnalyzerBase, ITmPacketAnalyzer
  {
    private static Dictionary<string,List<byte>> statictmPacket= new Dictionary<string,List<byte>>();
    private static byte cmdWindow = 0x00;
    private static bool retransmitFlag = false;
    
    public MobcTmPacketAnalyzer(ITelemetryLogRepository logRepository) : base(logRepository)
    {
    }

    //STX
    private enum Ver { Ver1 = 0b00, Ver2 = 0b01 }
    private enum ScId { Issl6U = 0x000 }
    private enum VirChId { Realtime = 0b000001, Replay = 0b000010, Fill = 0b111111 }

    //ETX
    private enum CtlWrdType { CLCW = 0b0 }
    private enum ClcwVer { Ver1 = 0b00 }
    private enum COPinEff { COP1 = 0b01 }
    private enum VCId { Default = 0b000000 }
    private enum Spare { Fixed = 0b00 }
    private enum Retransmit {Flag = 0b1000}

    public override async Task<bool> AnalyzePacketAsync(TmPacketData data, List<TelemetryPacket> prevTelemetry)
    {
      //data.TmPacket : Transferframe
      //not support ADU-split
      const int tfPriHeaderLen = 6;
      const int mpduPriHeaderLen = 2;
      const int mpduPacketZone = 432;
      const int ccsdsPriHeaderLen = 6;
      const int ccsdsSecHeaderLen = 7; //ADU-split -> 12
      const int headerLength = 6;
      const int bodyLength = 434;
      const int footerLength = 4;
      const int transferFrameLength = headerLength + bodyLength + footerLength;
      const int footerIndex = transferFrameLength - footerLength;
      
      UInt16 userdataLen = 0; //ccsdsSecHeaderLen + ADULen
      byte[] ccsdsTmPacketbuf = default;
      var ccsdsdataList = new List<TmPacketData>();
      var packetIdList = new List<string>();
      var realtimeFlagList = new List<bool>();
      var TIList = new List<UInt32>();
      

      if (data.TmPacket.Length == 512)
      {
        data.TmPacket = data.TmPacket[4..448];
      }
      
      var STX = data.TmPacket[0..headerLength];
      if (AnalyzeHeader(STX))
      {
        var ETX = data.TmPacket[footerIndex..transferFrameLength];
        if (AnalyzeFooter(ETX))
        {     
          if (statictmPacket.Keys.Contains(data.Opid) == false)
          {
            statictmPacket.Add(data.Opid, new List<byte>());
          }
          var ccsdsPriHeaderPointer = CombiteBytes(data.TmPacket, tfPriHeaderLen) & 0b_0000_0111_1111_1111;
          if (ccsdsPriHeaderPointer == 0b_0111_1111_1111)
          {
            //No CCSDS Packet starts in this Transferframe
            for (uint i = tfPriHeaderLen + mpduPriHeaderLen; i < tfPriHeaderLen + mpduPriHeaderLen + mpduPacketZone; i++)
            {
              statictmPacket[data.Opid].Add(data.TmPacket[i]);
            }
            ccsdsTmPacketbuf = statictmPacket[data.Opid].ToArray();
            userdataLen = CombiteBytesGetLen(ccsdsTmPacketbuf, 4);
            if (ccsdsTmPacketbuf.Length == ccsdsPriHeaderLen + userdataLen)
            {
              AddTelemetryList(data.Opid, ccsdsTmPacketbuf, ccsdsdataList, packetIdList, realtimeFlagList, TIList);
              statictmPacket[data.Opid].Clear();
            }
          }
          else if(ccsdsPriHeaderPointer == 0b_0111_1111_1110)
          {
            //What is "idle data" and how to process it?
            throw new Exception("Idle data is not supported.");
          }
          else
          {
            //"firstHeaderPointer" == 0 <=> M_PDU Packet Zone starts with the head of the first CCSDS Packet.
            if (ccsdsPriHeaderPointer != 0)
            {
              for (int i = tfPriHeaderLen + mpduPriHeaderLen; i < tfPriHeaderLen + mpduPriHeaderLen + ccsdsPriHeaderPointer; i++)
              {
                statictmPacket[data.Opid].Add(data.TmPacket[i]);
              }
              ccsdsTmPacketbuf = statictmPacket[data.Opid].ToArray();
              userdataLen = CombiteBytesGetLen(ccsdsTmPacketbuf, 4);
              if (ccsdsTmPacketbuf.Length == ccsdsPriHeaderLen + userdataLen)
              {
                AddTelemetryList(data.Opid, ccsdsTmPacketbuf, ccsdsdataList, packetIdList, realtimeFlagList, TIList);
                statictmPacket[data.Opid].Clear();
              }
              else
              {
                //error : Queue data is incorrect.
                //throw new Exception("Queue data is incorrect.");
                statictmPacket[data.Opid].Clear();
              }
            }

            var readPointer = tfPriHeaderLen + mpduPriHeaderLen + ccsdsPriHeaderPointer;
            while (readPointer !=  tfPriHeaderLen + mpduPriHeaderLen + mpduPacketZone)
            {
              if (tfPriHeaderLen + mpduPriHeaderLen + mpduPacketZone - readPointer < ccsdsPriHeaderLen + ccsdsSecHeaderLen)
              {
                for (int i = readPointer; i < tfPriHeaderLen + mpduPriHeaderLen + mpduPacketZone; i++)
                {
                  statictmPacket[data.Opid].Add(data.TmPacket[i]);
                }
                break;
              }
              else
              {
                userdataLen = CombiteBytesGetLen(data.TmPacket, readPointer + 4);
                if (tfPriHeaderLen + mpduPriHeaderLen + mpduPacketZone - readPointer < ccsdsPriHeaderLen + userdataLen)
                {
                  for (int i = readPointer; i < tfPriHeaderLen + mpduPriHeaderLen + mpduPacketZone; i++)
                  {
                    statictmPacket[data.Opid].Add(data.TmPacket[i]);
                  }
                  break;
                }
                else
                {
                  if (statictmPacket[data.Opid].Count != 0)
                  {
                    //error : Queue data should be empty here.
                    //throw new Exception("Queue data should be empty here.");
                    statictmPacket[data.Opid].Clear();
                  }
                  for (int i = readPointer; i < readPointer + ccsdsPriHeaderLen + userdataLen; i++)
                  {
                    statictmPacket[data.Opid].Add(data.TmPacket[i]);
                  }
                  AddTelemetryList(data.Opid, statictmPacket[data.Opid].ToArray(), ccsdsdataList, packetIdList, realtimeFlagList, TIList);
                  statictmPacket[data.Opid].Clear();
                  readPointer += ccsdsPriHeaderLen + userdataLen;
                }
              }
            }
          }
        }
      }
      return await SetTelemetryListValuesAsync(ccsdsdataList, packetIdList, realtimeFlagList, TIList, prevTelemetry);
    }

    public override byte GetCmdWindow()
    {
      return cmdWindow;
    }

    public override bool GetRetransmitFlag()
    {
      return retransmitFlag;
    }


    private void AddTelemetryList(string opid, byte[] ccsdstmPacket, List<TmPacketData> ccsdsdataList, List<string> packetIdList, List<bool> realtimeFlagList, List<UInt32> TIList)
    {
      ccsdsdataList.Add(new TmPacketData{ Opid = opid, TmPacket = ccsdstmPacket });
      packetIdList.Add(GetPacketId(ccsdstmPacket));
      realtimeFlagList.Add(GetRealTimeFlag(ccsdstmPacket));
      TIList.Add(GetTI(ccsdstmPacket));
    }

    private UInt16 CombiteBytes(byte[] bytes, int pos)
    {
      UInt16 byte1 = (UInt16)bytes[pos];
      UInt16 byte2 = (UInt16)bytes[pos + 1];
      UInt16 byte1s = (UInt16)(byte1 << 8);
      return (UInt16)(byte1s + byte2);
    }
    private UInt16 CombiteBytesGetLen(byte[] bytes, int pos)
    {
      UInt16 byte1 = (UInt16)bytes[pos];
      UInt16 byte2 = (UInt16)bytes[pos + 1];
      UInt16 byte1s = (UInt16)(byte1 << 8);
      return (UInt16)(byte1s + byte2 + 1); //起算
    }

    private string GetPacketId(byte[] packet)
    {
      //packet : CCSDS Packet
      int pos = 11;
      return string.Format("0x{0:x2}", packet[pos]);
    }
    private bool GetRealTimeFlag(byte[] packet)
    {
      //packet : CCSDS Packet
      int pos = 10;
      if ((packet[pos] & 0b_1110_0000) == 0b_0000_0000) // rp
      {
        return false;
      }
      else  // HK or MS( or stored)
      {
        return true;
      }
    }
    private UInt32 GetTI(byte[] packet)
    {
      //packet : CCSDS Packet
      int pos = 6;
      UInt32 byte1 = (UInt32)(packet[pos] << 24);
      UInt32 byte2 = (UInt32)(packet[pos + 1] << 16);
      UInt32 byte3 = (UInt32)(packet[pos + 2] << 8);
      UInt32 byte4 = (UInt32)(packet[pos + 3]);
      return (UInt32)(byte1 + byte2 + byte3 + byte4);
    }

    protected bool AnalyzeHeader(byte[] STX)
    {
      //only use fixed bits
      if (!ChkVer(STX, Ver.Ver2)) { return false; } 
      return true;
    }

    protected bool AnalyzeFooter(byte[] ETX)
    {
      //only use fixed bits
      if (!ChkCtlWrdType(ETX, CtlWrdType.CLCW)) { return false; }
      if (!ChkClcwVer(ETX, ClcwVer.Ver1)) { return false; }
      if (!ChkCOPinEff(ETX, COPinEff.COP1)) { return false; }
      if (!ChkVCId(ETX, VCId.Default)) { return false; }
      if (!ChkSpare(ETX, Spare.Fixed)) { return false; }
      retransmitFlag = SetRetransmitFlag(ETX, Retransmit.Flag);
      cmdWindow = SetCmdWindow(ETX);
      return true;
    }

    private bool ChkVer(byte[] STX, Ver ver)
    {
      int pos = 0;
      byte mask = 0b_1100_0000;
      byte val = (byte)((byte)ver << 6);
      return (STX[pos] & mask) == val;
    }

    private bool ChkScId(byte[] STX, ScId id)
    {
      int pos1 = 0;
      byte mask1 = 0b_0011_1111;
      byte val1 = (byte)((byte)id >> 2);
      int pos2 = 1;
      byte mask2 = 0b_1100_0000;
      byte val2 = (byte)((byte)id << 6);
      return ((STX[pos1] & mask1) == val1) & ((STX[pos2] & mask2) == val2);
    }

    private bool ChkCtlWrdType(byte[] ETX, CtlWrdType type)
    {
      int pos = 0;
      byte mask = 0b_1000_0000;
      byte val = (byte)((byte)type << 7);
      return (ETX[pos] & mask) == val;
    }

    private bool ChkClcwVer(byte[] ETX, ClcwVer ver)
    {
      int pos = 0;
      byte mask = 0b_0110_0000;
      byte val = (byte)((byte)ver << 5);
      return (ETX[pos] & mask) == val;
    }

    private bool ChkCOPinEff(byte[] ETX, COPinEff eff)
    {
      int pos = 0;
      byte mask = 0b_0000_0011;
      byte val = (byte)((byte)eff);
      return (ETX[pos] & mask) == val;
    }

    private bool ChkVCId(byte[] ETX, VCId id)
    {
      int pos = 1;
      byte mask = 0b_1111_1100;
      byte val = (byte)((byte)id << 2);
      return (ETX[pos] & mask) == val;
    }

    private bool ChkSpare(byte[] ETX, Spare spare)
    {
      int pos = 1;
      byte mask = 0b_0000_0011;
      byte val = (byte)((byte)spare);
      return (ETX[pos] & mask) == val;
    }

    private bool SetRetransmitFlag(byte[] ETX, Retransmit flag)
    {
      int pos = 2;
      byte mask = 0b_0000_1000;
      byte val = (byte) ((byte)flag);
      return (ETX[pos] & mask) == val;
    }

    private byte SetCmdWindow(byte[] ETX)
    {
      int pos = 3;
      return ETX[pos];
    }

    public override void RemoveOperation(string opid)
    {
      statictmPacket.Remove(opid);
    }
  }
}
