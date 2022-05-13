
import { CardMedia, Chip, Divider, Grid, Hidden, Tooltip, Typography } from "@material-ui/core";
import { StarBorder } from "@material-ui/icons";
import EventIcon from '@material-ui/icons/Event';
import LanguageIcon from '@material-ui/icons/Language';
import PageIcon from '@material-ui/icons/LibraryBooks';
import { Rating } from "@material-ui/lab";
import { MissingBookIcon } from "components/MissingBookIcon";
import React, { useContext } from "react";
import { LanguageContext } from "store/languageContext";
import { IBook } from "store/types";
import { useStyles } from "styles";
import { getAuthorsText } from "utils/bookUtils";

interface BookDetailsHeaderProps {
    book: IBook;
}

export const BookDetailsHeader = ({book} : BookDetailsHeaderProps): JSX.Element => {
    const classes = useStyles();
    const { dispatch: { translate }} = useContext(LanguageContext);
    const numberOfPagesLabel = translate("numberOfPages");
    const languageLabel = translate("language");
    const publishedLabel = translate("published");

    return (
        <Grid container>
            <Grid item xs={12} md={9}>
                <Grid container>
                    <Grid item xs={12} sm={9} md={12}>
                        <Grid item xs={12}>
                            <Typography variant="overline" color="textPrimary" gutterBottom>{getAuthorsText(book.authors, translate)}</Typography>
                            <Typography variant="h4" color="textPrimary">{book.title}</Typography>
                            <Typography variant="subtitle1" color="textPrimary">
                                {book.subTitle}
                            </Typography>
                            <Typography variant="caption">ISBN: {book.ean}</Typography>
                        </Grid>

                        <Hidden smUp>
                            <Grid item xs={12} className={classes.topMargin}>
                                {book.imageUrl ? (
                                    <CardMedia component="img"
                                        src={book.imageUrl}
                                        alt={book.title}
                                        className={classes.bookDetailImageMobile}
                                    />
                                ) : <MissingBookIcon />}
                            </Grid>
                        </Hidden>

                        <Grid item xs={12} className={classes.topMargin}>
                            <Grid container spacing={4}>
                                <Grid item className={classes.bookDetailsIconItem} >
                                    <Tooltip title={numberOfPagesLabel} placement="top">
                                        <PageIcon
                                            aria-label={numberOfPagesLabel}
                                            aria-hidden="false"
                                        />
                                    </Tooltip>
                                    <Typography>{book.pages ?? "?"} </Typography>
                                </Grid>
                                <Grid item className={classes.bookDetailsIconItem}>
                                    <Tooltip title={languageLabel} placement="top">
                                        <LanguageIcon
                                            aria-label={languageLabel}
                                            aria-hidden="false"
                                        />
                                    </Tooltip>
                                    <Typography>{book.language ?? "?"}</Typography>
                                </Grid>
                                <Grid item className={classes.bookDetailsIconItem}>
                                    <Tooltip title={publishedLabel} placement="top">
                                        <EventIcon
                                            aria-label={publishedLabel}
                                            aria-hidden="false"
                                        />
                                    </Tooltip>
                                    <Typography>{book.published ?? "?"}</Typography>
                                </Grid>
                            </Grid>
                        </Grid>

                        {book.rating && <Grid item xs={12} className={classes.topMargin}>
                            <Typography variant="subtitle2">{translate("reviewsFromBouveteket")}</Typography>
                            <Grid container spacing={1} >
                                <Grid item>
                                    <Rating
                                        defaultValue={book.rating}
                                        precision={0.5}
                                        size="small"
                                        emptyIcon={<StarBorder fontSize="inherit" />}
                                        readOnly
                                    />
                                </Grid>
                                <Grid item>
                                    {book.rating + translate("outOfFiveStars")}
                                </Grid>
                                <Grid item>
                                    <Tooltip title={translate("numberOfRatings")} placement="top">
                                        <Grid>
                                        ({book.ratingCount})
                                        </Grid>
                                    </Tooltip>
                                </Grid>
                            </Grid>
                        </Grid>}

                        {book.googleRating && <Grid item xs={12} className={classes.topMargin}>
                            <Typography variant="subtitle2" >{translate("reviewsFromGoogle")}</Typography>
                            <Grid container spacing={1} >
                                <Grid item>
                                    <Rating
                                        defaultValue={book.googleRating}
                                        precision={0.5}
                                        size="small"
                                        emptyIcon={<StarBorder fontSize="inherit" />}
                                        readOnly
                                    />
                                </Grid>
                                <Grid item>
                                    {book.googleRating + translate("outOfFiveStars")}
                                </Grid>
                                <Grid item>
                                    <Tooltip title={translate("numberOfRatingsFromGoogle")} placement="top">
                                        <Grid>
                                        ({book.googleRatingCount})
                                        </Grid>
                                    </Tooltip>
                                </Grid>
                            </Grid>
                        </Grid>}

                        <Grid item xs={12} className={classes.topMargin}>
                            <Grid container spacing={1}>
                                {book.categories.map((category, i) =>
                                    <Grid item key={i}>
                                        <Chip label={category.title} />
                                    </Grid>
                                )}
                            </Grid>
                        </Grid>
                    </Grid>

                    <Hidden xsDown mdUp>
                        <Grid item sm={3}>
                            {book.imageUrl ? (
                                <CardMedia component="img"
                                    src={book.imageUrl}
                                    alt={book.title}
                                />
                            ) : <MissingBookIcon />}
                        </Grid>
                    </Hidden>

                    {book.description && <Grid item xs={12} md={11}>
                        <Divider className={classes.bookDetailDivider}/>
                    </Grid>}

                    <Grid item xs={12} md={11} className={classes.topMargin}>
                        <Typography variant="subtitle2">
                            {book.description}
                        </Typography>
                    </Grid>
                </Grid>
            </Grid>
            <Hidden smDown>
                <Grid item sm={3}>
                    {book.imageUrl ? (
                        <CardMedia component="img"
                            src={book.imageUrl}
                            alt={book.title}
                        />
                    ) : <MissingBookIcon />}
                </Grid>
            </Hidden>
        </Grid>
    );
};

export default BookDetailsHeader;