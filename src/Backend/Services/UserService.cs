using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Backend.Models;
using Backend.Repositories.Interfaces;
using Backend.Services.Interfaces;

namespace Backend.Services
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;
        private readonly IOwnershipRepository _ownershipRepository;
        private readonly ILoanRepository _loanRepository;
        private readonly IBookRepository _bookRepository;
        private readonly IBookWishRepository _bookWishRepository;

        public UserService(IUserRepository userRepository, IBookWishRepository bookWishRepository, ILoanRepository loanRepository, IOwnershipRepository ownershipRepository, IBookRepository bookRepository)
        {
            _userRepository = userRepository;
            _bookRepository = bookRepository;
            _loanRepository = loanRepository;
            _ownershipRepository = ownershipRepository;
            _bookWishRepository = bookWishRepository;
        }

        public User GetUser(Guid userId)
        {
            return _userRepository.GetUserByGuid(userId);
        }

        public List<User> GetUsers(IEnumerable<Guid> userIds)
        {
            return _userRepository.GetUsersByGuids(userIds);
        }

        public async Task<User> SaveUser(User user)
        {
            var existingUser = _userRepository.GetUserByGuid(user.Id);
            if (existingUser == null)
            {
                return await _userRepository.AddUser(user);
            }

            if (!existingUser.Equals(user))
            {
                return await _userRepository.UpdateUser(existingUser, user);
            }

            return existingUser;
        }

        public async Task<User> AddUserIfNotExists(User user)
        {
            var existingUser = _userRepository.GetUserByGuid(user.Id);
            if (existingUser == null)
            {
                return await _userRepository.AddUser(user);
            }

            return existingUser;
        }

        public async Task<bool> DeleteUser(Guid userId, string username)
        {
            var existingUser = _userRepository.GetUserByGuid(userId);
            if (existingUser == null)
            {
                return true;
            }
            var myBooks = await _ownershipRepository.GetUserOwnerships(userId);
            var myLoans = await _loanRepository.GetAllLoansForUserAsync(userId, false);
            var myWishes = await _bookWishRepository.GetAllBookWishesForUser(username);
            var myWishVotes = await _bookWishRepository.GetAllBookWishesWithVotesFromUser(existingUser);
            var myBookReviews = await _bookRepository.GetBooksWithReviewsFromUser(userId);

            if (myBooks == null || myBooks.Count() > 0
                || myLoans == null || myLoans.Count() > 0
                || myWishes == null || myWishes.Count() > 0
                || myWishVotes == null || myWishVotes.Count() > 0
                || myBookReviews == null || myBookReviews.Count() > 0)
            {
                return false;
            }
            return await _userRepository.DeleteUser(existingUser);
        }
    }
}