using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using TalentFlow.Api.Common;

namespace TalentFlow.Api.Middleware
{
    // Catches every error in the application and returns ONE clean JSON format:
    // { "statusCode": 404, "message": "...", "errors": [] }
    // The client never sees a stack trace or a database message.
    public class ExceptionMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ExceptionMiddleware> _logger;

        public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);

                // Some responses (401, 403, 404, 429) are created by ASP.NET Core itself
                // and have no body. We add our JSON body to them.
                await AddBodyToEmptyErrorResponse(context);
            }
            catch (AppException ex)
            {
                await WriteError(context, ex.StatusCode, ex.Message);
            }
            catch (BadHttpRequestException ex)
            {
                // Example: the request body is larger than the allowed size
                await WriteError(context, ex.StatusCode, "The request is not valid or it is too large.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unhandled error on {Method} {Path}", context.Request.Method, context.Request.Path.Value);
                await WriteError(context, 500, "Something went wrong on the server. Please try again later.");
            }
        }

        private async Task AddBodyToEmptyErrorResponse(HttpContext context)
        {
            int status = context.Response.StatusCode;

            bool isHandledStatus = (status == 401 || status == 403 || status == 404 || status == 429);
            bool bodyIsEmpty = context.Response.ContentLength == null && string.IsNullOrEmpty(context.Response.ContentType);

            if (isHandledStatus && bodyIsEmpty && context.Response.HasStarted == false)
            {
                string message = "An error occurred.";
                if (status == 401) { message = "You are not logged in or your token is not valid."; }
                if (status == 403) { message = "You do not have permission to do this."; }
                if (status == 404) { message = "The requested resource was not found."; }
                if (status == 429) { message = "Too many requests. Please try again later."; }

                await WriteError(context, status, message);
            }
        }

        private async Task WriteError(HttpContext context, int statusCode, string message)
        {
            if (context.Response.HasStarted)
            {
                return;
            }

            ErrorResponse body = new ErrorResponse(statusCode, message, new List<string>());

            JsonSerializerOptions options = new JsonSerializerOptions();
            options.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;

            context.Response.StatusCode = statusCode;
            context.Response.ContentType = "application/json";
            await context.Response.WriteAsync(JsonSerializer.Serialize(body, options));
        }
    }
}
