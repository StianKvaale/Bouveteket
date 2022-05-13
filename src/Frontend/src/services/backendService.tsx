import axios from "axios";
import { getBackendUrl } from "config/environment";
import { getAccessToken } from "store/authContext";
import { IAuthor, IBook, IBookReview, IBookWish, ICategory, ILoan, IUser } from "../store/types";

const restAPI = axios.create({
    baseURL: getBackendUrl(),
    headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
    }
});

restAPI.interceptors.request.use(
    async config => {
        const accessToken = await getAccessToken();
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);


const customError = (name: string, message: string): Error => {
    const error = new Error(message);
    error.name = name;
    return error;
};

export const getBooks = async (): Promise<IBook[]> => {
    return await restAPI.get('book')
        .then(response => response.data)
        .catch(error => { throw customError(error.message, "Could not get books."); });
};

export const addBook = async (book: IBook): Promise<IBook> => {
    return await restAPI.post('book', book)
        .then(response => response.data)
        .catch(error => {
            throw customError(error.message, "Could not add book.");
        });
};

export const donateBook = async (bookId: number): Promise<IBook> => {
    return await restAPI.put(`book/DonateBook/${bookId}`)
        .then(response => response.data)
        .catch(error => { throw customError(error.message, "Could not donate book to library."); });
};

export const removeBook = async (bookId: number): Promise<IBook> => {
    return await restAPI.put(`book/RemoveBook/${bookId}`)
        .then(response => response.data)
        .catch(error => { throw customError(error.message, "Could not remove book from library."); });
};

export const removeAllMyBooks = async (isDonation: boolean): Promise<boolean> => {
    return await restAPI.put(`book/RemoveAllMyBooks/${isDonation}`)
        .then(response => response.data)
        .catch(error => { throw customError(error.message, "Could not remove my books from library."); });
};

export const updateBook = async (book: IBook): Promise<IBook> => {
    return await restAPI.put('book', book)
        .then(response => response.data)
        .catch(error => { throw customError(error.message, "Could not update book."); });
};

export const borrowBook = async (bookId: number): Promise<ILoan> => {
    return await restAPI.post(`loan/borrowBook/${bookId}`)
        .then(response => response.data)
        .catch(error => { throw customError(error.message, "Could not borrow book."); });
};

export const returnBook = async (bookId: number): Promise<ILoan> => {
    return await restAPI.put(`loan/returnBook/${bookId}`)
        .then(response => response.data)
        .catch(error => { throw customError(error.message, "Could not return book."); });
};

export const getLoans = async (): Promise<ILoan[]> => {
    return await restAPI.get('loan/getAllLoans')
        .then(response => response.data)
        .catch(error => { throw customError(error.message, "Could not get loans."); });
};

export const getLoansForActiveUser = async (onlyActiveLoans: boolean): Promise<ILoan[]> => {
    return await restAPI.get(`loan/getAllLoansForUser/${onlyActiveLoans}`)
        .then(response => response.data)
        .catch(error => { throw customError(error.message, "Could not get loans."); });
};

export const removeLoan = async (loan: ILoan): Promise<boolean> => {
    return await restAPI.put(`loan/Delete`, loan)
        .then(response => response.data)
        .catch(error => { throw customError(error.message, "Could not delete loan"); });
};

export const removeMyLoans = async (onlyDeliveredLoans: boolean): Promise<boolean> => {
    return await restAPI.put(`loan/DeleteAllMyLoans/${onlyDeliveredLoans}`)
        .then(response => response.data)
        .catch(error => { throw customError(error.message, "Could not delete my loans"); });
};

export const getAuthors = async (): Promise<IAuthor[]> => {
    return await restAPI.get('author')
        .then(response => response.data)
        .catch(error => { throw customError(error.message, "Could not get authors."); });
};

export const getCategories = async (): Promise<ICategory[]> => {
    return await restAPI.get('category')
        .then(response => response.data)
        .catch(error => { throw customError(error.message, "Could not get categories."); });
};

export const getUser = async (): Promise<IUser> => {
    return await restAPI.get('user')
        .then(response => response.data)
        .catch(error => { throw customError(error.message, "Could not get user."); });
};

export const saveUser = async (user: IUser): Promise<IUser> => {
    return await restAPI.put(`user`, user)
        .then(response => response.data)
        .catch(error => { throw customError(error.message, "Could not save user"); });
};

export const addBookReviewToBook = async (bookReview: IBookReview): Promise<IBookReview> => {
    return await restAPI.post(`book/AddBookReview`, bookReview)
        .then(response => response.data)
        .catch(error => { throw customError(error.message, "Could not add bookreview"); });
};

export const removeBookReviewFromBook = async (bookReview: IBookReview): Promise<boolean> => {
    return await restAPI.put(`book/RemoveBookReview`, bookReview)
        .then(response => response.data)
        .catch(error => { throw customError(error.message, "Could not delete bookreview"); });
};

export const removeMyBookReviews = async (): Promise<boolean> => {
    return await restAPI.put(`book/RemoveAllMyBookReviews`)
        .then(response => response.data)
        .catch(error => { throw customError(error.message, "Could not delete my bookreviews"); });
};

export const getBookWishes = async (): Promise<IBookWish[]> => {
    return await restAPI.get('bookwish')
        .then(response => response.data)
        .catch(error => { throw customError(error.message, "Could not get wishlist."); });
};

export const addBookWish = async (bookWish: IBookWish): Promise<IBookWish> => {
    return await restAPI.post(`bookwish`, bookWish)
        .then(response => response.data)
        .catch(error => { throw customError(error.message, "Could not add bookwish"); });
};

export const updateBookWish = async (bookWish: IBookWish): Promise<IBookWish> => {
    return await restAPI.put(`bookwish`, bookWish)
        .then(response => response.data)
        .catch(error => { throw customError(error.message, "Could not update bookwish"); });
};

export const removeBookWish = async (bookWish: IBookWish): Promise<boolean> => {
    return await restAPI.put(`bookwish/Delete`, bookWish)
        .then(response => response.data)
        .catch(error => { throw customError(error.message, "Could not delete bookwish"); });
};

export const removeMyBookWishes = async (): Promise<boolean> => {
    return await restAPI.put(`bookwish/DeleteAllMine`)
        .then(response => response.data)
        .catch(error => { throw customError(error.message, "Could not delete my bookwishes"); });
};

export const removeMyBookWishVotes = async (): Promise<IBookWish[]> => {
    return await restAPI.put(`bookwish/DeleteAllMyVotes`)
        .then(response => response.data)
        .catch(error => { throw customError(error.message, "Could not delete my bookwishe-votes"); });
};

export const removeUser = async (): Promise<boolean> => {
    return await restAPI.put(`user/Delete`)
        .then(response => response.data)
        .catch(error => { throw customError(error.message, "Could not delete user"); });
};

export default {getBooks, addBook, donateBook, removeBook, removeAllMyBooks, updateBook, borrowBook, returnBook,
    getLoans, removeLoan, removeMyLoans, getLoansForActiveUser, getAuthors, getCategories, getUser, saveUser, addBookReviewToBook,
    removeBookReviewFromBook, removeMyBookReviews, getBookWishes, addBookWish, updateBookWish, removeBookWish, removeMyBookWishes, removeMyBookWishVotes, removeUser};
