using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Backend.Models;
using Backend.Repositories.Interfaces;
using Backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Backend.Repositories
{
    public class BookRepository : IBookRepository
    {
        private readonly BouveteketContext _context;
        private readonly IAuthorService _authorService;
        private readonly ICategoryService _categoryService;
        private readonly ILoanRepository _loanRepository;
        private readonly IOwnershipRepository _ownershipRepository;

        public BookRepository(BouveteketContext context, IAuthorService authorService, ICategoryService categoryService, ILoanRepository loanRepository, IOwnershipRepository ownershipRepository)
        {
            _context = context;
            _authorService = authorService;
            _categoryService = categoryService;
            _loanRepository = loanRepository;
            _ownershipRepository = ownershipRepository;
        }

        public async Task<Book> AddBook(Book book)
        {
            if (book.Authors.Any())
            {
                var authorsToAdd = new List<Author>();
                foreach (var author in book.Authors)
                {
                    var existingAuthor = _context.Authors.FirstOrDefault(a => a.Name.ToLower() == author.Name.ToLower());
                    authorsToAdd.Add(existingAuthor ?? author);
                }
                book.Authors = authorsToAdd;
            }

            if (book.Categories.Any())
            {
                var categoriesToAdd = new List<Category>();
                foreach (var category in book.Categories)
                {
                    var existingCategory = _context.Categories.FirstOrDefault(c => c.Title.ToLower() == category.Title.ToLower());
                    categoriesToAdd.Add(existingCategory ?? category);
                }
                book.Categories = categoriesToAdd;
            }

            var bookEntity = await _context.Books.AddAsync(book);
            await _context.SaveChangesAsync();
            return bookEntity.Entity;
        }

        public async Task<List<Book>> GetAllBooks()
        {
            try
            {
                return await _context.Books
                    .Include(b => b.Authors)
                    .Include(b => b.Categories)
                    .Include(b => b.BookReviews)
                    .ToListAsync();
            }
            catch
            {
                return null;
            }
        }

        public Book GetBook(int id)
        {
            return _context.Books
                .Include(b => b.Authors)
                .Include(b => b.Categories)
                .Include(b => b.BookReviews)
                .SingleOrDefault(b => b.Id == id);
        }

        public Book GetBookIncludeBookReview(int id)
        {
            return _context.Books
                .Include(b => b.BookReviews)
                .SingleOrDefault(b => b.Id == id);
        }

        public Book GetBookWithAuthorsAndCategories(int id)
        {
            return _context.Books
                .Include(b => b.Authors)
                .Include(b => b.Categories)
                .Include(b => b.BookReviews)
                .SingleOrDefault(b => b.Id == id);
        }

        public async Task<List<Book>> GetMyBooks(Guid userId)
        {
            return await _context.Books
                .Include(b => b.Authors)
                .Include(b => b.Categories)
                .Include(b => b.BookReviews)
                .Where(b => _context.Ownerships.Any(o => o.BookId == b.Id && o.UserId == userId))
                .ToListAsync();
        }

        public async Task<List<Book>> GetBooksWithReviewsFromUser(Guid userId)
        {
            return await _context.Books
                .Include(b => b.BookReviews)
                .Where(b => b.BookReviews.Any(br => br.UserId == userId))
                .ToListAsync();
        }

        public async Task<Book> UpdateBook(Book existingBook, Book updatedBook)
        {
            _context.Entry(existingBook).CurrentValues.SetValues(updatedBook);

            // Apply changes on books' Authors to DB
            existingBook.Authors = await _authorService.GetUpdatedAuthors(existingBook, updatedBook);
            // Apply changes on books' Categories to DB
            existingBook.Categories = await _categoryService.GetUpdatedCategories(existingBook, updatedBook);

            await _context.SaveChangesAsync();
            return _context.Books
                .Include(b => b.Authors)
                .Include(b => b.Categories)
                .Include(b => b.BookReviews)
                .SingleOrDefault(b => b.Id == existingBook.Id);
        }

        public async Task<bool> RemoveAllMyOwnedBooks(Guid userId, bool isDonation)
        {
            try
            {
                var myBooks = await GetMyBooks(userId);
                var ownershipsToRemove = new List<Ownership>();

                foreach (var book in myBooks)
                {
                    var ownership = _ownershipRepository.GetOwnershipToBook(userId, book.Id);
                    if (book != null && book.Active && ownership != null && ownership.Quantity > 0)
                    {
                        if (!isDonation)
                        {
                            var activeLoans = await _loanRepository.GetAllLoansForBookAsync(book.Id, true);
                            if (activeLoans == null || (book.Quantity - activeLoans.Count >= ownership.Quantity))
                            {
                                ownershipsToRemove.Add(ownership);
                                var newQty = book.Quantity - ownership.Quantity;
                                book.Quantity = (newQty <= 0 ? 0 : newQty);
                                if (book.Quantity == 0)
                                {
                                    book.Active = false;
                                }
                            }
                        }
                        else
                        {
                            ownershipsToRemove.Add(ownership);
                        }
                    }
                }

                _context.Ownerships.RemoveRange(ownershipsToRemove);

                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception)
            {
                return false;
            }
        }

        public async Task<bool> DeleteBookReviewsForUser(Guid userId)
        {
            try
            {
                var booksWithMyReviews = await GetBooksWithReviewsFromUser(userId);
                booksWithMyReviews.ForEach(book =>
                {
                    var existingReviews = book.BookReviews.ToList();
                    int reviewsToRemove = existingReviews.RemoveAll(br => br.UserId == userId);
                    if (reviewsToRemove >= 1)
                    {
                        book.BookReviews = existingReviews;
                        var ratingTuple = CalculateRating(book.BookReviews);
                        book.RatingCount = ratingTuple.Item2;
                        book.Rating = book.RatingCount == 0 ? null : ratingTuple.Item1;
                    }
                });
                await _context.SaveChangesAsync();

                return true;
            }
            catch (Exception)
            {
                return false;
            }
        }

        public Tuple<float, int> CalculateRating(IEnumerable<BookReview> bookReviews)
        {
            var totalRating = 0.0f;
            var rating = 0.0f;
            var ratingCount = 0;
            foreach (var review in bookReviews)
            {
                if (review.Rating != null)
                {
                    totalRating = totalRating + review.Rating ?? 0;
                    ratingCount++;
                }
            }
            if (ratingCount > 0)
            {
                var averageRating = totalRating / ratingCount;
                rating = (float)Math.Round(averageRating * 2, MidpointRounding.AwayFromZero) / 2;
            }
            return new Tuple<float, int>(rating, ratingCount);
        }
    }
}