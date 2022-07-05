using System.IO;

namespace WINGS.Models
{
  public class ZipItem
  {
    public string Name { get; set; }
    public Stream Content { get; set; }
  }
}
