using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Backend.Dtos;
using Backend.Models;
using Backend.Repositories.Interfaces;
using Backend.Services.Interfaces;
using static Backend.Utilities.Helpers;

namespace Backend.Services
{
    public class BookService : IBookService
    {
        private readonly IBookRepository _bookRepository;
        private readonly IBlobStorageService _blobStorageService;
        private readonly ILoanRepository _loanRepository;
        private readonly IUserService _userService;
        private readonly IOwnershipRepository _ownershipRepository;

        public BookService(IBookRepository bookRepository, ILoanRepository loanRepository, IBlobStorageService blobStorageService, IUserService userService, IOwnershipRepository ownershipRepository)
        {
            _bookRepository = bookRepository;
            _loanRepository = loanRepository;
            _blobStorageService = blobStorageService;
            _userService = userService;
            _ownershipRepository = ownershipRepository;
        }

        public async Task<BookDto> GetBook(int bookId)
        {
            var toReturn = await GetBookWithOwners(bookId);
            if(toReturn == null)
            {
                return null;
            }

            toReturn.ActiveLoans = await GetLoansDtosForBook(toReturn.Id, true);
            toReturn.AvailableQuantity = GetAvailableQuantityDto(toReturn.Quantity, toReturn.ActiveLoans);
            return toReturn;
        }

        public async Task<BookDto> GetBookWithOwners(int bookId)
        {
            var toReturn = BookAsDto(_bookRepository.GetBook(bookId));
            toReturn.Owners = OwnershipsAsDtos(await _ownershipRepository.GetBookOwnerships(toReturn.Id));
            return toReturn;
        }

        public async Task<List<BookDto>> GetBooks()
        {
            return await GetAllBooks(null);
        }

        public async Task<List<BookDto>> GetMyBooks(Guid userId)
        {
            return await GetAllBooks(userId);
        }

        private async Task<List<BookDto>> GetAllBooks(Guid? ownerId)
        {
            var books = await (ownerId.HasValue ? _bookRepository.GetMyBooks(ownerId.Value) : _bookRepository.GetAllBooks());
            var bookDtos = new List<BookDto>();

            foreach (var b in books)
            {
                var bD = BookAsDto(b);
                var ownerships = await _ownershipRepository.GetBookOwnerships(b.Id);
                bD.Owners = OwnershipsAsDtos(ownerships);
                bD.ActiveLoans = await GetLoansDtosForBookAsync(b.Id);
                bD.AvailableQuantity = GetAvailableQuantityDto(bD.Quantity, bD.ActiveLoans);
                bookDtos.Add(bD);
            }
            return bookDtos;
        }

        public async Task<BookDto> AddBook(BookDto bookDto, Guid userId, string username)
        {
            if (bookDto == null)
            {
                return null;
            }

            var existingBook = _bookRepository.GetBookWithAuthorsAndCategories(bookDto.Id);

            if (existingBook == null || string.IsNullOrWhiteSpace(existingBook.Title))
            {
                return await AddNewBook(bookDto, userId, username);
            }
            return await UpdateExistingBook(bookDto, userId, username);
        }

        private async Task<List<LoanDto>> GetLoansDtosForBook(int? bookId, bool onlyActiveLoans = true)
        {
            if (!bookId.HasValue)
            {
                return null;
            }
            return LoansAsDtos(await _loanRepository.GetAllLoansForBook(bookId.Value, onlyActiveLoans));
        }

        private async Task<List<LoanDto>> GetLoansDtosForBookAsync(int? bookId, bool onlyActiveLoans = true)
        {
            if (!bookId.HasValue)
            {
                return null;
            }
            return LoansAsDtos(await _loanRepository.GetAllLoansForBookAsync(bookId.Value, onlyActiveLoans));
        }

        private async Task<BookDto> AddNewBook(BookDto bookDto, Guid userId, string username)
        {
            Book bookToAdd = DtoAsBook(bookDto);
            User user = await _userService.AddUserIfNotExists(new User() { Id = userId, Username = username });

            bookToAdd.DateAdded = DateTime.UtcNow.ToLocalTime();
            bookToAdd.Active = true;

            if (!string.IsNullOrEmpty(bookDto.ImageUrl))
            {
                bool validUri = Uri.TryCreate(bookDto.ImageUrl, UriKind.Absolute, out var uriResult) && (uriResult.Scheme == Uri.UriSchemeHttp || uriResult.Scheme == Uri.UriSchemeHttps);
                if (!validUri)
                {
                    bookToAdd.ImageUrl = await _blobStorageService.UploadImageToBlobIfBase64(bookDto.ImageUrl, bookDto.Title);
                }
            }

            Book addedBook = await _bookRepository.AddBook(bookToAdd);

            if (bookDto.Owners != null && bookDto.Owners.Any(x => x.UserId == userId))
            {
                await _ownershipRepository.AddOwnership(new Ownership
                {
                    UserId = user.Id,
                    BookId = addedBook.Id,
                    Quantity = addedBook.Quantity
                });
            }

            BookDto toReturn = BookAsDto(addedBook);

            toReturn.Owners = OwnershipsAsDtos(await _ownershipRepository.GetBookOwnerships(toReturn.Id));
            toReturn.ActiveLoans = LoansAsDtos(await _loanRepository.GetAllLoansForBookAsync(toReturn.Id, true));
            toReturn.AvailableQuantity = GetAvailableQuantityDto(toReturn.Quantity, toReturn.ActiveLoans);

            return toReturn;
        }

        public async Task<BookDto> DonateOwnedBookToLibrary(int id, Guid userId)
        {
            return await RemoveMyOwnedBook(id, userId, true);
        }

        public async Task<BookDto> RemoveOwnedBookFromLibrary(int id, Guid userId)
        {
            return await RemoveMyOwnedBook(id, userId, false);
        }

        private async Task<BookDto> UpdateExistingBook(BookDto newData, Guid userId, string username)
        {
            User user = await _userService.AddUserIfNotExists(new User() { Id = userId, Username = username });
            Book existingBook = _bookRepository.GetBookWithAuthorsAndCategories(newData.Id);

            if (existingBook == null || newData == null || existingBook.Id != newData.Id)
            {
                return null;
            }

            // Handle Ownership
            HandleOwnershipResult handleOwnershipResult = await HandleOwnershipForExistingBookUpdate(existingBook, newData, user.Id);

            // Create book with changes applied
            Book updatedBook = AppendChanges(existingBook, newData, handleOwnershipResult);
            // Apply changes on book to DB
            Book finalBook = await _bookRepository.UpdateBook(existingBook, updatedBook);


            // Create and return final result after changes applied to DB
            var dtoToReturn = BookAsDto(finalBook);
            dtoToReturn.Owners = OwnershipsAsDtos(await _ownershipRepository.GetBookOwnerships(dtoToReturn.Id));
            dtoToReturn.ActiveLoans = LoansAsDtos(await _loanRepository.GetAllLoansForBookAsync(dtoToReturn.Id));
            dtoToReturn.AvailableQuantity = GetAvailableQuantityDto(dtoToReturn.Quantity, dtoToReturn.ActiveLoans);
            return dtoToReturn;
        }

        private async Task<HandleOwnershipResult> HandleOwnershipForExistingBookUpdate(Book existing, BookDto changes, Guid userId)
        {
            if(existing == null || changes == null || userId == Guid.Empty)
            {
                throw new InvalidOperationException("Invalid parameter(s)!");
            }

            var result = new HandleOwnershipResult();
            
            // Is the user an owner in the changed version?
            OwnershipDto ownershipChanges = changes.Owners?.FirstOrDefault(o => o.UserId == userId);

            if (ownershipChanges != null)
            {
                // User is an Owner of the book
                Ownership existingOwnership = _ownershipRepository.GetOwnershipToBook(userId, existing.Id);

                if (existingOwnership == null || existingOwnership.Id <= 0)
                {
                    // User was not previously an owner of this book.
                    result.Ownership = await _ownershipRepository.AddOwnership(new Ownership
                    {
                        UserId = userId,
                        BookId = existing.Id,
                        Quantity = ownershipChanges.Quantity
                    });

                    if (result.HasResult)
                    {
                        result.ActionTaken = HandleOwnershipAction.Added;
                        result.ChangedQuantity = result.Ownership.Quantity;
                    }
                    else
                    {
                        result.ActionTaken = HandleOwnershipAction.None;
                        result.ChangedQuantity = 0;
                    }
                    return result;
                }
                else
                {
                    int existingQuantity = existingOwnership.Quantity;
                    // Making changes to existing ownership
                    result.Ownership = await _ownershipRepository.UpdateOwnership(existingOwnership, new Ownership
                    {
                        Id = existingOwnership.Id,
                        UserId = existingOwnership.UserId,
                        BookId = existingOwnership.BookId,
                        Quantity = ownershipChanges.Quantity
                    });

                    if (result.HasResult)
                    {
                        result.ActionTaken = HandleOwnershipAction.Updated;
                        result.ChangedQuantity = ownershipChanges.Quantity - existingQuantity;
                    }
                    else
                    {
                        result.ActionTaken = HandleOwnershipAction.None;
                        result.ChangedQuantity = 0;
                    }

                    return result;
                }
            }
            else
            {
                // User is NOT an Owner of the book in the updated version
                var removedOwnership = await _ownershipRepository.RemoveOwnershipBy(userId, existing.Id);
                if(removedOwnership == null)
                {
                    // User did not remove an existing ownership;
                    // No changes made to any ownership.
                    result.ActionTaken = HandleOwnershipAction.None;
                    result.ChangedQuantity = 0;
                }
                else
                {
                    // User removed an existing ownership
                    result.ActionTaken = HandleOwnershipAction.Removed;
                    // The total Quantity of a book did not change,
                    //  the user only removed the ownership-claim to this book.
                    result.ChangedQuantity = 0;
                }
                return result;
            }
        }

        public async Task<BookReview> AddBookReviewOnBook(BookReview bookReview)
        {
            var book = _bookRepository.GetBookIncludeBookReview(bookReview.BookId);
            if (book == null)
            {
                return null;
            }
            bookReview.DateAdded = DateTime.UtcNow.ToLocalTime();

            var existingBookReviews = book.BookReviews.ToList();
            existingBookReviews.Add(bookReview);
            book.BookReviews = existingBookReviews;
            var ratingTuple = _bookRepository.CalculateRating(book.BookReviews);
            if (ratingTuple.Item2 > 0)
            {
                book.Rating = ratingTuple.Item1;
                book.RatingCount = ratingTuple.Item2;
            }
            await _bookRepository.UpdateBook(book, book);

            return bookReview;
        }

        public async Task<bool> DeleteBookReviewFromBook(BookReview bookReview)
        {
            if (bookReview == null)
            {
                return false;
            }
            var book = _bookRepository.GetBookIncludeBookReview(bookReview.BookId);
            if (book == null)
            {
                return false;
            }
            var existingBookReviews = book.BookReviews.ToList();
            int bookReviewRemoved = existingBookReviews.RemoveAll(br => br.Id == bookReview.Id);
            if (bookReviewRemoved != 1)
            {
                return false;
            }
            book.BookReviews = existingBookReviews;
            var ratingTuple = _bookRepository.CalculateRating(book.BookReviews);
            book.RatingCount = ratingTuple.Item2;
            book.Rating = book.RatingCount == 0 ? null : ratingTuple.Item1;
            var updatedBook = await _bookRepository.UpdateBook(book, book);
            return updatedBook != null;
        }

        public async Task<bool> DeleteBookReviewsForUser(Guid userId)
        {
            var bookReviewsDeleted = await _bookRepository.DeleteBookReviewsForUser(userId);
            return bookReviewsDeleted;
        }

        private async Task<BookDto> RemoveMyOwnedBook(int bookId, Guid userId, bool isDonation)
        {
            if (bookId <= 0 || userId == Guid.Empty)
            {
                return null;
            }

            User user = _userService.GetUser(userId);
            Book existingBook = _bookRepository.GetBookWithAuthorsAndCategories(bookId);
            var ownership = _ownershipRepository.GetOwnershipToBook(userId, bookId);
            if (user == null || existingBook == null || !existingBook.Active || ownership == null || ownership.Quantity <= 0)
            {
                return null;
            }

            if (!isDonation)
            {
                var activeLoans = await GetLoansDtosForBookAsync(bookId);
                if(activeLoans != null && (existingBook.Quantity - activeLoans.Count < ownership.Quantity))
                {
                    return null;
                }
                ownership = await _ownershipRepository.RemoveOwnership(ownership);
                var newQty = existingBook.Quantity - ownership.Quantity;
                Book updatedBook = existingBook;
                updatedBook.Quantity = (newQty <= 0 ? 0 : newQty);
                if (updatedBook.Quantity == 0)
                    {
                        updatedBook.Active = false;
                    }
                existingBook = await _bookRepository.UpdateBook(existingBook, updatedBook);
            }
            else
            {
                await _ownershipRepository.RemoveOwnership(ownership);
            }

            var bookDto = BookAsDto(existingBook);
            bookDto.Owners = OwnershipsAsDtos(await _ownershipRepository.GetBookOwnerships(bookDto.Id));
            bookDto.ActiveLoans = LoansAsDtos(await _loanRepository.GetAllLoansForBookAsync(bookDto.Id));
            bookDto.AvailableQuantity = GetAvailableQuantityDto(bookDto.Quantity, bookDto.ActiveLoans);

            return bookDto;
        }

        public async Task<bool> RemoveAllMyOwnedBooksFromLibrary(Guid userId, bool isDonation)
        {
            if (userId == Guid.Empty)
            {
                return false;
            }
            var booksRemoved = await _bookRepository.RemoveAllMyOwnedBooks(userId, isDonation);
            return booksRemoved;
        }

        private static int GetAvailableQuantityDto(int totalQty, IEnumerable<LoanDto> loanDtos)
        {
            if (totalQty < 0)
            {
                return 0;
            }
            if (loanDtos == null || !loanDtos.Any())
            {
                return totalQty;
            }
            return (totalQty - loanDtos.Count(l => l.DateDelivered == null));
        }

        public class HandleOwnershipResult
        {
            public HandleOwnershipAction ActionTaken { get; set; } = HandleOwnershipAction.None;
            public Ownership Ownership { get; set; } = null;
            public int ChangedQuantity { get; set; } = 0;
            public bool HasResult { get { return Ownership != null; } }
            public bool ActionWasTaken { get { return ActionTaken != HandleOwnershipAction.None; } }
            public bool ActionWasTakenAndChangedQuantity { get { return ActionWasTaken && ActionTaken != HandleOwnershipAction.Removed; } }
        }

        public enum HandleOwnershipAction
        {
            None = 0,
            Added = 1,
            Updated = 2,
            Removed = 3
        }
    }
}
