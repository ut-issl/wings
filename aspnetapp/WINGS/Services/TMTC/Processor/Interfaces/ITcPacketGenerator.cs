using System.Collections.Generic;
using WINGS.Models;

namespace WINGS.Services
{
  public interface ITcPacketGenerator
  {
    TcPacketData GetTcPacketData(string opid, Command command, byte cmdType, byte cmdWindow, List<TlmCmdConfigurationInfo> tlmCmdConfigInfo);
  }
}
