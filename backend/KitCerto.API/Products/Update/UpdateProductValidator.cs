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
            RuleForEach(x => x.Media).ChildRules(media =>
            {
                media.RuleFor(m => m.Url).NotEmpty();
                media.RuleFor(m => m.Type).NotEmpty().Must(t => t == "image" || t == "video");
            });
        }
    }
}
