using FluentValidation;

namespace KitCerto.Application.Categories.Create;

public sealed class CreateCategoryValidator : AbstractValidator<CreateCategoryCmd>
{
    public CreateCategoryValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(80);
        RuleFor(x => x.Description).MaximumLength(500);
    }
}
