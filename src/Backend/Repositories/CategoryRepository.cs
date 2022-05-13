using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Backend.Models;
using Backend.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;

namespace Backend.Repositories
{

    public class CategoryRepository : ICategoryRepository
    {
        private readonly BouveteketContext _context;

        public CategoryRepository(BouveteketContext context)
        {
            _context = context;
        }

        public async Task<List<Category>> GetAllCategories()
        {
            var categories = await _context.Categories.ToListAsync();
            return categories;
        }

        public async Task<EntityEntry<Category>> AddCategory(Category category)
        {
            var categoryEntity = await _context.Categories.AddAsync(category);
            await _context.SaveChangesAsync();
            return categoryEntity;
        }

        public Category GetCategory(int id)
        {
            try
            {
                return _context.Categories.Single(x => x.Id == id);
            }
            catch (Exception)
            {
                return null;
            }
        }

        public async Task<bool> UpdateCategory(Category category)
        {
            var categoryEntity = _context.Categories.Single(x => x.Id == category.Id);

            if (categoryEntity == null) return false;

            categoryEntity.Title = category.Title;
            categoryEntity.Books = category.Books;

            var hasUpdatedCategory = 0 < await _context.SaveChangesAsync();
            return hasUpdatedCategory;
        }

        public async Task<bool> DeleteCategory(int id)
        {
            var category = await _context.Categories.SingleOrDefaultAsync(x => x.Id == id);
            _context.Categories.Remove(category);
            return (await _context.SaveChangesAsync()) == 1;
        }

        public Category GetCategoryByTitle(string title)
        {
            return _context.Categories.FirstOrDefault(c => c.Title.ToLower() == title.ToLower());
        }

        public Category GetCategoryByIdWithBooks(int id)
        {
            return _context.Categories
                .Include(b => b.Books)
                .FirstOrDefault(c => c.Id == id);
        }
    }
}