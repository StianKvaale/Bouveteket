using System.Collections.Generic;
using System.Threading.Tasks;
using Backend.Dtos;
using Backend.Models;

namespace Backend.Services.Interfaces
{
    public interface IAuthorService
    {
        Task<List<AuthorDto>> GetAuthors();
        Task<List<Author>> GetUpdatedAuthors(Book existingBook, Book updatedBook);
    }
}
