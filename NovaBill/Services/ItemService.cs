using NovaBill.Data;
using NovaBill.Models;
using Microsoft.EntityFrameworkCore;

namespace NovaBill.Services;

public class ItemService : IItemService
{
    private readonly AppDbContext _context;

    public ItemService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Item>> GetListAsync()
    {
        return await _context.Items.ToListAsync();
    }

    public async Task<Item?> GetByIdAsync(int id)
    {
        return await _context.Items.FindAsync(id);
    }

    public async Task<Item> CreateAsync(Item item)
    {
        _context.Items.Add(item);
        await _context.SaveChangesAsync();
        return item;
    }

    public async Task<Item?> UpdateAsync(int id, Item item)
    {
        var existingItem = await _context.Items.FindAsync(id);
        if (existingItem == null) return null;

        existingItem.Name = item.Name;
        existingItem.Description = item.Description;
        existingItem.UnitPrice = item.UnitPrice;
        existingItem.AvailableQuantity = item.AvailableQuantity;

        await _context.SaveChangesAsync();
        return existingItem;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var existingItem = await _context.Items.FindAsync(id);
        if (existingItem == null) return false;

        _context.Items.Remove(existingItem);
        await _context.SaveChangesAsync();
        return true;
    }
}