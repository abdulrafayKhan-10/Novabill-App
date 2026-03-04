using NovaBill.DTO;
using NovaBill.Models;
using NovaBill.Services;
using Microsoft.AspNetCore.Mvc;

namespace WebApiDemo.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class InvoiceController : ControllerBase
    {
        private readonly IInvoiceService _invoiceService;

        public InvoiceController(IInvoiceService invoiceService)
        {
            _invoiceService = invoiceService;
        }

        // POST: api/invoice
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] InvoiceRequestDto invoice)
        {
            if (invoice == null || invoice.items == null || !invoice.items.Any())
                return BadRequest(new { error = new { message = "Invoice and InvoiceItems are required", statusCode = 400 } });

            var createdInvoiceId = await _invoiceService.CreateAsync(invoice);

            return Ok(new { id = createdInvoiceId });
        }

        // Put: api/invoice/id
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] InvoiceRequestDto invoice)
        {
            if (invoice == null || invoice.items == null || !invoice.items.Any())
                return BadRequest(new { error = new { message = "Invoice and InvoiceItems are required", statusCode = 400 } });

            if (id != invoice.id)
                return BadRequest(new { error = new { message = "Invoice ID mismatch", statusCode = 400 } });

            try
            {
                var updatedInvoiceId = await _invoiceService.UpdateAsync(invoice);
                return Ok(new { id = updatedInvoiceId });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = new { message = ex.Message, statusCode = 400 } });
            }
        }

        // GET: api/invoice?includeItems=true
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] bool invoiceItems = false)
        {
            var invoices = await _invoiceService.GetListAsync(invoiceItems: invoiceItems);
            return Ok(invoices);
        }

        // GET: api/invoice/5?includeItems=true
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id, [FromQuery] bool invoiceItems = false)
        {
            var invoice = await _invoiceService.GetByIdAsync(id, invoiceItems);
            if (invoice == null)
                return NotFound();

            return Ok(invoice);
        }

        // DELETE: api/invoice/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteInvoice(int id)
        {
            try
            {
                await _invoiceService.DeleteAsync(id);
                return NoContent(); // 204
            }
            catch (Exception ex)
            {
                return NotFound(new { message = ex.Message });

            }
        }
    }
}