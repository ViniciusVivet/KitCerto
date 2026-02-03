using MediatR;

namespace KitCerto.Application.Addresses.Update;

public sealed record UpdateAddressCmd(
    string UserId,
    string AddressId,
    string? Label,
    string Street,
    string Number,
    string? Complement,
    string Neighborhood,
    string City,
    string State,
    string ZipCode,
    bool IsDefault
) : IRequest;
