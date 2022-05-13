using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Backend.Models;

namespace Backend.Repositories.Interfaces
{
    public interface IUserRepository
    {
        Task<User> UpdateUser(User user, User updatedUser);
        User GetUserByGuid(Guid userId);
        List<User> GetUsersByGuids(IEnumerable<Guid> userIds);
        Task<User> AddUser(User user);
        Task<bool> DeleteUser(User user);
    }
}
