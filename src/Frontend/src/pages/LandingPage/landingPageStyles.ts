import { makeStyles } from "@material-ui/core";
import mobileBackground from "images/bulb-cover.jpg";

export const mobileBackgroundWidth = 640;

export const useStyles = makeStyles(() => ({
    landingPageGrid: {
        background: "#010600",
        "@supports ( -moz-appearance:none )" : { //Firefox styling - FF renders colors differently than chrome/edge for some reason
            background: "#090e00"
        },
        height: "100vh"
    },
    centeredGridItem: {
        display: "flex",
        alignItems: "self-start",
        justifyContent: "center"
    },
    bulbCoverImage: {
        height: "60%",
        backgroundSize: "cover",
        backgroundPosition: "center center",
        background: `url(${mobileBackground}) no-repeat`,
    },
    welcomeMessageItem: {
        height: "15%",
        [`@media (min-width:${mobileBackgroundWidth}px)`]: {
            whiteSpace: "nowrap"
        }
    },
    joinButtonItem: {
        height: "25%"
    },
    loadingContainer: {
        display: "flex",
        height: "100vh",
        justifyContent: "center",
        alignItems: "center"
    }
}));