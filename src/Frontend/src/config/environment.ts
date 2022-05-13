import { EnvironmentEnum } from "config/enums";

const environment = process.env.REACT_APP_NODE_ENV;

export const isProductionEnvironment = (): boolean => environment === EnvironmentEnum.Production;

export const isTestEnvironment = (): boolean => environment === EnvironmentEnum.Test;

export const isLocalEnvironment = (): boolean => environment === EnvironmentEnum.Local;


export const getBackendUrl = (): string => {
    if(isProductionEnvironment()) {
        return "https://bouveteket-prod-backend.azurewebsites.net/api/";
    }
    else if(isTestEnvironment()) {
        return "https://bouveteket-test-backend.azurewebsites.net/api/";
    }
    else {
        return "https://localhost:44394/api/";
    }
};