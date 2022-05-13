
import { createMuiTheme } from "@material-ui/core/styles";
import { mainFonts } from "./fonts";


export const darkTheme = createMuiTheme({
    palette: {
        type: "dark",
        primary: {
            main: "#4a4a4a", // Grey base color
            contrastText: "#ECECEC" // Lighter grey
        },
        secondary: {
            main: "#FF6400", // Orange base color
            contrastText: "#000000" // Black
        },
        text: {
            primary: "#DDDDDD", // White
            secondary: "#DDDDDD" // "#858585" // Darker white
        }
    },
    typography: {
        fontFamily: mainFonts
    }
});

// Override default themes

// By applying styles like shown below, the styles will automatically be applied to every element (like )
Object.assign(darkTheme, {
    overrides: {
        // Override flat button for use in DateTimePicker
        MuiButton: {
            textPrimary: {
                color: darkTheme.palette.secondary.main
            }
        },
        MuiOutlinedInput: {
            root: {
                '&$focused $notchedOutline': {
                    borderColor: darkTheme.palette.secondary.main,
                },
            }
        },
        MuiInputLabel: {
            root: {
                "&$focused": {
                    color: darkTheme.palette.text.primary
                }
            }
        },
    }
});

// Here's some examples

// Object.assign(theme, {
//     overrides: {
//         // Override flat button for use in DateTimePicker
//         MuiButton: {
//             textPrimary: {
//                 color: theme.palette.secondary.main
//             }
//         },
//         // Override pointer for use in DateTimePicker
//         MuiPickersClockPointer: {
//             pointer: {
//                 backgroundColor: theme.palette.secondary.main
//             },
//             noPoint: {
//                 backgroundColor: theme.palette.secondary.main
//             },
//             thumb: {
//                 border: `14px solid ${theme.palette.secondary.main}`,
//                 backgroundColor: theme.palette.secondary.contrastText
//             }
//         },
//         MuiPickersClock: {
//             pin: { backgroundColor: theme.palette.secondary.main }
//         },
//         MuiInputLabel: {
//             // Name of the component ⚛️ / style sheet
//             root: {
//                 "&$focused": {
//                     // increase the specificity for the pseudo class
//                     color: theme.palette.secondary.main
//                 }
//             }
//         },
//         MuiTab: {
//             root: {
//                 textTransform: "none",
//                 fontSize: "1rem",
//                 "@media (min-width: 600px)": {
//                     fontSize: "1rem"
//                 }
//             },
//             wrapper: {
//                 alignItems: "start"
//             }
//         }
//     }
// });