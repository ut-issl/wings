using WINGS.Models;

namespace WINGS.Services
{
  public interface ITmtcHandlerFactory
  {
    ITmPacketAnalyzer GetTmPacketAnalyzer(string opid);
    ITcPacketGenerator GetTcPacketGenerator(string opid);
    ITmtcPacketService GetTmtcPacketService(string opid);
    void AddOperation(string opid, Component component, TmtcTarget target);
    void RemoveOperation(string opid);
  }
}
