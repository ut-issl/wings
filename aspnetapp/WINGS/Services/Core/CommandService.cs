using System;
using System.IO;
using System.Text;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Globalization;
using WINGS.Data;
using WINGS.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Hosting;

namespace WINGS.Services
{
  public class CommandService : ICommandService
  {
    private readonly ApplicationDbContext _dbContext;
    private readonly ITmtcHandlerFactory _tmtcHandlerFactory;
    private readonly ITcPacketManager _tcPacketManager;
    private readonly IDbRepository<Command> _dbRepository;
    private readonly ICommandFileRepository _fileRepository;
    private readonly ICommandFileLogRepository _filelogRepository;
    private readonly ILogger<ICommandService> _logger;
    private readonly IWebHostEnvironment _env;
    private static Dictionary<string, List<CommandFileIndex>> _indexesDict;
    private static Dictionary<int, Command> _sendCmdDict;
    private static bool _sendCommandFlag;
    private int periodMilliSeconds = 200; // 200 ms
    private static int _nextCmdWindow;
    private static int _cacheCmdWindow;
    private static readonly int _cmdWindowSize;
    protected enum CmdType { TypeA = 0b0, TypeB = 0b1 };
    

    static CommandService()
    {
      _indexesDict = new Dictionary<string, List<CommandFileIndex>>();
      _sendCmdDict = new Dictionary<int, Command>();
      _sendCommandFlag = false;
      _nextCmdWindow = 0x00;
      _cacheCmdWindow = 0x00;
      _cmdWindowSize = 256;
    }
    
    public CommandService(ApplicationDbContext dbContext,
                          ITmtcHandlerFactory tmtcHandlerFactory,
                          ITcPacketManager tcPacketManager,
                          IDbRepository<Command> dbRepository,
                          ICommandFileRepository fileRepository,
                          ICommandFileLogRepository filelogRepository,
                          ILogger<ICommandService> logger,
                          IWebHostEnvironment env)
    {
      _dbContext = dbContext;
      _tmtcHandlerFactory = tmtcHandlerFactory;
      _tcPacketManager = tcPacketManager;
      _dbRepository = dbRepository;
      _fileRepository = fileRepository;
      _filelogRepository = filelogRepository;
      _logger = logger;
      _env = env;
    }

    public IEnumerable<Command> GetAllCommand(string opid)
    {
      return _tcPacketManager.GetCommandDb(opid);
    }

    public async Task<bool> SendCommandAsync(string opid, Command command, string commanderId)
    {
      var commandDb = new List<Command>(_tcPacketManager.GetCommandDb(opid));
      if (!IsParamsTypeCheckOk(command, commandDb)) return false;

      try
      {
        _tcPacketManager.RegisterCommand(opid, command, (byte)CmdType.TypeB, 0x00);

        var commandLog = CommandToLog(opid, command);
        _dbContext.CommandLogs.Add(commandLog);
        await _dbContext.SaveChangesAsync();
        
        return true;
      }
      catch (Exception ex)
      {
        Console.WriteLine(ex.Message);
        return false;
      }
    }

    public async Task<bool> SendTypeACommandAsync(string opid, Command command, string commanderId, int cmdWindow)
    {
      var commandDb = new List<Command>(_tcPacketManager.GetCommandDb(opid));
      if (!IsParamsTypeCheckOk(command, commandDb)) return false;

      try
      {
        int reqCmdWindow = (int) _tmtcHandlerFactory.GetTmPacketAnalyzer(opid).GetCmdWindow();
        _tcPacketManager.RegisterCommand(opid, command, (byte)CmdType.TypeA, (byte)cmdWindow);

        var commandLog = CommandToLog(opid, command);
        _dbContext.CommandLogs.Add(commandLog);
        _sendCmdDict.Add(cmdWindow, command);

        for (int i = _cacheCmdWindow; i < ((_cacheCmdWindow>reqCmdWindow) ? (reqCmdWindow+_cmdWindowSize) : reqCmdWindow); i++)
        {
          _sendCmdDict.Remove(i%_cmdWindowSize);
          _cacheCmdWindow = (i+1) % _cmdWindowSize;
        }

        await _dbContext.SaveChangesAsync();

        return true;
      }
      catch (Exception ex)
      {
        Console.WriteLine(ex.Message);
        return false;
      }
    }

    public bool InitializeTypeAStatus(string opid) {
      try
      {
        _sendCmdDict.Clear();
        return true;
      }
      catch (Exception ex)
      {
        _logger.LogError(ex, $"Error initializing Type-A status. {ex.ToString()}");
        return false;
      }
    }

    public int UpdateCmdWindow(int window)
    {
      return (window == 0xff)?0x00:window+1;
    }

    public void SendRawCommand(string opid, byte[] packet)
    {
      var data = new TcPacketData(){
        Opid = opid,
        TcPacket = packet
      };
      _tmtcHandlerFactory.GetTmtcPacketService(opid).Send(data);
    }

    public async Task<bool> AddCmdFileLineLog(string opid, CommandFileLineLog command_file_line_log, string commanderName)
    {
      try
      {
        await _filelogRepository.AddHistoryAsync(opid, command_file_line_log, commanderName);
        return true;
      }
      catch (Exception ex)
      {
        Console.WriteLine(ex.Message);
        return false;
      }
    }

    public IEnumerable<CommandFileIndex> GetCommandFileIndexes(string opid)
    {
      if (!_indexesDict.TryGetValue(opid, out var indexes))
      {
        throw new ResourceNotFoundException("The operation is not running");
      }
      return indexes;
    }

    public async Task<CommandFile> GetCommandFileAsync(string opid, int cmdFileInfoIndex, int fileId)
    {
      if (!_indexesDict.TryGetValue(opid, out var indexes))
      {
        throw new ResourceNotFoundException("The operation is not running");
      }
      var index = indexes.FirstOrDefault(index => index.CmdFileInfoIndex == cmdFileInfoIndex && index.FileId == fileId);
      if (index == null)
      {
        throw new ResourceNotFoundException("The command file is not found");
      }
      var config = await new TlmCmdFileConfigBuilder(_dbContext, _env).Build(opid);
      var commandDb = _tcPacketManager.GetCommandDb(opid);
      var file = await _fileRepository.LoadCommandFileAsync(config, index, commandDb);
      return file;
    }
    public async Task<string> GetCommandRowAsync(string opid, int cmdFileInfoIndex, int fileId, int row)
    {
      if (!_indexesDict.TryGetValue(opid, out var indexes))
      {
        throw new ResourceNotFoundException("The operation is not running");
      }
      var index = indexes.FirstOrDefault(index => index.CmdFileInfoIndex == cmdFileInfoIndex && index.FileId == fileId);
      if (index == null)
      {
        throw new ResourceNotFoundException("The command file is not found");
      }
      var config = await new TlmCmdFileConfigBuilder(_dbContext, _env).Build(opid);
      var line = await _fileRepository.GetCommandRowAsync(config, index, row);
      return line;
    }

    public async Task<CommandFileLine> LoadCommandRowAsync(string opid, int cmdFileInfoIndex, int fileId, int row, string text)
    {
      if (!_indexesDict.TryGetValue(opid, out var indexes))
      {
        throw new ResourceNotFoundException("The operation is not running");
      }
      var index = indexes.FirstOrDefault(index => index.CmdFileInfoIndex == cmdFileInfoIndex && index.FileId == fileId);
      if (index == null)
      {
        throw new ResourceNotFoundException("The command file is not found");
      }
      var config = await new TlmCmdFileConfigBuilder(_dbContext, _env).Build(opid);
      var commandDb = _tcPacketManager.GetCommandDb(opid);
      var commandFileLine = await _fileRepository.LoadCommandRowAsync(config, index, commandDb, row, text);
      return commandFileLine;
    }

    public async Task<bool> ConfigureCommandDbAsync(Operation operation, TlmCmdFileConfig config)
    {
      try
      {
        var commandDb = await _dbRepository.LoadAllFilesAsync(config);
        _tcPacketManager.SetCommandDb(operation.Id, commandDb.ToList());
        return true;
      }
      catch (Exception ex)
      {
        Console.WriteLine(ex.Message);
        return false;
      }
    }

    public async Task<bool> ConfigureCommandFileAsync(Operation operation, TlmCmdFileConfig config)
    {
      try
      {
        var indexes = await _fileRepository.LoadCommandFileIndexesAsync(config);
        _indexesDict.Add(operation.Id, indexes);
        return true;
      }
      catch (Exception ex)
      {
        Console.WriteLine(ex.Message);
        return false;
      }
    }

    public async Task ReconfigureCommandFileAsync(string opid)
    {
      var operation = await _dbContext.Operations.FindAsync(opid);
      if (!operation.IsRunning || operation == null)
      {
        throw new ResourceNotFoundException("The operation is not running");
      }
      _indexesDict.Remove(opid);
      var config = await new TlmCmdFileConfigBuilder(_dbContext, _env).Build(opid);
      var indexes = await _fileRepository.LoadCommandFileIndexesAsync(config);
      _indexesDict.Add(opid, indexes);
    }

    public bool ConfigureCommandFileLog(Operation operation)
    {
      try
      {
        _filelogRepository.InitializeLogFiles(operation.Id);
        return true;
      }
      catch (Exception ex)
      {
        Console.WriteLine(ex.Message);
        return false;
      }
    }

    public void RemoveCommandFileIndexes(string opid)
    {
      _indexesDict.Remove(opid);
    }

    public Stream GetCommandLogStream(string opid)
    {
      var sb = new StringBuilder();
      sb.Append("Time, CmdName, Param1, Param2, Param3, Param4, Param5, Param6\r\n");

      var commandLogs = _dbContext.CommandLogs
        .Where(c => c.OperationId == opid)
        .OrderBy(c => c.SentAt);
      
      foreach (var log in commandLogs)
      {
        sb.Append(log.SentAt.ToString("yyyy-MM-dd HH:mm:ss.f")+","+","+log.CmdName+","+log.Param1+","+log.Param2+","+log.Param3+","+log.Param4+","+log.Param5+","+log.Param6+"\r\n");
      }
      var logByteArray = Encoding.UTF8.GetBytes(sb.ToString());
      return new MemoryStream(logByteArray);
    }

    public IEnumerable<CommandFileLineLogs> GetCmdLogHistory (string opid)
    {
      return _filelogRepository.GetCmdLogHistory(opid);
    }
    public Stream GetCommandFileLogStream(string opid)
    {
      return _filelogRepository.GetLogFileStream(opid);
    }

    private CommandLog CommandToLog(string opid, Command command)
    {
      var values = new string[6];
      for (int i = 0; i < 6; i++)
      {
        values[i] = i < command.Params.Count ? command.Params[i].Value.ToString() : null;
      }
      return new CommandLog
      {
        ExecType = command.ExecType,
        ExecTimeInt = command.ExecTimeInt,
        ExecTimeDouble = command.ExecTimeDouble,
        SentAt = DateTime.Now,
        CmdName = command.Name,
        OperationId = opid,
        Param1 = values[0],
        Param2 = values[1],
        Param3 = values[2],
        Param4 = values[3],
        Param5 = values[4],
        Param6 = values[5]
      };
    }

    private bool IsParamsTypeCheckOk(Command commandWillBeExecuted, IEnumerable<Command> commandDb)
    {
      var command = commandWillBeExecuted.Clone();  // deep copy

      // Search cmd from DB by name-matching
      var commandFromDb = commandDb.FirstOrDefault(cDb => (cDb.Code == command.Code && cDb.Component == command.Component));
      if (commandFromDb == null)
      {
        Console.WriteLine("\"Command\" : Command not found in CmdDB");
        return false;
      }

      // Check match of Params.Count
      if (commandFromDb.Params.Count != 0)
      {
        if (commandFromDb.Params[commandFromDb.Params.Count - 1].Type.ToLower() != "raw")
        {
          if (commandFromDb.Params.Count != command.Params.Count)
          {
            Console.WriteLine("\"Command\" : wrong number of parameters");
            return false;
          }
        }
      }
      else{
        if (command.Params.Count != 0)
          {
            Console.WriteLine("\"Command\" : wrong number of parameters");
            return false;
          }
      }

      // Check match of types of Params
      NumberStyles style;
      for (int SL = 0; SL < command.Params.Count; SL++)
      {
        if (command.Params[SL].Value.Contains("0x"))
        {
          style = NumberStyles.HexNumber;
          command.Params[SL].Value = command.Params[SL].Value.Replace("0x", ""); //TryParseは0xがあると成功しない
        }
        else
        {
          style = NumberStyles.Integer;
        }
        switch (commandFromDb.Params[SL].Type.ToLower())
        {
          //TODO: How to show the number of wrong-type parameters          
          case "int8_t":
          case "int8":
            SByte sbyte_val;
            if (SByte.TryParse(command.Params[SL].Value, style, CultureInfo.InvariantCulture, out sbyte_val))
            {
              if (style == NumberStyles.HexNumber)
              {
                command.Params[SL].Value = "0x" + command.Params[SL].Value;
              }
            }
            else
            {
              Console.WriteLine("\"Command\" : wrong type of parameters");
              return false;
            }
            break;
          case "uint8_t":
          case "uint8":
            Byte byte_val;
            if (Byte.TryParse(command.Params[SL].Value, style, CultureInfo.InvariantCulture, out byte_val))
            {
              if (style == NumberStyles.HexNumber)
              {
                command.Params[SL].Value = "0x" + command.Params[SL].Value;
              }
            }
            else
            {
              Console.WriteLine("\"Command\" : wrong type of parameters");
              return false;
            }
            break;
          case "int16_t":
          case "int16":
            Int16 int16_val;
            if (Int16.TryParse(command.Params[SL].Value, style, CultureInfo.InvariantCulture, out int16_val))
            {
              if (style == NumberStyles.HexNumber)
              {
                command.Params[SL].Value = "0x" + command.Params[SL].Value;
              }
            }
            else
            {
              Console.WriteLine("\"Command\" : wrong type of parameters");
              return false;
            }
            break;
          case "uint16_t":
          case "uint16":
            UInt16 uint16_val;
            if (UInt16.TryParse(command.Params[SL].Value, style, CultureInfo.InvariantCulture, out uint16_val))
            {
              if (style == NumberStyles.HexNumber)
              {
                command.Params[SL].Value = "0x" + command.Params[SL].Value;
              }
            }
            else
            {
              Console.WriteLine("\"Command\" : wrong type of parameters");
              return false;
            }
            break;
          case "int32_t":
          case "int32":
            Int32 int32_val;
            if (Int32.TryParse(command.Params[SL].Value, style, CultureInfo.InvariantCulture, out int32_val)) 
            {
              if (style == NumberStyles.HexNumber)
              {
                command.Params[SL].Value = "0x" + command.Params[SL].Value;
              }
            }
            else
            {
              Console.WriteLine("\"Command\" : wrong type of parameters");
              return false;
            }
            break;
          case "uint32_t":
          case "uint32":
            UInt32 uint32_val;
            if (UInt32.TryParse(command.Params[SL].Value, style, CultureInfo.InvariantCulture, out uint32_val)) 
            {
              if (style == NumberStyles.HexNumber)
              {
                command.Params[SL].Value = "0x" + command.Params[SL].Value;
              }
            }
            else
            {
              Console.WriteLine("\"Command\" : wrong type of parameters");
              return false;
            }
            break;
          case "float":
            float float_val;
            if (float.TryParse(command.Params[SL].Value, out float_val)) 
            {
            }
            else
            {
              Console.WriteLine("\"Command\" : wrong type of parameters");
              return false;
            }
            break;
          case "double":
            double double_val;
            if (double.TryParse(command.Params[SL].Value, out double_val)) 
            {
            }
            else
            {
              Console.WriteLine("\"Command\" : wrong type of parameters");
              return false;
            }
            break;
          case "raw":
            if (style != NumberStyles.HexNumber)
            {
              Console.WriteLine("\"Command\" : The raw parameter should be HEX.");
              return false;
            }
            for (int i = SL + 1; i < command.Params.Count; i++)
            {
              if (!command.Params[i].Value.Contains("0x"))
              {
                Console.WriteLine("\"Command\" : The raw parameter should be HEX.");
                return false;
              }
            }
            break;
          default:
            Console.WriteLine("\"Command\" : undefined type (check CMD_DB)");
            return false;
        }
      }
      return true;
    }
  }
}
