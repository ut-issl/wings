using System;

namespace WINGS.Models
{
  public class ResourceReadException : Exception
  {
    public ResourceReadException()
    {
    }
    public ResourceReadException(string message)
      : base(message)
    {
    }
    public ResourceReadException(string message, Exception inner)
      : base(message, inner)
    {
    }
  }

  public class ResourceCreateException : Exception
  {
    public ResourceCreateException()
    {
    }
    public ResourceCreateException(string message)
      : base(message)
    {
    }
    public ResourceCreateException(string message, Exception inner)
      : base(message, inner)
    {
    }
  }

  public class ResourceUpdateException : Exception
  {
    public ResourceUpdateException()
    {
    }
    public ResourceUpdateException(string message)
      : base(message)
    {
    }
    public ResourceUpdateException(string message, Exception inner)
      : base(message, inner)
    {
    }
  }

  public class ResourceDeleteException : Exception
  {
    public ResourceDeleteException()
    {
    }
    public ResourceDeleteException(string message)
      : base(message)
    {
    }
    public ResourceDeleteException(string message, Exception inner)
      : base(message, inner)
    {
    }
  }

  public class ResourceNotFoundException : Exception
  {
    public ResourceNotFoundException()
    {
    }
    public ResourceNotFoundException(string message)
      : base(message)
    {
    }
    public ResourceNotFoundException(string message, Exception inner)
      : base(message, inner)
    {
    }
  }

  public class IllegalContextException : Exception
  {
    public IllegalContextException()
    {
    }
    public IllegalContextException(string message)
      : base(message)
    {
    }
    public IllegalContextException(string message, Exception inner)
      : base(message, inner)
    {
    }
  }
}
