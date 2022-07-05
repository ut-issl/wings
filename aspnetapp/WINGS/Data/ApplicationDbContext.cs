using WINGS.Models;
using Microsoft.EntityFrameworkCore;

namespace WINGS.Data
{
  public class ApplicationDbContext : DbContext
  {
    public DbSet<Operation> Operations { get; set; }
    public DbSet<Component> Components { get; set; }
    public DbSet<CommandLog> CommandLogs { get; set; }

    public ApplicationDbContext(
      DbContextOptions options
      ) : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
      modelBuilder.Entity<Operation>(e =>
      {
        e.Property(o => o.FileLocation)
          .HasConversion<string>();
        e.HasOne(o => o.Component)
          .WithMany()
          .OnDelete(DeleteBehavior.Restrict);
      });
      
      modelBuilder.Entity<CommandLog>()
        .HasKey(c => new { c.OperationId, c.SentAt });

      base.OnModelCreating(modelBuilder);
    }
  }
}
