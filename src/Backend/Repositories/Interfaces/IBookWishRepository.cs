using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Backend.Models;

namespace Backend.Repositories.Interfaces
{
    public interface IBookWishRepository
    {
        Task<List<BookWish>> GetAllBookWishes();
        Task<List<BookWish>> GetAllBookWishesForUser(string username);
        Task<List<BookWish>> GetAllBookWishesWithVotesFromUser(User user);
        Task<BookWish> AddBookWish(BookWish bookWish);
        Task<BookWish> UpdateBookWish(BookWish updatedBookWish);
        Task<bool> DeleteBookWish(BookWish bookWish);
        Task<bool> DeleteBookWishesForUser(string username);
        BookWish GetBookWishWithVoters(int bookWishId);
        Task<bool> DeleteVotesForUser(Guid userId);
    }
}
