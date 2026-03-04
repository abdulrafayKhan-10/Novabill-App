namespace NovaBill.Models;

public class Invoice
{
    public int Id { get; set; }
    public string InvoiceNumber { get; set; }
    public DateTime InvoiceDate { get; set; }
    public DateTime DueDate { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal PaidAmount { get; set; }
    
    // Navigation property
    public ICollection<InvoiceItem> InvoiceItems { get; set; }
}