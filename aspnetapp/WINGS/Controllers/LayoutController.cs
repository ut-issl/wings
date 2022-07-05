using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using WINGS.Models;
using WINGS.Services;
using static Microsoft.AspNetCore.Http.StatusCodes;

namespace WINGS.Controllers
{
  [ApiController]
  [Route("api/operations/{id}")]
  public class LayoutController : ControllerBase
  {
    private readonly ILayoutService _layoutService;
    
    public LayoutController(ILayoutService layoutService)
    {
      _layoutService = layoutService;
    }
    
    // GET: api/operations/f364../lyt : fetch layout
    [HttpGet("lyt")]
    public IActionResult GetAll(string id)
    {
      try
      {
        var layouts = _layoutService.GetAllLayout(id);
        return StatusCode(Status200OK, new { data = layouts });
      }
      catch (ResourceNotFoundException ex)
      {
        return StatusCode(Status404NotFound, new { message = ex.Message });
      }
    }
    // POST: api/operations/f364../lyt
    [HttpPost("lyt")]
    public async Task<IActionResult> Save(string id, Layout layout)
    {
      var name = layout.name;
      var lytStr = JsonSerializer.Serialize(new Layout { telemetryView = layout.telemetryView }, new JsonSerializerOptions{
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        Converters = { new JsonStringEnumConverter() }
      });
      var ack = await _layoutService.SaveLayoutAsync(id, name, lytStr);
      return StatusCode(Status200OK, new { ack = ack });
    }

    // PUT: api/operations/f364../lyt
    [HttpPut("lyt/{index}/{name}")]
    public async Task<IActionResult> Rename(string id, string name, int index)
    {
      var ack = await _layoutService.RenameLayoutAsync(id, name, index);
      return StatusCode(Status200OK, new { ack = ack });
    }

    // DELETE: api/operations/f364../lyt
    [HttpDelete("lyt/{name}")]
    public async Task<IActionResult> Delete(string id, string name)
    {
      var ack = await _layoutService.DeleteLayoutAsync(id, name);
      return StatusCode(Status200OK, new { ack = ack });
    }
  }
}
