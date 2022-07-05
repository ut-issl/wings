using System.Collections.Generic;

namespace WINGS.Models
{
  public class Pagination<T>
  {
    public PageMeta Meta { get; set; }
    public List<T> Data { get; set; }
  }

  public class PageMeta
  {
    public int Page { get; set; }
    public int Size { get; set; }
    public int PageCount  { get; set; }
    public PageLink Links { get; set; }
  }

  public class PageLink
  {
    public string Self { get; set; }
    public string First { get; set; }
    public string Previous { get; set; }
    public string Next { get; set; }
    public string Last { get; set; }
  }
}
