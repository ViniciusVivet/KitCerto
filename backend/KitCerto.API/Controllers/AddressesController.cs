using System.Linq;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using KitCerto.Application.Addresses.Queries.ListAddresses;
using KitCerto.Application.Addresses.Queries.GetAddressById;
using KitCerto.Application.Addresses.Create;
using KitCerto.Application.Addresses.Update;
using KitCerto.Application.Addresses.Delete;
using KitCerto.Application.Addresses.SetDefault;
using KitCerto.Domain.Addresses;

namespace KitCerto.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Produces("application/json")]
    [Authorize]
    public sealed class AddressesController : ControllerBase
    {
        private readonly IMediator _mediator;

        public AddressesController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        [ProducesResponseType(typeof(AddressDto[]), StatusCodes.Status200OK)]
        public async Task<IActionResult> List(CancellationToken ct)
        {
            var userId = GetUserId();
            if (string.IsNullOrWhiteSpace(userId)) return Unauthorized(new { message = "Usuário não autenticado." });
            var list = await _mediator.Send(new ListAddressesQuery(userId), ct);
            var dtos = list.Select(a => ToDto(a)).ToArray();
            return Ok(dtos);
        }

        [HttpGet("{id}")]
        [ProducesResponseType(typeof(AddressDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetById([FromRoute] string id, CancellationToken ct)
        {
            var userId = GetUserId();
            if (string.IsNullOrWhiteSpace(userId)) return Unauthorized(new { message = "Usuário não autenticado." });
            var address = await _mediator.Send(new GetAddressByIdQuery(userId, id), ct);
            if (address is null) return NotFound(new { message = "Endereço não encontrado." });
            return Ok(ToDto(address));
        }

        [HttpPost]
        [ProducesResponseType(typeof(CreateAddressResult), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Create([FromBody] CreateAddressRequest body, CancellationToken ct)
        {
            var userId = GetUserId();
            if (string.IsNullOrWhiteSpace(userId)) return Unauthorized(new { message = "Usuário não autenticado." });
            if (string.IsNullOrWhiteSpace(body?.Street) || string.IsNullOrWhiteSpace(body?.Number) || string.IsNullOrWhiteSpace(body?.City) || string.IsNullOrWhiteSpace(body?.State) || string.IsNullOrWhiteSpace(body?.ZipCode))
                return BadRequest(new { message = "Rua, número, cidade, estado e CEP são obrigatórios." });
            var id = await _mediator.Send(new CreateAddressCmd(userId, body.Label, body.Street, body.Number, body.Complement, body.Neighborhood ?? "", body.City, body.State, body.ZipCode, body.IsDefault), ct);
            return CreatedAtAction(nameof(GetById), new { id }, new CreateAddressResult { Id = id });
        }

        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Update([FromRoute] string id, [FromBody] UpdateAddressRequest body, CancellationToken ct)
        {
            var userId = GetUserId();
            if (string.IsNullOrWhiteSpace(userId)) return Unauthorized(new { message = "Usuário não autenticado." });
            if (string.IsNullOrWhiteSpace(body?.Street) || string.IsNullOrWhiteSpace(body?.Number) || string.IsNullOrWhiteSpace(body?.City) || string.IsNullOrWhiteSpace(body?.State) || string.IsNullOrWhiteSpace(body?.ZipCode))
                return BadRequest(new { message = "Rua, número, cidade, estado e CEP são obrigatórios." });
            await _mediator.Send(new UpdateAddressCmd(userId, id, body.Label, body.Street, body.Number, body.Complement, body.Neighborhood ?? "", body.City, body.State, body.ZipCode, body.IsDefault), ct);
            return NoContent();
        }

        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Delete([FromRoute] string id, CancellationToken ct)
        {
            var userId = GetUserId();
            if (string.IsNullOrWhiteSpace(userId)) return Unauthorized(new { message = "Usuário não autenticado." });
            await _mediator.Send(new DeleteAddressCmd(userId, id), ct);
            return NoContent();
        }

        [HttpPost("{id}/default")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> SetDefault([FromRoute] string id, CancellationToken ct)
        {
            var userId = GetUserId();
            if (string.IsNullOrWhiteSpace(userId)) return Unauthorized(new { message = "Usuário não autenticado." });
            var address = await _mediator.Send(new GetAddressByIdQuery(userId, id), ct);
            if (address is null) return NotFound(new { message = "Endereço não encontrado." });
            await _mediator.Send(new SetDefaultAddressCmd(userId, id), ct);
            return NoContent();
        }

        private static string? GetUserId(ClaimsPrincipal? user)
        {
            return user?.FindFirst("preferred_username")?.Value
                ?? user?.FindFirst("sub")?.Value
                ?? user?.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? user?.Identity?.Name;
        }

        private string? GetUserId() => GetUserId(User);

        private static AddressDto ToDto(Address a) => new()
        {
            Id = a.Id,
            Label = a.Label,
            Street = a.Street,
            Number = a.Number,
            Complement = a.Complement,
            Neighborhood = a.Neighborhood,
            City = a.City,
            State = a.State,
            ZipCode = a.ZipCode,
            IsDefault = a.IsDefault,
            CreatedAtUtc = a.CreatedAtUtc
        };
    }

    public sealed class AddressDto
    {
        public string Id { get; set; } = string.Empty;
        public string? Label { get; set; }
        public string Street { get; set; } = string.Empty;
        public string Number { get; set; } = string.Empty;
        public string? Complement { get; set; }
        public string Neighborhood { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string State { get; set; } = string.Empty;
        public string ZipCode { get; set; } = string.Empty;
        public bool IsDefault { get; set; }
        public System.DateTime CreatedAtUtc { get; set; }
    }

    public sealed class CreateAddressRequest
    {
        public string? Label { get; set; }
        public string Street { get; set; } = string.Empty;
        public string Number { get; set; } = string.Empty;
        public string? Complement { get; set; }
        public string? Neighborhood { get; set; }
        public string City { get; set; } = string.Empty;
        public string State { get; set; } = string.Empty;
        public string ZipCode { get; set; } = string.Empty;
        public bool IsDefault { get; set; }
    }

    public sealed class UpdateAddressRequest
    {
        public string? Label { get; set; }
        public string Street { get; set; } = string.Empty;
        public string Number { get; set; } = string.Empty;
        public string? Complement { get; set; }
        public string? Neighborhood { get; set; }
        public string City { get; set; } = string.Empty;
        public string State { get; set; } = string.Empty;
        public string ZipCode { get; set; } = string.Empty;
        public bool IsDefault { get; set; }
    }

    public sealed class CreateAddressResult
    {
        public string Id { get; set; } = string.Empty;
    }
}
