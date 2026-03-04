using NovaBill.Data;
using NovaBill.Models;
using Microsoft.EntityFrameworkCore;

namespace NovaBill.Repositories;

public class InvoiceRepository : IInvoiceRepository
{
    private readonly AppDbContext _context;
    public InvoiceRepository(AppDbContext context) => _context = context;

    public async Task<int> CreateAsync(Invoice invoice)
    {
        _context.Invoices.Add(invoice);
        await _context.SaveChangesAsync();
        
        //invoiceNumber - need to change this to generate in code and save directly
        invoice.InvoiceNumber = invoice.Id.ToString("D6");
        await _context.SaveChangesAsync();
        
        return invoice.Id;
    }
    
    public async Task<IEnumerable<Invoice>> GetAllAsync()
    {
        return await _context.Invoices.AsNoTracking().ToListAsync();
    }
    
    public async Task<Invoice?> GetByIdAsync(int id)
    {
        return await _context.Invoices
            .AsNoTracking()
            .FirstOrDefaultAsync(i => i.Id == id);
    }
    
    public async Task UpdateAsync(Invoice invoice)
    {
        // Attach root entity if not tracked
        _context.Invoices.Update(invoice);

        // Save all changes
        await _context.SaveChangesAsync();
    }
    
    public async Task DeleteAsync(Invoice invoice)
    {
        _context.InvoiceItems.RemoveRange(invoice.InvoiceItems); // if not using cascade delete
        _context.Invoices.Remove(invoice);
        await _context.SaveChangesAsync();
    }
}