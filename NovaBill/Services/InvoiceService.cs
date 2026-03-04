using NovaBill.DTO;
using NovaBill.Models;
using NovaBill.Repositories;

namespace NovaBill.Services;

public class InvoiceService : IInvoiceService
{
    private readonly IInvoiceRepository _invoiceRepo;
    private readonly IInvoiceItemRepository _itemRepo;
    
    public InvoiceService(IInvoiceRepository invoiceRepo, IInvoiceItemRepository itemRepo)
    {
        _invoiceRepo = invoiceRepo;
        _itemRepo = itemRepo;
    }

    //create invoice with invoiceitems
    public async Task<int> CreateAsync(InvoiceRequestDto dto)
    {
        //create invoice
        var invoice = InvoiceRequestDto.Create(dto);
        int invoiceId = await _invoiceRepo.CreateAsync(invoice);

        //create invoice items
        foreach (var item in dto.items)
        {
            var invoiceItem = InvoiceItemRequestDto.Create(item);
            invoiceItem.InvoiceId = invoiceId;
            
            await _itemRepo.CreateAsync(invoiceItem);
            
            //do this change later, after the each invoice item create need to decrese quantity of item
        }

        return invoiceId;

    }
    
    public async Task<int> UpdateAsync(InvoiceRequestDto dto)
    {
        var invoice = await _invoiceRepo.GetByIdAsync(dto.id.Value);
        if (invoice == null)
            throw new Exception("Invoice not found");

        invoice.InvoiceNumber = dto.invoiceNumber;
        invoice.InvoiceDate = dto.invoiceDate;
        invoice.DueDate = dto.dueDate;
        invoice.PaidAmount = dto.paidAmount;
        invoice.TotalAmount = dto.totalAmount;

        invoice.InvoiceItems = (await _itemRepo.GetByInvoiceIdAsync(invoice.Id)).ToList();
        // Updating InvoiceItems (add/update/remove)
        var existingItems = invoice.InvoiceItems.ToList();

        foreach (var itemDto in dto.items)
        {
            var existingItem = existingItems.FirstOrDefault(x => x.Id == itemDto.id);
            if (existingItem != null)
            {
                // Update existing
                existingItem.ItemId = itemDto.itemId;
                existingItem.Quantity = itemDto.quantity;
                existingItem.UnitPrice = itemDto.unitPrice;
                existingItem.Amount = itemDto.amount;
            }
            else
            {
                // New item
                invoice.InvoiceItems.Add(new InvoiceItem
                {
                    ItemId = itemDto.itemId,
                    Quantity = itemDto.quantity,
                    UnitPrice = itemDto.unitPrice,
                    Amount = itemDto.amount,
                });
            }
        }

        // Remove items not in dto
        var dtoItemIds = dto.items.Select(x => x.id.Value).ToHashSet();
        var toRemove = existingItems.Where(x => !dtoItemIds.Contains(x.Id)).ToList();
        foreach (var removedItem in toRemove)
        {
            invoice.InvoiceItems.Remove(removedItem);
            _itemRepo.Remove(removedItem);
        }

        await _invoiceRepo.UpdateAsync(invoice);
        return invoice.Id;

    }
    public async Task<IEnumerable<InvoiceResponseDto>> GetListAsync(int page = 1, int pageSize = 10, bool invoiceItems = false)
    {
        var invoices = await _invoiceRepo.GetAllAsync();

        if (invoiceItems)
        {
            foreach (var invoice in invoices)
            {
                invoice.InvoiceItems = (await _itemRepo.GetByInvoiceIdAsync(invoice.Id)).ToList();
            }
        }

        var result = invoices.Select(i => InvoiceResponseDto.Create(i));
        return result;

    }

    public async Task<InvoiceResponseDto> GetByIdAsync(int id, bool includeItems)
    {
        var invoice = await _invoiceRepo.GetByIdAsync(id);

        if (invoice == null)
            return null;

        if (includeItems)
        {
            invoice.InvoiceItems = (await _itemRepo.GetByInvoiceIdAsync(invoice.Id)).ToList();
        }

        var result = InvoiceResponseDto.Create(invoice);
        return result;
    }
    
    public async Task DeleteAsync(int id)
    {
        var invoice = await _invoiceRepo.GetByIdAsync(id);
        if (invoice == null)
            throw new Exception("Invoice not found");
        
        invoice.InvoiceItems = (await _itemRepo.GetByInvoiceIdAsync(invoice.Id)).ToList();

        await _invoiceRepo.DeleteAsync(invoice);
    }
}