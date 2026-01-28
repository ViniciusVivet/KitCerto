using System.Collections.Generic;
using MediatR;

namespace KitCerto.Application.Products.Update
{
    public sealed class UpdateProductCmd : IRequest
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public int Stock { get; set; }
        public int Quantity { get; set; }
        public string CategoryId { get; set; } = string.Empty;
        public List<UpdateProductMedia>? Media { get; set; }
    }

    public sealed record UpdateProductMedia(string Url, string Type);
}
