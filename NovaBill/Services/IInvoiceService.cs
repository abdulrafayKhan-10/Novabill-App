using NovaBill.DTO;

namespace NovaBill.Services;

public interface IInvoiceService
{
    Task<int> CreateAsync(InvoiceRequestDto dto);
    Task<int> UpdateAsync(InvoiceRequestDto dto);
    Task<IEnumerable<InvoiceResponseDto>> GetListAsync(int page = 1, int pageSize = 10, bool invoiceItems = false);
    Task<InvoiceResponseDto> GetByIdAsync(int id, bool includeItems);
    Task DeleteAsync(int id);
}