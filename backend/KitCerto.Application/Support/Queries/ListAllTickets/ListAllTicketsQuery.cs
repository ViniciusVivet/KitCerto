using System.Collections.Generic;
using MediatR;

namespace KitCerto.Application.Support.Queries.ListAllTickets;

public sealed record ListAllTicketsQuery() : IRequest<IReadOnlyList<AllTicketsDto>>;

public sealed record AllTicketsDto(
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
