import { makeStyles, Theme } from "@material-ui/core";
import { blue, green } from '@material-ui/core/colors';

export const useStyles = makeStyles((theme: Theme) => ({
    root: {
        flexGrow: 1,
    },
    userContainer: {
        marginLeft: "auto",
        display: "flex"
    },
    appBar: {
        marginBottom: "20px"
    },
    headerButton: {
        marginLeft: theme.spacing(4)
    },
    removePadding: {
        padding: 0
    },
    centerHorizontal: {
        display: "flex",
        justifyContent: "center"
    },
    centerVertical: {
        display: "flex",
        alignItems: "center"
    },
    placeRight: {
        display: "flex",
        justifyContent: "flex-end"
    },
    spacingTopSm: {
        marginTop: theme.spacing(2)
    },
    spacingTop: {
        marginTop: theme.spacing(4)
    },
    spacingBottom: {
        marginBottom: theme.spacing(4)
    },
    smallSpacingBottom: {
        marginBottom: theme.spacing(1)
    },
    largeSpacingBottomXs: {
        [theme.breakpoints.down('xs')]: {
            marginBottom: theme.spacing(8)
        }
    },
    noPaddingTop: {
        paddingTop: 0
    },
    fullHeight: {
        height: "100%",
    },
    tableWidth35: {
        width: "35%"
    },
    tableWidth27: {
        width: "27%"
    },
    tableWidth35to70: {
        width: "35%",
        [theme.breakpoints.down('xs')]: {
            width: "70%"
        }
    },
    tableWidth40: {
        width: "40%"
    },
    link: {
        color: "inherit",
        textDecoration: "inherit"
    },
    wikiLink: {
        color: "inherit",
    },
    headerPopover: {
        marginTop: "12px"
    },
    popoverAvatar: {
        background: theme.palette.secondary.main
    },
    smallAvatar: {
        width: theme.spacing(3),
        height: theme.spacing(3),
        backgroundColor: theme.palette.secondary.main
    },
    largeAvatar: {
        width: theme.spacing(7),
        height: theme.spacing(7),
        backgroundColor: theme.palette.primary.main
    },
    paper: {
        padding: theme.spacing(3),
        marginBottom: theme.spacing(2)
    },
    smallPaper: {
        padding: theme.spacing(1)
    },
    myLoanTable: {
        marginBottom: theme.spacing(2)
    },
    secondaryColor: {
        color: theme.palette.secondary.main,
        backgroundColor: theme.palette.secondary.main
    },
    listItemIconSize: {
        minWidth: "40px"
    },
    bookItemHeader: {
        padding: "12px"
    },
    bookItemFooter: {
        padding: "12px",
        paddingTop: "0",
        marginBottom: "-12px"
    },
    bookItemContentGrid: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between"
    },
    bookDetailStatus: {
        display: "flex",
        marginTop: theme.spacing(4)
    },
    bookDetailStatusText: {
        marginLeft: theme.spacing(1)
    },
    bookDetailDivider: {
        marginTop: theme.spacing(3),
        marginBottom: theme.spacing(2),
        [theme.breakpoints.down('sm')]: {
            marginTop: theme.spacing(2),
            marginBottom: theme.spacing(1)
        },
    },
    bookDetailsIconItem: {
        textAlign: "center"
    },
    bookDetailsCoverImage: {
        maxHeight: "300px",
        objectFit: "contain",
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1),
    },
    bookDetailImageMobile: {
        margin: "0 auto",
        maxHeight: "300px",
        objectFit: "contain",
    },
    topMargin: {
        marginTop: theme.spacing(2)
    },
    smallTopMargin: {
        marginTop: theme.spacing(1)
    },
    rlySmallTopMargin: {
        marginTop: theme.spacing(0.5)
    },
    bigMargin: {
        marginTop: theme.spacing(6)
    },
    expandMoreIcon: {
        transform: "rotate(0deg)",
        transition: theme.transitions.create("transform", {
            duration: theme.transitions.duration.shortest
        })
    },
    expandMoreIconOpen: {
        transform: "rotate(180deg)"
    },
    registerBookSearchCard: {
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between"
    },
    speedDial: {
        margin: 0,
        top: "auto",
        right: 20,
        bottom: 20,
        left: "auto",
        position: "fixed",
        "& svg": {
            display: "block"
        }
    },
    speedDialAction: {
        whiteSpace: "nowrap"
    },
    useEllipsis: {
        textOverflow: "ellipsis"
    },
    centeredGridItem: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    },
    canBorrowBookIcon: {
        color: green[500]
    },
    bookUnavailableIcon: {
        color: blue[500]
    },
    tableHeader: {
        fontWeight: "bold"
    },
    tableCellLink: {
        padding: "0",
        "& a": {
            display: "block",
            padding: "16px",
            color: "inherit",
            textDecoration: "inherit"
        }
    },
    tableCellDouble: {
        "& span": {
            display: "block"
        }
    },
    bookDetailsHeader: {
        maxHeight: 130
    },
    missingBookIcon: {
        width: '5rem',
        height: '5rem',
        marginRight: 8
    },
    progressContainer: {
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)"
    },
    isBookAvailableCheckbox: {
        marginLeft: "auto",
        [theme.breakpoints.down('sm')]: {
            paddingTop: 0,
            paddingBottom: 0
        },
    },
    photoCameraButtonContainer: {
        textAlign: "center"
    },
    imageMenu: {
        marginTop: theme.spacing(1),
        float: "right"
    },
    bookSearchPopupGrid: {
        marginBottom: theme.spacing(2)
    },
    permissionGuideImage: {
        maxWidth: "100%"
    },
    marginLeftAuto: {
        marginLeft: "auto"
    },
    marginRightRemove: {
        marginRight: "-12px"
    },
    cardImageFill: {
        objectFit: "cover",
        width: "100%",
        height: "100%"
    },
    missingBookStyling: {
        borderRight: "5px solid " + theme.palette.secondary.main,
        width: "100%",
        height: "100%"
    },
    centerImage: {
        marginLeft: "auto",
        marginRight: "auto"
    },
    backdrop: {
        zIndex: 1
    },
    noBorder: {
        border: 0,
        margin: "16px"
    },
    selectFilterChip: {
        margin: "0 3px"
    },
    columnToRow: {
        display: "flex",
        [theme.breakpoints.up('sm')]: {
            flexDirection: "column",
            alignItems: "flex-end"
        },
        [theme.breakpoints.down('xs')]: {
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center"
        }
    },
    searchIcon: {
        fontSize: "1.5rem",
        padding: "2px"
    }
}), {index: 1});
