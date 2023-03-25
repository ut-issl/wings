using System.Collections.Generic;

namespace WINGS.Models
{
  public enum TlmCmdFileLocation
  {
    Local
  }
  
  public class TlmCmdFileLocationInfo
  {
    public string DirPath { get; set; }
  }

  public class TlmConfigurationInfo
  {
    public string TlmApid { get; set; }
    public string CompoName { get; set; }
  }

  public class TlmCmdFileConfig
  {
    public TlmCmdFileLocation Location { get; set; }
    public List<TlmCmdFileLocationInfo> CmdDBInfo { get; set; }
    public List<TlmCmdFileLocationInfo> TlmDBInfo { get; set; }
    public List<TlmCmdFileLocationInfo> CmdFileInfo { get; set; }
    public TlmCmdFileLocationInfo LayoutInfo { get; set; }
    public List<TlmConfigurationInfo> TlmConfigInfo { get; set; }
  }
}
