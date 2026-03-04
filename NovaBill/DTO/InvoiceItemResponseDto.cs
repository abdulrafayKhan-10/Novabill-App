using NovaBill.Models;

namespace NovaBill.DTO;

public class InvoiceItemResponseDto
{
    public int id { get; set; }
    public int invoiceId { get; set; }
    public int itemId { get; set; }
    public int quantity { get; set; }
    public decimal unitPrice { get; set; }
    public decimal amount { get; set; }
    
    public static InvoiceItemResponseDto Create(InvoiceItem obj)
    {
        if (obj == null)
        {
            return new InvoiceItemResponseDto();
        }
        
        var invoiceItemResponse = new InvoiceItemResponseDto()
        {
            id = obj.Id,
            invoiceId = obj.InvoiceId,
            itemId = obj.ItemId,
            quantity = obj.Quantity,    
            unitPrice = obj.UnitPrice,
            amount = obj.Amount,
        };
        
        return invoiceItemResponse;
    }
}