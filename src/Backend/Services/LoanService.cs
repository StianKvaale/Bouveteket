using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Backend.Dtos;
using Backend.Models;
using Backend.Repositories.Interfaces;
using Backend.Services.Interfaces;
using static Backend.Utilities.Helpers;

namespace Backend.Services
{
    public class LoanService : ILoanService
    {
        private readonly ILoanRepository _loanRepository;
        private readonly IBookService _bookService;
        private readonly IUserService _userService;

        public LoanService(ILoanRepository loanRepository, IBookService bookService, IUserService userService)
        {
            _loanRepository = loanRepository;
            _bookService = bookService;
            _userService = userService;
        }

        public async Task<LoanDto> BorrowBook(Guid userId, int bookId, string username)
        {
            var bDto = await _bookService.GetBook(bookId);
            if (bDto == null)
            {
                return null;
            }
            
            var user = await _userService.AddUserIfNotExists(new User() {Id = userId, Username = username});
            if(CanBorrowDto(bDto.ActiveLoans, user.Id))
            {
                await _loanRepository.AddLoan(new Loan
                {
                    UserId = user.Id,
                    BookId = bookId,
                    DateBorrowed = DateTime.UtcNow.ToLocalTime()
                });
            }
            return LoanAsDto(await _loanRepository.GetLoan(user.Id, bookId, null));
        }

        public async Task<LoanDto> ReturnBook(Guid userId, int bookId)
        {
            if (await _bookService.GetBook(bookId) == null)
            {
                return null;
            }

            var activeLoan = await _loanRepository.GetLoan(userId, bookId, null);
            if (activeLoan == null)
            {
                return null;
            }

            var dateTimeNow = DateTime.UtcNow.ToLocalTime();
            activeLoan.DateDelivered = dateTimeNow;

            var toReturn = await _loanRepository.UpdateLoan(activeLoan);

            return LoanAsDto(toReturn);
        }

        public async Task<List<LoanDto>> GetAllLoans()
        {
            return LoansAsDtos(await _loanRepository.GetAllLoans());
        }

        public async Task<List<LoanDto>> GetAllLoansForUser(Guid userId, bool onlyActiveLoans)
        {
            return LoansAsDtos(await _loanRepository.GetAllLoansForUserAsync(userId, onlyActiveLoans));
        }

        public async Task<List<Guid>> GetBorrowersFor(int bookId)
        {
            return await _loanRepository.GetAllBorrowersFor(bookId);
        }

        public async Task<bool> DeleteLoan(LoanDto loanDto)
        {
            if (loanDto == null)
            {
                return false;
            }
            Loan loan = await _loanRepository.GetLoan(loanDto.UserId, loanDto.BookId, loanDto.Id);
            if (loan == null)
            {
                return false;
            }
            return await _loanRepository.DeleteLoan(loan);
        }

        public async Task<bool> DeleteLoansForUser(Guid userId, bool onlyDeliveredLoans)
        {
            if (userId == Guid.Empty)
            {
                return false;
            }
            var loansDeleted = await _loanRepository.DeleteLoansForUser(userId, onlyDeliveredLoans);
            return loansDeleted;
        }
    }
}
