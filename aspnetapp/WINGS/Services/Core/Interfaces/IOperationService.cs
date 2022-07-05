using System.Threading.Tasks;
using System.Collections.Generic;
using WINGS.Models;

namespace WINGS.Services
{
  public interface IOperationService
  {
    IEnumerable<Operation> GetCurrentOperations();
    Task<Operation> GetOperationByIdAsync(string opid);
    Task<Pagination<Operation>> GetOperationHistoryAsync(int page, int size, string search);
    Task<Operation> StartOperationAsync(Operation operation);
    Task CancelOperationAsync(string opid);
    Task StopOperationAsync(string opid);
    Task UpdateOperationHistoryAsync(Operation operation);
    Task DeleteOperationHistoryAsync(string opid);
  }
}
