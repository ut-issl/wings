//
// TextFieldParserForDotNetCore
//
// https://github.com/Taka414/TextFieldParserForDotNetCore
//
// This supports for reading a CSV file with commas in a column
// Example:
//  1,2,3,4,5          -> [1], [2], [3], [4], [5]
//  "a,a",2,3,4,"5"    -> [a,a], [2], [3], [4], [5]
//  "a,a", 2, 3,"4", 5 -> [a,a] [2] [3] ["4"] [5]
//

using System;
using System.IO;
using System.Text;
using System.Collections.Generic;
using System.Runtime.Serialization;

namespace WINGS.Library
{
  [Serializable]
  public class MalformedLineException : Exception
  {
    public MalformedLineException() { }
    public MalformedLineException(string message, long line) : base(message) { }
    public MalformedLineException(string message, Exception inner) : base(message, inner) { }
    protected MalformedLineException(SerializationInfo info, StreamingContext context) : base(info, context) { }
  }

  /// <summary>
  /// Indicates whether text fields are delimited or fixed width.
  /// <para>[Jp]テキスト フィールドが区切り形式か固定幅形式かを示します。</para>
  /// </summary>
  public enum FieldType
  {
    /// <summary>
    /// Indicates that the fields are delimited.
    /// <para>[JP] 	フィールドが区切り形式であることを示します。</para>
    /// </summary>

    Delimited = 0,
    /// <summary>
    /// Indicates that the fields are fixed width.
    /// <para>[JP] フィールドが固定幅形式であることを示します。</para>
    /// </summary>
    FixedWidth = 1
  }

  /// <summary>
  /// Provides methods and properties for parsing structured text files.
  /// <para>[JP] 構造化テキスト ファイルの解析に使用するメソッドとプロパティを提供します。</para>
  /// </summary>
  public class TextFieldParser : IDisposable
  {
    // Node::
    //
    // [Sample,csv]
    // 1,2,3,4,5            // read OK
    // "a,a",2,3,4,"5"      // read OK
    // "a,a", 2, 3, "4" , 5 // can not read pattern [ "4" ]. with no error ended.

    //
    // Fields
    // - - - - - - - - - - - - - - - - - - - -
    #region Fields

    private TextReader reader;
    private bool leaveOpen = false;
    private int[] fieldWidths = null;
    private Queue<string> peekedLine = new Queue<string>();
    private int minFieldLength;

    #endregion

    //
    // Properties
    // - - - - - - - - - - - - - - - - - - - -
    #region Properties

    /// <summary>
    /// Defines comment tokens. A comment token is a string that, when placed at the beginning of a line, indicates that the line is a comment and should be ignored by the parser.
    /// <para>[Jp] コメント トークンを定義します。 コメント トークンとは、コメント行であることを示すために、行頭に配置される文字列です。コメント トークンの配置された行は、パーサーによって無視されます。</para>
    /// </summary>
    public string[] CommentTokens { get; set; } = new string[] { };

    /// <summary>
    /// Defines the delimiters for a text file.
    /// <para>[JP] テキスト ファイルの区切り記号を定義します。</para>
    /// </summary>
    public string[] Delimiters { get; set; }

    /// <summary>
    /// Returns <code>true</code> if there are no non-blank, non-comment lines between the current cursor position and the end of the file.
    /// <para>[JP] 現在のカーソル位置とファイルの終端との間に、空行またはコメント行以外のデータが存在しない場合、<code>true</code> を返します。</para>
    /// </summary>
    public bool EndOfData => this.PeekChars(1) == null;

    /// <summary>
    /// Returns the line that caused the most recent <see cref="MalformedLineException"/> exception.
    /// <para>[Jp] 直前に発生した MalformedLineException 例外の原因となった行を返します。</para>
    /// </summary>
    public string ErrorLine { get; private set; } = string.Empty;

    /// <summary>
    /// Returns the number of the line that caused the most recent <see cref="MalformedLineException"/> exception.
    /// <para>[Jp] 	直前の MalformedLineException 例外が発生した行の番号を返します。</para>
    /// </summary>
    public long ErrorLineNumber { get; private set; } = -1;

    /// <summary>
    /// Denotes the width of each column in the text file being parsed.
    /// <para>[Jp] 解析するテキスト ファイルの各列の幅を表します。</para>
    /// </summary>
    public int[] FieldWidths
    {
      get => this.fieldWidths;
      set
      {
        this.fieldWidths = value;
        if (this.fieldWidths != null)
        {
          this.minFieldLength = 0;
          for (int i = 0; i <= this.fieldWidths.Length - 1; i++)
          {
            this.minFieldLength += value[i];
          }
        }
      }
    }

    /// <summary>
    /// Denotes whether fields are enclosed in quotation marks when a delimited file is being parsed.
    /// <para>[Jp] 区切り記号入りファイルを解析する場合に、フィールドが引用符で囲まれているかどうかを示します。</para>
    /// </summary>
    public bool HasFieldsEnclosedInQuotes { get; set; } = true;

    /// <summary>
    /// Returns the current line number, or returns -1 if no more characters are available in the stream.
    /// <para>[Jp] 	現在の行番号を返します。ストリームから取り出す文字がなくなった場合は -1 を返します。</para>
    /// </summary>
    public long LineNumber { get; private set; } = -1;

    /// <summary>
    /// Indicates whether the file to be parsed is delimited or fixed-width.
    /// <para>[Jp] 解析対象のファイルが区切り形式か固定幅形式かを示します。</para>
    /// </summary>
    public FieldType TextFieldType { get; set; } = FieldType.Delimited;

    /// <summary>
    /// Indicates whether leading and trailing white space should be trimmed from field values.
    /// <para>[Jp] フィールド値から前後の空白をトリムするかどうかを示します。</para>
    /// </summary>
    public bool TrimWhiteSpace { get; set; } = true;

    #endregion

    //
    // Constructors
    // - - - - - - - - - - - - - - - - - - - -
    #region Constructors

    public TextFieldParser(Stream stream) => this.reader = new StreamReader(stream);
    public TextFieldParser(TextReader reader) => this.reader = reader;
    public TextFieldParser(string path) => this.reader = new StreamReader(path);
    public TextFieldParser(Stream stream, Encoding defaultEncoding) => this.reader = new StreamReader(stream, defaultEncoding);
    public TextFieldParser(string path, Encoding defaultEncoding) => this.reader = new StreamReader(path, defaultEncoding);
    public TextFieldParser(Stream stream, Encoding defaultEncoding, bool detectEncoding) => this.reader = new StreamReader(stream, defaultEncoding, detectEncoding);
    public TextFieldParser(string path, Encoding defaultEncoding, bool detectEncoding) => this.reader = new StreamReader(path, defaultEncoding, detectEncoding);
    public TextFieldParser(Stream stream, Encoding defaultEncoding, bool detectEncoding, bool leaveOpen)
    {
      this.reader = new StreamReader(stream, defaultEncoding, detectEncoding);
      this.leaveOpen = leaveOpen;
    }

    ~TextFieldParser()
    {
      this.Dispose(false);
    }

    #endregion

    //
    // Public Functions
    // - - - - - - - - - - - - - - - - - - - -
    #region Public Functions

    /// <summary>
    /// Closes the current <see cref="TextFieldParser"/> object.
    /// <para>[Jp] 現在の <see cref="TextFieldParser"/> オブジェクトを閉じます。</para>
    /// </summary>
    public void Close()
    {
      if (this.reader != null && this.leaveOpen == false)
      {
        this.reader.Close();
      }
      this.reader = null;
    }

    /// <summary>
    /// 
    /// <para>[Jp] カーソルを進めずに、指定された文字数を読み込みます。</para>
    /// </summary>
    public string PeekChars(int numberOfChars)
    {
      if (numberOfChars < 1)
      {
        throw (new ArgumentException("numberOfChars has to be a positive, non-zero number", "numberOfChars"));
      }
      string[] peekedLines;
      string theLine = null;
      if (this.peekedLine.Count > 0)
      {
        peekedLines = this.peekedLine.ToArray();
        for (int i = 0; i <= this.peekedLine.Count - 1; i++)
        {
          if (this.IsCommentLine(Line: peekedLines[i]) == false)
          {
            theLine = peekedLines[i];
            break;
          }
        }
      }
      if (theLine == null)
      {
        do
        {
          theLine = this.reader.ReadLine();
          this.LineNumber++;
          this.peekedLine.Enqueue(theLine);
            
        } while (!(theLine == null || this.IsCommentLine(theLine) == false));
      }
      if (theLine != null)
      {
        if (theLine.Length <= numberOfChars)
        {
          return theLine;
        }
        else
        {
          return theLine.Substring(0, numberOfChars);
        }
      }

      else
      {
        return null;
      }
    }

    /// <summary>
    /// Reads the specified number of characters without advancing the cursor.
    /// <para>[Jp] 現在行のすべてのフィールドを読み込んで文字列の配列として返し、次のデータが格納されている行にカーソルを進めます。</para>
    /// </summary>
    public string[] ReadFields()
    {
      switch (this.TextFieldType)
      {
        case FieldType.Delimited:
          return this.GetDelimitedFields();

        case FieldType.FixedWidth:
        default:
          throw new NotSupportedException("Sorry. this type is not suported.");

        // case FieldType.FixedWidth:
        //     return GetWidthFields();
        // default:
        //     return GetDelimitedFields();
      }
    }

    /// <summary>
    /// Returns the current line as a string and advances the cursor to the next line.
    /// <para>[Jp] 現在の行を文字列として返し、カーソルを次の行に進めます。</para>
    /// </summary>
    public string ReadLine()
    {
      if (this.peekedLine.Count > 0)
      {
        return this.peekedLine.Dequeue();
      }
      if (this.LineNumber == -1)
      {
        this.LineNumber = 1;
      }
      else
      {
        this.LineNumber++;
      }
      return this.reader.ReadLine();
    }

    /// <summary>
    /// Reads the remainder of the text file and returns it as a string.
    /// <para>[Jp] テキスト ファイルの残りの部分を読み込み、文字列として返します。</para>
    /// </summary>
    public string ReadToEnd() => this.reader.ReadToEnd();

    /// <summary>
    /// Sets the delimiters for the reader to the specified values, and sets the field type to <see cref="FieldType.Delimited"/>.
    /// <para>[Jp] リーダーの区切り記号を指定された値に設定し、フィールドの種類を <see cref="FieldType.Delimited"/> に設定します。</para>
    /// </summary>
    public void SetDelimiters(params string[] delimiters) => this.Delimiters = delimiters;

    /// <summary>
    /// Indicates whether leading and trailing white space should be trimmed from field values.
    /// <para>[Jp] リーダーの区切り記号を指定の値に設定します。</para>
    /// </summary>
    public void SetFieldWidths(params int[] fieldWidths) => this.FieldWidths = fieldWidths;

    #endregion

    //
    // IDisposable Support
    // - - - - - - - - - - - - - - - - - - - -
    #region IDisposable Support

    private bool disposedValue = false; // To detect redundant calls
                                        // IDisposable
    protected virtual void Dispose(bool disposing)
    {
      if (!this.disposedValue)
      {
        this.Close();
      }
      this.disposedValue = true;
    }

    public void Dispose()
    {
      this.Dispose(true);
      GC.SuppressFinalize(this);
    }

    #endregion

    //
    // Private Functions
    // - - - - - - - - - - - - - - - - - - - -
    #region Private Functions

    private string[] GetDelimitedFields()
    {
      if (this.Delimiters == null || this.Delimiters.Length == 0)
      {
        throw (new InvalidOperationException("Unable to read delimited fields because Delimiters is Nothing or empty."));
      }
      List<string> result = new List<string>();
      string line;
      int currentIndex = 0;
      int nextIndex = 0;
      line = this.GetNextLine();
      if (line == null)
      {
        return null;
      }
      while (!(nextIndex >= line.Length))
      {
        string parts = this.GetNextField(line, currentIndex, ref nextIndex);
        if (this.TrimWhiteSpace)
        {
          parts = parts.Trim(); // simple trim. white space only.
        }
        result.Add(parts);
        currentIndex = nextIndex;
      }
      return result.ToArray();
    }

    private string GetNextField(string line, int startIndex, ref int nextIndex)
    {
      bool inQuote = false;
      int currentindex = 0;
      if (nextIndex == int.MinValue)
      {
        nextIndex = int.MaxValue;
        return string.Empty;
      }

      currentindex = startIndex;

      if (this.HasFieldsEnclosedInQuotes && line[currentindex] == '\"')
      {
        inQuote = true;
        startIndex++;
      }

        
      bool mustMatch = false;
      for (int j = startIndex; j <= line.Length - 1; j++)
      {
        if (inQuote)
        {
          if (line[j] == '\"')
          {
            inQuote = false;
            mustMatch = true;
          }
          continue;
        }
        for (int i = 0; i <= this.Delimiters.Length - 1; i++)
        {
          if (string.Compare(line, j, this.Delimiters[i], 0, this.Delimiters[i].Length) == 0)
          {
            nextIndex = j + this.Delimiters[i].Length;
            if (nextIndex == line.Length)
            {
              nextIndex = int.MinValue;
            }
            if (mustMatch)
            {
              return line.Substring(startIndex, j - startIndex - 1);
            }
            else
            {
              return line.Substring(startIndex, j - startIndex);
            }
          }
        }
        if (mustMatch)
        {
          this.RaiseDelimiterEx(line);
        }
      }

      if (inQuote)
      {
        this.RaiseDelimiterEx(line);
      }

      nextIndex = line.Length;
      if (mustMatch)
      {
        return line.Substring(startIndex, nextIndex - startIndex - 1);
      }
      else
      {
        return line.Substring(startIndex);
      }
    }

    private void RaiseDelimiterEx(string Line)
    {
      this.ErrorLineNumber = this.LineNumber;
      this.ErrorLine = Line;
      throw new MalformedLineException("Line " + this.ErrorLineNumber.ToString() + " cannot be parsed using the current Delimiters.", this.ErrorLineNumber);
    }

    private void RaiseFieldWidthEx(string Line)
    {
      this.ErrorLineNumber = this.LineNumber;
      this.ErrorLine = Line;
      throw new MalformedLineException("Line " + this.ErrorLineNumber.ToString() + " cannot be parsed using the current FieldWidths.", this.ErrorLineNumber);
    }

    private string[] GetWidthFields()
    {
      if (this.fieldWidths == null || this.fieldWidths.Length == 0)
      {
        throw (new InvalidOperationException("Unable to read fixed width fields because FieldWidths is Nothing or empty."));
      }
      string[] result = new string[this.fieldWidths.Length - 1 + 1];
      int currentIndex = 0;
      string line;
      line = this.GetNextLine();
      if (line.Length < this.minFieldLength)
      {
        this.RaiseFieldWidthEx(line);
      }
      for (int i = 0; i <= result.Length - 1; i++)
      {
        if (this.TrimWhiteSpace)
        {
          result[i] = line.Substring(currentIndex, this.fieldWidths[i]).Trim();
        }
        else
        {
          result[i] = line.Substring(currentIndex, this.fieldWidths[i]);
        }
        currentIndex += this.fieldWidths[i];
      }
      return result;
    }

    private bool IsCommentLine(string Line)
    {
      if (this.CommentTokens == null)
      {
        return false;
      }
      foreach (string str in this.CommentTokens)
      {
        if (Line.StartsWith(str))
        {
          return true;
        }
      }
      return false;
    }

    private string GetNextRealLine()
    {
      string nextLine;
      do
      {
        nextLine = this.ReadLine();
      } while (!(nextLine == null || this.IsCommentLine(nextLine) == false));
      return nextLine;
    }

    private string GetNextLine()
    {
      return this.peekedLine.Count > 0 ? this.peekedLine.Dequeue() : this.GetNextRealLine();
    }
    
    #endregion
  }
}
