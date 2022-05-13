using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Runtime.CompilerServices;
using Backend.Dtos;
using Backend.Models;
using static Backend.Services.BookService;

namespace Backend.Utilities
{
    public static class Helpers
    {
        #region Books

        public static Book AppendChanges(Book original, BookDto changes, HandleOwnershipResult ownershipResult)
        {
            if (original == null || changes == null || original.Id != changes.Id || ownershipResult == null)
            {
                return original;
            }

            return new Book
            {
                Id = original.Id,
                Title = original.Title,
                Ean = original.Ean,
                ImageUrl = changes.ImageUrl,
                Description = changes.Description,
                SubTitle = changes.SubTitle,
                Language = changes.Language,
                Quantity = ownershipResult.ActionWasTakenAndChangedQuantity ? (original.Quantity + ownershipResult.ChangedQuantity) : changes.Quantity,
                Pages = changes.Pages,
                Published = changes.Published,
                Rating = changes.Rating,
                RatingCount = changes.RatingCount,
                GoogleRating = original.GoogleRating,
                GoogleRatingCount = original.GoogleRatingCount,
                DateAdded = original.DateAdded,
                Active = changes.Active,
                Authors = changes.Authors.Select(a => new Author
                {
                    Name = a.Name
                }).ToList(),
                BookReviews = changes.BookReviews.Select(b => new BookReview
                {
                    BookId = b.BookId,
                    Comment = b.Comment,
                    DateAdded = b.DateAdded,
                    Rating = b.Rating,
                    Title = b.Title,
                    UserId = b.UserId,
                    Username = b.Username
                }).ToList(),
                Categories = changes.Categories.Select(c => new Category
                {
                    Title = c.Title
                }).ToList()
            };
        }

        public static BookDto BookAsDto(Book book)
        {
            if (book == null)
            {
                return null;
            }

            return new BookDto
            {
                Id = book.Id,
                Title = book.Title,
                Ean = book.Ean,
                ImageUrl = book.ImageUrl,
                Description = book.Description,
                SubTitle = book.SubTitle,
                Authors = book.Authors.Select(x => new AuthorDto
                {
                    Name = x.Name
                }).ToList(),
                Categories = book.Categories.Select(x => new CategoryDto
                {
                    Title = x.Title
                }).ToList(),
                Language = book.Language,
                Quantity = book.Quantity,
                AvailableQuantity = 0,
                Pages = book.Pages,
                Published = book.Published,
                Rating = book.Rating,
                RatingCount = book.RatingCount,
                GoogleRating = book.GoogleRating,
                GoogleRatingCount = book.GoogleRatingCount,
                Owners = null,
                DateAdded = book.DateAdded,
                Active = book.Active,
                BookReviews = book.BookReviews
            };
        }

        public static Book DtoAsBook(BookDto bookDto)
        {
            if (bookDto == null)
            {
                return null;
            }

            return new Book
            {
                Id = bookDto.Id,
                Title = bookDto.Title,
                Ean = bookDto.Ean,
                ImageUrl = bookDto.ImageUrl,
                Description = bookDto.Description,
                SubTitle = bookDto.SubTitle,
                Authors = bookDto.Authors.Select(x => new Author
                {
                    Name = x.Name
                }).ToList(),
                Categories = bookDto.Categories.Select(x => new Category
                {
                    Title = x.Title
                }).ToList(),
                Language = bookDto.Language,
                Quantity = bookDto.Quantity,
                Pages = bookDto.Pages,
                Published = bookDto.Published,
                Rating = bookDto.Rating,
                RatingCount = bookDto.RatingCount,
                GoogleRating = bookDto.GoogleRating,
                GoogleRatingCount = bookDto.GoogleRatingCount,
                DateAdded = bookDto.DateAdded,
                Active = bookDto.Active,
                BookReviews = bookDto.BookReviews
            };
        }

        #endregion Books

        #region Ownerships

        public static List<OwnershipDto> OwnershipsAsDtos(IEnumerable<Ownership> ownerships)
        {
            if (ownerships == null)
            {
                return null;
            }
            return ownerships.Select(o => OwnershipAsDto(o)).ToList();
        }

        public static OwnershipDto OwnershipAsDto(Ownership ownership)
        {
            if (ownership == null)
            {
                return null;
            }

            return new OwnershipDto
            {
                Id = ownership.Id,
                BookId = ownership.BookId,
                UserId = ownership.UserId,
                Quantity = ownership.Quantity
            };
        }

        #endregion Ownerships

        #region Loans

        public static bool CanBorrowDto(IEnumerable<LoanDto> existingLoanDtos, Guid userId)
        {
            if (!HasElementsDto(existingLoanDtos))
            {
                return true;
            }
            return !existingLoanDtos.Any(l => l.UserId == userId);
        }

        public static bool HasElementsDto(IEnumerable<LoanDto> col)
        {
            return col != null && col.Any();
        }

        public static LoanDto LoanAsDto(Loan loan)
        {
            if (loan == null)
            {
                return null;
            }

            return new LoanDto
            {
                Id = loan.Id,
                BookId = loan.BookId,
                UserId = loan.UserId,
                DateBorrowed = loan.DateBorrowed,
                DateDelivered = loan.DateDelivered
            };
        }

        public static List<LoanDto> LoansAsDtos(IEnumerable<Loan> loans)
        {
            if (loans == null || !loans.Any())
            {
                return null;
            }
            return loans.Select(l => LoanAsDto(l)).ToList();
        }

        #endregion Loans

        [MethodImpl(MethodImplOptions.NoInlining)]
        public static string GetCurrentMethod()
        {
            var st = new StackTrace();
            string smN = st.GetFrame(1).GetMethod().DeclaringType.Name;
            int startIdx = smN.IndexOf('<') + 1;
            int endIdx = smN.IndexOf('>');
            int length = endIdx - startIdx;
            string toReturn = smN[startIdx..endIdx];
            return toReturn;
        }
    }
}
