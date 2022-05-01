import { Fragment, useEffect, useState } from 'react';
import { Divider, Layout, Space, Spin, Typography } from 'antd';
import { matchPath, Route, RouteComponentProps, Switch, useHistory, useLocation } from 'react-router-dom';
import { SourceSeparationView, Error404View, LoginView, LOGIN, SIGNUP, HistoryView } from './views';
import { useApi, useDest, useError } from './contexts';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { appConfigState } from './recoil/state/app-config';
import './App.css';
import { Header } from './components/header';
import { ProtectedRoute } from './components';
import { appLoadingState } from './recoil/state/selectors';
import { environmentState, LoginPopupBehavior, LOGIN_REDIRECT, POPUP, ProtectedRouteBehavior } from './recoil/state/environment';
import { EnvironmentError, loadEnvironmentValue } from './utils';
import { loggedInState } from './recoil/state/login';

const { Text } = Typography;
const { Content, Footer } = Layout;

export const App = () => {
  const history = useHistory();
  const location = useLocation();
  const api = useApi();
  const dest = useDest()!;
  const { handleError } = useError();
  const setAppConfig = useSetRecoilState(appConfigState);
  const setEnvironment = useSetRecoilState(environmentState);
  const setLoggedIn = useSetRecoilState(loggedInState);
  const appConfig  = useRecoilValue(appConfigState);
  const appLoading = useRecoilValue(appLoadingState);


  const protectedRoutes = [
    { exact: true, path: "/history", component: HistoryView }
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
    (async () => {
      const errors: EnvironmentError[] = [];
      let PROTECTED_ROUTE_BEHAVIOR = LOGIN_REDIRECT as ProtectedRouteBehavior;
      let LOGIN_POPUP_BEHAVIOR = POPUP as LoginPopupBehavior;
      let API_URL = window.location.protocol + "//" + window.location.host;
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
      setEnvironment({
          protectedRouteBehavior: PROTECTED_ROUTE_BEHAVIOR,
          loginPopupBehavior: LOGIN_POPUP_BEHAVIOR,
          apiUrl: API_URL
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
  }, []);

  const loginComplete = () => {
    dest.redirectToDest();
  };

  const handleLogout = () => {
    if (api) api.logout();
    setLoggedIn(false);
    if (matchPath(location.pathname, protectedRoutes[0])) {
      // Currently viewing a login-protected route.
      history.push("/");
    }
  };

  const sourceSeparationView = (activeSeparator: string, props: RouteComponentProps) => (
    <SourceSeparationView setActiveSeparator={(key) => {
      if (key === appConfig!.default_separator) history.push("/");
      else history.push(`/${key}`);
    }} activeSeparatorKey={activeSeparator} {...props}/>
  );

  const isPageLogin = location.pathname === "/signup" || location.pathname === "/login";
  return (
    <Layout className="layout">
      {!isPageLogin && <Header onLogout={handleLogout}/>}
      <Content>
        {appLoading ? (
          <div style={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
            <Spin/>
          </div>
        ) : (
          <Switch>
            <Route exact path="/" render={(props) => sourceSeparationView(appConfig!.default_separator, props)}/>
            {
              appConfig!.separator_config.map((separator) => (
                <Route exact key={separator.key} path={`/${separator.key}`} render={(props) => sourceSeparationView(separator.key, props)}/>
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
            {protectedRoutes.map((route) => (
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