using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Backend.Models;

namespace Backend.Repositories.Interfaces
{
    public interface ILoanRepository
    {
        Task<Loan> AddLoan(Loan loan);
        Task<List<Guid>> GetAllBorrowersFor(int bookId);
        Task<List<Loan>> GetAllLoans();
        Task<List<Loan>> GetAllLoansForBook(int bookId, bool onlyActiveLoans = true);
        Task<List<Loan>> GetAllLoansForBookAsync(int bookId, bool onlyActiveLoans = true);
        Task<List<Loan>> GetAllLoansForUser(Guid userId, bool onlyActiveLoans = true);
        Task<List<Loan>> GetAllLoansForUserAsync(Guid userId, bool onlyActiveLoans = true);
        int GetAmountOfActiveLoansForBook(int bookId);
        Task<Loan> GetLoan(Guid userId, int bookId, int? loanId);
        Task<Loan> UpdateLoan(Loan newLoan);
        Task<bool> DeleteLoan(Loan loan);
        Task<bool> DeleteLoansForUser(Guid userId, bool onlyDeliveredLoans);
    }
}
