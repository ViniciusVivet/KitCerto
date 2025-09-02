# build
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY . .
RUN dotnet restore
RUN dotnet publish KitCerto.API/KitCerto.API.csproj -c Release -o /out

# runtime
FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app
COPY --from=build /out .
EXPOSE 5000
ENTRYPOINT ["dotnet", "KitCerto.API.dll"]
