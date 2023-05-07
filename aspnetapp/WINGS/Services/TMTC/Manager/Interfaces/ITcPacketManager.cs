using System.Collections.Generic;
using WINGS.Models;

namespace WINGS.Services
{
  public interface ITcPacketManager
  {  
    void SetCommandDb(string opid, List<Command> commandDb);
    void RemoveOperation(string opid);
    List<Command> GetCommandDb(string opid);
    void RegisterCommand(string opid, Command command, byte cmdType, byte cmdWindow);
  }
}
