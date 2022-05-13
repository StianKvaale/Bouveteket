using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Backend.Models
{
    public class Book
    {
        public int Id { get; set; }
        public string Ean { get; set; }
        [Required(AllowEmptyStrings = true)]
        [StringLength(150)]
        public string Title { get; set; }
        [StringLength(250)]
        public string ImageUrl { get; set; }
        [Required(AllowEmptyStrings = true)]
        [StringLength(4000)]
        public string Description { get; set; }
        [Required(AllowEmptyStrings = true)]
        [StringLength(150)]
        public string SubTitle { get; set; }
        [StringLength(35)]
        public string Language { get; set; }
        public int Quantity { get; set; }
        public int? Pages { get; set; }
        public int? Published { get; set; }
        public float? Rating { get; set; }
        public int? RatingCount { get; set; }
        public float? GoogleRating { get; set; }
        public int? GoogleRatingCount { get; set; }
        public DateTime DateAdded { get; set; }
        public bool Active { get; set; }
        public IEnumerable<Author> Authors { get; set; } = new List<Author>();
        public IEnumerable<BookReview> BookReviews { get; set; } = new List<BookReview>();
        public IEnumerable<Category> Categories { get; set; } = new List<Category>();
    }
}