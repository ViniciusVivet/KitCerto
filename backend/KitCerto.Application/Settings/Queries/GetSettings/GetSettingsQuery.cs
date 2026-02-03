using MediatR;
using KitCerto.Domain.Settings;

namespace KitCerto.Application.Settings.Queries.GetSettings;

public sealed record GetSettingsQuery() : IRequest<StoreSettings>;
