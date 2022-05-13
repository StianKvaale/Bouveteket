using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Backend.Dtos;
using Backend.Models;
using Backend.Repositories.Interfaces;
using Backend.Services.Interfaces;

namespace Backend.Services
{
    public class CategoryService : ICategoryService
    {
        private readonly ICategoryRepository _categoryRepository;

        public CategoryService(ICategoryRepository categoryRepository)
        {
            _categoryRepository = categoryRepository;
        }

        public async Task<List<CategoryDto>> GetCategories()
        {
            var categories = await _categoryRepository.GetAllCategories();
            if(categories != null && categories.Any())
                return categories.Select(category => new CategoryDto() {Title = category.Title}).ToList();

            return new List<CategoryDto>();
        }

        public async Task<List<Category>> GetUpdatedCategories(Book existingBook, Book updatedBook)
        {
            var currentBookCategories = existingBook.Categories.ToList();
            var categoriesToAdd = updatedBook.Categories.Except(existingBook.Categories, new Category()).ToList();
            var categoriesToRemove = existingBook.Categories.Except(updatedBook.Categories, new Category()).ToList();

            foreach (var outdatedCategory in categoriesToRemove)
            {
                currentBookCategories.Remove(outdatedCategory); 
                await RemoveCategoryIfNoBooks(outdatedCategory);
            }

            foreach (var newCategory in categoriesToAdd)
            {
                var existingCategory = _categoryRepository.GetCategoryByTitle(newCategory.Title);
                currentBookCategories.Add(existingCategory ?? newCategory);
            }

            return currentBookCategories;
        }

        private async Task RemoveCategoryIfNoBooks(Category category)
        {
            var existingCategory = _categoryRepository.GetCategoryByIdWithBooks(category.Id);
            if (existingCategory != null && existingCategory.Books.ToList().Count <= 1)
            {
                await _categoryRepository.DeleteCategory(existingCategory.Id);
            }
        }
    }
}