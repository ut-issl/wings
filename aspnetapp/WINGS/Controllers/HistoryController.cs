using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using WINGS.Services;
using WINGS.Models;
using static Microsoft.AspNetCore.Http.StatusCodes;

namespace WINGS.Controllers
{
  [ApiController]
  [Route("api/operations")]
  public class HistoryController : ControllerBase
  {
    private readonly IOperationService _operationService;
    private readonly ICommandService _commandService;
    private readonly ITelemetryService _telemetryService;

    public HistoryController(IOperationService operationService,
                             ICommandService commandService,
                             ITelemetryService telemetryService)
    {
      _operationService = operationService;
      _commandService = commandService;
      _telemetryService = telemetryService;
    }

    // GET: api/operations/history?page=1&size=30&search=aaa
    [HttpGet("history")]
    public async Task<IActionResult> Get(int page = 1, int size = 30, string search = "")
    {
      Pagination<Operation> operations = await _operationService.GetOperationHistoryAsync(page, size, search);
      return StatusCode(Status200OK, operations);
    }

    // PUT: api/operations/f364../history
    [HttpPut("{id}/history")]
    public async Task<IActionResult> Update(string id, Operation operation)
    {
      if (id != operation.Id)
      {
        return StatusCode(Status400BadRequest, new { message = "The id doesn't match" });
      }
      try
      {
        await _operationService.UpdateOperationHistoryAsync(operation);
        return StatusCode(Status200OK);
      }
      catch (IllegalContextException ex)
      {
        return StatusCode(Status400BadRequest, new { message = ex.Message });
      }
      catch (ResourceNotFoundException ex)
      {
        return StatusCode(Status404NotFound, new { message = ex.Message });
      }
      catch (ResourceUpdateException ex)
      {
        return StatusCode(Status500InternalServerError, new { message = ex.Message });
      }
    }

    // DELETE: api/operations/f364../history
    [HttpDelete("{id}/history")]
    public async Task<IActionResult> DeleteHistory(string id)
    {
      try
      {
        await _operationService.DeleteOperationHistoryAsync(id);
        return StatusCode(Status204NoContent);
      }
      catch (IllegalContextException ex)
      {
        return StatusCode(Status400BadRequest, new { message = ex.Message });
      }
      catch (ResourceNotFoundException ex)
      {
        return StatusCode(Status404NotFound, new { message = ex.Message });
      }
      catch (ResourceDeleteException ex)
      {
        return StatusCode(Status500InternalServerError, new { message = ex.Message });
      }
    }

    // GET: api/operations/f364../history/cmd_logs
    [HttpGet("{id}/history/cmd_logs")]
    public async Task<IActionResult> DownloadCommandLog(string id)
    {
      try
      {
        var fs = _commandService.GetCommandLogStream(id);
        var operation = await _operationService.GetOperationByIdAsync(id);
        var fileName = operation.PathNumber + "_CmdLog.csv";
        return File(fs, "text/csv", fileName);
      }
      catch (ResourceNotFoundException ex)
      {
        return StatusCode(Status404NotFound, new { message = ex.Message });
      }
    }
    
    // GET: api/operations/f364../history/cmdfile_logs
    [HttpGet("{id}/history/cmdfile_logs")]
    public async Task<IActionResult> DownloadCommandFileLog(string id)
    {
      try
      {
        var fs = _commandService.GetCommandFileLogStream(id);
        var operation = await _operationService.GetOperationByIdAsync(id);
        var fileName = operation.PathNumber + "_CmdFileLog.csv";
        return File(fs, "text/csv", fileName);
      }
      catch (ResourceNotFoundException ex)
      {
        return StatusCode(Status404NotFound, new { message = ex.Message });
      }
    }
    
    // GET: api/operations/f364../history/tlm_packets
    [HttpGet("{id}/history/tlm_packets")]
    public IActionResult GetTelemetryPacketsWithData(string id)
    {
      try
      {
        var packets = _telemetryService.GetPacketsWithData(id);
        return StatusCode(Status200OK, new { data = packets });
      }
      catch (ResourceNotFoundException ex)
      {
        return StatusCode(Status404NotFound, new { message = ex.Message });
      }
    }

    // GET: api/operations/f364../history/record_tlm_packets
    [HttpGet("{id}/history/record_tlm_packets")]
    public IActionResult GetRecordTelemetryPacketsWithData(string id)
    {
      try
      {
        var packets = _telemetryService.GetRecordPacketsWithData(id);
        return StatusCode(Status200OK, new { data = packets });
      }
      catch (ResourceNotFoundException ex)
      {
        return StatusCode(Status404NotFound, new { message = ex.Message });
      }
    }

    // GET: api/operations/f364../history/tlm_logs?packet_name=aaa,bbb,ccc
    [HttpGet("{id}/history/tlm_logs")]
    public async Task<IActionResult> DownloadTelemetryLog(string id, string packet_name)
    {
      if (packet_name == null)
      {
        return StatusCode(Status400BadRequest, new { message = "The packet name must not be null" });
      }
      var packetNames = new List<string>(packet_name.Split(","));
      try
      {
        var zs = _telemetryService.GetTelemetryLogStream(id, packetNames);
        var operation = await _operationService.GetOperationByIdAsync(id);
        string fileName = operation.PathNumber + "_TlmLog.zip";
        return File(zs, "application/zip", fileName);
      }
      catch (ResourceNotFoundException ex)
      {
        return StatusCode(Status404NotFound, new { message = ex.Message });
      }
    }

    // GET: api/operations/f364../history/record_tlm_logs?packet_name=aaa,bbb,ccc
    [HttpGet("{id}/history/record_tlm_logs")]
    public async Task<IActionResult> DownloadRecordTelemetryLog(string id, string packet_name)
    {
      if (packet_name == null)
      {
        return StatusCode(Status400BadRequest, new { message = "The packet name must not be null" });
      }
      var packetNames = new List<string>(packet_name.Split(","));
      try
      {
        var zs = _telemetryService.GetRecordTelemetryLogStream(id, packetNames);
        var operation = await _operationService.GetOperationByIdAsync(id);
        string fileName = operation.PathNumber + "_RecordTlmLog.zip";
        return File(zs, "application/zip", fileName);
      }
      catch (ResourceNotFoundException ex)
      {
        return StatusCode(Status404NotFound, new { message = ex.Message });
      }
    }
  }
}
