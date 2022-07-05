using System.Collections.Generic;
using System.Threading.Tasks;
using WINGS.Models;

namespace WINGS.Data
{
  public interface IDbRepository<T>
  {
    Task<IEnumerable<T>> LoadAllFilesAsync(TlmCmdFileConfig config);
  }
}
