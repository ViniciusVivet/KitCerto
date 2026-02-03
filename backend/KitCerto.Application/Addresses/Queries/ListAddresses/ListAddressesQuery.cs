using MediatR;
using KitCerto.Domain.Addresses;

namespace KitCerto.Application.Addresses.Queries.ListAddresses;

public sealed record ListAddressesQuery(string UserId) : IRequest<IReadOnlyList<Address>>;
