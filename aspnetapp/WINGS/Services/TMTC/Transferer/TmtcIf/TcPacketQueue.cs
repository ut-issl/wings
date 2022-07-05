using System;
using System.Collections.Generic;
using System.Linq;
using WINGS.Models;

namespace WINGS.Services.TmtcIf
{
  public class TcPacketQueue : ITcPacketQueue
  {
    private Dictionary<string, Queue<TcPacketData>> _packetQueueDict;

    public TcPacketQueue()
    {
      _packetQueueDict = new Dictionary<string, Queue<TcPacketData>>();
    }
    
    public void Add(string opid)
    {
      _packetQueueDict.Add(opid, new Queue<TcPacketData>());
    }

    public void Remove(string opid)
    {
      _packetQueueDict.Remove(opid);
    }

    public void Enqueue(TcPacketData data)
    {
      if (!_packetQueueDict.TryGetValue(data.Opid, out var packetQueue))
      {
        throw new ResourceNotFoundException("The packet queue is not found");
      }
      packetQueue.Enqueue(data);
    }

    public TcPacketData Dequeue(string opid)
    {
      if (!_packetQueueDict.TryGetValue(opid, out var packetQueue))
      {
        throw new ResourceNotFoundException("The packet queue is not found");
      }
      return packetQueue.Dequeue();
    }

    public bool PacketQueueExists(string opid)
    {
      if (!_packetQueueDict.TryGetValue(opid, out var packetQueue))
      {
        throw new ResourceNotFoundException("The packet queue is not found");
      }
      return packetQueue.Count != 0;
    }
  }
}
