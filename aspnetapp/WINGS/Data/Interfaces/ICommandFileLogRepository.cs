using System.IO;
using System.Collections.Generic;
using System.Threading.Tasks;
using WINGS.Models;

namespace WINGS.Data
{
  public interface ICommandFileLogRepository
  {
    Task AddHistoryAsync(string opid, CommandFileLineLog command_file_line_log, string commanderId);
    void InitializeLogFiles(string opid);
    Stream GetLogFileStream(string opid);
    List<CommandFileLineLogs> GetCmdLogHistory(string opid);
  }
}
