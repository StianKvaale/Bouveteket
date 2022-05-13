using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Backend.Models;

namespace Backend.Services.Interfaces
{
    public interface IUserService
    {
        Task<User> SaveUser(User user);
        User GetUser(Guid userId);
        List<User> GetUsers(IEnumerable<Guid> userIds);
        Task<User> AddUserIfNotExists(User user);
        Task<bool> DeleteUser(Guid userId, string username);
    }
}