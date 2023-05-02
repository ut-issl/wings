using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.Extensions.DependencyInjection;
using WINGS.Models;
using WINGS.Services.TmtcIf;

namespace WINGS.Services
{
  public class TmtcHandlerFactory : ITmtcHandlerFactory
  {
    private readonly IServiceProvider _serviceProvider;
    private Dictionary<string, Component> _componentDict;
    private Dictionary<string, TmtcTarget> _targetDict;

    public TmtcHandlerFactory(IServiceProvider serviceProvider)
    {
      _serviceProvider = serviceProvider;
      _componentDict = new Dictionary<string, Component>();
      _targetDict = new Dictionary<string, TmtcTarget>();
    }

    public ITmPacketAnalyzer GetTmPacketAnalyzer(string opid)
    {
      if (!_componentDict.TryGetValue(opid, out var component))
      {
        throw new ResourceNotFoundException("The component is not found");
      }
      switch (component.TmPacketKey)
      {
        case "OBC":
          return _serviceProvider.GetService<MobcTmPacketAnalyzer>();
        
        case "SECONDARY_OBC":
          return _serviceProvider.GetService<SecondaryObcTmPacketAnalyzer>();

        case "ISSL_COMMON":
          return _serviceProvider.GetService<IsslCommonTmPacketAnalyzer>();

        default:
          throw new NotImplementedException("The TmPacketKey is not defined");
      }
    }

    public ITcPacketGenerator GetTcPacketGenerator(string opid)
    {
      if (!_componentDict.TryGetValue(opid, out var component))
      {
        throw new ResourceNotFoundException("The component is not found");
      }
      switch (component.TcPacketKey)
      {
        case "OBC":
          return _serviceProvider.GetService<MobcTcPacketGenerator>();

        case "SECONDARY_OBC":
          return _serviceProvider.GetService<SecondaryObcTcPacketGenerator>();

        case "ISSL_COMMON":
          return _serviceProvider.GetService<IsslCommonTcPacketGenerator>();

        default:
          throw new NotImplementedException("The TcPacketKey is not defined");
      }
    }

    public ITmtcPacketService GetTmtcPacketService(string opid)
    {
      if (!_targetDict.TryGetValue(opid, out var target))
      {
        throw new ResourceNotFoundException("The component is not found");
      }
      switch (target)
      {
        case TmtcTarget.TmtcIf:
          return _serviceProvider.GetService<TmtcPacketService>();

        default:
          throw new NotImplementedException("The target is not found");
      }
    }

    public void AddOperation(string opid, Component component, TmtcTarget target)
    {
      _componentDict.Add(opid, component);
      _targetDict.Add(opid, target);
    }

    public void RemoveOperation(string opid)
    {
      _componentDict.Remove(opid);
      _targetDict.Remove(opid);
    }
  }
}
