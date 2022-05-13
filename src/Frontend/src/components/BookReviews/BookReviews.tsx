import { AddBookReviewForm } from "components/AddBookReviewForm";
import { BookReviewItem } from "components/BookReviewItem";
import React from "react";
import { IBook } from "store/types";



interface BookReviewsProps {
    book: IBook;
}
export const BookReviews = ({book} : BookReviewsProps): JSX.Element => {
    return (
        <>
            {book.bookReviews.length > 0  ?
                book.bookReviews.map((bookReview, i) => (
                    <BookReviewItem
                        key={i}
                        bookReview={bookReview}
                    />
                )
                ) : (
                    <>
                    </>
                )
            }
            <AddBookReviewForm
                book={book}
            />
        </>
    );
};

export default BookReviews;
