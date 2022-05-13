using System;

namespace Backend.Dtos
{
    public class OwnershipDto
    {
        public int Id { get; set; }
        public Guid UserId { get; set; }
        public int BookId { get; set; }
        public int Quantity { get; set; }
    }
}
