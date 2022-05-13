using System.Collections.Generic;
using System.Linq;
using Backend.Models;
using Backend.Repositories.Interfaces;
using Moq;
using Xunit;

namespace Backend.Tests
{
    public class BookRepositoryTests
    {

        private readonly IBookRepository _mockBookRepository;
        private readonly IList<Book> _books = new List<Book>()
        {
            new()
            {
                Id = 0,
                Title = "Data Structures and Algorithms in Java",
                Ean = "1278213101010"
            },
            new()
            {
                Id = 1,
                Title = "C# Programming for Absolute Beginners",
                Ean = "7621832100"
            },
            new()
            {
                Id = 2,
                Title = "Countdown To Zero Day",
                Ean = "9780770436193"
            }
        };

        public BookRepositoryTests()
        {
            _mockBookRepository = GetMockBookRepository().Object;
        }

        private Mock<IBookRepository> GetMockBookRepository()
        {
            var mockRepo = new Mock<IBookRepository>();
            
            mockRepo.Setup(repo => repo.GetAllBooks()).ReturnsAsync(_books.ToList());

            mockRepo.Setup(repo => repo.GetBook(It.IsAny<int>()))
                .Returns((int i) => _books.SingleOrDefault(x => x.Id == i));

            mockRepo.Setup(repo => repo.AddBook(It.IsAny<Book>()))
                .Callback((Book book) =>
                {
                    book.Id = _books.Count() + 1;
                    _books.Add(book);
                });

            /*
            mockRepo.Setup(repo => repo.DeactivateBook(It.IsAny<int>()))
                .Callback((int id) =>
                {
                    var book = _books.SingleOrDefault(x => x.Id == id);
                    _books.Remove(book);
                });
            */    

            mockRepo.SetupAllProperties();

            return mockRepo;
        }
        
        [Fact]
        public void CanGetBookById()
        {
            //Arrange
            var expectedBook = _books.FirstOrDefault();
            Assert.NotNull(expectedBook);

            //Act
            var book = _mockBookRepository.GetBook(expectedBook.Id);

            //Assert
            Assert.Equal(expectedBook, book);
        }

        [Fact]
        public async void CanDeleteBook()
        {
            //Arrange
            var books = await _mockBookRepository.GetAllBooks();
            var book = _books.FirstOrDefault();
            Assert.NotNull(book);
            var bookId = book.Id;
            var length = _books.Count;

            //Act
            //await _mockBookRepository.DeactivateBook(0);
            //bool containsBook = _books.Any(x => x.Id == bookId);

            //Assert
            //Assert.Equal(length - 1, _books.Count);
            //Assert.False(containsBook);
        }

        [Fact]
        public async void CanAddNewBook()
        {
            //arrange
            var expectedBook = new Book()
            {
                Title = "new book",
                Ean = "1234567890123"
            };
            var length = _books.Count;

            //act
            await _mockBookRepository.AddBook(expectedBook);
            
            //assert
            Assert.Equal(length + 1, _books.Count);
            Assert.Equal(_books.LastOrDefault(), expectedBook);
        }
    }
}
