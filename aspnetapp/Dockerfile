FROM mcr.microsoft.com/dotnet/aspnet:6.0 AS base
WORKDIR /app
EXPOSE 5001
RUN curl -sL https://deb.nodesource.com/setup_20.x |  bash -
RUN apt-get update
RUN apt-get install -y nodejs
ENV TZ=Asia/Tokyo

FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build
WORKDIR /src
RUN curl -sL https://deb.nodesource.com/setup_20.x |  bash -
RUN apt-get update
RUN apt-get install -y nodejs
COPY ["WINGS/WINGS.csproj", "WINGS/"]
RUN dotnet restore "WINGS/WINGS.csproj"
COPY . .
WORKDIR "/src/WINGS"
RUN dotnet build "WINGS.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "WINGS.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
COPY ["WINGS/certificate.pfx", "./"]
ENTRYPOINT ["dotnet", "WINGS.dll"]
