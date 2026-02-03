using System.Collections.Generic;
using MediatR;

namespace KitCerto.Application.Support.Queries.ListTicketsForSeller;

public sealed record ListTicketsForSellerQuery(string UserId) : IRequest<IReadOnlyList<TicketForSellerDto>>;

public sealed record TicketForSellerDto(
    string Id,
    string UserId,
    string Subject,
    string Message,
    string Status,
    string? OrderId,
    string? SellerId,
    System.DateTime CreatedAtUtc,
    System.DateTime UpdatedAtUtc
);
