using MediatR;

namespace KitCerto.Application.Support.CreateTicket;

public sealed record CreateTicketCmd(string UserId, string Subject, string Message, string? OrderId = null) : IRequest<string>;
