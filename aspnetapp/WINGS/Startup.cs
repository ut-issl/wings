using System.Text.Json.Serialization;
using System;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
// SPA統合のusingを削除
// using Microsoft.AspNetCore.SpaServices.ReactDevelopmentServer;
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
          Configuration.GetConnectionString("DefaultConnection"),
          ServerVersion.Parse("8.0"),
          mysqlOptions => mysqlOptions.EnableRetryOnFailure(
            maxRetryCount: 5,
            maxRetryDelay: TimeSpan.FromSeconds(30),
            errorNumbersToAdd: null)));

      services.AddControllers()
        .AddJsonOptions(options => options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()));
      // RazorPagesは不要（SPA分離のため）
      // services.AddRazorPages();

      services.AddCors(options =>
      {
        options.AddPolicy("AllowFrontend", policy =>
        {
          policy.WithOrigins("http://localhost:3000", "http://frontend:3000")
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials();
        });
      });

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
    }

    private void ConfigureUserDefinedServices(IServiceCollection services)
    {
      // MOBC
      services.AddTransient<MobcTmPacketAnalyzer>();
      services.AddTransient<MobcTcPacketGenerator>();

      //ISSL_COMMON
      services.AddTransient<IsslCommonTmPacketAnalyzer>();
      services.AddTransient<IsslCommonTcPacketGenerator>();

      services.AddTransient<SecondaryObcTmPacketAnalyzer>();
      services.AddTransient<SecondaryObcTcPacketGenerator>();
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
        app.UseExceptionHandler("/api/error");
        app.UseHsts();
      }
      
   
      // If you are configuring HTTPS redirection, ensure that your environment is set up correctly.
      // app.UseHttpsRedirection();
      
      app.UseCors("AllowFrontend");

      app.UseRouting();

      app.UseEndpoints(endpoints =>
      {
        endpoints.MapGrpcService<TmtcPacketService>();
        endpoints.MapControllers();
      });
    }
  }
}
