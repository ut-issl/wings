using System.Collections.Generic;
using System.Threading.Tasks;
using WINGS.Models;

namespace WINGS.Data
{
  public interface ILayoutRepository<T>
  {
    Task<IEnumerable<T>> LoadAllFilesAsync(TlmCmdFileConfig config);
    void SaveLayoutAsync(TlmCmdFileConfig config, string name, string lytStr);
    void RenameLayoutAsync(TlmCmdFileConfig config, string name, string oldName);
    void DeleteLayoutAsync(TlmCmdFileConfig config, string name);
  }
}
