using System.Text.Json.Serialization;

namespace NovaBill.Models;

public class Item
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal UnitPrice { get; set; }
    public int AvailableQuantity { get; set; }
    
    // Navigation property
    [JsonIgnore]
    public ICollection<InvoiceItem>? InvoiceItems { get; set; }
}