using System;
using System.ComponentModel.DataAnnotations;

namespace Backend.Models
{
    public class BookReview
    {
        public int Id { get; set; }
        public Guid UserId { get; set; }
        [StringLength(70)]
        public string Username { get; set; }
        [StringLength(255)]
        public string Title { get; set; }
        public float? Rating { get; set; }
        public string Comment { get; set; }
        public DateTime DateAdded { get; set; }
        public int BookId { get; set; }
    }
}