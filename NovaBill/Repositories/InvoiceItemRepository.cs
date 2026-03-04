using NovaBill.Data;
using NovaBill.Models;
using Microsoft.EntityFrameworkCore;

namespace NovaBill.Repositories;

public class InvoiceItemRepository : IInvoiceItemRepository
{
    private readonly AppDbContext _context;
    public InvoiceItemRepository(AppDbContext context) => _context = context;

    public async Task<int> CreateAsync(InvoiceItem invoiceItem)
    {
        _context.InvoiceItems.Add(invoiceItem);
        await _context.SaveChangesAsync();
        return invoiceItem.Id;
    }
    
    public async Task<IEnumerable<InvoiceItem>> GetAllAsync()
    {
        return await _context.InvoiceItems.AsNoTracking().ToListAsync();
    }
    
    public async Task<IEnumerable<InvoiceItem>> GetByInvoiceIdAsync(int invoiceId)
    {
        return await _context.InvoiceItems
            .Where(i => i.InvoiceId == invoiceId)
            .AsNoTracking()
            .ToListAsync();
    }
    
    public async Task<InvoiceItem?> GetByIdAsync(int id)
    {
        return await _context.InvoiceItems
            .AsNoTracking()
            .FirstOrDefaultAsync(i => i.Id == id);
    }
    
    public  async Task Remove(InvoiceItem item)
    {
        _context.InvoiceItems.Remove(item);
        
        // Save changes
        await _context.SaveChangesAsync();
    }
}