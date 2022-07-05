using System.IO;
using System.IO.Compression;
using System.Collections.Generic;
using WINGS.Models;

namespace WINGS.Library
{
  public static class Zipper
  {
    public static Stream GetZipStream(List<ZipItem> zipItems)
    {
      var zipStream = new MemoryStream();
      using (var zip = new ZipArchive(zipStream, ZipArchiveMode.Create, true))
      {
        foreach (var zipItem in zipItems)
        {
          var entry = zip.CreateEntry(zipItem.Name);
          using (var entryStream = entry.Open())
          {
            zipItem.Content.CopyTo(entryStream);
          }
        }
      }
      zipStream.Position = 0;
      return zipStream;
    }
  }
}
