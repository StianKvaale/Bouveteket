using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Threading.Tasks;
using Backend.Auth;
using Backend.Cache;
using Backend.Dtos;
using Backend.Services.Interfaces;
using Microsoft.ApplicationInsights;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using static Backend.Utilities.AppInsightsTool;
using static Backend.Utilities.AppInsightsTool.Props;
using static Backend.Utilities.Helpers;
using static Backend.Utilities.Constants;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class LoanController : ControllerBase
    {
        private readonly ILoanService _loanService;
        private TelemetryClient _appInsights;
        private readonly BouveteketMemoryCache _cache;

        public LoanController(ILoanService loanService, TelemetryClient appInsights, BouveteketMemoryCache cache)
        {
            _loanService = loanService;
            _appInsights = appInsights;
            _cache = cache;
        }

        [HttpGet("getAllLoans")]
        public async Task<ActionResult<List<LoanDto>>> GetAllLoans()
        {
            Stopwatch timer = new Stopwatch();
            timer.Start();
            var toReturn = await _loanService.GetAllLoans();
            timer.Stop();
            _appInsights.TrackEvent(GetCurrentMethod(), SingleProperty(TIME_TAKEN_MS, timer.ElapsedMilliseconds.ToString()));

            return Ok(toReturn);
        }

        [HttpGet("getAllLoansForUser/{onlyActiveLoans:bool}")]
        public async Task<ActionResult<List<LoanDto>>> GetAllLoansForUser(bool onlyActiveLoans = false)
        {
            Stopwatch timer = new Stopwatch();
            timer.Start();
            var userId = User.GetAzureAadObjectId();
            var toReturn = await _loanService.GetAllLoansForUser(userId, onlyActiveLoans);
            timer.Stop();
            _appInsights.TrackEvent(GetCurrentMethod(), SingleProperty(TIME_TAKEN_MS, timer.ElapsedMilliseconds.ToString()));

            return Ok(toReturn);
        } 

        [HttpPost("borrowBook/{bookId:int}")]
        public async Task<ActionResult<LoanDto>> BorrowBook(int bookId)
        {
            if (!_cache.Cache.TryGetValue(bookId, out int _))
            {
                var cacheEntryOptions = new MemoryCacheEntryOptions().SetSize(1024).SetSlidingExpiration(TimeSpan.FromSeconds(30));
                _cache.Cache.Set(bookId, bookId, cacheEntryOptions);
            }
            else
            {
                string msg = GetMessage(ResponseMessage.BookAlreadyBorrowed);
                _appInsights.TrackEvent(GetCurrentMethod(), 
                                        CreateTrackProperties(ExecutionResult.Failed, 
                                                              msg,
                                                              BOOK_ID, 
                                                              bookId.ToString()));
                return BadRequest(msg);
            }
            var userId = User.GetAzureAadObjectId();
            var username = User.FindFirst("name")?.Value;
            var loan = await _loanService.BorrowBook(userId, bookId, username);
            if (loan == null)
            {
                string msg = GetMessage(ResponseMessage.BookNotExistOrUnavailable);
                _appInsights.TrackEvent(GetCurrentMethod(), 
                                        CreateTrackProperties(ExecutionResult.Failed,
                                                              msg,
                                                              BOOK_ID,
                                                              bookId.ToString()));
                return BadRequest(msg);
            }

            _cache.Cache.Remove(bookId);
            _appInsights.TrackEvent(GetCurrentMethod(), 
                                    CreateTrackProperties(ExecutionResult.OK,
                                                          GetMessage(ResponseMessage.BookBorrowed),
                                                          BOOK_ID,
                                                          bookId.ToString()));
            return Ok(loan);
        }

        [HttpPut("returnBook/{bookId:int}")]
        public async Task<ActionResult<LoanDto>> ReturnBook(int bookId)
        {
            var userId = User.GetAzureAadObjectId();
            var username = User.FindFirst("name")?.Value;

            if(userId == Guid.Empty || string.IsNullOrWhiteSpace(username))
            {
                string msg = GetMessage(ResponseMessage.InvalidUser);
                _appInsights.TrackEvent(GetCurrentMethod(),
                                        CreateTrackProperties(ExecutionResult.Failed,
                                                              msg,
                                                              BOOK_ID,
                                                              bookId.ToString()));
                return BadRequest(msg);
            }

            var loanAfterDeliver = await _loanService.ReturnBook(userId, bookId);
            if (loanAfterDeliver != null && loanAfterDeliver.DateDelivered == null)
            {
                string msg = GetMessage(ResponseMessage.CouldNotReturnBook);
                _appInsights.TrackEvent(GetCurrentMethod(),
                                        CreateTrackProperties(ExecutionResult.Failed,
                                                              msg,
                                                              BOOK_ID,
                                                              bookId.ToString()));
                return BadRequest(msg);
            }

            _appInsights.TrackEvent(GetCurrentMethod(),
                                    CreateTrackProperties(ExecutionResult.OK,
                                                          GetMessage(ResponseMessage.BookReturned),
                                                          BOOK_ID,
                                                          bookId.ToString()));
            return Ok(loanAfterDeliver);
        }

        [HttpPut("Delete")]
        public async Task<ActionResult<bool>> DeleteLoan([FromBody] LoanDto loanDto)
        {
            bool success = await _loanService.DeleteLoan(loanDto);
            string msg = success 
                         ? GetMessage(ResponseMessage.LoanDeleted) 
                         : GetMessage(ResponseMessage.DeleteLoanFailed);
            var result = success ? ExecutionResult.OK : ExecutionResult.Failed;

            _appInsights.TrackEvent(GetCurrentMethod(),
                                    CreateTrackProperties(result,
                                                          msg,
                                                          LOAN_ID,
                                                          loanDto == null ? "null" : loanDto.Id.ToString()));
            return Ok(success);
        }

        [HttpPut("DeleteAllMyLoans/{onlyDeliveredLoans:bool}")]
        public async Task<ActionResult<bool>> DeleteAllMyLoans(bool onlyDeliveredLoans)
        {
            var userId = User.GetAzureAadObjectId();
            bool success = await _loanService.DeleteLoansForUser(userId, onlyDeliveredLoans);
            string msg = success
                         ? GetMessage(ResponseMessage.AllUserLoansDeleted)
                         : GetMessage(ResponseMessage.DeleteAllUserLoansFailed);
            var result = success ? ExecutionResult.OK : ExecutionResult.Failed;
            _appInsights.TrackEvent(GetCurrentMethod(),
                                    CreateTrackProperties(result,
                                                          msg,
                                                          USER_ID,
                                                          userId.ToString()));
            return Ok(await _loanService.DeleteLoansForUser(userId, onlyDeliveredLoans));
        }
    }
}
