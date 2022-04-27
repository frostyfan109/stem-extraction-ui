import { Spin } from "antd";
import { Fragment } from "react";

const Spinner = ({ loading, children }: any) => (
    <Spin className="login-spin" spinning={loading}>
        {children}
    </Spin>
);

export const FormWrapper = ({ loading, asComponent, children }: any) => {
    if (asComponent) return (
        <Fragment>
            <Spinner loading={loading}>
            {children}
            </Spinner>
        </Fragment>
    );
    // Basic reimplemtnation of LoginFormPage, because LoginFormPage
    // does not expose any mechanism for wrapping of the inner components
    // it generates, which leads to styling issues when using Spin.
    else return (
        <div className="ant-pro-form-login-page" style={{ backgroundImage: "url('/background.png')" }}>
            <div className="ant-pro-form-login-page-notice">
                {/* Unimplemented */}
            </div>
            <div className="ant-pro-form-login-page-container">
                <Spinner loading={loading}>
                    {children}
                </Spinner>
            </div>
        </div>
    );
};