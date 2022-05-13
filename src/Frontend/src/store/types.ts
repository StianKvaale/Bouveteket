export interface IBook {
    id: number;
    ean: string,
    title: string,
    imageUrl?: string,
    description: string,
    subTitle: string,
    authors: IAuthor[],
    categories: ICategory[],
    language?: string,
    quantity: number,
    availableQuantity: number,
    pages?: number,
    published?: number,
    rating?: number,
    ratingCount?: number,
    googleRating?: number,
    googleRatingCount?: number,
    dateAdded: Date,
    owners: IOwnership[],
    active: boolean,
    bookReviews: IBookReview[],
    activeLoans: ILoan[]
}

export interface IAuthor {
    id?: number;
    name: string;
}

export interface ICategory {
    id?: number;
    title: string;
}

export interface IOwnership {
    id: string;
    userId: string;
    bookId: number;
    quantity: number;
}

export interface ILoan {
    id: number,
    userId: string,
    bookId: number,
    dateBorrowed: Date,
    dateDelivered?: Date,
}

export interface IBorrowedBook extends ILoan {
    title: string,
    authors: IAuthor[]
}

export interface IMsGraphUser {
    department: string
}

export interface IUser {
    language: number,
    useDarkMode: boolean
}

export interface EditBookFormError {
    title: boolean;
    authors: boolean;
    ean: boolean;
    quantity: boolean;
}

export interface IBookReview {
    id: number,
    username: string,
    title: string,
    rating?: number,
    comment: string,
    dateAdded: Date,
    bookId?: number
}

export interface IBookWish {
    id: number,
    title: string,
    authors: string,
    comment: string,
    username: string,
    votes: number,
    voters: string[]
}