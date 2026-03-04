using NovaBill.Models;

namespace NovaBill.Services;

public interface IItemService
{
    Task<IEnumerable<Item>> GetListAsync();
    Task<Item?> GetByIdAsync(int id);
    Task<Item> CreateAsync(Item item);
    Task<Item?> UpdateAsync(int id, Item item);
    Task<bool> DeleteAsync(int id);
}