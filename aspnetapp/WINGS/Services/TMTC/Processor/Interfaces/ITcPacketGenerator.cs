using WINGS.Models;

namespace WINGS.Services
{
  public interface ITcPacketGenerator
  {
    TcPacketData GetTcPacketData(string opid, Command command);
  }
}
