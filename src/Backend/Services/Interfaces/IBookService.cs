using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Backend.Dtos;
using Backend.Models;

namespace Backend.Services.Interfaces
{
    public interface IBookService
    {
        Task<BookDto> GetBook(int bookId);
        Task<BookDto> GetBookWithOwners(int bookId);
        Task<List<BookDto>> GetBooks();
        Task<BookDto> AddBook(BookDto bookDto, Guid userId, string username);
        Task<BookDto> DonateOwnedBookToLibrary(int id, Guid userId);
        Task<BookDto> RemoveOwnedBookFromLibrary(int id, Guid userId);
        Task<bool> RemoveAllMyOwnedBooksFromLibrary(Guid userId, bool isDonation);
        Task<BookReview> AddBookReviewOnBook(BookReview bookReview);
        Task<bool> DeleteBookReviewFromBook(BookReview bookReview);
        Task<bool> DeleteBookReviewsForUser(Guid userId);
    }
}
