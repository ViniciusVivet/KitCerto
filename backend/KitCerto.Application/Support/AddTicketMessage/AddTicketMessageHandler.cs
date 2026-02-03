using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using KitCerto.Domain.Support;
using KitCerto.Domain.Repositories;

namespace KitCerto.Application.Support.AddTicketMessage;

public sealed class AddTicketMessageHandler : IRequestHandler<AddTicketMessageCmd, AddTicketMessageResult?>
{
    private readonly ISupportTicketsRepo _tickets;
    private readonly ITicketMessagesRepo _messages;
    private readonly ISellersRepo _sellers;
    private readonly INotifySellerService _notifySeller;

    public AddTicketMessageHandler(
        ISupportTicketsRepo tickets,
        ITicketMessagesRepo messages,
        ISellersRepo sellers,
        INotifySellerService notifySeller)
    {
        _tickets = tickets;
        _messages = messages;
        _sellers = sellers;
        _notifySeller = notifySeller;
    }

    public async Task<AddTicketMessageResult?> Handle(AddTicketMessageCmd req, CancellationToken ct)
    {
        var ticket = await _tickets.GetByIdAsync(req.UserId, req.TicketId, ct);
        if (ticket is null)
        {
            ticket = await _tickets.GetByTicketIdAsync(req.TicketId, ct);
            if (ticket is null) return null;
            if (req.IsAdmin)
            { /* allow */ }
            else if (!string.IsNullOrWhiteSpace(ticket.SellerId))
            {
                var seller = await _sellers.GetByUserIdAsync(req.UserId, ct);
                if (seller?.Id != ticket.SellerId)
                    return null;
            }
            else
                return null;
        }

        var id = Guid.NewGuid().ToString("N");
        var msg = new TicketMessage(id, req.TicketId, req.UserId, req.Message.Trim());
        await _messages.AddAsync(msg, ct);

        if (ticket.UserId == req.UserId && !string.IsNullOrWhiteSpace(ticket.SellerId))
        {
            var seller = await _sellers.GetByIdAsync(ticket.SellerId, ct);
            if (seller != null)
                await _notifySeller.NotifyNewMessageAsync(req.TicketId, seller.Email, req.Message.Trim(), ct);
        }

        return new AddTicketMessageResult(msg.Id, msg.Message, msg.SenderUserId, msg.CreatedAtUtc);
    }
}
