using System;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Linq;
using System.IO;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using WINGS.Data;
using WINGS.Models;
using Microsoft.AspNetCore.Hosting;

namespace WINGS.Services
{
  public class TlmCmdFileConfigBuilder : ITlmCmdFileConfigBuilder
  {
    private readonly ApplicationDbContext _dbContext;

    private readonly IWebHostEnvironment _env;

    public TlmCmdFileConfigBuilder(ApplicationDbContext dbContext, IWebHostEnvironment env)
    {
      _dbContext = dbContext;
      _env = env;
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
        LayoutInfo = new TlmCmdFileLocationInfo(),
        TlmConfigInfo = new List<TlmConfigurationInfo>()
      };

      static List<TlmConfigurationInfo> CreateConfigInfo(string filePath, string encodingName)
      {
          StreamReader sr = new StreamReader(filePath, Encoding.GetEncoding(encodingName));
          string configStr = sr.ReadToEnd();
          sr.Close();

          List<TlmConfigurationInfo> configJson = JsonSerializer.Deserialize<List<TlmConfigurationInfo>>(configStr, new JsonSerializerOptions{
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            Converters = { new JsonStringEnumConverter() }
          });

          return configJson;
      }

      switch (config.Location)
      {
        case TlmCmdFileLocation.Local:
          string tlmConfigDirPath = Path.Combine(_env.ContentRootPath, operation.Component.LocalDirPath, "tlmdb/config.json");

          config.CmdDBInfo.Add(new TlmCmdFileLocationInfo() { DirPath = operation.Component.LocalDirPath });
          config.TlmDBInfo.Add(new TlmCmdFileLocationInfo() { DirPath = operation.Component.LocalDirPath });
          config.CmdFileInfo.Add(new TlmCmdFileLocationInfo() { DirPath = operation.Component.LocalDirPath });
          config.LayoutInfo = new TlmCmdFileLocationInfo() { DirPath = operation.Component.LocalDirPath };
          config.TlmConfigInfo = CreateConfigInfo(tlmConfigDirPath, "utf-8");
          break;
        
        default:
          throw new NotImplementedException("Undefined file location");
      }
      
      return config;
    }
  }
}
