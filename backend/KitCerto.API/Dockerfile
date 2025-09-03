# build
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

COPY ../KitCerto.Domain ./KitCerto.Domain
COPY ../KitCerto.Application ./KitCerto.Application
COPY ../KitCerto.Infrastructure ./KitCerto.Infrastructure
COPY ./KitCerto.API ./KitCerto.API

RUN dotnet restore ./KitCerto.API/KitCerto.API.csproj
RUN dotnet publish ./KitCerto.API/KitCerto.API.csproj -c Release -o /app/publish

# runtime
FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app
COPY --from=build /app/publish ./
ENV ASPNETCORE_URLS=http://+:5000
EXPOSE 5000
ENTRYPOINT ["dotnet", "KitCerto.API.dll"]
