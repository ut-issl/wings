using System.Collections.Generic;
using System.Linq;

namespace WINGS.Models
{
  public enum CmdExecType
  {
    RT,
    TL,
    BL,
    UTL
  }

  public class Command
  {
    public string Component { get; set; }
    public CmdExecType ExecType { get; set; }
    public uint ExecTimeInt { get; set; }
    public double ExecTimeDouble { get; set; }
    public string ExecTimeStr {get; set; }
    public string Name { get; set; }
    public string Code { get; set; }
    public string Target { get; set; }
    public List<CommandParam> Params { get; set; }
    public bool IsDanger { get; set; }
    public bool IsViaMobc { get; set; }
    public bool IsRestricted { get; set; }
    public string Description { get; set; }

    public Command Clone()
    {
      Command cloned = (Command)MemberwiseClone();
      if (this.Params != null)
      {
        cloned.Params = new List<CommandParam>();
        foreach (var param in this.Params)
        {
          cloned.Params.Add((CommandParam)param.Clone());
        }
      }
      return cloned;
    }
  }
  public class CommandParam
  {
    public string Name { get; set; }
    public string Type { get; set; }
    public string Value { get; set; }
    public string Unit { get; set; }
    public string Description { get; set; }

    public CommandParam Clone()
    {
      return (CommandParam)MemberwiseClone();
    }
  }

  public class CommandFileLineLogs
  {
    public string Time { get; set; }
    public string Commander { get; set; }
    public string Content { get; set; }
    public string Status { get; set; }
  }
}
