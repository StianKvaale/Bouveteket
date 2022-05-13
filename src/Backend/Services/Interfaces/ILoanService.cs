using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Backend.Dtos;

namespace Backend.Services.Interfaces
{
    public interface ILoanService
    {
        Task<LoanDto> BorrowBook(Guid userId, int bookId, string username);
        Task<LoanDto> ReturnBook(Guid userId, int bookId);
        Task<List<LoanDto>> GetAllLoans();
        Task<List<LoanDto>> GetAllLoansForUser(Guid userId, bool onlyActiveLoans);
        Task<List<Guid>> GetBorrowersFor(int bookId);
        Task<bool> DeleteLoan(LoanDto loanDto);
        Task<bool> DeleteLoansForUser(Guid userId, bool onlyDeliveredLoans);
    }
}
