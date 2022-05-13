using System.Collections.Generic;
using Backend.Cache;
using Backend.Models;
using Backend.Repositories;
using Backend.Repositories.Interfaces;
using Backend.Services;
using Backend.Services.Interfaces;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Identity.Web;
using Microsoft.OpenApi.Models;

namespace Backend
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddMicrosoftIdentityWebApi(
                    options =>
                    {
                        Configuration.Bind("AzureAd", options);
                    },
                    options => { Configuration.Bind("AzureAd", options); }
                );

            services.AddAuthorization(options =>
            {
                options.FallbackPolicy = new AuthorizationPolicyBuilder()
                    .RequireAuthenticatedUser()
                    .Build();
            });

            //This method connects to a Application Insights resource with the appsettings key "ApplicationInsights:InstrumentationKey" in test/prod (loaded from keyvault)
            services.AddApplicationInsightsTelemetry(); 

            services.AddControllers();
            services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new OpenApiInfo {Title = "BouveteketBackend", Version = "v1"});
                c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
                {
                    Description = @"JWT Authorization header issued by AD using the Bearer scheme. Value format: 'Bearer ${token}'",
                    Name = "Authorization",
                    In = ParameterLocation.Header,
                    Type = SecuritySchemeType.ApiKey,
                    Scheme = "Bearer"
                });
                c.AddSecurityRequirement(new OpenApiSecurityRequirement()
                {
                    {
                        new OpenApiSecurityScheme
                        {
                            Reference = new OpenApiReference
                            {
                                Type = ReferenceType.SecurityScheme,
                                Id = "Bearer"
                            },
                            Scheme = "oauth2",
                            Name = "Bearer",
                            In = ParameterLocation.Header
                        },
                        new List<string>()
                    }
                });

            });
            services.AddDbContext<BouveteketContext>(options =>
                options.UseSqlServer(
                    Configuration["dbConnectionString"]
                ));
            
            services.AddTransient<IAuthorRepository, AuthorRepository>();
            services.AddTransient<IAuthorService, AuthorService>();
            services.AddTransient<IBookRepository, BookRepository>();
            services.AddTransient<IBookService, BookService>();
            services.AddTransient<ICategoryRepository, CategoryRepository>();
            services.AddTransient<ICategoryService, CategoryService>();
            services.AddTransient<ILoanRepository, LoanRepository>();
            services.AddTransient<ILoanService, LoanService>();
            services.AddTransient<IUserRepository, UserRepository>();
            services.AddTransient<IUserService, UserService>();
            services.AddTransient<IOwnershipRepository, OwnershipRepository>();
            services.AddTransient<IBookWishService, BookWishService>();
            services.AddTransient<IBookWishRepository, BookWishRepository>();
            services.AddSingleton<BouveteketMemoryCache>();
            services.AddScoped<IBlobStorageService, BlobStorageService>();
            services.Configure<AzureStorageConfig>(Configuration.GetSection("AzureStorageConfig"));

            services.AddCors(options =>
            {
                options.AddPolicy(name: "ApiPolicy",
                    builder =>
                    {
                        builder.WithOrigins(Configuration["FrontEndUrl"]).AllowAnyHeader().AllowAnyMethod();
                    });
            });
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env, BouveteketContext bouveteketContext)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            app.UseSwagger();
            app.UseSwaggerUI(c =>
                {
                    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Bouveteket API V1");
                    c.RoutePrefix = string.Empty;
                }
            );

            bouveteketContext.Database.Migrate();

            app.UseHttpsRedirection();

            app.UseRouting();
            app.UseCors("ApiPolicy");
            app.UseAuthentication();
            app.UseAuthorization();

            app.UseEndpoints(endpoints => { endpoints.MapControllers(); });
        }
    }
}