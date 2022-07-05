using System;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using WINGS.Data;
using WINGS.Models;

namespace WINGS.Services
{
  public class TlmCmdFileConfigBuilder : ITlmCmdFileConfigBuilder
  {
    private readonly ApplicationDbContext _dbContext;

    public TlmCmdFileConfigBuilder(ApplicationDbContext dbContext)
    {
      _dbContext = dbContext;
    }

    /// <summary>
    /// Returns the file config of the specified operation
    /// </summary>
    /// <param name="opid">Operation id</param>
    public async Task<TlmCmdFileConfig> Build(string opid)
    {
      var operation =  await _dbContext.Operations
        .Include(o => o.Component)
        .FirstOrDefaultAsync(o => o.Id == opid);
      
      var config = new TlmCmdFileConfig(){
        Location = operation.FileLocation,
        CmdDBInfo = new List<TlmCmdFileLocationInfo>(),
        TlmDBInfo = new List<TlmCmdFileLocationInfo>(),
        CmdFileInfo = new List<TlmCmdFileLocationInfo>(),
        LayoutInfo = new TlmCmdFileLocationInfo()
      };

      switch (config.Location)
      {
        case TlmCmdFileLocation.Local:
          config.CmdDBInfo.Add(new TlmCmdFileLocationInfo() { DirPath = operation.Component.LocalDirPath });
          config.TlmDBInfo.Add(new TlmCmdFileLocationInfo() { DirPath = operation.Component.LocalDirPath });
          config.CmdFileInfo.Add(new TlmCmdFileLocationInfo() { DirPath = operation.Component.LocalDirPath });
          config.LayoutInfo = new TlmCmdFileLocationInfo() { DirPath = operation.Component.LocalDirPath };
          break;
        
        default:
          throw new NotImplementedException("Undefined file location");
      }
      
      return config;
    }
  }
}
