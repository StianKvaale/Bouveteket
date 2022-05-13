using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Backend.Models;

namespace Backend.Repositories.Interfaces
{
    public interface IOwnershipRepository
    {
        Task<List<Ownership>> GetBookOwnerships(int bookId);
        Task<List<Ownership>> GetUserOwnerships(Guid userId); 
        Ownership GetOwnershipToBook(Guid userId, int bookId);
        Task<Ownership> AddOwnership(Ownership ownership);
        Task<Ownership> UpdateOwnership(Ownership existing, Ownership updatedship);
        Task<Ownership> RemoveOwnership(Ownership ownership);
        Task<Ownership> RemoveOwnershipBy(Guid userId, int bookId);
    }
}
