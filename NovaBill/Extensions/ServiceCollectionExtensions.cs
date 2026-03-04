using NovaBill.Repositories;
using NovaBill.Services;

namespace NovaBill.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        // Register your services and repositories here
        services.AddScoped<IInvoiceService, InvoiceService>();
        services.AddScoped<IInvoiceRepository, InvoiceRepository>();
        services.AddScoped<IInvoiceItemRepository, InvoiceItemRepository>();
        services.AddScoped<IItemService, ItemService>();

        // Add more as you build features
        return services;
    }
}