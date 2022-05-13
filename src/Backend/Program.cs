using System;
using Azure.Extensions.AspNetCore.Configuration.Secrets;
using Azure.Identity;
using Azure.Security.KeyVault.Secrets;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;

namespace Backend
{
    public class Program
    {
        public static void Main(string[] args)
        {
            CreateWebHostBuilder(args).Build().Run();
        }
        public static IHostBuilder CreateWebHostBuilder(string[] args)
        {
            var host = Host.CreateDefaultBuilder(args)
                .ConfigureWebHostDefaults(webBuilder => webBuilder.UseStartup<Startup>())
                .ConfigureAppConfiguration((context, config) =>
                {
                    if (context.HostingEnvironment.IsDevelopment())
                    {
                        config.AddUserSecrets<Program>();
                    }
                    else
                    {
                        var keyVaultUri = GetKeyVaultEndpoint(context.HostingEnvironment.IsProduction());
                        var keyVaultClient = new SecretClient(keyVaultUri, new DefaultAzureCredential());
                        config.AddAzureKeyVault(keyVaultClient, new KeyVaultSecretManager());
                    }
                });
            return host;
        }
        private static Uri GetKeyVaultEndpoint(bool isProduction)
        {
            var environment = isProduction ? "prod" : "test";
            return new Uri($"https://bouveteket-{environment}-kv.vault.azure.net/");
        }
    }
}