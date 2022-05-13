using System;

namespace Backend.Models
{
    public class Ownership
    {
        public int Id { get; set; }
        public Guid UserId { get; set; }
        public int BookId { get; set; }
        public int Quantity { get; set; }
    }
}
