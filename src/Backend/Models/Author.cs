using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Backend.Models
{
    public class Author : IEqualityComparer<Author>
    {
        public int Id { get; set; }
        [StringLength(70)]
        public string Name { get; set; }
        public IEnumerable<Book> Books { get; set; }

        public bool Equals(Author x, Author y)
        {
            if (ReferenceEquals(x, y)) return true;
            if (ReferenceEquals(x, null)) return false;
            if (ReferenceEquals(y, null)) return false;
            if (x.GetType() != y.GetType()) return false;
            return x.Name == y.Name;
        }

        public int GetHashCode(Author obj)
        {
            return (obj.Name != null ? obj.Name.GetHashCode() : 0);
        }
    }
}
