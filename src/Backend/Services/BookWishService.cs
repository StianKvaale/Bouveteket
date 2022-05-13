using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Backend.Dtos;
using Backend.Models;
using Backend.Repositories.Interfaces;
using Backend.Services.Interfaces;

namespace Backend.Services
{
    public class BookWishService : IBookWishService
    {
        private readonly IBookWishRepository _bookWishRepository;
        private readonly IUserService _userService;

        public BookWishService(IBookWishRepository bookWishRepository, IUserService userService)
        {
            _bookWishRepository = bookWishRepository;
            _userService = userService;
        }
        public async Task<BookWishDto> AddBookWish(BookWishDto bookWishDto)
        {
            if (bookWishDto == null)
            {
                return null;
            }
            BookWish addedBookWish = await _bookWishRepository.AddBookWish(DtoAsBookWish(bookWishDto));
            return BookWishAsDto(addedBookWish);
        }

        public async Task<bool> DeleteBookWish(BookWishDto bookWishDto)
        {
            if (bookWishDto == null)
            {
                return false;
            }
            var bookWishDeleted = await _bookWishRepository.DeleteBookWish(DtoAsBookWish(bookWishDto));
            return bookWishDeleted;
        }

        public async Task<List<BookWishDto>> GetBookWishes()
        {
            var bookWishes = await _bookWishRepository.GetAllBookWishes();

            var bookWishDtos = new List<BookWishDto>();
            bookWishes.ForEach(bookWish => {
                bookWishDtos.Add(BookWishAsDto(bookWish));
            });
            return bookWishDtos;
        }

        public async Task<bool> DeleteBookWishesForUser(string username)
        {
            var bookWishesDeleted = await _bookWishRepository.DeleteBookWishesForUser(username);
            return bookWishesDeleted;
        }

        public async Task<BookWishDto> UpdateBookWish(BookWishDto bookWishDto)
        {
            if (bookWishDto == null)
            {
                return null;
            }
            BookWish updatedBookWish = DtoAsBookWish(bookWishDto);
            BookWish finalBookWish = await _bookWishRepository.UpdateBookWish(updatedBookWish);
            
            return BookWishAsDto(finalBookWish);
        }

        public async Task<List<BookWishDto>> DeleteVotesForUser(Guid userId)
        {
            var votesDeleted = await _bookWishRepository.DeleteVotesForUser(userId);
            if (votesDeleted)
            {
                return await GetBookWishes();
            }
            return null;
        }

        private BookWishDto BookWishAsDto(BookWish bookWish)
        {
            if (bookWish == null)
            {
                return null;
            }
            return new BookWishDto
            {
                Id = bookWish.Id,
                Title = bookWish.Title,
                Authors = bookWish.Authors,
                Comment = bookWish.Comment,
                Username = bookWish.Username,
                Votes = bookWish.Votes,
                Voters = bookWish.Voters.Select(user => user.Id).ToList()
            };
        }

        private BookWish DtoAsBookWish(BookWishDto bookWishDto)
        {
            if (bookWishDto == null)
            {
                return null;
            }
            return new BookWish
            {
                Id = bookWishDto.Id,
                Title = bookWishDto.Title,
                Authors = bookWishDto.Authors,
                Comment = bookWishDto.Comment,
                Username = bookWishDto.Username,
                Votes = bookWishDto.Votes,
                Voters = _userService.GetUsers(bookWishDto.Voters)
            };
        }
    }
}
