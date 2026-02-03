using MediatR;
using System.Collections.Generic;
using KitCerto.Domain.Support;

namespace KitCerto.Application.Support.Queries.ListMyTickets;

public sealed record ListMyTicketsQuery(string UserId) : IRequest<IReadOnlyList<SupportTicket>>;
