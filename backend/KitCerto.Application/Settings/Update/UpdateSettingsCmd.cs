using MediatR;

namespace KitCerto.Application.Settings.Update;

public sealed record UpdateSettingsCmd(
    string StoreName,
    string SupportEmail,
    string SupportPhone,
    decimal FreeShippingThreshold,
    bool PromoBannerActive,
    string PromoBannerText,
    bool MaintenanceMode
) : IRequest;
