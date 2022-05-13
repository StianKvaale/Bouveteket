import { Avatar, Button, IconButton, List, ListItem, ListItemIcon, ListItemSecondaryAction, ListItemText, Popover, Switch, Typography } from "@material-ui/core";
import { Language, Mail, WbIncandescent, Work } from "@material-ui/icons";
import { Paths } from "config/enums";
import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProfilePicture, getUserInformation } from "services/msGraphService";
import { AuthContext } from "store/authContext";
import { LanguageContext } from "store/languageContext";
import { IMsGraphUser } from "store/types";
import { useStyles } from "styles";

export const ProfileMenu = (): JSX.Element => {
    const classes = useStyles();
    const { dispatch: { translate }} = useContext(LanguageContext);
    const authContext = useContext(AuthContext);
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
    const [profilePicture, setProfilePicture] = useState("");
    const [profileInformation, setProfileInformation] = useState<IMsGraphUser>();

    useEffect(() => {
        getProfilePicture().then(result => {
            setProfilePicture(result);
        });

        getUserInformation().then(result => {
            setProfileInformation(result);
        });
    }, []);

    return <>
        {profilePicture && (
            <IconButton aria-describedby="popover" onClick={event => setAnchorEl(event.currentTarget)} className={classes.removePadding} disableRipple>
                <Avatar alt={authContext.account?.name ?? translate("defaultUser")} src={profilePicture} className={classes.popoverAvatar} />
            </IconButton>
        )}

        <Popover
            id="popover"
            open={!!anchorEl}
            anchorEl={anchorEl}
            onClose={() => setAnchorEl(null)}
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'center',
            }}
            transformOrigin={{
                vertical: 'top',
                horizontal: 'center',
            }}
            className={classes.headerPopover}
        >
            <List>
                {authContext?.account?.name && (
                    <ListItem className={classes.centerHorizontal}>
                        <Typography variant="h5">{authContext.account.name}</Typography>
                    </ListItem>
                )}
                {authContext?.account?.username && (
                    <ListItem>
                        <ListItemIcon className={classes.listItemIconSize}><Mail /></ListItemIcon>
                        <ListItemText>{authContext.account.username}</ListItemText>
                    </ListItem>
                )}
                {profileInformation?.department && (
                    <ListItem>
                        <ListItemIcon className={classes.listItemIconSize}><Work /></ListItemIcon>
                        <ListItemText>{profileInformation.department}</ListItemText>
                    </ListItem>
                )}
                <ListItem>
                    <ListItemIcon className={classes.listItemIconSize}><Language /></ListItemIcon>
                    <ListItemText>{translate("selectedLanguage")}</ListItemText>
                    <ListItemSecondaryAction>
                        <Switch
                            edge="end"
                            onChange={() => authContext.setLanguageForUser(authContext.user.language === 0 ? 1 : 0)}
                            checked={authContext.user.language === 0 ? true : false}
                        />
                    </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                    <ListItemIcon className={classes.listItemIconSize}><WbIncandescent /></ListItemIcon>
                    <ListItemText>
                        {authContext.user.useDarkMode ? translate("darkMode") : translate("lightMode")}
                    </ListItemText>
                    <ListItemSecondaryAction>
                        <Switch
                            edge="end"
                            onChange={() => authContext.setDarkModeForUser(!authContext.user.useDarkMode)}
                            checked={authContext.user.useDarkMode}
                        />
                    </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                    <Button color="secondary" className={classes.headerButton} component={Link} to={Paths.MyBooks} onClick={() => setAnchorEl(null)}>
                        {translate("myBooks")}
                    </Button>

                    <Button color="secondary" className={classes.headerButton} component={Link} to={Paths.Statistics} onClick={() => setAnchorEl(null)}>
                        {translate("statistics")} 🤓
                    </Button>
                </ListItem>
                <ListItem>
                    <Button color="secondary" className={classes.headerButton} component={Link} to={Paths.Gdpr} onClick={() => setAnchorEl(null)}>
                        {translate("seeAndChangePersonalData")}
                    </Button>
                </ListItem>
                <ListItem>
                    <Button onClick={authContext.logout} variant={"contained"} color={"secondary"} fullWidth>
                        {translate("logout")}
                    </Button>
                </ListItem>
            </List>
        </Popover>
    </>;
};

export default ProfileMenu;