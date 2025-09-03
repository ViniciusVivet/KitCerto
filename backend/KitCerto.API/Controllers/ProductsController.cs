using KitCerto.Application.Products.Create;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace KitCerto.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[ApiExplorerSettings(GroupName = "products")] // << agrupa este controller no doc "products"
public class ProductsController : ControllerBase
{
    private readonly IMediator _mediator;
    public ProductsController(IMediator mediator) => _mediator = mediator;

    [HttpPost]
    [AllowAnonymous] // depois trocaremos por [Authorize]
    public async Task<ActionResult<string>> Create([FromBody] CreateProductCmd cmd, CancellationToken ct)
    {
        var id = await _mediator.Send(cmd, ct);
        return Ok(id);
    }
}
