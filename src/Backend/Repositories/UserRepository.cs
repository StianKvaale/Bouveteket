using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Backend.Models;
using Backend.Repositories.Interfaces;

namespace Backend.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly BouveteketContext _context;

        public UserRepository(BouveteketContext context)
        {
            _context = context;
        }

        public async Task<User> AddUser(User user)
        {
            var userEntity = await _context.Users.AddAsync(user);
            await _context.SaveChangesAsync();
            return userEntity.Entity;
        }

        public async Task<User> UpdateUser(User user, User updatedUser)
        {
            _context.Entry(user).CurrentValues.SetValues(updatedUser);
            await _context.SaveChangesAsync();
            return updatedUser;
        }

        public async Task<bool> DeleteUser(User user)
        {
            try
            {
                var deletedUser = _context.Users.Remove(user);
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception)
            {
                return false;
            }
        }

        public User GetUserByGuid(Guid userId)
        {
            return _context.Users.SingleOrDefault(x => x.Id == userId);
        }

        public List<User> GetUsersByGuids(IEnumerable<Guid> userIds)
        {
            if(userIds == null)
            {
                return null;
            }
            return _context.Users.Where(u => userIds.Contains(u.Id)).ToList();
        }
    }
}
