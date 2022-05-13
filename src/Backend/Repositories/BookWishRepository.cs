using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Backend.Models;
using Backend.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Backend.Repositories
{
    public class BookWishRepository : IBookWishRepository
    {
        private readonly BouveteketContext _context;
        private readonly IUserRepository _userRepository;

        public BookWishRepository(BouveteketContext context, IUserRepository userRepository)
        {
            _context = context;
            _userRepository = userRepository;
        }
        public async Task<BookWish> AddBookWish(BookWish bookWish)
        {
            if (bookWish.Voters.Any())
            {
                var votersToAdd = new List<User>();
                foreach (var userVote in bookWish.Voters)
                {
                    var existingVoter = _userRepository.GetUserByGuid(userVote.Id);
                    votersToAdd.Add(existingVoter);
                }
                bookWish.Voters = votersToAdd;
                bookWish.Votes = votersToAdd.Count();
            }
            
            var bookWishEntity = await _context.BookWishes.AddAsync(bookWish);
            await _context.SaveChangesAsync();
            return bookWishEntity.Entity;
        }

        public async Task<bool> DeleteBookWish(BookWish bookWish)
        {
            try
            {
                var deletedBookWish = _context.BookWishes.Remove(bookWish);
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception)
            {
                return false;
            }
        }

        public async Task<List<BookWish>> GetAllBookWishes()
        {
            return await _context.BookWishes
                .Include(bw => bw.Voters)
                .ToListAsync();
        }

        public async Task<List<BookWish>> GetAllBookWishesForUser(string username)
        {
            var myBookWishes = await _context.BookWishes
                    .Where(bw => bw.Username == username)
                    .Include(bw => bw.Voters)
                    .ToListAsync();
            return myBookWishes;
        }

        public async Task<List<BookWish>> GetAllBookWishesWithVotesFromUser(User user)
        {
            var myBookWishVotes = await _context.BookWishes
                    .Include(bw => bw.Voters)
                    .Where(bw => bw.Voters.Contains(user))
                    .ToListAsync();
            return myBookWishVotes;
        }

        public async Task<bool> DeleteBookWishesForUser(string username)
        {
            try
            {
                var myBookWishes = await GetAllBookWishesForUser(username);

                _context.BookWishes.RemoveRange(myBookWishes);
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception)
            {
                return false;
            }
            
        }

        public BookWish GetBookWishWithVoters(int bookWishId)
        {
            return _context.BookWishes
                .Include(bw => bw.Voters)
                .SingleOrDefault(bw => bw.Id == bookWishId);
        }

        private bool _updateBookWishRunning = false;

        public async Task<BookWish> UpdateBookWish(BookWish updatedBookWish)
        {
            if (_updateBookWishRunning)
            {
                return null;
            }
            _updateBookWishRunning = true;

            try
            {
                if (updatedBookWish == null)
                {
                    return null;
                }
                var finalBookWish = GetBookWishWithVoters(updatedBookWish.Id);

                finalBookWish.Voters = updatedBookWish.Voters.ToList();
                finalBookWish.Votes = finalBookWish.Voters.Count();

                await _context.SaveChangesAsync();

                return GetBookWishWithVoters(finalBookWish.Id);
            }
            catch(Exception e)
            {
                Console.WriteLine(e.Message);
                return null;
            }
            finally
            {
                _updateBookWishRunning = false;
            }
        }

        public async Task<bool> DeleteVotesForUser(Guid userId)
        {
            try
            {
                var bookWishes = await GetAllBookWishes();
                bookWishes.ForEach(bookWish =>
                {
                    var existingVoters = bookWish.Voters.ToList();
                    var votersToRemove = existingVoters.RemoveAll(v => v.Id == userId);
                    if (votersToRemove == 1)
                    {
                        bookWish.Voters = existingVoters;
                        bookWish.Votes = existingVoters.Count();
                    }
                });
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
