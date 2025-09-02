var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var authority = builder.Configuration["Auth:Authority"];
var audience  = builder.Configuration["Auth:Audience"];

builder.Services.AddAuthentication("Bearer")
  .AddJwtBearer("Bearer", opt => {
    opt.Authority = authority; // http://keycloak:8080/realms/kitcerto (em docker)
    opt.Audience = audience;   // kitcerto-api
    opt.RequireHttpsMetadata = false;
  });

builder.Services.AddHealthChecks()
  .AddMongoDb(builder.Configuration.GetConnectionString("Mongo")!);

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();
app.UseAuthentication();
app.UseAuthorization();
app.MapHealthChecks("/health");
app.MapControllers();

app.Run();
