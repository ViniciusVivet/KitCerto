using FluentValidation;

namespace KitCerto.Application.Products.Update
{
    public sealed class UpdateProductValidator : AbstractValidator<UpdateProductCmd>
    {
        public UpdateProductValidator()
        {
            RuleFor(x => x.Id).NotEmpty();
            RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
            RuleFor(x => x.Price).GreaterThanOrEqualTo(0);
            RuleFor(x => x.Stock).GreaterThanOrEqualTo(0);
            RuleFor(x => x.CategoryId).NotEmpty();
        }
    }
}
