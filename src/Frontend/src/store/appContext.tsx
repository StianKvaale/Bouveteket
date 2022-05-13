import React, { createContext, useContext, useEffect, useState } from "react";
import { backendService } from "services";
import { AuthContext } from "store/authContext";
import { IAuthor, IBook, IBookReview, IBookWish, IBorrowedBook, ICategory, ILoan } from "store/types";
import { getListOfUniqueItems, roundUpToDecimal } from "utils/helpers";

interface AppContextProps {
    books: IBook[];
    loans: ILoan[];
    authors: IAuthor[];
    categories: ICategory[];
    bookwishes: IBookWish[];
    addBook: (newBook: IBook) => Promise<IBook>;
    getBook: (bookId: number) => IBook | undefined;
    getBookFromDb: (id: number) => Promise<IBook | null>;
    updateBook: (book: IBook | undefined) => void;
    donateBook: (book: IBook) => Promise<IBook | undefined>;
    removeBook: (book: IBook) => Promise<IBook | undefined>;
    removeAllMyBooks: (isDonation: boolean) => Promise<boolean>;
    getMyBorrowedBooks: () => Promise<IBorrowedBook[]>;
    onReturnBook: (bookId: number) => Promise<void>;
    onBorrowBook: (bookId: number) => Promise<ILoan | undefined>;
    removeLoan: (loan: ILoan) => Promise<boolean>;
    removeMyLoans: (onlyDeliveredLoans: boolean) => Promise<boolean>;
    addBookReview: (bookReview: IBookReview) => Promise<IBookReview>;
    removeBookReview: (bookReview: IBookReview) => Promise<boolean>;
    removeMyBookReviews: () => Promise<boolean>;
    addBookWish: (bookWish: IBookWish) => Promise<IBookWish>;
    updateBookWish: (bookWish: IBookWish) => Promise<IBookWish | undefined>;
    removeBookWish: (bookWish: IBookWish) => Promise<boolean>;
    removeMyBookWishes: () => Promise<boolean>;
    removeMyBookWishVotes: () => Promise<boolean>;
    removeUserAndLogOut: () => Promise<boolean>;
    isLoadingBooks: boolean;
    apiError: boolean;
}

export const AppContext = createContext<AppContextProps>({} as AppContextProps);

interface StateProviderProps {
    children: JSX.Element
}

export const StateProvider = ({ children }: StateProviderProps): JSX.Element => {
    const authContext = useContext(AuthContext);
    const [books, setBooks] = useState<IBook[]>([]);
    const [loans, setLoans] = useState<ILoan[]>([]);
    const [authors, setAuthors] = useState<IAuthor[]>([]);
    const [categories, setCategories] = useState<ICategory[]>([]);
    const [bookwishes, setBookWishes] = useState<IBookWish[]>([]);
    const [isLoadingBooks, setIsLoadingBooks] = useState(true);
    const [apiError, setApiError] = useState(false);

    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        backendService.getBooks()
            .then(response => setBooks(response))
            .catch(() => setApiError(true))
            .finally(() => setIsLoadingBooks(false));

        backendService.getLoans()
            .then(response => setLoans(response))
            .catch(() => setApiError(true));

        backendService.getAuthors()
            .then(response => setAuthors(response))
            .catch(() => setApiError(true));

        backendService.getCategories()
            .then(response => setCategories(response))
            .catch(() => setApiError(true));

        backendService.getBookWishes()
            .then(response => setBookWishes(response.sort((a,b) => b.votes - a.votes)))
            .catch(() => setApiError(true));
    };

    const addBook = async (newBook: IBook) => {
        const addedBook = await backendService.addBook(newBook);
        setBooks([...books, addedBook]);
        addAuthors(newBook.authors);
        addCategories(newBook.categories);
        return addedBook;
    };

    const addAuthors = (newAuthors: IAuthor[]) => {
        setAuthors(getListOfUniqueItems(authors.concat(newAuthors), "name"));
    };

    const addCategories = (newCategories: ICategory[]) => {
        setCategories(getListOfUniqueItems(categories.concat(newCategories), "title"));
    };

    const getBook = (bookId: number) => books.find(book => book.id === bookId);

    const updateBookInContext = (book: IBook | undefined) => {
        if(book == null){
            return;
        }

        const index = books.findIndex(x => x.id === book.id);
        const updatedBooks = [ ...books ];
        updatedBooks[index] = book;
        setBooks(updatedBooks);
        addAuthors(book.authors);
        addCategories(book.categories);
    };

    const updateBook = async (book: IBook | undefined) => {
        if(book == null){
            return null;
        }

        const updatedBook = await backendService.updateBook(book);
        updateBookInContext(updatedBook);
    };

    const getBookFromDb = async (id: number): Promise<IBook | null> => {
        setIsLoadingBooks(true);
        const booksFromDb = await backendService.getBooks();
        setIsLoadingBooks(false);
        if(booksFromDb == null || booksFromDb.length === 0){
            return null;
        }
        return booksFromDb?.find(b => b.id === id) || null;
    };

    const donateBook = async (book: IBook): Promise<IBook | undefined> => {
        try {
            const result = await backendService.donateBook(book.id);
            if (result) {
                updateBookInContext(result);
            }
            return result;
        } catch (error) {
            return;
        }
    };

    const removeBook = async (book: IBook): Promise<IBook | undefined> => {
        try {
            const result = await backendService.removeBook(book.id);
            if (result) {
                updateBookInContext(result);
            }
            return result;
        } catch (error) {
            return;
        }
    };

    const removeAllMyBooks = async (isDonation: boolean): Promise<boolean> => {
        try {
            const result = await backendService.removeAllMyBooks(isDonation);
            if (result) {
                const userId = authContext.account?.localAccountId;
                books.forEach(book => {
                    const ownership = book.owners.find(o => o.userId === userId);
                    if (ownership) {
                        if (!isDonation && ownership.quantity <= book.availableQuantity) {
                            book.owners = book.owners.filter(o => o.userId != userId);
                            book.quantity = book.quantity - ownership?.quantity;
                            book.availableQuantity = book.availableQuantity - ownership.quantity;
                            if (book.quantity <= 0) {
                                book.active = false;
                            }
                        } else if (isDonation) {
                            book.owners = book.owners.filter(o => o.userId != userId);
                        }
                    }
                });
            }
            return result;
        } catch (error) {
            return false;
        }
    };

    const updateLoans = (loan: ILoan) => {
        const index = loans.findIndex(x => x.id === loan.id);
        const updatedLoans = [ ...loans ];
        if(index === -1){
            updatedLoans.push(loan);
        } else {
            updatedLoans[index] = loan;
        }
        setLoans(updatedLoans);
    };

    const getMyBorrowedBooks = async () : Promise<IBorrowedBook[]> => {
        const userLoans = await backendService.getLoansForActiveUser(false);
        if(userLoans == null || userLoans.length === 0)
        {
            return [];
        }

        const borrowedBooks : IBorrowedBook[] = userLoans.map(loan => {
            const book = getBook(loan.bookId);
            const borrowedBook : IBorrowedBook = {
                id: loan.id,
                bookId: loan.bookId,
                userId: loan.userId,
                dateBorrowed: loan.dateBorrowed,
                dateDelivered: loan.dateDelivered,
                title: book?.title ?? "",
                authors: book?.authors ?? [],
            };
            return borrowedBook;
        });
        return borrowedBooks;
    };

    const updateLoansOnBook = (bookId: number, updatedLoan: ILoan | undefined) => {
        if(updatedLoan == null){
            return;
        }
        const book = books.find(x => x.id === bookId);
        if(book) {
            const bookCopy = {...book};
            if(updatedLoan.dateDelivered == null) {
                if(bookCopy.activeLoans == null) {
                    bookCopy.activeLoans = [];
                }
                bookCopy.activeLoans.push(updatedLoan);
                bookCopy.availableQuantity -= 1;
            } else {
                const newActiveLoans = bookCopy.activeLoans.filter(l => l.id != updatedLoan.id);
                if(newActiveLoans == null) {
                    bookCopy.activeLoans = [];
                } else {
                    bookCopy.activeLoans = newActiveLoans;
                }
                bookCopy.availableQuantity += 1;
            }
            updateBookInContext(bookCopy);
        }
    };

    const onReturnBook = async (bookId: number) => {
        if(authContext == null || authContext.account == null){
            return;
        }
        const result = await backendService.returnBook(bookId)
            .then(response => {updateLoans(response); updateBookInContext(getBook(response.bookId)); return response;})
            .catch((error) => {throw error;});

        updateLoansOnBook(bookId, result);
    };

    const onBorrowBook = async (bookId: number) : Promise<ILoan | undefined> => {
        if(authContext == null || authContext.account == null){
            return undefined;
        }
        const result = await backendService.borrowBook(bookId)
            .then(response => {updateLoans(response); return response; })
            .catch((error) => {throw error;});

        updateLoansOnBook(bookId, result);
        return result;
    };

    const removeLoan = async (loan: ILoan) : Promise<boolean> => {
        try {
            const result = await backendService.removeLoan(loan);
            if (result) {
                const updatedLoans = loans.filter(l => !(l.id === loan.id));
                setLoans(updatedLoans);
                if (!loan.dateDelivered) {
                    const book = books.find(b => b.id === loan.bookId);
                    if (book) {
                        const bookCopy = {...book};
                        bookCopy.activeLoans = bookCopy.activeLoans.filter(l => !(l.id === loan.id));
                        bookCopy.availableQuantity += 1;
                        updateBookInContext(bookCopy);
                    }
                }
            }
            return result;
        } catch (error) {
            return false;
        }
    };

    const removeMyLoans = async (onlyDeliveredLoans: boolean) : Promise<boolean> => {
        try {
            const result = await backendService.removeMyLoans(onlyDeliveredLoans);
            if (result) {
                if (onlyDeliveredLoans) {
                    const updatedLoans = loans.filter(l => !(l.userId === authContext.account?.localAccountId && l.dateDelivered != null) );
                    setLoans(updatedLoans);
                } else {
                    const myCurrentLoans = loans.filter(l => l.userId === authContext.account?.localAccountId && l.dateDelivered === null);
                    const updatedLoans = loans.filter(l => !(l.userId === authContext.account?.localAccountId) );
                    setLoans(updatedLoans);
                    if (myCurrentLoans.length > 0) {
                        myCurrentLoans.forEach(loan => {
                            const book = books.find(b => b.id === loan.bookId);
                            if (book) {
                                const bookCopy = {...book};
                                bookCopy.activeLoans = bookCopy.activeLoans.filter(l => !(l.id === loan.id));
                                bookCopy.availableQuantity += 1;
                                updateBookInContext(bookCopy);
                            }
                        });

                    }
                }

            }
            return result;
        } catch (error) {
            return false;
        }
    };

    const addBookReview = async (bookReview: IBookReview) : Promise<IBookReview> => {
        const resultReview = await backendService.addBookReviewToBook(bookReview);
        if (resultReview) {
            const book = books.find(x => x.id === resultReview.bookId);
            if(book) {
                const bookCopy = {...book};
                bookCopy.bookReviews.push(resultReview);
                if(bookCopy.rating){
                    let totalRating = 0;
                    let itemsWithRating = 0;
                    bookCopy.bookReviews.forEach(element => {
                        if(element.rating){
                            totalRating = totalRating + element.rating;
                            itemsWithRating++;
                        }
                    });
                    bookCopy.rating = roundUpToDecimal(totalRating/itemsWithRating);
                    bookCopy.ratingCount = itemsWithRating;
                } else {
                    bookCopy.rating = resultReview.rating;
                    bookCopy.ratingCount = 1;
                }
                updateBookInContext(bookCopy);
            }
        }
        return resultReview;
    };

    const removeBookReview = async (bookReview: IBookReview): Promise<boolean> => {
        try {
            const result = await backendService.removeBookReviewFromBook(bookReview);
            if (result) {
                const book = books.find(b => b.id === bookReview.bookId);
                if (book) {
                    const bookCopy = {...book};
                    bookCopy.bookReviews = bookCopy.bookReviews.filter(br => !(br.id === bookReview.id));
                    if (bookCopy.rating) {
                        let totalRating = 0;
                        let itemsWithRating = 0;
                        bookCopy.bookReviews.forEach(element => {
                            if(element.rating){
                                totalRating = totalRating + element.rating;
                                itemsWithRating++;
                            }
                        });
                        bookCopy.rating = roundUpToDecimal(totalRating/itemsWithRating);
                        bookCopy.ratingCount = itemsWithRating;
                    }
                    updateBookInContext(bookCopy);
                }
            }
            return result;
        } catch (error) {
            return false;
        }
    };

    const removeMyBookReviews = async (): Promise<boolean> => {
        try {
            const result = await backendService.removeMyBookReviews();
            if (result) {
                const booksCopy = [...books];
                booksCopy.map(bookCopy => {
                    if (bookCopy.bookReviews.some(review => review.username == authContext.account?.name)) {
                        bookCopy.bookReviews = bookCopy.bookReviews.filter(review => review.username != authContext.account?.name);
                        if (bookCopy.rating) {
                            let totalRating = 0;
                            let itemsWithRating = 0;
                            bookCopy.bookReviews.forEach(element => {
                                if(element.rating){
                                    totalRating = totalRating + element.rating;
                                    itemsWithRating++;
                                }
                            });
                            bookCopy.rating = totalRating == 0 ? undefined : roundUpToDecimal(totalRating/itemsWithRating);
                            bookCopy.ratingCount = itemsWithRating;
                        }
                        updateBookInContext(bookCopy);
                    }
                });
            }
            return result;
        } catch (error) {
            return false;
        }
    };

    const addBookWish = async (bookWish: IBookWish) : Promise<IBookWish> => {
        const result = await backendService.addBookWish(bookWish);
        if (result) {
            updateBookWishesInContext(result);
        }
        return result;
    };

    const updateBookWish = async (bookWish: IBookWish): Promise<IBookWish | undefined> => {
        try {
            const result = await backendService.updateBookWish(bookWish);
            if (result) {
                updateBookWishesInContext(result);
            }
            return result;
        } catch (error) {
            return;
        }
    };

    const removeBookWish = async (bookWish: IBookWish): Promise<boolean> => {
        try {
            const result = await backendService.removeBookWish(bookWish);
            if (result) {
                const updatedWishes = bookwishes.filter(bw => !(bw.id === bookWish.id));
                setBookWishes(updatedWishes);
            }
            return result;
        } catch (error) {
            return false;
        }
    };

    const removeMyBookWishes = async (): Promise<boolean> => {
        try {
            const result = await backendService.removeMyBookWishes();
            if (result) {
                const updatedWishes = bookwishes.filter(bw => !(bw.username === authContext.account?.name));
                setBookWishes(updatedWishes);
            }
            return result;
        } catch (error) {
            return false;
        }
    };

    const removeMyBookWishVotes = async (): Promise<boolean> => {
        try {
            const result = await backendService.removeMyBookWishVotes();
            if (result) {
                setBookWishes(result);
            }
            return result != null;
        } catch (error) {
            return false;
        }
    };

    const updateBookWishesInContext = (bookWish: IBookWish) => {
        const index = bookwishes.findIndex(bw => bw.id === bookWish.id);
        const updatedWishes = [ ...bookwishes ];
        if(index === -1){
            updatedWishes.push(bookWish);
        } else {
            updatedWishes[index] = bookWish;
        }
        setBookWishes(updatedWishes);
    };

    const removeUserAndLogOut = async (): Promise<boolean> => {
        try {
            const result = await backendService.removeUser();
            if (result) {
                authContext.logout();
            }
            return result;
        } catch (error) {
            return false;
        }
    };

    return (
        <AppContext.Provider
            value={{
                books,
                addBook,
                getBook,
                getBookFromDb,
                updateBook,
                loans,
                donateBook,
                removeBook,
                removeAllMyBooks,
                onReturnBook,
                getMyBorrowedBooks,
                onBorrowBook,
                removeLoan,
                removeMyLoans,
                isLoadingBooks,
                categories,
                authors,
                apiError,
                addBookReview,
                removeBookReview,
                removeMyBookReviews,
                bookwishes,
                addBookWish,
                updateBookWish,
                removeBookWish,
                removeMyBookWishes,
                removeMyBookWishVotes,
                removeUserAndLogOut,
            }}
        >
            {children}
        </AppContext.Provider>
    );
};


export default StateProvider;