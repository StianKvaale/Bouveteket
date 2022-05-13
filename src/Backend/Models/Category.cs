using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Backend.Models
{
    public class Category : IEqualityComparer<Category>
    {
        public int Id { get; set; }
        [StringLength(35)]
        public string Title { get; set; }
        public IEnumerable<Book> Books { get; set; }

        public bool Equals(Category x, Category y)
        {
            if (ReferenceEquals(x, y)) return true;
            if (ReferenceEquals(x, null)) return false;
            if (ReferenceEquals(y, null)) return false;
            if (x.GetType() != y.GetType()) return false;
            return x.Title == y.Title;
        }

        public int GetHashCode(Category obj)
        {
            return HashCode.Combine(obj.Id, obj.Title, obj.Books);
        }
    }
}
