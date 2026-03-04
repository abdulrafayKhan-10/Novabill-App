using NovaBill.Models;
using Microsoft.EntityFrameworkCore;

namespace NovaBill.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
        
    }
    
    public DbSet<Item> Items { get; set; }
    public DbSet<Invoice> Invoices { get; set; }
    public DbSet<InvoiceItem> InvoiceItems { get; set; }
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        //while migration table and column names to conver to lower case.
        foreach (var entity in modelBuilder.Model.GetEntityTypes())
        {
            // lower case table name
            entity.SetTableName(entity.GetTableName()!.ToLower());

            // lower case all column
            foreach (var property in entity.GetProperties())
            {
                property.SetColumnName(property.Name.ToLower());
            }
        }

        base.OnModelCreating(modelBuilder);
        
        modelBuilder.Entity<InvoiceItem>()
            .HasOne(x => x.Invoice)
            .WithMany(y => y.InvoiceItems)
            .HasForeignKey(x => x.InvoiceId);

        modelBuilder.Entity<InvoiceItem>()
            .HasOne(x => x.Item)
            .WithMany(y => y.InvoiceItems)
            .HasForeignKey(x => x.ItemId);
    }
}