using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using System.Text.Json;
using System.Text.Json.Serialization;
using WINGS.Services;
using WINGS.Models;
using static Microsoft.AspNetCore.Http.StatusCodes;

namespace WINGS.Controllers
{
  [ApiController]
  [Route("api/operations")]
  public class OperationController : ControllerBase
  {
    private readonly IOperationService _operationService;
    private readonly ICommandService _commandService;
    private readonly ITelemetryService _telemetryService;
    private readonly ILayoutService _layoutService;
    private readonly ITlmCmdFileConfigBuilder _configBuilder;

    public OperationController(IOperationService operationService,
                               ICommandService commandService,
                               ITelemetryService telemetryService,
                               ILayoutService layoutService,
                               ITlmCmdFileConfigBuilder configBuilder)
    {
      _operationService = operationService;
      _commandService = commandService;
      _telemetryService = telemetryService;
      _layoutService = layoutService;
      _configBuilder = configBuilder;
    }

    // GET: api/operations
    [HttpGet]
    public IActionResult Get()
    {
      var operations = _operationService.GetCurrentOperations();
      return StatusCode(Status200OK, new { data = operations });
    }

    // POST: api/operations
    [HttpPost]
    public async Task<IActionResult> Start([FromBody] JsonElement json)
    {
      if (!json.TryGetProperty("operation", out JsonElement operationJson))
      {
        return StatusCode(Status400BadRequest, new { message = "Plese set operation to json file" });
      }
      var operationStr = operationJson.ToString();
      var operation = JsonSerializer.Deserialize<Operation>(operationStr, new JsonSerializerOptions
      {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        Converters = { new JsonStringEnumConverter() }
      });
      try
      {
        var newOperation = await _operationService.StartOperationAsync(operation);
        var config = await _configBuilder.Build(newOperation.Id);
        Task<bool> cmdDbTask = Task.Run(() => _commandService.ConfigureCommandDbAsync(newOperation, config));
        Task<bool> tlmDbTask = Task.Run(() => _telemetryService.ConfigureTelemetryDbAsync(newOperation, config));
        Task<bool> lytDbTask = Task.Run(() => _layoutService.ConfigureLayoutAsync(newOperation, config));
        Task<bool> cmdFileTask = Task.Run(() => _commandService.ConfigureCommandFileAsync(newOperation, config));
        _commandService.ConfigureCommandFileLog(newOperation);

        if (!cmdDbTask.Result || !tlmDbTask.Result || !cmdFileTask.Result)
        {
          await _operationService.CancelOperationAsync(newOperation.Id);
          return StatusCode(Status500InternalServerError);
        }
        return StatusCode(Status201Created);
      }
      catch (IllegalContextException ex)
      {
        return StatusCode(Status400BadRequest, new { message = ex.Message });
      }
      catch (ResourceNotFoundException ex)
      {
        return StatusCode(Status404NotFound, new { message = ex.Message });
      }
      catch (ResourceCreateException ex)
      {
        return StatusCode(Status500InternalServerError, new { message = ex.Message });
      }
    }

    // DELETE: api/operations/f364..
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
      try
      {
        await _operationService.StopOperationAsync(id);
        _commandService.RemoveCommandFileIndexes(id);
        _layoutService.RemoveLayouts(id);
        return StatusCode(Status204NoContent);
      }
      catch (ResourceNotFoundException ex)
      {
        return StatusCode(Status404NotFound, new { message = ex.Message });
      }
    }
  }
}
