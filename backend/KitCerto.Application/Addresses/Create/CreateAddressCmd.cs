using MediatR;

namespace KitCerto.Application.Addresses.Create;

public sealed record CreateAddressCmd(
    string UserId,
    string? Label,
    string Street,
    string Number,
    string? Complement,
    string Neighborhood,
    string City,
    string State,
    string ZipCode,
    bool IsDefault
) : IRequest<string>;
