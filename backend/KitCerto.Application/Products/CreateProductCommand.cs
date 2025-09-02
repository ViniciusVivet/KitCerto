using MediatR;

public record CreateProductCmd(string Name, string Description, decimal Price, string CategoryId, int Quantity) : IRequest<string>;