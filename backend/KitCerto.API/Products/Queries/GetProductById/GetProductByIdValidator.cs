using FluentValidation;

namespace KitCerto.Application.Products.Queries.GetProductById
{
    public sealed class GetProductByIdValidator : AbstractValidator<GetProductByIdQuery>
    {
        public GetProductByIdValidator()
        {
            RuleFor(x => x.Id).NotEmpty();
        }
    }
}
