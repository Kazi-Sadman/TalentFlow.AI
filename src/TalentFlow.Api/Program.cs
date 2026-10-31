using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using TalentFlow.Api.Authorization;
using TalentFlow.Api.Common;
using TalentFlow.Api.Data;
using TalentFlow.Api.Middleware;
using TalentFlow.Api.Services;
using TalentFlow.Api.Services.Interfaces;

WebApplicationBuilder builder = WebApplication.CreateBuilder(args);

// ------------------------------------------------------------
// 1. Settings (read from appsettings.json, user-secrets or environment variables)
// ------------------------------------------------------------
JwtSettings jwtSettings = new JwtSettings();
builder.Configuration.GetSection("Jwt").Bind(jwtSettings);
builder.Services.AddSingleton(jwtSettings);

ResumeSettings resumeSettings = new ResumeSettings();
builder.Configuration.GetSection("ResumeStorage").Bind(resumeSettings);
builder.Services.AddSingleton(resumeSettings);

// ------------------------------------------------------------
// 2. Database (PostgreSQL + Entity Framework Core)
// ------------------------------------------------------------
string connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddDbContext<TalentFlowDbContext>(options =>
{
    options.UseNpgsql(connectionString);
});

// ------------------------------------------------------------
// 3. Our services (Dependency Injection)
// ------------------------------------------------------------
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IJobService, JobService>();
builder.Services.AddScoped<IApplicationService, ApplicationService>();
builder.Services.AddScoped<IResumeService, ResumeService>();
builder.Services.AddScoped<IInterviewService, InterviewService>();
builder.Services.AddScoped<IAIAnalysisService, AIAnalysisService>();
builder.Services.AddScoped<IProfileService, ProfileService>();
builder.Services.AddScoped<IDashboardService, DashboardService>();
builder.Services.AddSingleton<IResumeParserService, ResumeParserService>();
builder.Services.AddSingleton<ISkillMatchingService, SkillMatchingService>();

// ------------------------------------------------------------
// 4. Controllers, JSON and validation errors
// ------------------------------------------------------------
builder.Services
    .AddControllers()
    .AddJsonOptions(options =>
    {
        // Enums are written as text ("Published") instead of numbers
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    })
    .ConfigureApiBehaviorOptions(options =>
    {
        // Validation errors use the same ErrorResponse format as all other errors
        options.InvalidModelStateResponseFactory = context =>
        {
            List<string> errors = new List<string>();

            foreach (ModelStateEntry entry in context.ModelState.Values)
            {
                foreach (ModelError error in entry.Errors)
                {
                    if (string.IsNullOrWhiteSpace(error.ErrorMessage))
                    {
                        errors.Add("A value in the request is not valid.");
                    }
                    else
                    {
                        errors.Add(error.ErrorMessage);
                    }
                }
            }

            ErrorResponse body = new ErrorResponse(400, "Validation failed.", errors);
            return new BadRequestObjectResult(body);
        };
    });

// ------------------------------------------------------------
// 5. Authentication (JWT) and Authorization (roles / policies)
// ------------------------------------------------------------
builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        // Keep the claim names exactly as we wrote them in the token ("sub", "role", ...)
        options.MapInboundClaims = false;

        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = jwtSettings.Issuer,
            ValidateAudience = true,
            ValidAudience = jwtSettings.Audience,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.Key)),
            RoleClaimType = "role",
            NameClaimType = "sub",
            ClockSkew = TimeSpan.FromMinutes(1)
        };
    });

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy(PolicyNames.CandidateOnly, policy => policy.RequireRole(RoleNames.Candidate));
    options.AddPolicy(PolicyNames.RecruiterOnly, policy => policy.RequireRole(RoleNames.Recruiter));
});

// ------------------------------------------------------------
// 6. Rate limiting for login/register (stops password guessing)
// ------------------------------------------------------------
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = 429;
    options.AddFixedWindowLimiter("auth", limiter =>
    {
        limiter.PermitLimit = 20;
        limiter.Window = TimeSpan.FromMinutes(1);
        limiter.QueueLimit = 0;
    });
});

// ------------------------------------------------------------
// 7. Swagger (API test page) and health check
// ------------------------------------------------------------
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "TalentFlow AI API",
        Version = "v1",
        Description = "Recruitment and Applicant Tracking System"
    });

    // Adds the "Authorize" button to Swagger
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Paste only the token. Swagger adds the word Bearer for you."
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] { }
        }
    });
});

builder.Services.AddHealthChecks();

// ------------------------------------------------------------
// Build the application
// ------------------------------------------------------------
WebApplication app = builder.Build();

// We check the JWT key here (not earlier), so "dotnet ef" commands can still run without it.
if (string.IsNullOrWhiteSpace(jwtSettings.Key) || jwtSettings.Key.Length < 32)
{
    throw new InvalidOperationException(
        "Jwt:Key is missing or too short. Set a secret of at least 32 characters. " +
        "Example: dotnet user-secrets set \"Jwt:Key\" \"your-long-random-secret-text-here-123456\" --project src/TalentFlow.Api");
}

// ------------------------------------------------------------
// Development only: apply migrations and add demo data
// ------------------------------------------------------------
if (app.Environment.IsDevelopment())
{
    using (IServiceScope scope = app.Services.CreateScope())
    {
        TalentFlowDbContext db = scope.ServiceProvider.GetRequiredService<TalentFlowDbContext>();

        if (db.Database.GetMigrations().Any())
        {
            db.Database.Migrate();

            if (builder.Configuration.GetValue<bool>("SeedDemoData"))
            {
                DemoDataSeeder.Seed(db);
            }
        }
        else
        {
            Console.WriteLine("-----------------------------------------------------------------");
            Console.WriteLine("No database migration was found, so no tables were created.");
            Console.WriteLine("Run this command once, then start the app again:");
            Console.WriteLine("dotnet ef migrations add InitialCreate --project src/TalentFlow.Api --output-dir Data/Migrations");
            Console.WriteLine("-----------------------------------------------------------------");
        }
    }

    app.UseSwagger();
    app.UseSwaggerUI();
}

// ------------------------------------------------------------
// Middleware pipeline (the order is important)
// ------------------------------------------------------------
app.UseMiddleware<ExceptionMiddleware>();
app.UseHttpsRedirection();
app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHealthChecks("/health");

app.Run();
