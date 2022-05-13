using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Backend.Utilities;

namespace Backend.Models
{
    public class User
    {
        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        public Guid Id { get; set; }
        public Languages Language { get; set; } = Languages.Norwegian;
        public bool UseDarkMode { get; set; } = true;
        [StringLength(70)]
        public string Username { get; set; }
        public IEnumerable<BookWish> BookWishes { get; set; } = new List<BookWish>();
    }
}
