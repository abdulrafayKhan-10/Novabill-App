using NovaBill.Models;

namespace NovaBill.DTO;

public class InvoiceRequestDto
{
    public int? id { get; set; }
    public string invoiceNumber { get; set; }
    public DateTime invoiceDate { get; set; }
    public DateTime dueDate { get; set; }
    public decimal totalAmount { get; set; }
    public decimal paidAmount { get; set; }
    
    public List<InvoiceItemRequestDto> items { get; set; }

    public static Invoice Create(InvoiceRequestDto request)
    {
        if (request == null)
            return new Invoice();
        
        var invoice = new Invoice()
        {
            Id = request.id ?? 0,
            InvoiceNumber = request.invoiceNumber == "" ? "000000" : request.invoiceNumber, //need to fix this as need to generate in code and assign before save
            InvoiceDate = request.invoiceDate,
            DueDate = request.dueDate,
            PaidAmount = request.paidAmount,
            TotalAmount = request.totalAmount   //as of now using received total amount, but later change to calculate here from received items as total might be received wrong if api call is not from fe and manual call...
        };
        
        return invoice;
    }
}