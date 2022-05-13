import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, useMediaQuery, useTheme } from "@material-ui/core";
import { PhotoCamera } from "@material-ui/icons";
import React, { useContext, useRef } from "react";
import Webcam from "react-webcam";
import { LanguageContext } from "store/languageContext";
import { useStyles } from "styles";

interface CoverPhotoPopupProps {
  visible: boolean;
  setVisible: (value: boolean) => void;
  setImageSource: (imageSource: string) => void;
}

export const CoverPhotoPopup = ({visible, setVisible, setImageSource}: CoverPhotoPopupProps): JSX.Element => {
    const { dispatch: { translate }} = useContext(LanguageContext);
    const classes = useStyles();
    const theme = useTheme();
    const webcamRef = useRef<Webcam>(null);
    const captureImage = () => {
        const imageSrc = webcamRef?.current?.getScreenshot();
        if (imageSrc) {
            setImageSource(imageSrc);
            setVisible(false);
        }
    };
    return (
        <Dialog
            open={visible}
            onClose={() => setVisible(false)}
            aria-labelledby="cover-photo-dialog-title"
            fullScreen={useMediaQuery(theme.breakpoints.down('sm'))}
        >
            <DialogTitle id="cover-photo-dialog-title">{translate("photographBookCover")}</DialogTitle>
            <DialogContent>
                <Webcam
                    audio={false}
                    width={"100%"}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    videoConstraints={{
                        facingMode: "environment"
                    }}
                />
                <div className={classes.photoCameraButtonContainer}>
                    <IconButton
                        aria-label={translate("takePhoto")}
                        onClick={captureImage}>
                        <PhotoCamera />
                    </IconButton>
                </div>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setVisible(false)} color="primary">{translate("close")}</Button>
            </DialogActions>
        </Dialog>
    );
};
export default CoverPhotoPopup;