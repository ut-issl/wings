using System.Runtime.InteropServices;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.AspNetCore.Server.Kestrel.Core;

namespace WINGS
{
  public class Program
  {
    public static void Main(string[] args)
    {
      var host = CreateHostBuilder(args).Build();

      using (var scope = host.Services.CreateScope())
      {
        var serviceProvider = scope.ServiceProvider;
      }
      host.Run();
    }

    public static IHostBuilder CreateHostBuilder(string[] args)
    {
      return Host.CreateDefaultBuilder(args)
        .ConfigureWebHostDefaults(webBuilder =>
        {
          // For development by MacOS
          if (RuntimeInformation.IsOSPlatform(OSPlatform.OSX))
          {
            webBuilder.ConfigureKestrel(options =>
            {
              // Setup a Http/1 endpoint without TLS
              options.ListenLocalhost(5000, listenOptions => 
              {
                listenOptions.Protocols = HttpProtocols.Http1;
              });
              // Setup a HTTP/2 endpoint without TLS for gRPC
              options.ListenLocalhost(6000, listenOptions =>
              {
                listenOptions.Protocols = HttpProtocols.Http2;
              });
            });
          }
          webBuilder.UseStartup<Startup>()
            .UseDefaultServiceProvider(options => 
              options.ValidateScopes = false);
        });
    }
  }
}
