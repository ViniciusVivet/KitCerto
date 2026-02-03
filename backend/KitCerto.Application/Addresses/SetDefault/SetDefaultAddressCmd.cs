using MediatR;

namespace KitCerto.Application.Addresses.SetDefault;

public sealed record SetDefaultAddressCmd(string UserId, string AddressId) : IRequest;
