using MediatR;

namespace KitCerto.Application.Addresses.Delete;

public sealed record DeleteAddressCmd(string UserId, string AddressId) : IRequest;
