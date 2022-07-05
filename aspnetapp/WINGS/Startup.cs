using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.SpaServices.ReactDevelopmentServer;
using Microsoft.EntityFrameworkCore;
using WINGS.Data;
using WINGS.Models;
using WINGS.Services;
using WINGS.Services.TmtcIf;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace WINGS
{
  public class Startup
  {
    public Startup(IConfiguration configuration)
    {
      Configuration = configuration;
    }

    public IConfiguration Configuration { get; }

    // This method gets called by the runtime. Use this method to add services to the container.
    public void ConfigureServices(IServiceCollection services)
    {
      services.AddDbContext<ApplicationDbContext>(options =>
        options.UseMySql(
          Configuration.GetConnectionString("DefaultConnection"),ServerVersion.Parse("8.0")));

      services.AddControllersWithViews()
        .AddJsonOptions(options => options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()));
      services.AddRazorPages();

      services.AddGrpc();

      services.AddDatabaseDeveloperPageExceptionFilter();

      // Services
      services.AddScoped<IOperationService, OperationService>();
      services.AddScoped<ICommandService, CommandService>();
      services.AddScoped<ITelemetryService, TelemetryService>();
      services.AddScoped<ILayoutService, LayoutService>();
      services.AddScoped<ITlmCmdFileConfigBuilder, TlmCmdFileConfigBuilder>();

      services.AddSingleton<ITmtcHandlerFactory, TmtcHandlerFactory>();
      services.AddSingleton<ITmPacketManager, TmPacketManager>();
      services.AddSingleton<ITcPacketManager, TcPacketManager>();

      // TmtcIf
      services.AddSingleton<ITcPacketQueue, TcPacketQueue>();
      services.AddTransient<TmtcPacketService>();
      
      // Repositories
      services.AddScoped<ITelemetryLogRepository, TelemetryLogRepository>();
      services.AddScoped<IDbRepository<Command>, CommandDbRepository>();
      services.AddScoped<IDbRepository<TelemetryPacket>, TelemetryDbRepository>();
      services.AddScoped<ILayoutRepository<Layout>, LayoutRepository>();
      services.AddScoped<ICommandFileRepository, CommandFileRepository>();
      services.AddScoped<ICommandFileLogRepository, CommandFileLogRepository>();

      ConfigureUserDefinedServices(services);
      
      // In production, the React files will be served from this directory
      services.AddSpaStaticFiles(configuration =>
      {
        configuration.RootPath = "ClientApp/build";
      });
    }

    private void ConfigureUserDefinedServices(IServiceCollection services)
    {
      // MOBC
      services.AddTransient<MobcTmPacketAnalyzer>();
      services.AddTransient<MobcTcPacketGenerator>();

      //ISSL_COMMON
      services.AddTransient<IsslCommonTmPacketAnalyzer>();
      services.AddTransient<IsslCommonTcPacketGenerator>();
    }

    // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
    public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
    {
      if (env.IsDevelopment())
      {
        app.UseDeveloperExceptionPage();
        app.UseMigrationsEndPoint();
      }
      else
      {
        app.UseExceptionHandler("/Error");
        app.UseHsts();
      }
      
      app.UseHttpsRedirection();
      app.UseStaticFiles();
      app.UseSpaStaticFiles();

      app.UseRouting();

      app.UseEndpoints(endpoints =>
      {
        endpoints.MapGrpcService<TmtcPacketService>();
        endpoints.MapControllerRoute(
          name: "default",
          pattern: "{controller}/{action=Index}/{id?}");
        endpoints.MapRazorPages();
      });

      app.UseSpa(spa =>
      {
        spa.Options.SourcePath = "ClientApp";

        if (env.IsDevelopment())
        {
          spa.UseReactDevelopmentServer(npmScript: "start");
        }
      });
    }
  }
}
