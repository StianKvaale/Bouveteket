import { Grid, Typography } from "@material-ui/core";
import { BarcodeFormat, BrowserMultiFormatReader, DecodeHintType, Result } from "@zxing/library";
import PermissionGuide from "images/permission-guide.png";
import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import { LanguageContext } from "store/languageContext";
import { useStyles } from "styles";

interface BarcodeScannerProps {
    onUpdate: (arg0: unknown, arg1?: Result) => void;
}

export const BarcodeScanner = ({onUpdate}: BarcodeScannerProps): JSX.Element => {
    const webcamRef = useRef<Webcam>(null);
    const codeReader = new BrowserMultiFormatReader();
    const classes = useStyles();
    const { dispatch: { translate }} = useContext(LanguageContext);
    const hints = new Map();
    const formats = [BarcodeFormat.EAN_8, BarcodeFormat.EAN_13];
    const [cameraPermissionGranted, setCameraPermissionGranted] = useState<boolean>(true);
    hints.set(DecodeHintType.POSSIBLE_FORMATS, formats);

    codeReader.hints = hints;

    const capture = useCallback(
        () => {
            const imageSrc = webcamRef?.current?.getScreenshot();
            if (imageSrc) {
                codeReader.decodeFromImage(undefined, imageSrc)
                    .then(result => {
                        onUpdate(null, result);
                    }).catch((err) => {
                        onUpdate(err);
                    });
            }
        },
        [codeReader, onUpdate]
    );

    useEffect(() => {
        navigator.mediaDevices.getUserMedia({video: true})
            .then(() => {
                setCameraPermissionGranted(true);
                setInterval(capture, 100);
            })
            .catch(() => setCameraPermissionGranted(false));
    }, []);

    return (
        <>
            {!cameraPermissionGranted ? (
                <Grid container spacing={2}>
                    <Grid item>
                        <Typography variant="subtitle1" color="textPrimary">
                            {translate("thisFunctionNeedsPermissionToYourCamera")}
                        </Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <img src={PermissionGuide} className={classes.permissionGuideImage}/>
                    </Grid>
                </Grid>
            ) : (
                <Grid container spacing={2}>
                    <Grid item>
                        <Typography variant="subtitle1" color="textPrimary">
                            {translate("barcodeDescription")}
                        </Typography>
                    </Grid>
                    <Grid item>
                        <Webcam
                            audio={false}
                            width={"100%"}
                            ref={webcamRef}
                            screenshotFormat="image/png"
                            videoConstraints={{
                                facingMode: "environment"
                            }}
                        />
                    </Grid>
                </Grid>
            )}
        </>
    );
};

export default BarcodeScanner;