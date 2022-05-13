using System.Collections.Generic;
using System.Threading.Tasks;
using Backend.Models;
using Microsoft.EntityFrameworkCore.ChangeTracking;

namespace Backend.Repositories.Interfaces
{
    public interface ICategoryRepository
    {
        Task<List<Category>> GetAllCategories();

        Task<EntityEntry<Category>> AddCategory(Category category);

        Category GetCategory(int id);

        Task<bool> UpdateCategory(Category category);

        Task<bool> DeleteCategory(int id);
        Category GetCategoryByTitle(string title);
        Category GetCategoryByIdWithBooks(int id);
    }
}