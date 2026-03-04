using NovaBill.Models;

namespace NovaBill.DTO;

public class InvoiceItemRequestDto
{
    public int? id { get; set; }
    public int? invoiceId { get; set; }
    public int itemId { get; set; }
    public int quantity { get; set; }
    public decimal unitPrice { get; set; }
    public decimal amount { get; set; }
    
    public static InvoiceItem Create(InvoiceItemRequestDto request)
    {
        if (request == null)
            return new InvoiceItem();
        
        var invoiceItem = new InvoiceItem
        {
            Id = request.id ?? 0,
            ItemId = request.itemId,
            Quantity = request.quantity,
            UnitPrice = request.unitPrice,
            Amount = request.amount    //need to calculate here, will change later
        };
        
        return invoiceItem;
    }
}