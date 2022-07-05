using System.Threading.Tasks;
using WINGS.Models;

namespace WINGS.Services
{
  public interface ITlmCmdFileConfigBuilder
  {
    Task<TlmCmdFileConfig> Build(string opid);
  }
}
