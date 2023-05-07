using System.Collections.Generic;
using WINGS.Models;

namespace WINGS.Services
{
  public class TcPacketManager : ITcPacketManager
  {
    private readonly ITmtcHandlerFactory _tmtcHandlerFactory;
    private Dictionary<string, List<Command>> _commandDbDict;

    public TcPacketManager(ITmtcHandlerFactory tmtcHandlerFactory)
    {
      _tmtcHandlerFactory = tmtcHandlerFactory;
      _commandDbDict = new Dictionary<string, List<Command>>();
    }

    public void SetCommandDb(string opid, List<Command> commandDb)
    {
      _commandDbDict.Add(opid, commandDb);
    }

    public void RemoveOperation(string opid)
    {
      _commandDbDict.Remove(opid);
    }

    public List<Command> GetCommandDb(string opid)
    {
      if (!_commandDbDict.TryGetValue(opid, out var commandDb))
      {
        throw new ResourceNotFoundException("The command db of this operation is not found");
      }
      return commandDb;
    }

    public void RegisterCommand(string opid, Command command, byte cmdType, byte cmdWindow)
    {
      var data = _tmtcHandlerFactory.GetTcPacketGenerator(opid).GetTcPacketData(opid, command, cmdType, cmdWindow);
      _tmtcHandlerFactory.GetTmtcPacketService(opid).Send(data);
    }
  }
}
