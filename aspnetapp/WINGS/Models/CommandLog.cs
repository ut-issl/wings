using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace WINGS.Models
{
  public class CommandLog
  {
    [Column(TypeName = "datetime(1)")]
    public DateTime SentAt { get; set; }

    [Column(TypeName = "varchar(64)")]
    public CmdExecType ExecType { get; set; }

    public uint ExecTime { get; set; }

    [Column(TypeName = "varchar(255)")]
    public string CmdName { get; set; }

    [Column(TypeName = "varchar(64)")]
    public string Param1 { get; set; }

    [Column(TypeName = "varchar(64)")]
    public string Param2 { get; set; }

    [Column(TypeName = "varchar(64)")]
    public string Param3  { get; set; }

    [Column(TypeName = "varchar(64)")]
    public string Param4 { get; set; }

    [Column(TypeName = "varchar(64)")]
    public string Param5 { get; set; }

    [Column(TypeName = "varchar(64)")]
    public string Param6 { get; set; }

    public string OperationId { get; set; }
    public Operation Operation { get; set; }
  }
}
