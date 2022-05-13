import { Button, Collapse, Grid, IconButton, useMediaQuery, useTheme } from "@material-ui/core";
import { ExpandLess, ExpandMore } from "@material-ui/icons";
import { SortOptions } from "config/enums";
import React, { useContext, useState } from "react";
import { AppContext } from "store/appContext";
import { LanguageContext } from "store/languageContext";
import { SessionContext } from "store/sessionContext";
import { useStyles } from "styles";
import { CheckboxWithLabel } from "./CheckboxWithLabel";
import { SearchField } from "./SearchField";
import { SelectBox } from "./SelectBox";
import { SelectFilter } from "./SelectFilter";

export const BookFilter = (): JSX.Element => {
    const context = useContext(AppContext);
    const sessionContext = useContext(SessionContext);
    const classes = useStyles();
    const { dispatch: { translate }} = useContext(LanguageContext);
    const [showFilter, setShowFilter] = useState(false);
    const theme = useTheme();
    const smUp = useMediaQuery(theme.breakpoints.up('sm'));

    let allCategories: string[] = [];
    let allAuthors: string[] = [];
    let allLanguages: string[] = [];

    context.books.filter((book) => book.active).map((book) => {
        allCategories = allCategories.concat(book.categories.map(category => category.title));
        allAuthors = allAuthors.concat(book.authors.map(author => author.name));
        allLanguages = allLanguages.concat(book.language ? [book.language] : []);
    });


    return (
        <Grid container spacing={2} className={classes.centerVertical}>
            <Grid item xs={10} md={6}>
                <SearchField />
            </Grid>
            {smUp ?
                <Button
                    aria-label="open filter"
                    onClick={() => setShowFilter(!showFilter)}>
                    {translate("filter")} { showFilter ? <ExpandLess /> : <ExpandMore /> }
                </Button> :
                <IconButton
                    aria-label="open filter"
                    onClick={() => setShowFilter(!showFilter)}>
                    { showFilter ? <ExpandLess /> : <ExpandMore /> }
                </IconButton > }
            <Grid item xs={12}>
                <Collapse in={showFilter}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6} md={4}>
                            <SelectFilter
                                allFilterOptions={allCategories}
                                filterText={translate("categories")}
                                selectedFilter={sessionContext.selectedCategoryFilter}
                                setSelectedFilter={sessionContext.setSelectedCategoryFilter} />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <SelectFilter
                                allFilterOptions={allAuthors}
                                filterText={translate("authors")}
                                selectedFilter={sessionContext.selectedAuthorFilter}
                                setSelectedFilter={sessionContext.setSelectedAuthorFilter} />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <SelectFilter
                                allFilterOptions={allLanguages}
                                filterText={translate("languages")}
                                selectedFilter={sessionContext.selectedLanguageFilter}
                                setSelectedFilter={sessionContext.setSelectedLanguageFilter} />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <SelectBox
                                options={Object.values(SortOptions)}
                                selectedValue={sessionContext.selectedSortOption}
                                setSelectedValue={sessionContext.setSelectedSortOption}
                                setPage={sessionContext.setPage}/>
                        </Grid>
                        <Grid item className={classes.isBookAvailableCheckbox}>
                            <CheckboxWithLabel label={translate("displayOnlyAvailable")} />
                        </Grid>
                    </Grid>
                </Collapse>
            </Grid>
        </Grid>
    );
};