using System;
using System.Collections.Generic;

namespace Backend.Dtos
{
    public class BookWishDto
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Authors { get; set; }
        public string Comment { get; set; }
        public string Username { get; set; }
        public int Votes { get; set; }
        public IEnumerable<Guid> Voters { get; set; }
    }
}
