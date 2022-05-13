import { Card, CardActionArea, CardContent, CardMedia, Grid, Tooltip, Typography } from "@material-ui/core";
import Link from '@material-ui/core/Link';
import { StarBorder } from "@material-ui/icons";
import { Rating } from "@material-ui/lab";
import { BookRentalStatus } from "components/BookRentalStatus";
import { MissingBookIcon } from "components/MissingBookIcon";
import { Paths } from "config/enums";
import React, { useContext } from "react";
import { Link as RouterLink } from 'react-router-dom';
import { LanguageContext } from "store/languageContext";
import { IBook } from "store/types";
import { useStyles } from "styles";
import { getAuthorsText } from "utils/bookUtils";
import { truncateString } from "utils/helpers";

interface BookItemProps {
    book: IBook;
}

export const BookItem = ({book}: BookItemProps): JSX.Element => {
    const { dispatch: { translate }} = useContext(LanguageContext);
    const classes = useStyles();
    const authors = getAuthorsText(book.authors, translate);

    return (
        <Grid item xs={12} sm={6} md={4}>
            <Link component={RouterLink} to={Paths.Details.replace(":id", book.id.toString())}>
                <Card raised className={classes.fullHeight}>
                    <CardActionArea className={classes.fullHeight}>
                        <Grid container className={classes.fullHeight}>
                            <Grid item xs={9} md={8} className={classes.bookItemContentGrid}>
                                <CardContent className={classes.bookItemHeader}>
                                    <Tooltip title={authors}>
                                        <Typography variant="overline" display="block" color="textSecondary" noWrap>{authors}</Typography>
                                    </Tooltip>

                                    <Tooltip title={book.title}>
                                        <Typography variant="h6" color="textSecondary" gutterBottom>{truncateString(book.title, 45)}</Typography>
                                    </Tooltip>

                                    <Tooltip title={book.description}>
                                        <Typography variant="subtitle2" noWrap >{book.description}</Typography>
                                    </Tooltip>
                                </CardContent>

                                <CardContent className={classes.bookItemFooter}>
                                    <Grid container justify="space-between" alignItems="center">
                                        <Grid item>
                                            <BookRentalStatus book={book}/>
                                        </Grid>
                                        <Grid item>
                                            {book.rating &&
                                            <Rating
                                                defaultValue={book.rating}
                                                precision={0.5}
                                                size="small"
                                                emptyIcon={<StarBorder fontSize="inherit" />}
                                                readOnly
                                            />
                                            }
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Grid>
                            <Grid item xs={3} md={4}>
                                {book.imageUrl ?
                                    <CardMedia
                                        component="img"
                                        src={book.imageUrl}
                                        alt={book.title}
                                        className={classes.cardImageFill}
                                    />
                                    : <Grid container justify="center" alignItems="center" className={classes.missingBookStyling}>
                                        <MissingBookIcon />
                                    </Grid>}
                            </Grid>
                        </Grid>
                    </CardActionArea>
                </Card>
            </Link>
        </Grid>
    );
};

export default BookItem;