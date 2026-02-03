using MediatR;

namespace KitCerto.Application.Support.AddTicketMessage;

public sealed record AddTicketMessageCmd(string UserId, string TicketId, string Message, bool IsAdmin = false) : IRequest<AddTicketMessageResult?>;

public sealed record AddTicketMessageResult(string Id, string Message, string SenderUserId, DateTime CreatedAtUtc);
