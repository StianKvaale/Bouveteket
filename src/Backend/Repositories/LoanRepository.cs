using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Backend.Models;
using Backend.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Backend.Repositories
{
    public class LoanRepository : ILoanRepository
    {
        private readonly BouveteketContext _context;

        public LoanRepository(BouveteketContext context)
        {
            _context = context;
        }

        public async Task<Loan> AddLoan(Loan loan)
        {
            var loanEntity = await _context.Loans.AddAsync(loan);
            await _context.SaveChangesAsync();
            return loanEntity.Entity;
        }

        public async Task<List<Guid>> GetAllBorrowersFor(int bookId)
        {
            return await _context.Loans.Where(l => l.BookId == bookId && l.DateDelivered == null)?.Select(l => l.UserId).ToListAsync();
        }

        public async Task<List<Loan>> GetAllLoans()
        {
            return await _context.Loans.ToListAsync();
        }

        public async Task<List<Loan>> GetAllLoansForBook(int bookId, bool onlyActiveLoans = true)
        {
            var toReturn = await _context.Loans.Where(x => x.BookId == bookId && (!onlyActiveLoans || x.DateDelivered == null))?.ToListAsync();
            return toReturn;
        }

        public async Task<List<Loan>> GetAllLoansForBookAsync(int bookId, bool onlyActiveLoans = true)
        {
            return await _context.Loans.Where(x => x.BookId == bookId && (!onlyActiveLoans || x.DateDelivered == null)).ToListAsync();
        }

        public async Task<List<Loan>> GetAllLoansForUser(Guid userId, bool onlyActiveLoans = true)
        {
            return await _context.Loans.Where(x => x.UserId == userId && (!onlyActiveLoans || x.DateDelivered == null))?.ToListAsync();
        }

        public async Task<List<Loan>> GetAllLoansForUserAsync(Guid userId, bool onlyActiveLoans = true)
        {
            return await _context.Loans.Where(x => x.UserId == userId && (!onlyActiveLoans || x.DateDelivered == null)).ToListAsync();
        }

        public int GetAmountOfActiveLoansForBook(int bookId)
        {
            return _context.Loans.Count(l => (l.BookId == bookId && l.DateDelivered == null));
        }

        public async Task<Loan> GetLoan(Guid userId, int bookId, int? loanId)
        {
            return await _context.Loans.FirstOrDefaultAsync(l => l.BookId == bookId && l.UserId == userId && (loanId.HasValue ? l.Id == loanId.Value : l.DateDelivered == null));
        }

        /// <summary>
        /// Tries to update an existing Loan
        /// </summary>
        /// <param name="newLoan">
        /// The new data for the Loan
        /// </param>
        /// <returns>
        /// If no existing Loan found: null
        /// Else if existing Loan found: 
        ///     If loan is returned: null
        ///     Else If loan is not yet returned: The existing Loan
        /// </returns>
        public async Task<Loan> UpdateLoan(Loan newLoan)
        {
            var existing = _context.Loans.FirstOrDefault(l =>  l.Id == newLoan.Id);
            if (existing == null)
            {
                return null;
            }

            _context.Entry(existing).CurrentValues.SetValues(newLoan);
            await _context.SaveChangesAsync();
            return await GetLoan(existing.UserId, existing.BookId, existing.Id);
        }

        public async Task<bool> DeleteLoan(Loan loan)
        {
            try
            {
                var deletedLoan = _context.Loans.Remove(loan);
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception)
            {
                return false; 
            }
        }

        public async Task<bool> DeleteLoansForUser(Guid userId, bool onlyDeliveredLoans)
        {
            try
            {
                var loansToRemove = new List<Loan>();
                if (onlyDeliveredLoans)
                {
                    loansToRemove = await _context.Loans
                        .Where(l => l.UserId == userId && l.DateDelivered != null)
                        .ToListAsync();
                }
                else
                {
                    loansToRemove = await _context.Loans
                        .Where(l => l.UserId == userId)
                        .ToListAsync();
                }
                 
                _context.Loans.RemoveRange(loansToRemove);
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception)
            {
                return false;
            }
        }
    }
}
