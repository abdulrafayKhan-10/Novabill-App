using NovaBill.Services;
using Microsoft.AspNetCore.Mvc;

namespace WebApiDemo.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ItemController : ControllerBase
    {
        private readonly IItemService _itemService;

        public ItemController(IItemService itemService)
        {
            _itemService = itemService;
        }

        // GET: api/item
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var items = await _itemService.GetListAsync();
            return Ok(items);
        }

        // GET: api/item/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var item = await _itemService.GetByIdAsync(id);
            if (item == null)
                return NotFound();

            return Ok(item);
        }

        // POST: api/item
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] NovaBill.Models.Item item)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var createdItem = await _itemService.CreateAsync(item);
            return CreatedAtAction(nameof(GetById), new { id = createdItem.Id }, createdItem);
        }

        // PUT: api/item/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] NovaBill.Models.Item item)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var updatedItem = await _itemService.UpdateAsync(id, item);
            if (updatedItem == null)
                return NotFound();

            return Ok(updatedItem);
        }

        // DELETE: api/item/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var success = await _itemService.DeleteAsync(id);
            if (!success)
                return NotFound();

            return NoContent();
        }
    }
}