using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Backend.Models
{
    public class BookWish
    {
        public int Id { get; set; }
        public string Title { get; set; }
        [StringLength(250)]
        public string Authors { get; set; }
        public string Comment { get; set; }
        public string Username { get; set; }
        [StringLength(255)]
        public int Votes { get; set; }
        public IEnumerable<User> Voters { get; set; } = new List<User>();
    }
}
