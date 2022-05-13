import axios from "axios";
import { IndustryIdentifier, SortOptions } from "config/enums";
import { IAuthor, IBook, ICategory } from "../store/types";

export const searchGoogleBooks = (query: string, isEan: boolean) => {
    return axios.get("https://www.googleapis.com/books/v1/volumes?q=" + (isEan ? "isbn:" : "") + query + "&maxResults=40")
        .then(response => {
            if(response.data.items) {
                return response.data.items.map((googleBook: any) => {
                    const authors = googleBook.volumeInfo?.authors?.map((name: string) =>
                      ({ name }) as IAuthor
                    );
                    const categories = googleBook.volumeInfo?.categories?.map((title: string) =>
                      ({ title: title }) as ICategory
                    );

                    const book: IBook = {
                        id: 0,
                        ean: getIsbn13Or10(googleBook.volumeInfo?.industryIdentifiers)?.toString(),
                        title: googleBook.volumeInfo?.title,
                        authors: authors ?? [],
                        imageUrl: googleBook.volumeInfo?.imageLinks?.thumbnail?.replace("http://", "https://"),
                        categories: categories ?? [],
                        description: googleBook.volumeInfo?.description ?? "",
                        subTitle: googleBook.volumeInfo?.subtitle ?? "",
                        language: googleBook.volumeInfo?.language,
                        quantity: 0,
                        availableQuantity: 0,
                        pages: googleBook.volumeInfo?.pageCount,
                        published: googleBook.volumeInfo?.publishedDate?.slice(0, 4),
                        googleRating: googleBook.volumeInfo?.averageRating,
                        googleRatingCount: googleBook.volumeInfo?.ratingsCount,
                        rating: undefined,
                        ratingCount: 0,
                        owners: [],
                        dateAdded: new Date(),
                        active: true,
                        bookReviews: [],
                        activeLoans: []
                    };
                    return book;
                });
            }
            return [];
        })
        .catch(error => { console.log(error); });
};

export const requiredFieldLabel = (label: string): string => {
    return `${label} *`;
};

interface IIndustryIdentifier {
    type: string;
    identifier: string;
}

const getIsbn13Or10 = (industryIdentifiers: IIndustryIdentifier[]) => {
    let isbn = NaN;
    if(!industryIdentifiers){
        return isbn;
    }
    const types = industryIdentifiers.map(identifier => identifier.type);
    let index = types.indexOf(IndustryIdentifier.ISBN_13);
    if (index !== -1) {
        isbn = parseInt(industryIdentifiers[index].identifier);
    }
    else {
        index = types.indexOf(IndustryIdentifier.ISBN_10);
        if (index !== -1) {
            isbn = parseInt(industryIdentifiers[index].identifier);
        }
    }
    return isbn;
};

export const getListOfUniqueItems = <T, K extends keyof T>(list: T[], property: K): T[] => {
    return list.reduce((total: T[], item) =>
        total.some(itemInTotal => itemInTotal[property] == item[property]) ? total : total.concat(item)
    , []);
};

export const getLastName = (name: string): string => {
    if (!name) {
        return "";
    }
    const nameArray = name.split(" ");
    return nameArray[nameArray.length - 1];
};

export const sortBooks = (selectedSortOption: string, booksToSort: IBook[]) : IBook[] => {
    switch(selectedSortOption) {
    case SortOptions.Author:            return booksToSort.sort((a, b) => (getLastName(a.authors[0]?.name) > getLastName(b.authors[0]?.name) ? 1 : -1));
    case SortOptions.AuthorReverse:     return booksToSort.sort((a, b) => (getLastName(a.authors[0]?.name) < getLastName(b.authors[0]?.name) ? 1 : -1));
    case SortOptions.Title:             return booksToSort.sort((a, b) => (a.title > b.title ? 1 : -1));
    case SortOptions.TitleReverse:      return booksToSort.sort((a, b) => (a.title < b.title ? 1 : -1));
    case SortOptions.DateAdded:         return booksToSort.sort((a, b) => (a.dateAdded < b.dateAdded ? 1 : -1));
    case SortOptions.DateAddedReverse:  return booksToSort.sort((a, b) => (a.dateAdded > b.dateAdded ? 1 : -1));
    case SortOptions.Rating:            return booksToSort.sort((a, b) => {
        if(!a.rating) return 1;
        if(!b.rating) return -1;
        return b.rating - a.rating;
    });
    case SortOptions.RatingReverse:     return booksToSort.sort((a, b) => {
        if(!a.rating) return 1;
        if(!b.rating) return -1;
        return a.rating - b.rating;
    });
    default: return booksToSort;
    }
};

export const truncateString = (input: string, displayAmountOfChars: number): string => {
    return input.slice(0, displayAmountOfChars) + (input.length > displayAmountOfChars ? "..." : "");
};

export const trimAndOneWhitespaceString = (input: string): string => {
    return input.trim().replace(/\s\s+/g, ' ');
};

export const roundUpToDecimal = (value: number): number => {
    return Math.round(value * 2)/2;
};