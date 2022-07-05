using WINGS.Models;

namespace WINGS.Services
{
  public interface ITmtcPacketService
  {
    void Send(TcPacketData data);
  }
}
