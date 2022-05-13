using System.Collections.Generic;
using System.Threading.Tasks;
using Backend.Models;
using Microsoft.EntityFrameworkCore.ChangeTracking;

namespace Backend.Repositories.Interfaces
{
    public interface IAuthorRepository
    {
        Task<List<Author>> GetAllAuthors();

        Task<EntityEntry<Author>> AddAuthor(Author author);

        Author GetAuthor(int id);

        Task<bool> UpdateAuthor(Author author);

        Task<bool> DeleteAuthor(int id);
        Author GetAuthorByName(string name);
        Author GetAuthorByIdWithBooks(int id);
    }
}