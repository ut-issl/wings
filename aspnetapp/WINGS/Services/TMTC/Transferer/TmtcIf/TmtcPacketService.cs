using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Grpc.Core;
using Google.Protobuf;
using WINGS.Data;
using WINGS.Models;
using WINGS.GrpcService;

namespace WINGS.Services.TmtcIf
{
  public class TmtcPacketService : TmtcPacket.TmtcPacketBase, ITmtcPacketService
  {
    private readonly ApplicationDbContext _dbContext;
    private readonly ITmPacketManager _tmPacketManager;
    private readonly ITcPacketQueue _tcPacketQueue;

    public TmtcPacketService(ApplicationDbContext dbContext,
                             ITmPacketManager tmPacketManager,
                             ITcPacketQueue tcPacketQueue)
    {
      _dbContext = dbContext;
      _tmPacketManager = tmPacketManager;
      _tcPacketQueue = tcPacketQueue;
    }

    public override async Task<TmPacketResponseRpc> TmPacketTransfer(TmPacketDataRpc dataRpc, ServerCallContext context)
    {
      var data = FromRpcModel(dataRpc);
      bool ack = true;
      try
      {
        await _tmPacketManager.RegisterTelemetryAsync(data);
      }
      catch (ResourceNotFoundException)
      {
        ack = false;
      }
      return (new TmPacketResponseRpc
      {
        Opid = data.Opid,
        Ack = ack
      });
    }

    public override async Task TcPacketTransfer(TcPacketRequestRpc request, IServerStreamWriter<TcPacketDataRpc> responseStream, ServerCallContext context)
    {
      var contextCancellationToken = context.CancellationToken;
      string opid = request.Opid;

      _tcPacketQueue.Add(opid);
      await SetTmtcClientStatusAsync(opid, true);
      
      while (true)
      {
        if (contextCancellationToken.IsCancellationRequested)
        {
          _tcPacketQueue.Remove(opid);
          await SetTmtcClientStatusAsync(opid, false);
          return;
        }

        if (_tcPacketQueue.PacketQueueExists(opid))
        {
          var dataRpc = ToRpcModel(_tcPacketQueue.Dequeue(opid));
          await responseStream.WriteAsync(dataRpc);
        }
        await Task.Delay(100);
      }
    }

    public void Send(TcPacketData data)
    {
      _tcPacketQueue.Enqueue(data);
    }

    private async Task SetTmtcClientStatusAsync(string opid, bool isConnected)
    {
      var operation = await _dbContext.Operations.FindAsync(opid);
      operation.IsTmtcConnected = isConnected;
      _dbContext.Entry(operation).State = EntityState.Modified;
      await _dbContext.SaveChangesAsync();
    }

    private TmPacketData FromRpcModel(TmPacketDataRpc dataRpc)
    {
      return new TmPacketData{
        Opid = dataRpc.Opid,
        TmPacket = dataRpc.TmPacket.ToByteArray()
      };
    }

    private TcPacketDataRpc ToRpcModel(TcPacketData data)
    {
      return new TcPacketDataRpc{
        Opid = data.Opid,
        TcPacket = ByteString.CopyFrom(data.TcPacket)
      };
    }
  }
}
