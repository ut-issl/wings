using System.IO;
using System.Threading.Tasks;
using System.Collections.Generic;
using WINGS.Models;

namespace WINGS.Services
{
  public interface ILayoutService
  {
    IEnumerable<Layout> GetAllLayout(string opid);
    Task<bool> ConfigureLayoutAsync(Operation operation, TlmCmdFileConfig config);
    Task<bool> SaveLayoutAsync(string opid, string name, string lytStr);
    Task<bool> RenameLayoutAsync(string opid, string name, int index);
    Task<bool> DeleteLayoutAsync(string opid, string name);
    void RemoveLayouts(string opid);
  }
}
