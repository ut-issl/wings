using System;
using System.IO;
using System.Text;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using WINGS.Data;
using WINGS.Models;

namespace WINGS.Services
{
  public class LayoutService : ILayoutService
  {
    private readonly ILayoutRepository<Layout> _Repository;
    private static Dictionary<string, List<Layout>> _layoutDict;
    private readonly ITlmCmdFileConfigBuilder _configBuilder;

    static LayoutService()
    {
      _layoutDict = new Dictionary<string, List<Layout>>();
    }
    
    public LayoutService(ILayoutRepository<Layout> Repository,
                          ITlmCmdFileConfigBuilder configBuilder)
    {
      _Repository = Repository;
      _configBuilder = configBuilder;
    }

    public IEnumerable<Layout> GetAllLayout(string opid)
    {
      if (!_layoutDict.TryGetValue(opid, out var layouts))
      {
        throw new ResourceNotFoundException("Layouts of this operation are not found");
      }
      return layouts;
    }

    public async Task<bool> ConfigureLayoutAsync(Operation operation, TlmCmdFileConfig config)
    {
      try
      {
        var layouts = await _Repository.LoadAllFilesAsync(config);
        _layoutDict.Remove(operation.Id);
        _layoutDict.Add(operation.Id, layouts.ToList());
        return true;
      }
      catch (Exception ex)
      {
        Console.WriteLine(ex.Message);
        return false;
      }
    }

    public async Task<bool> SaveLayoutAsync(string opid, string name, string lytStr)
    {
      /*int i;
      for (i=0; i<_layoutDict[opid].Count;i++){
        if (name == _layoutDict[opid][i].name||name == ""){
          Console.WriteLine("invalid layout name");
          return false;
        }
      }*/
      try
      {
        var config = await _configBuilder.Build(opid);
        _Repository.SaveLayoutAsync(config, name, lytStr);
        var layouts = await _Repository.LoadAllFilesAsync(config);
        _layoutDict.Remove(opid);
        _layoutDict.Add(opid, layouts.ToList());
        return true;
      }
      catch (Exception ex)
      {
        Console.WriteLine(ex.Message);
        return false;
      }
    }

    public async Task<bool> RenameLayoutAsync(string opid, string name, int index)
    {
      try
      {
        var config = await _configBuilder.Build(opid);
        var oldName = _layoutDict[opid][index].name;
        _Repository.RenameLayoutAsync(config, name, oldName);
        var layouts = await _Repository.LoadAllFilesAsync(config);
        _layoutDict.Remove(opid);
        _layoutDict.Add(opid, layouts.ToList());
        return true;
      }
      catch (Exception ex)
      {
        Console.WriteLine(ex.Message);
        return false;
      }
    }

    public async Task<bool> DeleteLayoutAsync(string opid, string name)
    {
      try
      {
        var config = await _configBuilder.Build(opid);
        _Repository.DeleteLayoutAsync(config, name);
        var layouts = await _Repository.LoadAllFilesAsync(config);
        _layoutDict.Remove(opid);
        _layoutDict.Add(opid, layouts.ToList());
        return true;
      }
      catch (Exception ex)
      {
        Console.WriteLine(ex.Message);
        return false;
      }
    }

    public void RemoveLayouts(string opid)
    {
      _layoutDict.Remove(opid);
    }
  }
}
