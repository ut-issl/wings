using System.Collections.Generic;
using System.Threading.Tasks;
using WINGS.Models;

namespace WINGS.Data
{
  public interface ICommandFileRepository
  {
    Task<List<CommandFileIndex>> LoadCommandFileIndexesAsync(TlmCmdFileConfig config);
    Task<CommandFile> LoadCommandFileAsync(TlmCmdFileConfig config, CommandFileIndex index, List<Command> commandDb);
    Task<string> GetCommandRowAsync(TlmCmdFileConfig config, CommandFileIndex index, int row);
    Task<CommandFileLine> LoadCommandRowAsync(TlmCmdFileConfig config, CommandFileIndex index, List<Command> commandDb, int row, string line);
  }
}
