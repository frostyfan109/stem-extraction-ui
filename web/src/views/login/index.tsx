import { LoginForm, LoginFormPage, ProFormCheckbox, ProFormInstance, ProFormText } from "@ant-design/pro-form";
import { Tabs, Space, Divider, Typography, InputProps, FormInstance, Button, Spin } from "antd";
import { AppleFilled, GoogleCircleFilled, NodeExpandOutlined } from "@ant-design/icons";
import { CSSProperties, Fragment, useEffect, useRef, useState } from "react";
import { EmailInput, FormError, PasswordConfirmInput, PasswordInput, UsernameInput } from "./form-inputs";
import classNames from "classnames";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { loggedInState } from "../../recoil/state/login";
import { useApi, useError } from '../../contexts';
import "./login.css";
import "@ant-design/pro-form/dist/form.css";
import { APIError } from "../../api";
import { ProFormFieldItemProps } from "@ant-design/pro-form/lib/interface";
import { ValidatorRule } from "rc-field-form/lib/interface";
import { useForm } from "antd/lib/form/Form";
import { Link, Redirect } from "react-router-dom";
import { FormWrapper } from "./form-wrapper";
import { appConfigState } from "../../recoil/state/app-config";

const { Text } = Typography;

export type LOGIN = "LOGIN";
export type SIGNUP = "SIGNUP";
export type LoginType = LOGIN | SIGNUP;
export const LOGIN = "LOGIN";
export const SIGNUP = "SIGNUP";

const iconStyles: CSSProperties = {
    marginLeft: '16px',
    color: 'rgba(0, 0, 0, 0.2)',
    fontSize: '32px',
    verticalAlign: 'middle',
    cursor: 'pointer'
};

interface LoginViewProps {
    type: LoginType,
    asComponent: boolean
    typeChanged: (type: LoginType) => void,
    onCompleted: () => void,
    rememberMeClicked?: () => void
}

export const LoginView = ({ type, asComponent, typeChanged, onCompleted, rememberMeClicked=()=>{} }: LoginViewProps) => {
    const api = useApi();
    const { handleApiError } = useError();
    const [form] = useForm();
    const { login_features: {
        login_enabled: loginEnabled,
        google_login: googleEnabled,
        apple_login: appleEnabled
    } } = useRecoilValue(appConfigState)!;
    const setLoggedIn = useSetRecoilState(loggedInState);
    const [errors, setErrors] = useState<FormError[]>([]);
    const [revalidateForm, setRevalidateForm] = useState<boolean>(false);
    const [currentlyValidating, setCurrentlyValidating] = useState<boolean>(false);

    const noExtraOptions = !googleEnabled && !appleEnabled;

    useEffect(() => {
        setErrors([]);
    }, [type]);

    useEffect(() => {
        if (revalidateForm) {
            form.validateFields();
            setRevalidateForm(false);
        }
    }, [revalidateForm]);

    const tabChanged = (key: LoginType) => {
        typeChanged(key);
    };

    const addError = (error: FormError) => {
        // You can't have two errors on the same field at once.
        // The new one will replace the old one.
        setErrors([
            ...errors.filter((err) => err.fieldName !== error.fieldName),
            error
        ]);
    };

    const validateForm = async () => {
        setCurrentlyValidating(true);
        if (type === LOGIN) {
            try {
                const { login_username, login_password, remember_me } = await form.validateFields();
                try {
                    const { data } = await api!.login(login_username, login_password, remember_me);
                    form.submit();
                } catch (error: any) {
                    if (error instanceof APIError && error.response.status_code === 401) {
                        addError(error.response.data as FormError);
                        setRevalidateForm(true);
                    }
                }
            } catch (e) {
                // Front end validation failed.
            }
        } else {
            try {
                const {
                    signup_username,
                    signup_email,
                    signup_password,
                    remember_me
                } = await form.validateFields();
                try {
                    const { data } = await api!.register(
                        signup_username,
                        signup_email,
                        signup_password,
                        remember_me
                    );
                    form.submit();
                } catch (error: any) {
                    if (error instanceof APIError && error.response.status_code === 400) {
                        addError(error.response.data as FormError);
                        setRevalidateForm(true);
                    } else handleApiError({ error });
                }
            } catch (e) {
                // Front end validation failed.
            }
        }
        setCurrentlyValidating(false);
    };
    const validateFromButton = (e: any) => {
        e.preventDefault();
        validateForm();
    };
    const validateFromInput = (e: any) => {
        if (e.key === "Enter") {
            e.preventDefault();
            validateForm();
        }
    };

    const overrides: ProFormFieldItemProps = !asComponent ? {
        fieldProps: {
            size: "large"
        }
    } : {};
    overrides.fieldProps = {
        onKeyDown: validateFromInput,
        ...overrides.fieldProps
    };
    const formFieldProps = {
        errors,
        overrides
    };

    return (
        <div className={classNames("LoginForm", asComponent ? "component" : "full-page")}>
            <FormWrapper asComponent={asComponent} loading={currentlyValidating}>
                <LoginForm
                    submitter={{
                        render: () => (
                            <Button
                                key="submit"
                                htmlType="submit"
                                type="primary"
                                size={asComponent ? "middle" : "large"}
                                block
                                onClick={validateFromButton}
                            >{type === LOGIN ? "Log in" : "Sign up"}</Button>
                        )
                    }}
                    title="Stem Extractor"
                    // backgroundImageUrl="/background.png"
                    logo={<NodeExpandOutlined/>}
                    actions={
                        <div style={{ display: noExtraOptions ? "none" : "flex", justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
                            <Divider plain>
                                <Text type="secondary" style={{ color: "#ccc", fontWeight: "normal", fontSize: 14 }}>
                                    More options
                                </Text>
                            </Divider>
                            <Space>
                                {googleEnabled && <GoogleCircleFilled style={{... iconStyles, color: "#1677FF" }}/>}
                                {appleEnabled && <AppleFilled style={{... iconStyles, color: "#333333" }}/>}
                            </Space>
                        </div>
                    }
                    onFinish={async () => {
                        // Actual login submission occurs above.
                        setLoggedIn(true);
                        onCompleted();
                    }}
                    onFieldsChange={() => setErrors([])}
                    form={form}
                >
                    <Tabs activeKey={type} onChange={(key) => tabChanged(key as LoginType)}>
                        <Tabs.TabPane key={LOGIN} tab="Sign in"/>
                        <Tabs.TabPane key={SIGNUP} tab="Sign up"/>
                    </Tabs>
                    {
                        type === LOGIN ? (
                            <Fragment>
                            <UsernameInput name="login_username" {...formFieldProps}/>
                            <PasswordInput name="login_password" {...formFieldProps}/>
                            </Fragment>
                        ) : (
                            <Fragment>
                            <UsernameInput name="signup_username" {...formFieldProps}/>
                            <EmailInput name="signup_email" {...formFieldProps}/>
                            <PasswordInput name="signup_password" {...formFieldProps}/>
                            <PasswordConfirmInput name="signup_confirm_password" passwordName="signup_password" {...formFieldProps}/>
                            </Fragment>
                        )
                    }
                    <div style={{ marginBottom: "24px", display: "flex", justifyContent: "flex-end" }}>
                        {/* <ProFormCheckbox noStyle name="remember_me">
                            Remember me
                        </ProFormCheckbox> */}
                        {type === LOGIN && (
                            <Link to="/forgot_password" onClick={rememberMeClicked} style={{ float: "right" }}>Forgot password?</Link>
                        )}
                    </div>
                </LoginForm>
            </FormWrapper>
        </div>
    );
};