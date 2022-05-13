using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Backend.Models;
using Backend.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;

namespace Backend.Repositories
{

    public class AuthorRepository : IAuthorRepository
    {
        private readonly BouveteketContext _context;

        public AuthorRepository(BouveteketContext context)
        {
            _context = context;
        }

        public async Task<List<Author>> GetAllAuthors()
        {
            var authors = await _context.Authors.ToListAsync();
            return authors;
        }

        public async Task<EntityEntry<Author>> AddAuthor(Author author)
        {
            var authorEntity = await _context.Authors.AddAsync(author);
            await _context.SaveChangesAsync();
            return authorEntity;
        }

        public Author GetAuthor(int id)
        {
            try
            {
                return _context.Authors.Single(x => x.Id == id);
            }
            catch (Exception)
            {
                return null;
            }
        }

        public Author GetAuthorByIdWithBooks(int id)
        {
            return _context.Authors
                .Include(b => b.Books)
                .FirstOrDefault(a => a.Id == id);
        }

        public Author GetAuthorByName(string name)
        {
            return _context.Authors.FirstOrDefault(a => a.Name.ToLower() == name.ToLower());
        }

        public async Task<bool> UpdateAuthor(Author author)
        {
            var authorEntity = _context.Authors.Single(x => x.Id == author.Id);

            if (authorEntity == null) return false;

            authorEntity.Name = author.Name;
            authorEntity.Books = author.Books;

            var hasUpdatedAuthor = 0 < await _context.SaveChangesAsync();
            return hasUpdatedAuthor;
        }

        public async Task<bool> DeleteAuthor(int id)
        {
            var author = await _context.Authors.SingleOrDefaultAsync(x => x.Id == id);
            _context.Authors.Remove(author);
            return (await _context.SaveChangesAsync()) == 1;
        }
    }
}