using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Backend.Dtos;

namespace Backend.Services.Interfaces
{
    public interface IBookWishService
    {
        Task<List<BookWishDto>> GetBookWishes();
        Task<BookWishDto> AddBookWish(BookWishDto bookWishDto);
        Task<BookWishDto> UpdateBookWish(BookWishDto bookWishDto);
        Task<bool> DeleteBookWish(BookWishDto bookWishDto);
        Task<bool> DeleteBookWishesForUser(string username);
        Task<List<BookWishDto>> DeleteVotesForUser(Guid userId);
    }
}
