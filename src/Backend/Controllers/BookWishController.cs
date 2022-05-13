using System.Collections.Generic;
using System.Threading.Tasks;
using Backend.Auth;
using Backend.Dtos;
using Backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class BookWishController : ControllerBase
    {
        private readonly IBookWishService _bookWishService;

        public BookWishController(IBookWishService bookWishService)
        {
            _bookWishService = bookWishService;
        }

        [HttpGet]
        public async Task<ActionResult<List<BookWishDto>>> GetBookWishDtos()
        {
            return Ok(await _bookWishService.GetBookWishes());
        }

        [HttpPost]
        public async Task<ActionResult<BookWishDto>> AddBookWish([FromBody] BookWishDto bookWishDto)
        {
            return Ok(await _bookWishService.AddBookWish(bookWishDto));
        }

        [HttpPut]
        public async Task<ActionResult<BookWishDto>> UpdateBookWish([FromBody] BookWishDto bookWishDto)
        {
            return Ok(await _bookWishService.UpdateBookWish(bookWishDto));
        }

        [HttpPut("DeleteAllMyVotes")]
        public async Task<ActionResult<List<BookWishDto>>> DeleteAllMyVotes()
        {
            var userId = User.GetAzureAadObjectId();
            return Ok(await _bookWishService.DeleteVotesForUser(userId));
        }

        [HttpPut("Delete")]
        public async Task<ActionResult<bool>> DeleteBookWish([FromBody] BookWishDto bookWishDto)
        {
            return Ok(await _bookWishService.DeleteBookWish(bookWishDto));
        }

        [HttpPut("DeleteAllMine")]
        public async Task<ActionResult<bool>> DeleteAllMyBookWishes()
        {
            var username = User.FindFirst("name")?.Value;
            return Ok(await _bookWishService.DeleteBookWishesForUser(username));
        }
    }
}
