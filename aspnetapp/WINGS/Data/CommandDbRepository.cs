using System;
using System.IO;
using System.Linq;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using WINGS.Models;
using WINGS.Library;
using System.Text;

namespace WINGS.Data
{
  /// <summary>
  /// Provides methods for reading command db files
  /// </summary>
  public class CommandDbRepository : IDbRepository<Command>
  {
    private readonly IWebHostEnvironment _env;

    public CommandDbRepository(IWebHostEnvironment env)
    {
      _env = env;
    }

    /// <summary>
    /// Reads the command db file defined in config and parses to the Command objects
    /// </summary>
    /// <param name="config">Config of the db file</param>
    /// <returns>Returns an enumerable collection of command definitions that are read from command db file</returns>
    /// <exception cref="ArgumentException">Undefined config of the file</exception>
    public async Task<IEnumerable<Command>> LoadAllFilesAsync(TlmCmdFileConfig config)
    {
      var commandDb = new List<Command>();

      foreach (var c in config.CmdDBInfo)
      {
        var filePaths = await GetDbFilePathsAsync(config.Location, c);
        foreach (var filePath in filePaths)
        {
          commandDb.AddRange(await LoadFileAsync(config.Location, c, filePath));
        }
      }
      return commandDb;
    }

    private async Task<List<Command>> LoadFileAsync(TlmCmdFileLocation location, TlmCmdFileLocationInfo cmdDBInfo, string filePath)
    {
      var commandDb = new List<Command>();
      var reader = await GetDbFileReaderAsync(location, cmdDBInfo, filePath);
      using (var parser = new TextFieldParser(reader))
      {
        parser.SetDelimiters(",");
        parser.HasFieldsEnclosedInQuotes = true;
        parser.TrimWhiteSpace = true;
        string ComponentName = "";

        while (!parser.EndOfData)
        {
          var cols = parser.ReadFields();
          if (parser.LineNumber == 1) { ComponentName = cols[0]; continue; }
          else if (parser.LineNumber < 3) { continue; }
          if (cols.All(x => x == "")) { break; }
          if (cols[0] != "" && cols[0][0] == '*')
          {
            continue;
          }

          var numParam = Convert.ToInt32(cols[4]);
          var Params = new List<CommandParam>();
          for (var i = 0; i < numParam; i++)
          {
            if (cols[2 * i + 5] == "raw" && i != numParam - 1)
            {
              throw new FormatException("The raw parameter should be the last one.");
            }
            else
            {
              Params.Add(new CommandParam()
              {
                Type = cols[2 * i + 5],
                Description = cols[2 * i + 6]
              });
            }
          }
          commandDb.Add(new Command()
          {
            Component = ComponentName,
            ExecType = CmdExecType.RT,
            ExecTimeInt = 0,
            ExecTimeDouble = 0,
            Name = cols[1],
            Code = cols[3],
            Target = cols[2],
            Params = Params,
            IsDanger = cols[17] == "danger",
            IsViaMobc = false,
            IsRestricted = cols[18] == "restricted",
            Description = cols[19]
          });
        }
      }
      return commandDb;
    }

    private Task<IEnumerable<string>> GetDbFilePathsAsync(TlmCmdFileLocation location, TlmCmdFileLocationInfo cmdDBInfo)
    {
      switch (location)
      {
        case TlmCmdFileLocation.Local:
          string dirPath = Path.Combine(_env.ContentRootPath, cmdDBInfo.DirPath, "cmddb");
          return Task.FromResult(Directory.EnumerateFiles(dirPath, "*CMD_DB.csv", SearchOption.TopDirectoryOnly));
        default:
          throw new ArgumentException("Undefined file location");
      }
    }

    private Task<StreamReader> GetDbFileReaderAsync(TlmCmdFileLocation location, TlmCmdFileLocationInfo cmdDBInfo, string filePath)
    {
      switch (location)
      {
        case TlmCmdFileLocation.Local:
          Encoding.RegisterProvider(CodePagesEncodingProvider.Instance);
          return Task.FromResult(new StreamReader(filePath, Encoding.GetEncoding("utf-8")));
        default:
          throw new ArgumentException("Undefined file location");
      }
    }
  }
}
