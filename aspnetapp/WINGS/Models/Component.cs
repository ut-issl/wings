using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WINGS.Models
{
  public class Component
  {
    [Column(TypeName = "varchar(255)")]
    public string Id { get; set; }

    [Required]
    [Column(TypeName = "varchar(64)")]
    public string Name { get; set; }

    [Required]
    [Column(TypeName = "varchar(64)")]
    public string TcPacketKey { get; set; }

    [Required]
    [Column(TypeName = "varchar(64)")]
    public string TmPacketKey { get; set; }

    [Column(TypeName = "longtext")]
    public string LocalDirPath { get; set; }
  }
}
