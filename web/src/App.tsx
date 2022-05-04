import { Fragment, useEffect, useState } from 'react';
import { Divider, Layout, Space, Spin, Typography } from 'antd';
import { matchPath, Redirect, Route, RouteComponentProps, Switch, useHistory, useLocation } from 'react-router-dom';
import { SourceSeparationView, Error404View, LoginView, LOGIN, SIGNUP, HistoryView, HomeView } from './views';
import { useApi, useDest, useError, useLoading } from './contexts';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { appConfigState } from './recoil/state/app-config';
import './App.css';
import { Header } from './components/header';
import { ProtectedRoute, ProtectedRouteProps } from './components';
import { environmentState, LoginPopupBehavior, LOGIN_REDIRECT, POPUP, ProtectedRouteBehavior } from './recoil/state/environment';
import { EnvironmentError, loadEnvironmentValue } from './utils';
import { loggedInState } from './recoil/state/login';

const { Text } = Typography;
const { Content, Footer } = Layout;

export const App = () => {
  const history = useHistory();
  const location = useLocation();
  const api = useApi();
  const dest = useDest();
  const { appStateLoading } = useLoading();
  const { handleError } = useError() || {};
  const [environment, setEnvironment] = useRecoilState(environmentState);
  const appConfig  = useRecoilValue(appConfigState);
  const setAppConfig = useSetRecoilState(appConfigState);
  const setLoggedIn = useSetRecoilState(loggedInState);


  const protectedRoutes: any = [
    { exact: true, path: "/history", component: HistoryView },
  ];

  useEffect(() => {
    // API is ready.
    if (api) {
      (async () => {
        try {
          const { data: appConfig } = await api.getAppConfig();
          setAppConfig(appConfig);
        } catch (error: any) {}
      })();
    }
  }, [api, setAppConfig]);

  useEffect(() => {
    if (!handleError) return;
    (async () => {
      const errors: EnvironmentError[] = [];
      let PROTECTED_ROUTE_BEHAVIOR = LOGIN_REDIRECT as ProtectedRouteBehavior;
      let LOGIN_POPUP_BEHAVIOR = POPUP as LoginPopupBehavior;
      let API_URL = window.location.protocol + "//" + window.location.host;
      let LOGIN_ENABLED = true;
      let GOOGLE_TOKEN = null;
      let APPLE_TOKEN = null;
      try {
        PROTECTED_ROUTE_BEHAVIOR = loadEnvironmentValue("REACT_APP_PROTECTED_ROUTE_BEHAVIOR", ["login_redirect", "show_error"]);
      } catch (e) {
        errors.push(e as EnvironmentError);
      }
      try {
        LOGIN_POPUP_BEHAVIOR = loadEnvironmentValue("REACT_APP_LOGIN_POPUP", ["true", "false"]);
      } catch (e) {
        errors.push(e as EnvironmentError);
      }
      try {
        API_URL = loadEnvironmentValue("REACT_APP_API_URL");
      } catch (e) {
        errors.push(e as EnvironmentError);
      }
      try {
        LOGIN_ENABLED = loadEnvironmentValue("REACT_APP_LOGIN_ENABLED", ["true", "false"]);
      } catch (e) {
        errors.push(e as EnvironmentError);
      }
      try {
        GOOGLE_TOKEN = loadEnvironmentValue("REACT_APP_GOOGLE_TOKEN", undefined, false);
      } catch (e) {
        errors.push(e as EnvironmentError);
      }
      try {
        APPLE_TOKEN = loadEnvironmentValue("REACT_APP_APPLE_TOKEN", undefined, false);
      } catch (e) {
        errors.push(e as EnvironmentError);
      }
      setEnvironment({
          protectedRouteBehavior: PROTECTED_ROUTE_BEHAVIOR,
          loginPopupBehavior: LOGIN_POPUP_BEHAVIOR,
          apiUrl: API_URL,
          loginEnabled: LOGIN_ENABLED,
          googleToken: GOOGLE_TOKEN,
          appleToken: APPLE_TOKEN,
      });
      if (errors.length > 0) {
          handleError({
              errorName: "Invalid environment variables",
              errorInfo: (
                      errors.map((error, i) => (
                          <Fragment>
                          <Text>
                              Invalid value "{error.data.envValue}" for {error.data.required ? "required variable " : ""}
                              {error.data.envName}.
                              {
                                error.data.allowedValues && (
                                  ` Valid values are: ${error.data.allowedValues.map((val) => `"${val}"`).join(", ")}.`
                                )
                              }
                          </Text>
                          {i !== errors.length - 1 && <Divider/>}
                          </Fragment>
                      ))
              )
          });
      }
    })();
  }, [handleError]);

  const loginComplete = () => {
    dest.redirectToDest();
  };

  const handleLogout = () => {
    if (api) api.logout();
    setLoggedIn(false);
    if (protectedRoutes.some((route: any) => matchPath(location.pathname, route))) {
      // Currently viewing a login-protected route.
      history.push("/");
    }
  };
  const isPageLogin = location.pathname === "/signup" || location.pathname === "/login";
  return (
    <Layout className="layout">
      {!isPageLogin && <Header onLogout={handleLogout}/>}
      <Content>
        {appStateLoading ? (
          <div style={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
            <Spin/>
          </div>
        ) : (
          <Switch>
            <Route exact path="/" render={() => (
              <SourceSeparationView setActiveSeparator={(key) => history.push("/" + key)}/>
            )}/>
            {
              appConfig!.separator_config.map((separator) => (
                <Route exact key={separator.key} path={`/${separator.key}`} render={(props) => (
                  <SourceSeparationView activeSeparatorKey={separator.key}/>
                )}/>
              ))
            }
            <Route exact path="/login" render={(props) => (
              <LoginView type={LOGIN} typeChanged={() => history.push({
                pathname: "/signup",
                search: location.search
              })} onCompleted={loginComplete} asComponent={false}/>
            )}/>
            <Route exact path="/signup" render={(props) => (
              <LoginView type={SIGNUP} typeChanged={() => history.push({
                pathname: "/login",
                search: location.search
              })} onCompleted={loginComplete} asComponent={false}/>
            )}/>
            {protectedRoutes.map((route: any) => (
              <ProtectedRoute key={route.path} {...route}/>
            ))}
            <Route path="*" component={Error404View}/>
          </Switch>
        )}
      </Content>
      {/* <Footer></Footer> */}
    </Layout>
  );
};