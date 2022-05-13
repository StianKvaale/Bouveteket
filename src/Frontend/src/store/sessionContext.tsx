import { SortOptions } from "config/enums";
import PropTypes from "prop-types";
import React, { createContext, useState } from "react";
interface SessionContextProps {
    isAvailableFilterChecked: boolean;
    onIsAvailableFilterChecked: () => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    selectedSortOption: string;
    setSelectedSortOption: (selectedSortOption: string) => void;
    selectedCategoryFilter: string[];
    setSelectedCategoryFilter: (selectedCategoryFilter: string[]) => void;
    selectedAuthorFilter: string[];
    setSelectedAuthorFilter: (selectedAuthorFilter: string[]) => void;
    selectedLanguageFilter: string[];
    setSelectedLanguageFilter: (selectedLanguageFilter: string[]) => void;
    page: number;
    setPage: (page: number) => void;
    rowsPerPage: number;
    setRowsPerPage: (rowsPerPage: number) => void;
}

export const SessionContext = createContext<SessionContextProps>({} as SessionContextProps);

export const SessionProvider: React.FC = ({ children }): JSX.Element => {
    const [isAvailableFilterChecked, setIsAvailableFilterChecked] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedSortOption, setSelectedSortOption] = useState<string>(SortOptions.DateAdded);
    const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string[]>([]);
    const [selectedAuthorFilter, setSelectedAuthorFilter] = useState<string[]>([]);
    const [selectedLanguageFilter, setSelectedLanguageFilter] = useState<string[]>([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(15);

    const onIsAvailableFilterChecked = () => {
        setIsAvailableFilterChecked(!isAvailableFilterChecked);
    };

    return (
        <SessionContext.Provider
            value={{isAvailableFilterChecked, onIsAvailableFilterChecked, searchQuery, setSearchQuery, selectedSortOption,
                setSelectedSortOption, selectedCategoryFilter, setSelectedCategoryFilter, selectedAuthorFilter, setSelectedAuthorFilter,
                selectedLanguageFilter, setSelectedLanguageFilter, page, setPage, rowsPerPage, setRowsPerPage}}
        >
            {children}
        </SessionContext.Provider>
    );
};

SessionProvider.propTypes = {
    children: PropTypes.node,
};

export default SessionProvider;