using NovaBill.DTO;
using NovaBill.Models;

namespace NovaBill.Repositories;

public interface IInvoiceRepository : IRepository<Invoice>
{
    //Task<int> CreateAsync(Invoice invoice);
    Task UpdateAsync(Invoice invoice);
    Task DeleteAsync(Invoice invoice);
}