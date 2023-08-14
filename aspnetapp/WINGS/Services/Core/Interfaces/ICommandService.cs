using System.IO;
using System.Threading.Tasks;
using System.Collections.Generic;
using WINGS.Models;

namespace WINGS.Services
{
  public interface ICommandService
  {
    IEnumerable<Command> GetAllCommand(string opid);
    Task<bool> SendCommandAsync(string opid, Command command, string commanderId);
    Task<bool> SendTypeACommandAsync(string opid, Command command, string commanderId, int cmdWindow);
    public bool InitializeTypeAStatus(string opid);
    void SendRawCommand(string opid, byte[] packet);
    Task<bool> AddCmdFileLineLog(string opid, CommandFileLineLog command_file_line_log, string commanderId);
    IEnumerable<CommandFileIndex> GetCommandFileIndexes(string opid);
    Task<CommandFile> GetCommandFileAsync(string opid, int cmdFileInfoIndex, int fileId);
    Task<bool> ConfigureCommandDbAsync(Operation operation, TlmCmdFileConfig config);
    Task<bool> ConfigureCommandFileAsync(Operation operation, TlmCmdFileConfig config);
    bool ConfigureCommandFileLog(Operation operation);
    Task ReconfigureCommandFileAsync(string opid);
    void RemoveCommandFileIndexes(string opid);
    Stream GetCommandLogStream(string opid);
    IEnumerable<CommandFileLineLogs> GetCmdLogHistory (string opid);
    Stream GetCommandFileLogStream(string opid);
    Task<string> GetCommandRowAsync(string opid, int cmdFileInfoIndex, int fileId, int row);
    Task<CommandFileLine> LoadCommandRowAsync(string opid, int cmdFileInfoIndex, int fileId, int row, string line);
  }
}
