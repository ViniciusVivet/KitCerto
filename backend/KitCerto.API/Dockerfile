# 1) Build
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

COPY ./KitCerto.Domain ./KitCerto.Domain
COPY ./KitCerto.Application ./KitCerto.Application
COPY ./KitCerto.Infrastructure ./KitCerto.Infrastructure
COPY ./KitCerto.API ./KitCerto.API

RUN dotnet restore ./KitCerto.API/KitCerto.API.csproj
RUN dotnet publish ./KitCerto.API/KitCerto.API.csproj -c Release -o /app/publish

# 2) Runtime
FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app
COPY --from=build /app/publish ./

EXPOSE 5000 5001
ENTRYPOINT ["dotnet", "KitCerto.API.dll"]
