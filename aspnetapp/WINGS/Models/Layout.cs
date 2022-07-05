using System.Collections.Generic;
using System.Linq;

namespace WINGS.Models
{
  public class Layout
  {
    public TelemetryView telemetryView { get; set; }
    public int id { get; set; }
    public string name { get; set; }
  }

  public class TelemetryView
  {
    public List<TelemetryViewIndex> allIndexes { get; set; }
    public List<ViewBlockInfo> blocks { get; set; }
    public object contents { get; set; }
  }

  public class TelemetryViewIndex
  {
    public string Id { get; set; }
    public string Name { get; set; }
    public string FilePath { get; set; }
    public string Type { get; set; }
    public List<string> SelectedTelemetries { get; set; }
    public string DataType {get; set; }
    public string DataLength {get; set; }
    public string YlabelMin {get; set; }
    public string YlabelMax {get; set; }
  }

  public class ViewBlockInfo
  {
    public List<TelemetryViewIndex> tabs { get; set; }
    public int Activetab { get; set; }
  }
}
