using System;
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
  public class CommandController : ControllerBase
  {
    private readonly ICommandService _commandService;
    
    public CommandController(ICommandService commandService)
    {
      _commandService = commandService;
    }
    
    // GET: api/operations/f364../cmd
    [HttpGet("cmd")]
    public IActionResult GetAll(string id)
    {
      try
      {
        var commands = _commandService.GetAllCommand(id);

        return StatusCode(Status200OK, new { data = commands });
      }
      catch (ResourceNotFoundException ex)
      {
        return StatusCode(Status404NotFound, new { message = ex.Message });
      }
    }

    // POST: api/operations/f364../cmd
    [HttpPost("cmd")]
    public async Task<IActionResult> Send(string id, [FromBody]JsonElement json)
    {
      var cmdStr = json.GetProperty("command").ToString();
      var command = JsonSerializer.Deserialize<Command>(cmdStr, new JsonSerializerOptions{
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        Converters = { new JsonStringEnumConverter() }
      });

      var commanderId = "";

      var ack = await _commandService.SendCommandAsync(id, command, commanderId);
      return StatusCode(Status200OK, new { ack = ack });
    }
    
    // POST: api/operations/f364../cmd/raw
    [HttpPost("cmd/raw")]
    public IActionResult SendRaw(string id, [FromBody]JsonElement json)
    {
      var bytesStr = json.GetProperty("data").ToString().Split(" ");
      var num = bytesStr.Length;
      if (num == 0)
      {
        return StatusCode(Status400BadRequest, new { message = "The command bytes are empty" });
      }
      var packet = new byte[num];
      for (int i = 0; i < num; i++)
      {
        try
        {
          packet[i] = Byte.Parse(bytesStr[i].Remove(0,2), System.Globalization.NumberStyles.HexNumber);
        }
        catch
        {
          return StatusCode(Status400BadRequest, new { message = "Cannot parse to byte array" });
        }
      }
      _commandService.SendRawCommand(id, packet);
      return StatusCode(Status200OK);
    }

    // GET: api/operations/f364../cmd_fileline_log
    [HttpGet("cmd_fileline/log")]
    public IActionResult GetCmdFileLogHistory(string id)
    {
      try
      {
        var cmdFileLogHistory = _commandService.GetCmdLogHistory(id);
        return StatusCode(Status200OK, new { data = cmdFileLogHistory });
      }
      catch (ResourceNotFoundException ex)
      {
        return StatusCode(Status404NotFound, new { message = ex.Message });
      }
    }

    // POST: api/operations/f364../cmd_fileline_log
    [HttpPost("cmd_fileline_log")]
    public async Task<IActionResult> SendCmdFileLineLog(string id, [FromBody] JsonElement json)
    {
      var cmdFileLineStr = json.GetProperty("command_file_line_log").ToString();
      var commandFileLineLog = JsonSerializer.Deserialize<CommandFileLineLog>(cmdFileLineStr, new JsonSerializerOptions
      {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        Converters = { new JsonStringEnumConverter() }
      });
      var commanderName = "";
      var ack = await _commandService.AddCmdFileLineLog(id, commandFileLineLog, commanderName);
      return StatusCode(Status200OK, new { ack = ack });
    }

    // GET: api/operations/f364../cmd_plans
    [HttpGet("cmd_plans")]
    public IActionResult GetCommandFileIndexes(string id)
    {
      try
      {
        var indexes = _commandService.GetCommandFileIndexes(id);
        return StatusCode(Status200OK, new { data = indexes });
      }
      catch (ResourceNotFoundException ex)
      {
        return StatusCode(Status404NotFound, new { message = ex.Message });
      }
    }
    
    // PUT: api/operations/f364../cmd_plans
    [HttpPut("cmd_plans")]
    public async Task<IActionResult> ReconfigureCommandFileIndexes(string id)
    {
      try
      {
        await _commandService.ReconfigureCommandFileAsync(id);
        return StatusCode(Status200OK);
      }
      catch (ResourceNotFoundException ex)
      {
        return StatusCode(Status404NotFound, new { message = ex.Message });
      }
    }

    // GET: api/operations/f364../cmd_plans/0/5
    [HttpGet("cmd_plans/{cmdFileInfoIndex}/{fileId}")]
    public async Task<IActionResult> GetCommandFile(string id, int cmdFileInfoIndex, int fileId)
    {
      if (fileId < 0)
      {
        return StatusCode(Status400BadRequest, new { message = "The file id must be an integer greater than or equal to 0" });
      }
      try
      {
        var file = await _commandService.GetCommandFileAsync(id, cmdFileInfoIndex, fileId);
        return StatusCode(Status200OK, new { data = file });
      }
      catch (ResourceNotFoundException ex)
      {
        return StatusCode(Status404NotFound, new { message = ex.Message });
      }
    }
  }
}
