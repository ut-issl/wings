using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WINGS.Models
{
  public enum TmtcTarget
  {
    TmtcIf,
    Infostellar
  }

  public class Operation
  {
    [Column(TypeName = "varchar(255)")]
    public string Id { get; set; }

    [Column(TypeName = "varchar(64)")]
    public string PathNumber { get; set; }

    [Column(TypeName = "longtext")]
    public string Comment { get; set; }

    [Column(TypeName = "datetime(0)")]
    public DateTime CreatedAt { get; set; }
    
    public bool IsRunning { get; set; }
    
    public bool IsTmtcConnected { get; set; }

    [Column(TypeName = "varchar(64)")]
    public TlmCmdFileLocation FileLocation { get; set; }

    [Column(TypeName = "varchar(64)")]
    public TmtcTarget TmtcTarget { get; set; }

    [Required]
    public string ComponentId { get; set; }
    public Component Component { get; set; }
  }
}
