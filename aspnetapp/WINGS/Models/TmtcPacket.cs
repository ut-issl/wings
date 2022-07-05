namespace WINGS.Models
{
  public class TmPacketData
  {
    public string Opid { get; set; }
    public byte[] TmPacket { get; set; }
  }
  public class TcPacketData
  {
    public string Opid { get; set; }
    public byte[] TcPacket { get; set; }
  }
}