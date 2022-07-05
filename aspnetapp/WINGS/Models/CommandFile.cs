using System.Collections.Generic;

namespace WINGS.Models
{
  public class CommandFile
  {
    public CommandFileIndex Index { get; set; }
    public List<CommandFileLine> Content { get; set; }
  }

  public class CommandFileIndex
  {
    public int FileId { get; set; }
    public string Name { get; set; }
    public string FilePath { get; set; }
    public int CmdFileInfoIndex { get; set; }
  }

  public class CommandFileLine
  {
    public string Type { get; set; }
    public string Method { get; set; }
    public dynamic Body { get; set; }
    public string InlineComment { get; set; }
    public bool StopFlag { get; set; }
    public bool SyntaxError { get; set; }
    public string ErrorMessage { get; set; }
  }

  public class CommandFileLineLog
  {
    public CommandFileLineStatus Status { get; set; }
    public CommandFileLine Request { get; set; }
  }

  public class CommandFileLineStatus
  {
    public bool Success { get; set; }
    public bool Error { get; set; }
  }
}
