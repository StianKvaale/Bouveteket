using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Backend.Models;
using Backend.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Backend.Repositories
{
    public class OwnershipRepository : IOwnershipRepository
    {
        private readonly BouveteketContext _context;

        public OwnershipRepository(BouveteketContext context)
        {
            _context = context;
        }

        public async Task<Ownership> AddOwnership(Ownership ownership)
        {
            if (!ValidOwnership(ownership))
            {
                return null;
            }

            try
            {
                var ownershipEntity = await _context.Ownerships.AddAsync(ownership);
                await _context.SaveChangesAsync();
                return ownershipEntity.Entity;
            }
            catch
            {
                return null;
            }
        }

        public async Task<List<Ownership>> GetBookOwnerships(int bookId)
        {
            return await _context.Ownerships.Where(o => o.BookId == bookId).ToListAsync();
        }

        public async Task<List<Ownership>> GetUserOwnerships(Guid userId)
        {
            return await _context.Ownerships.Where(o => o.UserId == userId).ToListAsync();
        }

        public Ownership GetOwnershipToBook(Guid userId, int bookId)
        {
            return _context.Ownerships.FirstOrDefault(o => o.BookId == bookId && o.UserId == userId);
        }

        public async Task<Ownership> UpdateOwnership(Ownership existingOwnership, Ownership updatedOwnership)
        {
            _context.Entry(existingOwnership).CurrentValues.SetValues(updatedOwnership);
            await _context.SaveChangesAsync();
            return updatedOwnership;
        }

        public async Task<Ownership> RemoveOwnership(Ownership ownership)
        {
            if (!ValidOwnership(ownership))
            {
                return null;
            }

            try
            {
                var ownershipEntity = _context.Ownerships.Remove(ownership);
                await _context.SaveChangesAsync();
                return ownership;
            }
            catch
            {
                return null;
            }
        }

        public async Task<Ownership> RemoveOwnershipBy(Guid userId, int bookId)
        {
            if (bookId <= 0)
            {
                return null;
            }

            try
            {
                var ownership = await _context.Ownerships.FirstOrDefaultAsync(o => o.UserId == userId && o.BookId == bookId);
                if (ownership == null || ownership.Id <= 0)
                {
                    return null;
                }

                return await RemoveOwnership(ownership);
            }
            catch
            {
                return null;
            }
        }

        internal static bool ValidOwnership(Ownership ownership)
        {
            return ownership != null
                && ownership.BookId > 0
                && ownership.Quantity > 0;
        }
    }
}
