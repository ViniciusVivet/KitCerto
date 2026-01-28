using System.Linq;
using FluentValidation;

namespace KitCerto.Application.Products.Update
{
    public sealed class UpdateProductValidator : AbstractValidator<UpdateProductCmd>
    {
        public UpdateProductValidator()
        {
            // RuleFor(x => x.Id).NotEmpty(); // O Id vem da rota, não precisa validar no body
            RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
            RuleFor(x => x.Price).GreaterThanOrEqualTo(0);
            RuleFor(x => x.Stock).GreaterThanOrEqualTo(0);
            RuleFor(x => x.Quantity).GreaterThanOrEqualTo(0);
            RuleFor(x => x.CategoryId).NotEmpty();
            RuleFor(x => x.Media)
                .Must(media =>
                {
                    if (media is null) return true;
                    var imageCount = media.Count(m => m.Type == "image");
                    var videoCount = media.Count(m => m.Type == "video");
                    return imageCount <= 5 && videoCount <= 2 && (imageCount + videoCount) <= 7;
                })
                .WithMessage("Limite por produto: até 5 fotos e 2 vídeos.");
            RuleForEach(x => x.Media).ChildRules(media =>
            {
                media.RuleFor(m => m.Url).NotEmpty();
                media.RuleFor(m => m.Type).NotEmpty().Must(t => t == "image" || t == "video");
            });
        }
    }
}
