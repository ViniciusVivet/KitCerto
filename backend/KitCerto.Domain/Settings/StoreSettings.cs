using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace KitCerto.Domain.Settings;

public sealed class StoreSettings
{
    [BsonId]
    [BsonRepresentation(BsonType.String)]
    public string Id { get; private set; } = "global_settings";

    [BsonElement("StoreName")] public string StoreName { get; set; } = "KitCerto Store";
    [BsonElement("SupportEmail")] public string SupportEmail { get; set; } = "suporte@kitcerto.com.br";
    [BsonElement("SupportPhone")] public string SupportPhone { get; set; } = "(11) 99999-9999";
    
    [BsonElement("FreeShippingThreshold")] public decimal FreeShippingThreshold { get; set; } = 250.00m;
    [BsonElement("PromoBannerActive")] public bool PromoBannerActive { get; set; } = true;
    [BsonElement("PromoBannerText")] public string PromoBannerText { get; set; } = "Frete grátis para compras acima de R$ 250,00!";
    
    [BsonElement("MaintenanceMode")] public bool MaintenanceMode { get; set; } = false;

    public StoreSettings() { }
}
