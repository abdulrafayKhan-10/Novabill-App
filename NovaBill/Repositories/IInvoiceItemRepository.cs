using NovaBill.Models;

namespace NovaBill.Repositories;

public interface IInvoiceItemRepository : IRepository<InvoiceItem>
{
    //Task CreateAsync(InvoiceItem item);
    Task<IEnumerable<InvoiceItem>> GetByInvoiceIdAsync(int invoiceId);
    
    Task Remove(InvoiceItem item);
}