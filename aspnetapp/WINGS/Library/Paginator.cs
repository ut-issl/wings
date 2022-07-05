using System;
using System.Text;
using System.Collections.Generic;
using WINGS.Models;

namespace WINGS.Library
{
  public static class Paginator
  {
    public static PageMeta GetPageMeta(string baseUrl, int page, int size, int totalCount, Dictionary<string, string> query)
    {
      var pageCount = (int)Math.Ceiling((double)totalCount/size);
      if (page < 1) page = 1;
      if (page > pageCount) page = pageCount;

      var sb = new StringBuilder();
      sb.Append("?page={0}&size={1}");
      foreach (KeyValuePair<string, string> item in query)
      {
        sb.Append($"&{item.Key}={item.Value}");
      }
      var queryStringBase = sb.ToString();
      
      return new PageMeta
      {
        Page = page,
        Size = size,
        PageCount = pageCount,
        Links = new PageLink{
          Self = baseUrl + string.Format(queryStringBase, page, size),
          First = baseUrl + string.Format(queryStringBase, 1, size),
          Previous = baseUrl + string.Format(queryStringBase, page > 1 ? page - 1 : 1, size),
          Next = baseUrl + string.Format(queryStringBase, page < pageCount - 1 ? page + 1 : pageCount, size),
          Last = baseUrl + string.Format(queryStringBase, pageCount, size)
        }
      };
    }
  }
}
