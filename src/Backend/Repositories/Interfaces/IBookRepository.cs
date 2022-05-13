using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Backend.Models;

namespace Backend.Repositories.Interfaces
{
    public interface IBookRepository
    {
        Task<List<Book>> GetAllBooks();
        Task<List<Book>> GetMyBooks(Guid userId);
        Task<List<Book>> GetBooksWithReviewsFromUser(Guid userId);
        Task<Book> AddBook(Book book);
        Book GetBook(int id);
        Task<Book> UpdateBook(Book existingBook, Book updatedBook);
        Task<bool> RemoveAllMyOwnedBooks(Guid userId, bool isDonation);
        Book GetBookWithAuthorsAndCategories(int bookId);
        Book GetBookIncludeBookReview(int id);
        Task<bool> DeleteBookReviewsForUser(Guid userId);
        Tuple<float, int> CalculateRating(IEnumerable<BookReview> bookReviews);
    }
}