using MediatR;
using KitCerto.Domain.Profile;

namespace KitCerto.Application.Profile.Queries.GetProfile;

public sealed record GetProfileQuery(string UserId) : IRequest<UserProfile?>;
