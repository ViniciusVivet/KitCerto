using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using KitCerto.Domain.Support;
using KitCerto.Domain.Repositories;
using KitCerto.Infrastructure.Data;
using MongoDB.Driver;

namespace KitCerto.Infrastructure.Repositories
{
    public sealed class MongoSupportTicketsRepo : ISupportTicketsRepo
    {
        private readonly IMongoCollection<SupportTicket> _col;

        public MongoSupportTicketsRepo(MongoContext ctx)
        {
            _col = ctx.Db.GetCollection<SupportTicket>("support_tickets");
        }

        public async Task<SupportTicket> CreateAsync(SupportTicket ticket, CancellationToken ct)
        {
            await _col.InsertOneAsync(ticket, cancellationToken: ct);
            return ticket;
        }

        public async Task<IReadOnlyList<SupportTicket>> ListByUserAsync(string userId, CancellationToken ct)
        {
            var filter = Builders<SupportTicket>.Filter.Eq(x => x.UserId, userId);
            var list = await _col.Find(filter).SortByDescending(x => x.CreatedAtUtc).ToListAsync(ct);
            return list;
        }

        public async Task<SupportTicket?> GetByIdAsync(string userId, string ticketId, CancellationToken ct)
        {
            var filter = Builders<SupportTicket>.Filter.And(
                Builders<SupportTicket>.Filter.Eq(x => x.UserId, userId),
                Builders<SupportTicket>.Filter.Eq(x => x.Id, ticketId)
            );
            return await _col.Find(filter).FirstOrDefaultAsync(ct);
        }

        public async Task<SupportTicket?> GetByTicketIdAsync(string ticketId, CancellationToken ct)
        {
            var filter = Builders<SupportTicket>.Filter.Eq(x => x.Id, ticketId);
            return await _col.Find(filter).FirstOrDefaultAsync(ct);
        }

        public async Task<IReadOnlyList<SupportTicket>> ListBySellerIdAsync(string sellerId, CancellationToken ct)
        {
            var filter = Builders<SupportTicket>.Filter.Eq(x => x.SellerId, sellerId);
            var list = await _col.Find(filter).SortByDescending(x => x.UpdatedAtUtc).ToListAsync(ct);
            return list;
        }

        public async Task<IReadOnlyList<SupportTicket>> ListAllAsync(CancellationToken ct)
        {
            var list = await _col.Find(FilterDefinition<SupportTicket>.Empty).SortByDescending(x => x.UpdatedAtUtc).ToListAsync(ct);
            return list;
        }
    }
}
