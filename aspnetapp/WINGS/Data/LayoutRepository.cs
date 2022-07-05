using System;
using System.IO;
using System.Linq;
using System.Threading;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using WINGS.Models;
using WINGS.Library;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace WINGS.Data
{
  /// <summary>
  /// Provides methods for reading layout db files
  /// </summary>
  public class LayoutRepository : ILayoutRepository<Layout>
  {
    private readonly IWebHostEnvironment _env;
    
    public LayoutRepository(IWebHostEnvironment env)
    {
      _env = env;
    }

    /// <summary>
    /// Reads the layout db JSON files defined in config as they are
    /// </summary>
    /// <param name="config">Config of the db files</param>
    /// <returns>Returns an enumerable collection of layout definitions that are read from layout db files</returns>
    /// <exception cref="ArgumentException">Undefined config of the file</exception>
    public async Task<IEnumerable<Layout>> LoadAllFilesAsync(TlmCmdFileConfig config)
    {
      string dirPath = Path.Combine(_env.ContentRootPath, config.LayoutInfo.DirPath, "lyts");
      if (!Directory.Exists(dirPath))
      {
        // Try to create the directory.
        DirectoryInfo di = Directory.CreateDirectory(dirPath);
      }
      

      var filePaths = GetFilePathsAsync(config);
      
      // Parallel file loading
      var sem = new SemaphoreSlim(10); // Maximum number of parallel excecution

      static string ReadAllLines(string filePath, string encodingName)
      {
          StreamReader sr = new StreamReader(filePath, Encoding.GetEncoding(encodingName));
          string allLine = sr.ReadToEnd();
          sr.Close();

          return allLine;
      }
      
      int count = 0;
      var loadTasks = filePaths.Select(async filePath => 
      {
        await sem.WaitAsync();
        try
        {
          string lytStr = ReadAllLines(filePath,"utf-8");
          var lyt = JsonSerializer.Deserialize<Layout>(lytStr, new JsonSerializerOptions{
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            Converters = { new JsonStringEnumConverter() }
          });
          lyt.id = count;
          count = count + 1;
          int ind = filePath.IndexOf("lyts")+5;
          string jsonname = filePath.Substring(ind);
          lyt.name = jsonname.Substring(0,jsonname.Length-5);
          return lyt;
        }
        finally
        {
          sem.Release();
        }
      });
      var layouts = await Task.WhenAll(loadTasks);
      return layouts;
    }
    public void SaveLayoutAsync(TlmCmdFileConfig config, string name, string lytStr)
    {
      string dirPath = Path.Combine(_env.ContentRootPath, config.LayoutInfo.DirPath, "lyts");
      string fileName = dirPath + "/" + name + ".json";
      string encodingName = "utf-8";
      StreamWriter sw = new StreamWriter(fileName, true, Encoding.GetEncoding(encodingName));
      sw.Write(lytStr);
      sw.Close();
    }

    public void RenameLayoutAsync(TlmCmdFileConfig config, string name, string oldName)
    {
      string dirPath = Path.Combine(_env.ContentRootPath, config.LayoutInfo.DirPath, "lyts");
      string oldFilePath = dirPath + "/" + oldName + ".json";
      string newFilePath = dirPath + "/" + name + ".json";
      File.Move(oldFilePath, newFilePath);
    }

    public void DeleteLayoutAsync(TlmCmdFileConfig config, string name)
    {
      string dirPath = Path.Combine(_env.ContentRootPath, config.LayoutInfo.DirPath, "lyts");
      string filePath = dirPath + "/" + name + ".json";
      File.Delete(filePath);
    }
    private IEnumerable<string> GetFilePathsAsync(TlmCmdFileConfig config)
    {
      string dirPath = Path.Combine(_env.ContentRootPath, config.LayoutInfo.DirPath, "lyts");
      return Directory.EnumerateFiles(dirPath, "*.json", SearchOption.TopDirectoryOnly);
    }
  }
}
