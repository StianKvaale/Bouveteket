import { makeStyles } from "@material-ui/core";

export const useStyles = makeStyles((theme) => ({
    container: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "90vh"
    },
    innerContainer: {
        textAlign: "center",
        justifyContent: "center",
        alignItems: "center",
        display: "inline-block"
    },
    oopsHeader: {paddingBottom: theme.spacing(2)},
    penguinImage: {height: 300}
}));