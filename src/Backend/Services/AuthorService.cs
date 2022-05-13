using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Backend.Dtos;
using Backend.Models;
using Backend.Repositories.Interfaces;
using Backend.Services.Interfaces;

namespace Backend.Services
{
    public class AuthorService : IAuthorService
    {
        private readonly IAuthorRepository _authorRepository;

        public AuthorService(IAuthorRepository authorRepository)
        {
            _authorRepository = authorRepository;
        }

        public async Task<List<AuthorDto>> GetAuthors()
        {
            var authors = await _authorRepository.GetAllAuthors();
            if (authors != null && authors.Any())
                return authors.Select(author => new AuthorDto() { Name = author.Name }).ToList();

            return new List<AuthorDto>();
        }

        public async Task<List<Author>> GetUpdatedAuthors(Book existingBook, Book updatedBook)
        {
            var currentBookAuthors = existingBook.Authors.ToList();
            var authorsToAdd = updatedBook.Authors.Except(existingBook.Authors, new Author()).ToList();
            var authorsToRemove = existingBook.Authors.Except(updatedBook.Authors, new Author()).ToList();

            foreach (var outdatedAuthor in authorsToRemove)
            {
                currentBookAuthors.Remove(outdatedAuthor);
                await RemoveAuthorIfNoBooks(outdatedAuthor);
            }

            foreach (var newAuthor in authorsToAdd)
            {
                var existingAuthor = _authorRepository.GetAuthorByName(newAuthor.Name);
                currentBookAuthors.Add(existingAuthor ?? newAuthor);
            }

            return currentBookAuthors;
        }

        private async Task RemoveAuthorIfNoBooks(Author author)
        {
            var existingAuthor = _authorRepository.GetAuthorByIdWithBooks(author.Id);
            if (existingAuthor != null && existingAuthor.Books.ToList().Count <= 1)
            {
                await _authorRepository.DeleteAuthor(existingAuthor.Id);
            }
        }
    }
}
