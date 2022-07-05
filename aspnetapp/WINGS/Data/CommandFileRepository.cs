using System;
using System.IO;
using System.Linq;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Globalization;
using Microsoft.AspNetCore.Hosting;
using WINGS.Models;
using WINGS.Library;

namespace WINGS.Data
{
  /// <summary>
  /// Provides methods for reading command plan files
  /// </summary>
  public class CommandFileRepository : ICommandFileRepository
  {
    private readonly IWebHostEnvironment _env;
    
    public CommandFileRepository(IWebHostEnvironment env)
    {
      _env = env;
    }

    /// <summary>
    /// Lists all command plan files that exist in the location defined in config
    /// </summary>
    /// <param name="config">Config of the files</param>
    /// <returns>Returns a list of the command file indexes</returns>
    /// <exception cref="ArgumentException">Undefined config of the files</exception>
    public async Task<List<CommandFileIndex>> LoadCommandFileIndexesAsync(TlmCmdFileConfig config)
    {
      var indexes = new List<CommandFileIndex>();
      int idx = 0;
      foreach (var c in config.CmdFileInfo)
      {
        var filePaths = await GetCommandFilePathsAsync(config.Location, c);
        foreach (var item in filePaths.Select((v, i) => new { v, i }))
        {
          var index = new CommandFileIndex()
          {
            FileId = item.i,
            Name = Path.GetFileNameWithoutExtension(item.v),
            FilePath = item.v,
            CmdFileInfoIndex = idx
          };
          indexes.Add(index);
        }
        idx++;
      }
      return indexes;
    }

    /// <summary>
    /// Reads the contents of the command file specified by the index and parses to CommandFile object
    /// </summary>
    /// <param name="config">Config of the file</param>
    /// <param name="index">Index of the file</param>
    /// <param name="commandDb">Definition of the commands</param>
    /// <returns>Returns a CommandFile object of the specified file</returns>
    /// <exception cref="ArgumentException">Undefined config of the file</exception>
    public async Task<CommandFile> LoadCommandFileAsync(TlmCmdFileConfig config, CommandFileIndex index, List<Command> commandDb)
    {
      var reader = await GetCommandFileReaderAsync(config.Location, config.CmdFileInfo[index.CmdFileInfoIndex], index.FilePath);
      var content = new List<CommandFileLine>();
      string line;
      while ((line = reader.ReadLine()) != null)
      {
        var newContent = new CommandFileLine();

        if (String.IsNullOrWhiteSpace(line))
        {
          newContent.Type = "comment";
          newContent.Body = "";
          content.Add(newContent);
          continue;
        }

        StopFlagCheck (ref line, newContent);

        CommentCheck (ref line, newContent);
        if (newContent.Type != null)
        {
          content.Add(newContent);
          continue;
        }

        ControlCheck (ref line, newContent);
        if (newContent.Type != null)
        {
          content.Add(newContent);
          continue;          
        }

        CommandCheck(ref line, newContent, commandDb);
        if (newContent.Type != null)
        {
          content.Add(newContent);
          continue;     
        }

        if (newContent.SyntaxError == false)
        {
          newContent.SyntaxError = true;
          newContent.ErrorMessage = "Type is null.";
        }
        
        content.Add(newContent);
      }

      return new CommandFile()
      {
        Index = index,
        Content = content
      };
    }

    private Task<IEnumerable<string>> GetCommandFilePathsAsync(TlmCmdFileLocation location, TlmCmdFileLocationInfo cmdFileInfo)
    {
      switch (location)
      {
        case TlmCmdFileLocation.Local:
          string dirPath = Path.Combine(_env.ContentRootPath, cmdFileInfo.DirPath, "cmdplan");
          if (Directory.Exists(dirPath))
          {
            return Task.FromResult(Directory.EnumerateFiles(dirPath, "*.ops", SearchOption.AllDirectories));
          }
          else
          {
            throw new ArgumentException("Undefined file location");
          }
        default:
          throw new ArgumentException("Undefined file location");
      }
    }

    private Task<StreamReader> GetCommandFileReaderAsync(TlmCmdFileLocation location, TlmCmdFileLocationInfo cmdFileInfo, string filePath)
    {
      switch (location)
      {
        case TlmCmdFileLocation.Local:
          return Task.FromResult(new StreamReader(filePath));
        default:
          throw new ArgumentException("Undefined file location");
      }
    }

    private void StopFlagCheck(ref string line, CommandFileLine newContent)
    {
      line = line.Trim();
      if (line[0] == '.')
      {
        newContent.StopFlag = true;
        line = line.Substring(1);
      }
    }

    private void CommentCheck(ref string line, CommandFileLine newContent)
    {
      // comment & inline comment
      var hashindex = line.IndexOf('#');
      switch (hashindex)
      {
        case -1:
          break;
        case 0:
          newContent.Type = "comment";
          newContent.Body = line;
          break;
        default:
          newContent.InlineComment = line.Substring(hashindex);
          line = line.Remove(hashindex).Trim();
          break;
      }
    }

    private void ControlCheck(ref string line, CommandFileLine newContent)
    {
      string[] splitlinearray = line.Split(new string[] { " ", "　" }, StringSplitOptions.RemoveEmptyEntries);
      var splitlinelist = new List<string>(splitlinearray);
      switch (splitlinelist[0].ToLower())
      {
        case "call":
          newContent.Type = "control";
          newContent.Method = splitlinelist[0].ToLower();
          splitlinelist.RemoveAt(0);
          CallParse(splitlinelist, newContent);
          break;
        case "modechk":
          newContent.Type = "control";
          newContent.Method = splitlinelist[0].ToLower();
          splitlinelist.RemoveAt(0);
          ModechkParse(splitlinelist, newContent);
          break;
        case "wait_sec":
          newContent.Type = "control";
          newContent.Method = splitlinelist[0].ToLower();
          splitlinelist.RemoveAt(0);
          WaitsecParse(splitlinelist, newContent);
          break;
        case "check_value":
          newContent.Type = "control";
          newContent.Method = splitlinelist[0].ToLower();
          splitlinelist.RemoveAt(0);
          CheckValueParse(splitlinelist, newContent);
          break;
      }         
    }


    private void CallParse(List<string> splitlinelist, CommandFileLine newContent)
    {
      switch(splitlinelist.Count)
      {
        case 1:
          if(splitlinelist[0].EndsWith(".ops",StringComparison.OrdinalIgnoreCase))
          {
            newContent.Body = new {
              FileName = splitlinelist[0].TrimEnd('.', 'o', 'p', 's')
            };
          }
          else
          {
            newContent.SyntaxError = true;
            newContent.ErrorMessage = "Method \"call\" : end with *.ops";
          }
          break;
        default:
          newContent.SyntaxError = true;
          newContent.ErrorMessage = "Method \"call\" : wrong number of data";
          break;
      }
    }

    private void ModechkParse(List<string> splitlinelist, CommandFileLine newContent)
    {
      switch(splitlinelist.Count)
      {
        case 1:
          if(splitlinelist[0].EndsWith(".mod",StringComparison.OrdinalIgnoreCase))
          {
            newContent.Body = new {
              FileName = splitlinelist[0].TrimEnd('.', 'm', 'o', 'd')
            };
          }
          else
          {
            newContent.SyntaxError = true;
            newContent.ErrorMessage = "Method \"modechk\" : end with *.mod";
          }
          break;
        default:
          newContent.SyntaxError = true;
          newContent.ErrorMessage = "Method \"modechk\" : wrong number of data";
          break;
      }
    }

    private void WaitsecParse(List<string> splitlinelist, CommandFileLine newContent)
    {
      switch(splitlinelist.Count)
      {
        case 1:
          float sec;
          if(float.TryParse(splitlinelist[0], out sec))
          {
            newContent.Body = new {
              time = sec
            };
          }
          else
          { 
            newContent.SyntaxError = true;
            newContent.ErrorMessage = "Method \"wait_sec\" : type error 'time'";
          }
          break;
        default:
          newContent.SyntaxError = true;
          newContent.ErrorMessage = "Method \"wait_sec\" : wrong number of data";
          break;
      }
    }

    private void CheckValueParse(List<string> splitlinelist, CommandFileLine newContent)
    {
      switch (splitlinelist.Count)
      {
        case 3:
          if (splitlinelist[1] == "==" || splitlinelist[1] == "<=" || splitlinelist[1] == ">=" || splitlinelist[1] == "<" || splitlinelist[1] == ">" || splitlinelist[1] == "!=")
          {
            newContent.Body = new
            {
              variable = splitlinelist[0],
              compare = splitlinelist[1],
              value = splitlinelist[2]
            };
          }
          else
          {
            newContent.SyntaxError = true;
            newContent.ErrorMessage = "Method \"check_value\" : wrong number of data";
          }
          break;
        default:
          newContent.SyntaxError = true;
          newContent.ErrorMessage = "Method \"check_value\" : wrong number of data";
          break;
      }
    }

    private void CommandCheck(ref string line, CommandFileLine newContent, List<Command> commandDb)
    {
      // command
      // ex. Cmd_BCT_SET_BLOCK_POSITION 15 0
      // ex. OBC_TL.Cmd_BCT_SET_BLOCK_POSITION 100 15 0
      string[] splitlinearray = line.Split(new string[] { " ", "　" }, StringSplitOptions.RemoveEmptyEntries);
      var splitlinelist = new List<string>(splitlinearray);
      if (splitlinelist[0].IndexOf(".") != -1)
      {
        CommandExeParse(splitlinelist, newContent, commandDb);
      }
      else
      {
        CommandParse(splitlinelist, newContent, commandDb);        
      }
    }

    private void CommandExeParse(List<string> splitlinelist, CommandFileLine newContent, List<Command> commandDb)
    {
      var dotIndex = splitlinelist[0].IndexOf('.');
      CmdExecType execType = CmdExecType.RT;
      var component = "";
      var isViaMobc = false;
      if (dotIndex > 3)
      {
        var mobcIndex = splitlinelist[0].IndexOf("MOBC_");
        if (mobcIndex >= 0 && dotIndex > 11)
        {
          var afterMobcLine = splitlinelist[0].Substring(mobcIndex + 8);
          component = afterMobcLine.Substring(0, afterMobcLine.IndexOf('_'));
          Enum.TryParse(splitlinelist[0].Substring(mobcIndex + 5, dotIndex - mobcIndex - 5), out execType);
          isViaMobc = true;
        }
        else
        {
          component = splitlinelist[0].Substring(0, splitlinelist[0].IndexOf('_'));
          Enum.TryParse(splitlinelist[0].Substring(5, dotIndex - 5), out execType);
        }
      }
      var cmdBodyBuf = commandDb.FirstOrDefault(c => c.Name == splitlinelist[0].Substring(dotIndex + 1) && c.Component == component);
      if (cmdBodyBuf == null)
      {
        newContent.SyntaxError = true;
        newContent.ErrorMessage = "\"CommandExe\" : Command not found. Check the first word in this line.";
        return;
      }
      newContent.Body = cmdBodyBuf.Clone();
      newContent.Body.IsViaMobc = isViaMobc;
      newContent.Body.ExecType = execType;
      newContent.Type = "command";
      splitlinelist.RemoveAt(0);
      if (newContent.Body.ExecType == CmdExecType.TL || newContent.Body.ExecType == CmdExecType.BL || newContent.Body.ExecType == CmdExecType.UTL)
      {
        uint execTime;
        if (uint.TryParse(splitlinelist[0], out execTime)) 
        { 
          newContent.Body.ExecTime = execTime;
        }
        else
        {
          newContent.SyntaxError = true;
          newContent.ErrorMessage = "\"CommandExe\" : Exetype is 'TL' or 'BL' or 'UTL'. The first parameter should be uint.";
          return;
        }
        splitlinelist.RemoveAt(0);
      }
      ParamsTypeCheck(splitlinelist, newContent);
    }

    private void CommandParse(List<string> splitlinelist, CommandFileLine newContent, List<Command> commandDb)
    {
      var cmdBodyBuf = commandDb.FirstOrDefault(c => c.Name == splitlinelist[0]);
      if (cmdBodyBuf == null)
      {
        newContent.SyntaxError = true;
        newContent.ErrorMessage = "\"Command\" : Command not found. Check the first word in this line.";
        return;
      }
      newContent.Body = cmdBodyBuf.Clone();
      newContent.Type = "command";
      splitlinelist.RemoveAt(0);
      ParamsTypeCheck(splitlinelist, newContent);
    }

    private void ParamsTypeCheck(List<string> splitlinelist, CommandFileLine newContent)
    {
      NumberStyles style;
      if (newContent.Body.Params.Count != 0)
      {
        if (newContent.Body.Params[newContent.Body.Params.Count - 1].Type.ToLower() != "raw")
        {
          if (splitlinelist.Count != newContent.Body.Params.Count)
          {
            newContent.SyntaxError = true;
            newContent.ErrorMessage = "\"Command\" : wrong number of parameters";
            return;
          }
        }
      }
      else{
        if (splitlinelist.Count != 0)
          {
            newContent.SyntaxError = true;
            newContent.ErrorMessage = "\"Command\" : wrong number of parameters";
            return;
          }
      }
      for (int SL = 0; SL < newContent.Body.Params.Count; SL++)
      {
        if (splitlinelist[SL].Contains("0x"))
        {
          style = NumberStyles.HexNumber;
          splitlinelist[SL] = splitlinelist[SL].Replace("0x", ""); //TryParseは0xがあると成功しない
        }
        else
        {
          style = NumberStyles.Integer;
        }
        switch (newContent.Body.Params[SL].Type.ToLower())
        {
          //TODO: How to show the number of wrong-type parameters          
          case "int8_t":
          case "int8":
            SByte sbyte_val;
            if (SByte.TryParse(splitlinelist[SL], style, CultureInfo.InvariantCulture, out sbyte_val))
            {
              if(style == NumberStyles.HexNumber)
              {
                splitlinelist[SL] = "0x" + splitlinelist[SL];
              }
              newContent.Body.Params[SL].Value = splitlinelist[SL];
            }
            else
            {
              newContent.SyntaxError = true;
              newContent.ErrorMessage = "\"Command\" : wrong type of parameters";
            }
            break;
          case "uint8_t":
          case "uint8":
            Byte byte_val;
            if (Byte.TryParse(splitlinelist[SL], style, CultureInfo.InvariantCulture, out byte_val))
            {
              if (style == NumberStyles.HexNumber)
              {
                splitlinelist[SL] = "0x" + splitlinelist[SL];
              }
              newContent.Body.Params[SL].Value = splitlinelist[SL];
            }
            else
            {
              newContent.SyntaxError = true;
              newContent.ErrorMessage = "\"Command\" : wrong type of parameters";
            }
            break;
          case "int16_t":
          case "int16":
            Int16 int16_val;
            if (Int16.TryParse(splitlinelist[SL], style, CultureInfo.InvariantCulture, out int16_val))
            {
              if (style == NumberStyles.HexNumber)
              {
                splitlinelist[SL] = "0x" + splitlinelist[SL];
              }
              newContent.Body.Params[SL].Value = splitlinelist[SL];
            }
            else
            {
              newContent.SyntaxError = true;
              newContent.ErrorMessage = "\"Command\" : wrong type of parameters";
            }
            break;
          case "uint16_t":
          case "uint16":
            UInt16 uint16_val;
            if (UInt16.TryParse(splitlinelist[SL], style, CultureInfo.InvariantCulture, out uint16_val))
            {
              if (style == NumberStyles.HexNumber)
              {
                splitlinelist[SL] = "0x" + splitlinelist[SL];
              }
              newContent.Body.Params[SL].Value = splitlinelist[SL];
            }
            else
            {
              newContent.SyntaxError = true;
              newContent.ErrorMessage = "\"Command\" : wrong type of parameters";
            }
            break;
          case "int32_t":
          case "int32":
            Int32 int32_val;
            if (Int32.TryParse(splitlinelist[SL], style, CultureInfo.InvariantCulture, out int32_val)) 
            {
              if (style == NumberStyles.HexNumber)
              {
                splitlinelist[SL] = "0x" + splitlinelist[SL];
              }
              newContent.Body.Params[SL].Value = splitlinelist[SL]; 
            }
            else
            {
              newContent.SyntaxError = true;
              newContent.ErrorMessage = "\"Command\" : wrong type of parameters";
            }
            break;
          case "uint32_t":
          case "uint32":
            UInt32 uint32_val;
            if (UInt32.TryParse(splitlinelist[SL], style, CultureInfo.InvariantCulture, out uint32_val)) 
            {
              if (style == NumberStyles.HexNumber)
              {
                splitlinelist[SL] = "0x" + splitlinelist[SL];
              }
              newContent.Body.Params[SL].Value = splitlinelist[SL]; 
            }
            else
            {
              newContent.SyntaxError = true;
              newContent.ErrorMessage = "\"Command\" : wrong type of parameters";
            }
            break;
          case "float":
            float float_val;
            if (float.TryParse(splitlinelist[SL], out float_val)) 
            { 
              newContent.Body.Params[SL].Value = splitlinelist[SL]; 
            }
            else
            {
              newContent.SyntaxError = true;
              newContent.ErrorMessage = "\"Command\" : wrong type of parameters";
            }
            break;    
          case "double":
            double double_val;
            if (double.TryParse(splitlinelist[SL], out double_val)) 
            { 
              newContent.Body.Params[SL].Value = splitlinelist[SL]; 
            }
            else
            {
              newContent.SyntaxError = true;
              newContent.ErrorMessage = "\"Command\" : wrong type of parameters";
            }
            break;
          case "raw":
            if (style != NumberStyles.HexNumber)
            {
              newContent.SyntaxError = true;
              newContent.ErrorMessage = "\"Command\" : The raw parameter should be HEX.";
              break;            
            }
            splitlinelist[SL] = "[0x" + splitlinelist[SL];
            newContent.Body.Params[SL].Value = splitlinelist[SL];
            for (int i = SL + 1; i < splitlinelist.Count; i++)
            {
              if (!splitlinelist[i].Contains("0x"))
              {
                newContent.SyntaxError = true;
                newContent.ErrorMessage = "\"Command\" : The raw parameter should be HEX."; 
                break;             
              }
              newContent.Body.Params[SL].Value += "/" + splitlinelist[i];
            }
            newContent.Body.Params[SL].Value += "]";
            break;
          default:
            newContent.SyntaxError = true;
            newContent.ErrorMessage = "\"Command\" : undefined type (check CMD_DB)";
            break;                 
        }
      }
    }
  }
}
