using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using KitCerto.Domain.Support;
using KitCerto.Domain.Repositories;
using KitCerto.Infrastructure.Data;
using MongoDB.Driver;

namespace KitCerto.Infrastructure.Repositories
{
    public sealed class MongoTicketMessagesRepo : ITicketMessagesRepo
    {
        private readonly IMongoCollection<TicketMessage> _col;

        public MongoTicketMessagesRepo(MongoContext ctx)
        {
            _col = ctx.Db.GetCollection<TicketMessage>("ticket_messages");
        }

        public async Task<TicketMessage> AddAsync(TicketMessage message, CancellationToken ct)
        {
            await _col.InsertOneAsync(message, cancellationToken: ct);
            return message;
        }

        public async Task<IReadOnlyList<TicketMessage>> ListByTicketIdAsync(string ticketId, CancellationToken ct)
        {
            var filter = Builders<TicketMessage>.Filter.Eq(x => x.TicketId, ticketId);
            var list = await _col.Find(filter).SortBy(x => x.CreatedAtUtc).ToListAsync(ct);
            return list;
        }
    }
}
