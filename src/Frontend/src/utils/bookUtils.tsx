import { IAuthor, IBook, IOwnership } from "store/types";

export const getAuthorsText = (authors: IAuthor[] | undefined, translate: (key: string) => string): string => {
    if(authors === undefined || authors.length === 0){
        return translate("unknownAuthor");
    }
    return authors.map((author, i) => (i ? " " : "") + author.name).join();
};

export const getOwnedAmountOrZero = (book: IBook, id: string | undefined): number => {
    if(book == null || !isOwner(book, id)){
        return 0;
    }
    return book.owners.find(o => o.userId === id)?.quantity ?? 0;
};

export const isBorrower = (book: IBook, id: string | undefined): boolean => {
    if(id === undefined){
        return false;
    }
    return book.activeLoans?.some(l => l?.userId?.toString() === id);
};

export const isOwner = (book: IBook, id: string | undefined): boolean => {
    if(id === undefined){
        return false;
    }
    return book.owners?.some(o => o.userId.toString() === id);
};

export const isNumbersOnly = (val: string): boolean =>{
    return /^\d+$/.test(val);
};

export const isValidEanStr = (ean: string): boolean => {
    return (ean != null && isNumbersOnly(ean) && (ean.length === 10 || ean.length === 13)
    );
};

export const tryGetOwnership = (book: IBook, id: string | undefined): IOwnership | null => {
    if(id === undefined){
        return null;
    }
    return book.owners.find(o => o.userId === id) || null;
};

export const tryAddOwnership = (book: IBook, userId: string | undefined): boolean => {
    if(book == null || userId == null){
        return false;
    }
    if(book.owners == null){
        book.owners = [];
    }
    else if(isOwner(book, userId)){
        return true;
    }
    book.owners.push({
        id: "0",
        userId: userId,
        bookId: book.id,
        quantity: 1
    });
    return true;
};

export const tryRemoveOwnership = (book: IBook, userId: string | undefined): boolean => {
    if(book == null || userId == null){
        return false;
    }
    if(book.owners == null){
        book.owners = [];
        return true;
    }
    else if(!isOwner(book, userId)){
        return true;
    }
    const newOwnerships = book.owners.filter(o => o.userId != userId);
    book.owners = newOwnerships;
    return true;
};

export const tryClearOwners = (book: IBook): boolean => {
    if(book == null){
        return false;
    }
    book.owners = [];
    return true;
};
