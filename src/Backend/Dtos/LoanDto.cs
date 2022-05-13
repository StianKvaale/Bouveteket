using System;

namespace Backend.Dtos
{
    public class LoanDto
    {
        public int Id { get; set; }
        public Guid UserId { get; set; }
        public int BookId { get; set; }
        public DateTime DateBorrowed { get; set; }
        public DateTime? DateDelivered { get; set; }
    }
}
