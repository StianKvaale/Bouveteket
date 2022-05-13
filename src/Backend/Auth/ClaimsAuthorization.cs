using System;
using System.Linq;
using System.Security.Claims;

namespace Backend.Auth
{
    public static class ClaimsAuthorization
    {
        public static Guid GetAzureAadObjectId(this ClaimsPrincipal user)
        {
            var objectIdString = (user.Identity as ClaimsIdentity)?.Claims.FirstOrDefault(x => x.Type == "http://schemas.microsoft.com/identity/claims/objectidentifier")?.Value;
            return new Guid(objectIdString);
        }
    }
}
