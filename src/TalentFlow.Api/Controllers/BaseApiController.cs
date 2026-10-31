using System;
using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using TalentFlow.Api.Common;
using TalentFlow.Api.Entities;

namespace TalentFlow.Api.Controllers
{
    // All controllers inherit from this class.
    // It gives them easy methods to read the logged-in user from the JWT token.
    [ApiController]
    public class BaseApiController : ControllerBase
    {
        protected int GetUserId()
        {
            Claim claim = User.FindFirst("sub");
            if (claim == null)
            {
                throw new UnauthorizedException("Your token is not valid.");
            }
            return int.Parse(claim.Value);
        }

        protected UserRole GetUserRole()
        {
            Claim claim = User.FindFirst("role");
            if (claim == null)
            {
                throw new UnauthorizedException("Your token is not valid.");
            }
            return (UserRole)Enum.Parse(typeof(UserRole), claim.Value);
        }

        // Only recruiters have a company. Use this in recruiter endpoints.
        protected int GetCompanyId()
        {
            Claim claim = User.FindFirst("companyId");
            if (claim == null)
            {
                throw new ForbiddenException("Your account does not belong to a company.");
            }
            return int.Parse(claim.Value);
        }

        // Use this in public endpoints, where the user may be not logged in.
        protected int? GetCompanyIdOrNull()
        {
            Claim claim = User.FindFirst("companyId");
            if (claim == null)
            {
                return null;
            }
            return int.Parse(claim.Value);
        }
    }
}
