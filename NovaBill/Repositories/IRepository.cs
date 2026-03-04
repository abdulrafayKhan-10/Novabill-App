namespace NovaBill.Repositories;

public interface IRepository<T> where T : class
{
    Task<int> CreateAsync(T entity);
    Task<IEnumerable<T>> GetAllAsync();
    Task<T> GetByIdAsync(int id);
    // Task<int> UpdateAsync(T entity);
    // Task<bool> DeleteAsync(int id);
}