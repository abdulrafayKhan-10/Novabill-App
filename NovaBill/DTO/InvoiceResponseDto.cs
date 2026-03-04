using NovaBill.Models;

namespace NovaBill.DTO;

public class InvoiceResponseDto
{
    public int id { get; set; }
    public string invoiceNumber { get; set; }
    public DateTime invoiceDate { get; set; }
    public DateTime dueDate { get; set; }
    public decimal totalAmount { get; set; }
    public decimal paidAmount { get; set; }
    
    public List<InvoiceItemResponseDto> items { get; set; }
    
    public static InvoiceResponseDto Create(Invoice obj)
    {
        if (obj == null)
            return new InvoiceResponseDto();
        
        var invoiceResponse = new InvoiceResponseDto()
        {
            id = obj.Id,
            invoiceNumber = obj.InvoiceNumber,
            invoiceDate = obj.InvoiceDate,
            dueDate = obj.DueDate,    
            totalAmount = obj.TotalAmount,
            paidAmount = obj.PaidAmount,
        };

        if (obj.InvoiceItems != null && obj.InvoiceItems.Any())
        {
            invoiceResponse.items = new List<InvoiceItemResponseDto>();

            foreach (var objInvoiceItem in obj.InvoiceItems)
            {
                invoiceResponse.items.Add(InvoiceItemResponseDto.Create(objInvoiceItem));
            }
        }
        
        return invoiceResponse;
    }
}