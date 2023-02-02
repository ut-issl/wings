using System;
using System.Linq;
using System.IO;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using WINGS.Models;

namespace WINGS.Data
{
  /// <summary>
  /// Provides methods for handling csv CommandFile logs
  /// </summary>
  public class CommandFileLogRepository : ICommandFileLogRepository
  {
    private readonly IWebHostEnvironment _env;

    public CommandFileLogRepository(IWebHostEnvironment env)
    {
      _env = env;
    }

    /// <summary>
    /// Add the CommandFile log to csv files per packet
    /// </summary>
    /// <param name="opid">Operation id</param>
    /// <param name="packet">CommandFile packet to save the logs</param>
    public async Task AddHistoryAsync(string opid, CommandFileLineLog command_file_line_log, string commanderName)
    {
      string filePath = Path.Combine(_env.ContentRootPath, "Logs", opid, "cmdfilelog", "cmdfilelog.csv");
      var sb = new StringBuilder();
      sb.Append(DateTime.Now + ",");
      sb.Append(commanderName + ",");
      var cmdFileTxtTmp = CommandFileLineToText(command_file_line_log.Request);
      sb.Append(((cmdFileTxtTmp.IndexOf(",") > -1 || cmdFileTxtTmp.IndexOf("�C") > -1) ? "\""+ cmdFileTxtTmp + "\"" : cmdFileTxtTmp) + ",");
      sb.Append(command_file_line_log.Status.Success? "Success": "Error");
      sb.Append("\r\n");
      using (var sw = new StreamWriter(filePath, true, Encoding.UTF8))
      {
        await sw.WriteAsync(sb.ToString());
      }
    }

    public List<CommandFileLineLogs> GetCmdLogHistory(string opid)
    {
      string fileName = Path.Combine(_env.ContentRootPath, "Logs", opid, "cmdfilelog", "cmdfilelog.csv");
      FileStream fs = new FileStream(fileName, FileMode.Open, FileAccess.Read, FileShare.ReadWrite);
      List<CommandFileLineLogs> cmdLogHistory = new List<CommandFileLineLogs>();
      var sr = new StreamReader(fs);
      string[] cols;
      while (!sr.EndOfStream)
      {
        cols = sr.ReadLine().Split(",");
        for (int i = 0; i < (cols.Count()+1)%4; i++)
        {
          if (cols[i*4] == "Time"){
            continue;
          }
          else{
            CommandFileLineLogs commandFileLine = new CommandFileLineLogs();
            commandFileLine.Time = cols[i*4];
            commandFileLine.Commander = cols[i*4+1];
            commandFileLine.Content = cols[i*4+2];
            commandFileLine.Status = cols[i*4+3];
            cmdLogHistory.Add(commandFileLine);
          }
        }
      }
      return cmdLogHistory;
    }

    /// <summary>
    /// Create new files and write headers to initialize log files
    /// </summary>
    /// <param name="opid">Operation id</param>
    public void InitializeLogFiles(string opid)
    {
      string dirPath = Path.Combine(_env.ContentRootPath, "Logs", opid, "cmdfilelog");
      Directory.CreateDirectory(dirPath);
      string filePath = Path.Combine(dirPath, "cmdfilelog.csv");
      var sb = new StringBuilder();
      sb.Append("Time,CommanderName,CommandLine,Status\r\n");
      using (var sw = new StreamWriter(filePath, false, Encoding.UTF8))
      {
        sw.Write(sb.ToString());
      }
    }

    /// <summary>
    /// Returns a stream of the specified csv file
    /// </summary>
    /// <param name="opid">Operation id</param>
    public Stream GetLogFileStream(string opid)
    {
      string filePath = Path.Combine(_env.ContentRootPath, "Logs", opid, "cmdfilelog", "cmdfilelog.csv");
      return File.OpenRead(filePath);
    }

    private string CommandFileLineToText(CommandFileLine command_file_line_log)
    {
      var sb = new StringBuilder();
      switch (command_file_line_log.Type)
      {
        case "comment":
          return command_file_line_log.Body.ToString();
        case "command":
          Command cmd_tmp = JsonSerializer.Deserialize<Command>(command_file_line_log.Body.ToString(), new JsonSerializerOptions
          {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            Converters = { new JsonStringEnumConverter() }
          });
          switch (cmd_tmp.ExecType)
          {
            case CmdExecType.RT:
              sb.Append("RT." + cmd_tmp.Name);
              break;
            case CmdExecType.TL:
              sb.Append("TL." + cmd_tmp.Name + " " + cmd_tmp.ExecTimeStr);
              break;
            case CmdExecType.BL:
              sb.Append("BL." + cmd_tmp.Name + " " + cmd_tmp.ExecTimeStr);
              break;
            case CmdExecType.UTL:
              sb.Append("UTL." + cmd_tmp.Name + " " + cmd_tmp.ExecTimeStr);
              break;
            default:
              return "";
          }
          foreach (var param in cmd_tmp.Params)
          {
            sb.Append(" " + param.Value);
          }
          if (!String.IsNullOrEmpty(command_file_line_log.InlineComment))
          {
            sb.Append(" " + command_file_line_log.InlineComment);
          }
          return sb.ToString();
        case "control":
          switch (command_file_line_log.Method)
          {
            case "wait_sec":
              sb.Append(command_file_line_log.Method + " " + command_file_line_log.Body.GetProperty("time").ToString());
              break;
            case "wait_until":
              sb.Append(command_file_line_log.Method + " " + command_file_line_log.Body.GetProperty("variable").ToString() + " " + command_file_line_log.Body.GetProperty("compare").ToString() + " " + command_file_line_log.Body.GetProperty("value").ToString()
                        + " " + command_file_line_log.Body.GetProperty("statement").ToString() + " " + command_file_line_log.Body.GetProperty("timeoutsec").ToString());
              break;
            case "call":
              sb.Append(command_file_line_log.Method + " " + command_file_line_log.Body.GetProperty("fileName").ToString());
              break;
            case "check_value":
              sb.Append(command_file_line_log.Method + " " + command_file_line_log.Body.GetProperty("variable").ToString() + " " + command_file_line_log.Body.GetProperty("compare").ToString() + " " + command_file_line_log.Body.GetProperty("value").ToString());
              break;
            case "let":
              sb.Append(command_file_line_log.Method + " " + command_file_line_log.Body.GetProperty("variable").ToString() + " " + command_file_line_log.Body.GetProperty("equal").ToString() + " " + command_file_line_log.Body.GetProperty("equation").ToString());
              break;
          }
          if (!String.IsNullOrEmpty(command_file_line_log.InlineComment))
          {
            sb.Append(" " + command_file_line_log.InlineComment);
          }
          return sb.ToString();
        default:
          return "";
      }
    }
  }
}
