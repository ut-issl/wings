using Microsoft.AspNetCore.Mvc;
using WINGS.Services;
using WINGS.Models;
using static Microsoft.AspNetCore.Http.StatusCodes;

namespace WINGS.Controllers
{
  [ApiController]
  [Route("api/operations/{id}")]
  public class TelemetryController : ControllerBase
  {
    private readonly ITelemetryService _telemetryService;

    public TelemetryController(ITelemetryService telemetryService)
    {
      _telemetryService = telemetryService;
    }
    
    // GET: api/operations/f364../tlm
    [HttpGet("tlm")]
    public IActionResult GetLatestTelemetry(string id, [FromQuery] string refTlmTime)
    {
      try
      {
        var latestTelemetry = _telemetryService.GetLatestTelemetry(id, refTlmTime);

        return StatusCode(Status200OK, new { data = latestTelemetry.LatestTelemetryPackets, latestTlmTime = latestTelemetry.LatestTelemetryTime });
      }
      catch (ResourceNotFoundException ex)
      {
        return StatusCode(Status404NotFound, new { message = ex.Message });
      }
    }

    // GET: api/operations/f364../tlm_history
    [HttpGet("tlm_history")]
    public IActionResult GetTelemetryHistory(string id)
    {
      try
      {
        var tlmPacketHistories = _telemetryService.GetTelemetryHistory(id);

        return StatusCode(Status200OK, new { data = tlmPacketHistories });
      }
      catch (ResourceNotFoundException ex)
      {
        return StatusCode(Status404NotFound, new { message = ex.Message });
      }
    }
  }
}
