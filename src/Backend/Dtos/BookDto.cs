using System;
using System.Collections.Generic;
using Backend.Models;

namespace Backend.Dtos
{
    public class BookDto
    {
        public int Id { get; set; }
        public string Ean { get; set; }
        public string Title { get; set; }
        public string ImageUrl { get; set; }
        public string Description { get; set; }
        public string SubTitle { get; set; }
        public IEnumerable<AuthorDto> Authors { get; set; }
        public IEnumerable<CategoryDto> Categories { get; set; }
        public string Language { get; set; }
        public int Quantity { get; set; }
        public int AvailableQuantity { get; set; }
        public int? Pages { get; set; }
        public int? Published { get; set; }
        public float? Rating { get; set; }
        public int? RatingCount { get; set; }
        public float? GoogleRating { get; set; }
        public int? GoogleRatingCount { get; set; }
        public DateTime DateAdded { get; set; }
        public IEnumerable<OwnershipDto> Owners { get; set; }
        public bool Active { get; set; }
        public IEnumerable<BookReview> BookReviews { get; set; }
        public IEnumerable<LoanDto> ActiveLoans { get; set; }
    }
}
