import {
    AccountInfo,
    AuthenticationResult,
    Configuration,
    PublicClientApplication
} from '@azure/msal-browser';
import React, { useCallback, useEffect, useState } from 'react';
import { backendService } from 'services';
import { IUser } from 'store/types';

const msalConfig: Configuration = {
    auth: {
        clientId: '06db8bfe-975d-46ee-b6c5-e5a0749502a6',
        authority: 'https://login.microsoftonline.com/c317fa72-b393-44ea-a87c-ea272e8d963d',
        redirectUri: window.location.origin,
        navigateToLoginRequestUrl: false
    },
    cache: {
        cacheLocation: 'localStorage',
        storeAuthStateInCookie: true
    },
};

export const msalInstance = new PublicClientApplication(msalConfig);

const scopes = [
    'openid',
    'offline_access',
    'api://Bouveteket/Bouveteket.ReadAndWrite'
];

const loginRequest = { scopes };

export const getAccessToken = async (): Promise<string> => {
    const request = {
        account: msalInstance.getAllAccounts()[0],
        scopes,
    };
    const tokenResponse = await msalInstance?.acquireTokenSilent(request);
    if (tokenResponse.accessToken === undefined)
        throw Error('Unable to retrieve token');
    return tokenResponse.accessToken;
};

export const getAccessTokenForGraphApi = async (): Promise<string> => {
    const tokenResponse = await msalInstance.acquireTokenSilent({
        scopes: ["https://graph.microsoft.com/User.Read"],
        account: msalInstance.getAllAccounts()[0]
    });
    if (tokenResponse.accessToken === undefined)
        throw Error('Unable to retrieve token');
    return tokenResponse.accessToken;
};

interface IAuthProviderProps{
    children: JSX.Element;
}

export const AuthProvider = ({ children }: IAuthProviderProps): JSX.Element => {
    const [isUserLoggedInTaskDone, setIsUserLoggedInTaskDone] = useState(false);
    const [account, setAccount] = useState<AccountInfo | undefined>(
        msalInstance.getAllAccounts()[0]
    );
    const [user, setUser] = useState<IUser>({
        language: 0,
        useDarkMode: true
    });

    useEffect(() => {
        // This promise handler needs to be set before calling msalInstance.loginRedirect. We need to wait for this callback to finish to know whether the user is logged in or not
        msalInstance.handleRedirectPromise()
            .then(async (tokenResponse) => {
                if(tokenResponse !== null){
                    afterLogin(tokenResponse);
                }
                setIsUserLoggedInTaskDone(true);
                if(account){
                    backendService.getUser()
                        .then(user => {
                            user && setUser(user);
                        })
                        .catch(() => null);
                }
            });
    }, [account]);

    const afterLogin = useCallback(async (tokenResponse: AuthenticationResult | null) => {
        if(tokenResponse && tokenResponse.account){
            setAccount(tokenResponse.account);
        }
        return tokenResponse;
    }, []);

    const login = () => msalInstance.loginRedirect(loginRequest);

    const logout = useCallback(
        () =>
            msalInstance.logout().then(() => {
                setAccount(undefined);
            }),
        []
    );

    const setLanguageForUser = (language: number) => {
        const tempUser = {...user, language};
        setUser(tempUser);
        backendService.saveUser(tempUser)
            .catch(() => null);
    };

    const setDarkModeForUser = (useDarkMode: boolean) => {
        const tempUser = {...user, useDarkMode};
        setUser(tempUser);
        backendService.saveUser(tempUser)
            .catch(() => null);
    };

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated: !!account,
                isUserLoggedInTaskDone,
                login,
                logout,
                account,
                user,
                setDarkModeForUser,
                setLanguageForUser
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const AuthContext = React.createContext<{
  isAuthenticated: boolean;
  isUserLoggedInTaskDone: boolean;
  login: () => void;
  logout: () => Promise<void>;
  user: IUser;
  account?: AccountInfo;
  setDarkModeForUser:(useDarkMode: boolean) => void;
  setLanguageForUser:(language: number) => void;
      }>({
          isAuthenticated: false,
          isUserLoggedInTaskDone: false,
          login: () => undefined,
          logout: async () => undefined,
          setDarkModeForUser: () => undefined,
          setLanguageForUser: () => undefined,
          user: {
              language: 0,
              useDarkMode: true
          }
      });