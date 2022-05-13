using System.Threading.Tasks;
using Backend.Auth;
using Backend.Models;
using Backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;

        public UserController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpGet]
        public ActionResult<User> GetUser()
        {
            var userId = User.GetAzureAadObjectId();
            return Ok(_userService.GetUser(userId));
        }

        [HttpPut]
        public async Task<ActionResult<User>> SaveUser([FromBody] User user)
        {
            user.Id = User.GetAzureAadObjectId();
            user.Username = User.FindFirst("name")?.Value;
            
            return Ok(await _userService.SaveUser(user));
        }

        [HttpPut("Delete")]
        public async Task<ActionResult<bool>> DeleteUser()
        {
            var userId = User.GetAzureAadObjectId();
            var username = User.FindFirst("name")?.Value;
            return Ok(await _userService.DeleteUser(userId, username));
        }
    }
}
