using MediatR;

namespace KitCerto.Application.Profile.Update;

public sealed record UpdateProfileCmd(
    string UserId,
    string? DisplayName,
    string? FullName,
    string? Phone,
    string? AvatarUrl,
    DateTime? BirthDate,
    string? Document,
    bool NewsletterOptIn
) : IRequest;
