# ===== build =====
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copia só os csproj para restaurar (cache eficiente)
COPY backend/KitCerto.Domain/*.csproj        backend/KitCerto.Domain/
COPY backend/KitCerto.Application/*.csproj   backend/KitCerto.Application/
COPY backend/KitCerto.Infrastructure/*.csproj backend/KitCerto.Infrastructure/
COPY backend/KitCerto.API/*.csproj           backend/KitCerto.API/

# Restaura pelo PROJETO da API (não usa .sln)
RUN dotnet restore backend/KitCerto.API/KitCerto.API.csproj

# Agora copia todo o código
COPY backend/ ./backend/

# Publica a API
RUN dotnet publish backend/KitCerto.API/KitCerto.API.csproj -c Release -o /app/publish

# ===== runtime =====
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app

ENV ASPNETCORE_URLS=http://0.0.0.0:5000 \
    ASPNETCORE_ENVIRONMENT=Docker

COPY --from=build /app/publish .
EXPOSE 5000
ENTRYPOINT ["dotnet", "KitCerto.API.dll"]
