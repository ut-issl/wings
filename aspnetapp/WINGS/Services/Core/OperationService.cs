using System;
using System.IO;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Hosting;
using WINGS.Data;
using WINGS.Models;
using WINGS.Library;

namespace WINGS.Services
{
  public class OperationService : IOperationService
  {
    private readonly IWebHostEnvironment _env;
    private readonly ApplicationDbContext _dbContext;
    private readonly ITmtcHandlerFactory _tmtcHandlerFactory;
    private readonly ITmPacketManager _tmPacketManager;
    private readonly ITcPacketManager _tcPacketManager;
    
    public OperationService(IWebHostEnvironment env,
                            ApplicationDbContext dbContext,
                            ITmtcHandlerFactory tmtcHandlerFactory,
                            ITmPacketManager tmPacketManager,
                            ITcPacketManager tcPacketManager)
    {
      _env = env;
      _dbContext = dbContext;
      _tmtcHandlerFactory = tmtcHandlerFactory;
      _tmPacketManager = tmPacketManager;
      _tcPacketManager = tcPacketManager;
    }

    public IEnumerable<Operation> GetCurrentOperations()
    {
      return _dbContext.Operations
        .Where(o => o.IsRunning)
        .Include(o => o.Component);
    }

    public async Task<Operation> GetOperationByIdAsync(string opid)
    {
      var operation = await _dbContext.Operations.FindAsync(opid);
      if (operation == null)
      {
        throw new ResourceNotFoundException("The operation is not found");
      }
      return operation;
    }

    public async Task<Pagination<Operation>> GetOperationHistoryAsync(int page, int size, string search)
    {
      var operations = await _dbContext.Operations
        .Include(o => o.Component)
        .Where(o => !o.IsRunning)
        .ToListAsync();
      if (!String.IsNullOrEmpty(search))
      {
        operations = operations.Where(o => o.Comment.Contains(search)).ToList();
      }
      
      var totalCount = operations.Count();
      var baseUrl = "/api/operations/history";
      var query = new Dictionary<string, string>(){{"search", search}};
      var meta = Paginator.GetPageMeta(baseUrl, page, size, totalCount, query);

      var offset = (page - 1) * size;
      var data = operations
        .OrderByDescending(o => o.CreatedAt)
        .Where((o,i) => (offset <= i && i < offset+size))
        .ToList();
      
      return new Pagination<Operation>{
        Meta = meta,
        Data = data
      };
    }

    public async Task<Operation> StartOperationAsync(Operation operation)
    {
      string opid = Guid.NewGuid().ToString("d");

      if (operation.TmtcTarget == TmtcTarget.Infostellar && InfostellarOperationRunning())
      {
        throw new IllegalContextException("The Infostellar operation is limited to one");
      }

      try
      {
        operation.Id = opid;
        operation.CreatedAt = DateTime.Now;
        operation.IsRunning = false;
        operation.IsTmtcConnected = false;
        _dbContext.Operations.Add(operation);
        await _dbContext.SaveChangesAsync();
      }
      catch
      {
        throw new ResourceCreateException("Cannot create new entity");
      }

      var component = await _dbContext.Components.FindAsync(operation.ComponentId);
      if (component == null)
      {
        throw new ResourceNotFoundException("The component is not found");
      }

      _tmtcHandlerFactory.AddOperation(opid, component, operation.TmtcTarget);
      CreateLogDirectory(opid);

      operation.IsRunning = true;
      await UpdateOperationHistoryAsync(operation);

      return operation;
    }

    public async Task CancelOperationAsync(string opid)
    {
      var operation = await _dbContext.Operations.FindAsync(opid);
      if (operation == null)
      {
        throw new ResourceNotFoundException("The operation is not found");
      }

      operation.IsRunning = false;
      await UpdateOperationHistoryAsync(operation);

      try
      {
        _tmPacketManager.RemoveOperation(opid);
        _tcPacketManager.RemoveOperation(opid);
        _tmtcHandlerFactory.RemoveOperation(opid);
      }
      catch
      {
        // If this operation is canceled before registered to tm/tc packet manager
        // an execption is caught here, so there's no need to handle.
      }
      DeleteLogFiles(opid);
    }

    public async Task StopOperationAsync(string opid)
    {
      var operation = await _dbContext.Operations.FindAsync(opid);
      if (operation == null)
      {
        throw new ResourceNotFoundException("The operation is not found");
      }

      try
      {
        _tmPacketManager.RemoveOperation(opid);
        _tcPacketManager.RemoveOperation(opid);
        _tmtcHandlerFactory.RemoveOperation(opid);
      }
      catch
      {
        // If this operation is added to database before wings is started
        // an execption is caught here, so there's no need to handle.
      }

      operation.IsRunning = false;
      await UpdateOperationHistoryAsync(operation);
    }

    public async Task UpdateOperationHistoryAsync(Operation operation)
    {
      try
      {
        _dbContext.Entry(operation).State = EntityState.Modified;
        await _dbContext.SaveChangesAsync();
      }
      catch
      {
        if (!OperationExists(operation.Id))
        {
          throw new ResourceNotFoundException("The operation is not found");
        }
        throw new ResourceUpdateException("Cannot update entity");
      }
    }

    public async Task DeleteOperationHistoryAsync(string opid)
    {
      var operation = await _dbContext.Operations.FindAsync(opid);
      if (operation.IsRunning)
      {
        throw new IllegalContextException("Cannot delete running operation logs");
      }
      
      try
      {
        _dbContext.Operations.Remove(operation);
        await _dbContext.SaveChangesAsync();
      }
      catch
      {
        if (!OperationExists(opid))
        {
          throw new ResourceNotFoundException("The operation is not found");
        }
        throw new ResourceDeleteException("Cannot delete entity");
      }

      DeleteLogFiles(opid);
    }

    public async Task<List<TlmCmdConfigurationInfo>> GetTlmCmdConfigAsync(string opid)
    {
      var config = await new TlmCmdFileConfigBuilder(_dbContext, _env).Build(opid);
      return config.TlmCmdConfigInfo;
    }

    private bool OperationExists(string opid) =>
      _dbContext.Operations.Any(o => o.Id == opid);

    private bool InfostellarOperationRunning() => 
      GetCurrentOperations().Any(o => o.TmtcTarget == TmtcTarget.Infostellar);

    private void CreateLogDirectory(string opid)
    {
      string path = Path.Combine(_env.ContentRootPath, "Logs", opid);
      Directory.CreateDirectory(path);
    }

    private void DeleteLogFiles(string opid)
    {
      string path = Path.Combine(_env.ContentRootPath, "Logs", opid);
      Directory.Delete(path, true);
    }
  }
}
