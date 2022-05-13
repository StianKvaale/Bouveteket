using Backend.Dtos;
using Backend.Models;
using System.Collections.Generic;
using System.Linq;

namespace Backend.Validators
{

    public static class BookValidator
    {
        public static Validation ValidateAddBookDto(BookDto book)
        {
            var result = new Validation()
            {
                Error = false,
                ErrorMessages = new List<string>()
            };

            if (book == null)
            {
                result.ErrorMessages.Add("No book");
                result.Error = true;
                return result;
            }

            if (string.IsNullOrWhiteSpace(book.Title))
            {
                result.ErrorMessages.Add("Book title is empty");
            }

            if (book.Authors != null && book.Authors.Any())
            {
                if(book.Authors.Any(author => string.IsNullOrWhiteSpace(author.Name)))
                    result.ErrorMessages.Add("Book authors contain author with no name");
            }
            else
            {
                result.ErrorMessages.Add("No book authors");
            }

            var eanString = book.Ean;
            if (eanString.Length != 13 && eanString.Length != 10)
                result.ErrorMessages.Add("EAN must be 13 or 10 digits");

            if (book.Quantity <= 0)
            {
                result.ErrorMessages.Add("Adding a book requires quantity");
            }

            if (result.ErrorMessages.Count > 0)
            {
                result.Error = true;
            }
            return result;

        }
        
    }
}