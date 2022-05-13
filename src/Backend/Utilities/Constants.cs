using System.Collections.Generic;

namespace Backend.Utilities
{
    public class Constants
    {
        public const string BOOK = "Book";
        public const string BORROWED = "Borrowed";
        public const string FAILED = "Failed";
        public const string INVALID = "Invalid";
        public const string LOAN = "Loan";

        private static Dictionary<ResponseMessage, string> English =
            new()
            {
                { ResponseMessage.AccessDenied, $"Access denied" },
                { ResponseMessage.AddBookFailed, $"Add {BOOK.ToLower()} {FAILED.ToLower()}" },
                { ResponseMessage.AddBookReviewFailed, $"Add {BOOK.ToLower()} review failed" },
                { ResponseMessage.AllUserBooksRemoved, $"All user {BOOK.ToLower()}s removed" },
                { ResponseMessage.AllUserLoansDeleted, $"All user {LOAN.ToLower()}s deleted" },
                { ResponseMessage.BookAdded, $"{BOOK} added" },
                { ResponseMessage.BookAlreadyBorrowed, $"{BOOK} already {BORROWED.ToLower()}" },
                { ResponseMessage.BookBorrowed, $"{BOOK} {BORROWED.ToLower()}" },
                { ResponseMessage.BookDonated, $"{BOOK} donated" },
                { ResponseMessage.BookNotExistOrUnavailable, $"{BOOK} does not exist or is unavailable" },
                { ResponseMessage.BookRemoved, $"{BOOK} removed" },
                { ResponseMessage.BookReturned, $"{BOOK} returned" },
                { ResponseMessage.BookReviewAdded, $"{BOOK} review added" },
                { ResponseMessage.BookUpdated, $"{BOOK} updated" },
                { ResponseMessage.CouldNotReturnBook, $"Could not return {BOOK.ToLower()}" },
                { ResponseMessage.DeleteAllUserLoansFailed, $"Delete all user {LOAN.ToLower()}s {FAILED.ToLower()}" },
                { ResponseMessage.DeleteLoanFailed, $"Delete {LOAN.ToLower()} {FAILED.ToLower()}" },
                { ResponseMessage.DonateBookFailed, $"Donate {BOOK.ToLower()} {FAILED.ToLower()}" },
                { ResponseMessage.InvalidData, $"{INVALID} data" },
                { ResponseMessage.InvalidQuantity, $"{INVALID} quantity" },
                { ResponseMessage.InvalidUser, $"{INVALID} user" },
                { ResponseMessage.LoanDeleted, $"{LOAN} deleted" },
                { ResponseMessage.RemoveBookFailed, $"Remove {BOOK.ToLower()} {FAILED.ToLower()}" },
                { ResponseMessage.RemoveAllUserBooksFailed, $"Remove all user {BOOK.ToLower()}s {FAILED.ToLower()}" },
                { ResponseMessage.UpdateBookFailed, $"Update {BOOK.ToLower()} {FAILED.ToLower()}" },
                { ResponseMessage.ValidationError, $"Validation error" },
            };

        public static string GetMessage(ResponseMessage msg, Language lang = Language.English)
        {
            string toReturn = string.Empty;
            switch (lang)
            {
                case Language.English:
                default:
                    English.TryGetValue(msg, out toReturn);
                    break;
            }
            return toReturn;
        }

        public enum ExecutionResult
        {
            Unset,
            OK,
            Failed,
            Error
        }

        public enum Language
        {
            English
        }

        /// <summary>
        /// ResponseMessage is used as a key for getting the associated string.
        /// The number associated with each name is not a constant, 
        /// and hence should not be used as such.
        /// </summary>
        public enum ResponseMessage
        {
            AccessDenied,
            AddBookFailed,
            AddBookReviewFailed,
            AllUserBooksRemoved,
            AllUserLoansDeleted,
            BookAdded,
            BookAlreadyBorrowed,
            BookBorrowed,
            BookDonated,
            BookNotExistOrUnavailable,
            BookRemoved,
            BookReturned,
            BookReviewAdded,
            BookReviewDeleted,
            BookUpdated,
            CouldNotReturnBook,
            DeleteAllUserLoansFailed,
            DeleteLoanFailed,
            DonateBookFailed,
            DeleteBookReviewFailed,
            InvalidData,
            InvalidQuantity,
            InvalidUser,
            LoanDeleted,
            RemoveBookFailed,
            RemoveAllUserBooksFailed,
            UpdateBookFailed,
            ValidationError,
        }
    }
}
