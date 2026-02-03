using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using KitCerto.Domain.Support;
using KitCerto.Domain.Repositories;
using MediatR;

namespace KitCerto.Application.Support.CreateTicket;

public sealed class CreateTicketHandler : IRequestHandler<CreateTicketCmd, string>
{
    private readonly ISupportTicketsRepo _repo;
    private readonly IOrdersRepo _orders;
    private readonly IProductsRepo _products;

    public CreateTicketHandler(ISupportTicketsRepo repo, IOrdersRepo orders, IProductsRepo products)
    {
        _repo = repo;
        _orders = orders;
        _products = products;
    }

    public async Task<string> Handle(CreateTicketCmd req, CancellationToken ct)
    {
        string? sellerId = null;
        if (!string.IsNullOrWhiteSpace(req.OrderId))
        {
            var order = await _orders.GetByIdAsync(req.OrderId, ct);
            var firstItem = order?.Items?.FirstOrDefault();
            if (firstItem != null)
            {
                var product = await _products.GetByIdAsync(firstItem.ProductId, ct);
                if (!string.IsNullOrWhiteSpace(product?.SellerId))
                    sellerId = product.SellerId;
            }
        }

        var id = Guid.NewGuid().ToString("N");
        var ticket = new SupportTicket(id, req.UserId, req.Subject, req.Message, req.OrderId, sellerId);
        await _repo.CreateAsync(ticket, ct);
        return id;
    }
}
