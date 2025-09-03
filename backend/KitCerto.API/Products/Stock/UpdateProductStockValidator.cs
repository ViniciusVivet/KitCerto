using FluentValidation;

namespace KitCerto.Application.Products.Stock
{
    public sealed class UpdateProductStockValidator : AbstractValidator<UpdateProductStockCmd>
    {
        public UpdateProductStockValidator()
        {
            RuleFor(x => x.Id).NotEmpty();
            RuleFor(x => x.Stock).GreaterThanOrEqualTo(0);
        }
    }
}
