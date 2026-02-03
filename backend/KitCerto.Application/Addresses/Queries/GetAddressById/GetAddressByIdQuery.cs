using MediatR;
using KitCerto.Domain.Addresses;

namespace KitCerto.Application.Addresses.Queries.GetAddressById;

public sealed record GetAddressByIdQuery(string UserId, string AddressId) : IRequest<Address?>;
