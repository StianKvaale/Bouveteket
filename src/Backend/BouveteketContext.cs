using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend
{
    public class BouveteketContext : DbContext
    {
        public BouveteketContext(DbContextOptions<BouveteketContext> options) : base(options)
        {
        }

        public DbSet<Book> Books { get; set; }
        public DbSet<Author> Authors { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Loan> Loans { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Ownership> Ownerships { get; set; }
        public DbSet<BookWish> BookWishes { get; set; }
    }
}