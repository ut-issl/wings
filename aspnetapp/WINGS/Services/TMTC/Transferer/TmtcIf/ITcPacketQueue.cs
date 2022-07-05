using WINGS.Models;

namespace WINGS.Services.TmtcIf
{
  public interface ITcPacketQueue
  {
    void Add(string opid);
    void Remove(string opid);
    void Enqueue(TcPacketData data);
    TcPacketData Dequeue(string opid);
    bool PacketQueueExists(string opid);
  }
}
