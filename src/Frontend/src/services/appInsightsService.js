/*
import { ReactPlugin, withAITracking } from '@microsoft/applicationinsights-react-js';
import { ApplicationInsights } from '@microsoft/applicationinsights-web';
import { isLocalEnvironment } from "config/environment";
import { createBrowserHistory } from 'history';
const browserHistory = createBrowserHistory({ basename: '' });
const appInsightsPlugin = new ReactPlugin();
const appInsights = new ApplicationInsights({
    config: {
        // eslint-disable-next-line no-undef
        instrumentationKey: process.env.INSTRUMENTATION_KEY ?? "", // NB: INSTRUMENTATION_KEY will currently be an empty string
        extensions: [appInsightsPlugin],
        extensionConfig: {
            [appInsightsPlugin.identifier]: { history: browserHistory }
        },
        disableTelemetry: isLocalEnvironment()
    }
});
appInsights.loadAppInsights();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default (Component, name) => withAITracking(appInsightsPlugin, Component, name);
export { appInsightsPlugin, appInsights };
*/