using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WINGS.Data;
using WINGS.Models;
using static Microsoft.AspNetCore.Http.StatusCodes;

namespace WINGS.Controllers
{
  [ApiController]
  [Route("api/components")]
  public class ComponentController : ControllerBase
  {
    private readonly ApplicationDbContext _dbContext;

    public ComponentController(ApplicationDbContext dbContext)
    {
      _dbContext = dbContext;
    }

    // GET: api/components
    [HttpGet]
    public async Task<IActionResult> Get()
    {
      var components = await _dbContext.Components.ToListAsync();
      return StatusCode(Status200OK, new { data = components });
    }

    // POST: api/components
    [HttpPost]
    public async Task<IActionResult> Create(Component component)
    {
      try
      {
        component.Id = Guid.NewGuid().ToString("d");
        _dbContext.Components.Add(component);
        await _dbContext.SaveChangesAsync();
        return StatusCode(Status201Created);
      }
      catch
      {
        return StatusCode(Status500InternalServerError, new { message = "Cannot create new entity" });
      }
    }

    // PUT: api/components/5
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(string id, Component component)
    {
      if (id != component.Id)
      {
        return StatusCode(Status400BadRequest, new { message = "The id doesn't match" });
      }

      try
      {
        _dbContext.Entry(component).State = EntityState.Modified;
        await _dbContext.SaveChangesAsync();
        return StatusCode(Status200OK);
      }
      catch
      {
        if (!ComponentExists(id))
        {
          return StatusCode(Status404NotFound, new { message = "The component is not found" });
        }
        return StatusCode(Status500InternalServerError, new { message = "Cannot update entity" });
      }
    }

    // DELETE: api/components/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
      try
      {
        var component = await _dbContext.Components.FindAsync(id);
        _dbContext.Components.Remove(component);
        await _dbContext.SaveChangesAsync();
        return StatusCode(Status204NoContent);
      }
      catch
      {
        if (!ComponentExists(id))
        {
          return StatusCode(Status404NotFound, new { message = "The component is not found" });
        }
        return StatusCode(Status500InternalServerError, new { message = "Cannot delete entity" });
      }
    }

    private bool ComponentExists(string id) =>
      _dbContext.Components.Any(o => o.Id == id);
  }
}
