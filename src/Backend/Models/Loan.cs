using System;

namespace Backend.Models
{
    public class Loan
    {
        public int Id { get; set; }
        public Guid UserId { get; set; }
        public int BookId { get; set; }
        public DateTime DateBorrowed { get; set; }
        public DateTime? DateDelivered { get; set; }
    }
}
