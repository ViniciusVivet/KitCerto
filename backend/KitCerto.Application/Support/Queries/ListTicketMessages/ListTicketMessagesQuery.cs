using System.Collections.Generic;
using MediatR;

namespace KitCerto.Application.Support.Queries.ListTicketMessages;

public sealed record ListTicketMessagesQuery(string UserId, string TicketId, bool IsAdmin = false) : IRequest<IReadOnlyList<TicketMessageDto>>;

public sealed record TicketMessageDto(string Id, string Message, string SenderUserId, System.DateTime CreatedAtUtc);
