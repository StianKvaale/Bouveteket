using System.Collections.Generic;
using System.Threading.Tasks;
using Backend.Dtos;
using Backend.Models;

namespace Backend.Services.Interfaces
{
    public interface ICategoryService
    {
        Task<List<CategoryDto>> GetCategories();
        Task<List<Category>> GetUpdatedCategories(Book existingBook, Book updatedBook);
    }
}