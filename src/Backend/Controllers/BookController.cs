using System.Collections.Generic;
using System.Diagnostics;
using System.Threading.Tasks;
using Backend.Auth;
using Backend.Dtos;
using Backend.Models;
using Backend.Services.Interfaces;
using Backend.Validators;
using Microsoft.ApplicationInsights;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using static Backend.Utilities.AppInsightsTool;
using static Backend.Utilities.AppInsightsTool.Props;
using static Backend.Utilities.Helpers;
using static Backend.Utilities.Constants;
using static Backend.Utilities.Constants.ResponseMessage;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class BookController : ControllerBase
    {
        private readonly IBookService _bookService;
        private TelemetryClient _appInsights;

        public BookController(IBookService bookService, TelemetryClient appInsights)
        {
            _bookService = bookService;
            _appInsights = appInsights;
        }

        [HttpGet]
        public async Task<ActionResult<List<BookDto>>> GetBooks()
        {
            Stopwatch timer = new Stopwatch();
            timer.Start();
            var toReturn = await _bookService.GetBooks();
            timer.Stop();
            _appInsights.TrackEvent(GetCurrentMethod(), SingleProperty(TIME_TAKEN_MS, timer.ElapsedMilliseconds.ToString()));

            return Ok(toReturn);
        }

        [HttpPost]
        public async Task<ActionResult<BookDto>> AddBook([FromBody] BookDto bookDto)
        {
            var validation = BookValidator.ValidateAddBookDto(bookDto);
            string msg;
            if (validation.Error)
            {
                msg = GetMessage(ValidationError);
                _appInsights.TrackEvent(GetCurrentMethod(),
                                        CreateTrackProperties(ExecutionResult.Error, msg, BOOK_TITLE, bookDto == null ? "null" : bookDto.Title));
                return BadRequest(msg);
            }
            var userId = User.GetAzureAadObjectId();
            var username = User.FindFirst("name")?.Value;
            var toReturn = await _bookService.AddBook(bookDto, userId, username);
            bool success = toReturn != null;
            msg = success ? GetMessage(BookAdded) : GetMessage(AddBookFailed);
            var result = success ? ExecutionResult.OK : ExecutionResult.Failed;
            _appInsights.TrackEvent(GetCurrentMethod(),
                                    CreateTrackProperties(result, msg, BOOK_ID, success ? "null" : toReturn.Id.ToString()));
            return Ok(toReturn);
        }

        [HttpPut]
        public async Task<ActionResult<BookDto>> UpdateBook([FromBody] BookDto bookDto)
        {
            string msg;
            if (bookDto == null)
            {
                msg = GetMessage(InvalidData);
                _appInsights.TrackEvent(GetCurrentMethod(),
                                        CreateTrackProperties(ExecutionResult.Error, msg, BOOK_TITLE, bookDto == null ? "null" : bookDto.Title));
                return BadRequest(msg);
            }

            if (bookDto.Quantity <= 0)
            {
                msg = GetMessage(InvalidQuantity);
                _appInsights.TrackEvent(GetCurrentMethod(),
                                        CreateTrackProperties(ExecutionResult.Failed, msg, BOOK_TITLE, bookDto == null ? "null" : bookDto.Title));
                return BadRequest(msg);
            }

            var userId = User.GetAzureAadObjectId();
            var username = User.FindFirst("name")?.Value;
            var toReturn = await _bookService.AddBook(bookDto, userId, username);
            bool success = toReturn != null;
            msg = success ? GetMessage(BookUpdated) : GetMessage(UpdateBookFailed);
            var result = success ? ExecutionResult.OK : ExecutionResult.Failed;
            _appInsights.TrackEvent(GetCurrentMethod(),
                                    CreateTrackProperties(result, msg, BOOK_ID, success ? "null" : toReturn.Id.ToString()));
            return Ok(toReturn);
        } 

        [HttpPut("DonateBook/{bookId:int}")]
        public async Task<ActionResult<BookDto>> DonateBook(int bookId)
        {
            var toReturn = await _bookService.DonateOwnedBookToLibrary(bookId, User.GetAzureAadObjectId());
            bool success = toReturn != null;
            string msg = success ? GetMessage(BookDonated) : GetMessage(DonateBookFailed);
            var result = success ? ExecutionResult.OK : ExecutionResult.Failed;
            _appInsights.TrackEvent(GetCurrentMethod(),
                                    CreateTrackProperties(result, msg, BOOK_ID, success ? "null" : toReturn.Id.ToString()));
            return Ok(toReturn);
        }

        [HttpPut("RemoveBook/{bookId:int}")]
        public async Task<ActionResult<BookDto>> RemoveBook(int bookId)
        {
            var toReturn = await _bookService.RemoveOwnedBookFromLibrary(bookId, User.GetAzureAadObjectId());
            bool success = toReturn != null;
            string msg = success ? GetMessage(BookRemoved) : GetMessage(RemoveBookFailed);
            var result = success ? ExecutionResult.OK : ExecutionResult.Failed;
            _appInsights.TrackEvent(GetCurrentMethod(),
                                    CreateTrackProperties(result, msg, BOOK_ID, success ? "null" : toReturn.Id.ToString()));
            return Ok(toReturn);
        }

        [HttpPut("RemoveAllMyBooks/{isDonation:bool}")]
        public async Task<ActionResult<bool>> RemoveAllMyBooks(bool isDonation)
        {
            var userId = User.GetAzureAadObjectId();
            bool success = await _bookService.RemoveAllMyOwnedBooksFromLibrary(User.GetAzureAadObjectId(), isDonation);
            string msg = success ? GetMessage(AllUserBooksRemoved) : GetMessage(RemoveAllUserBooksFailed);
            var result = success ? ExecutionResult.OK : ExecutionResult.Failed;
            _appInsights.TrackEvent(GetCurrentMethod(),
                                    CreateTrackProperties(result, msg, USER_ID, userId.ToString()));
            return Ok(success);
        }

        [HttpPost("AddBookReview")]
        public async Task<ActionResult<BookReview>> AddBookReview([FromBody] BookReview bookReview)
        {
            string msg;
            if(bookReview == null)
            {
                msg = GetMessage(InvalidData);
                _appInsights.TrackEvent(GetCurrentMethod(),
                                        CreateTrackProperties(ExecutionResult.Error, msg, BOOK_ID, bookReview == null ? "null" : bookReview.BookId.ToString()));
                return BadRequest(msg);
            }

            bookReview.UserId = User.GetAzureAadObjectId();
            var toReturn = await _bookService.AddBookReviewOnBook(bookReview);
            bool success = toReturn != null;
            msg = success ? GetMessage(BookReviewAdded) : GetMessage(AddBookReviewFailed);
            var result = success ? ExecutionResult.OK : ExecutionResult.Failed;
            _appInsights.TrackEvent(GetCurrentMethod(),
                                    CreateTrackProperties(result, msg, BOOK_ID, bookReview.BookId.ToString()));
            return Ok(toReturn);
        }

        [HttpPut("RemoveBookReview")]
        public async Task<ActionResult<bool>> DeleteBookReview([FromBody] BookReview bookReview)
        {
            string msg;
            if (bookReview == null)
            {
                msg = GetMessage(InvalidData);
                _appInsights.TrackEvent(GetCurrentMethod(),
                                        CreateTrackProperties(ExecutionResult.Error, msg, BOOK_ID, bookReview == null ? "null" : bookReview.BookId.ToString()));
                return BadRequest(msg);
            }

            var userId = User.GetAzureAadObjectId();
            if (bookReview.UserId != userId)
            {
                msg = GetMessage(AccessDenied);
                _appInsights.TrackEvent(GetCurrentMethod(),
                                        CreateTrackProperties(ExecutionResult.Failed, msg, BOOK_ID, bookReview == null ? "null" : bookReview.BookId.ToString()));
                return BadRequest(msg);
            }

            bookReview.UserId = userId;
            bool success = await _bookService.DeleteBookReviewFromBook(bookReview);
            msg = success ? GetMessage(BookReviewDeleted) : GetMessage(DeleteBookReviewFailed);
            var result = success ? ExecutionResult.OK : ExecutionResult.Failed;
            _appInsights.TrackEvent(GetCurrentMethod(),
                                    CreateTrackProperties(result, msg, BOOK_ID, bookReview.BookId.ToString()));
            return Ok(success);
        }

        [HttpPut("RemoveAllMyBookReviews")]
        public async Task<ActionResult<bool>> DeleteAllMyBookReviews()
        {
            var userId = User.GetAzureAadObjectId();
            bool success = await _bookService.DeleteBookReviewsForUser(userId);
            string msg = success ? GetMessage(AllUserBooksRemoved) : GetMessage(RemoveAllUserBooksFailed);
            var result = success ? ExecutionResult.OK : ExecutionResult.Failed;
            _appInsights.TrackEvent(GetCurrentMethod(),
                                    CreateTrackProperties(result, msg, USER_ID, userId.ToString()));
            return Ok(success);
        }
    }
}