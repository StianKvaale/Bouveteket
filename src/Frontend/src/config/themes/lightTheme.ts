
import { createMuiTheme } from "@material-ui/core/styles";
import { mainFonts } from "./fonts";


export const lightTheme = createMuiTheme({
    palette: {
        type: "light",
        primary: {
            main: "#ECECEC", // Grey base color
            contrastText: "#4a4a4a" // Darker grey
        },
        secondary: {
            main: "#FF6400", // Orange base color
            contrastText: "#FFFFFF" // White
        },
        text: {
            primary: "#222222", // Black
            secondary: "#222222" // "#7a7a7a" // Lighter black
        }
    },
    typography: {
        fontFamily: mainFonts
    }
});

// Override default themes

// By applying styles like shown below, the styles will automatically be applied to every element (like )
Object.assign(lightTheme, {
    overrides: {
        MuiButton: {
            textPrimary: {
                color: lightTheme.palette.secondary.main
            }
        },
        MuiOutlinedInput: {
            root: {
                '&$focused $notchedOutline': {
                    borderColor: lightTheme.palette.secondary.main,
                },
            }
        },
        MuiInputLabel: {
            root: {
                "&$focused": {
                    color: lightTheme.palette.text.primary
                }
            }
        },
    }
});

//export default lightTheme;