import { LockOutlined, MailOutlined, UserOutlined } from "@ant-design/icons";
import { ProFormText } from "@ant-design/pro-form";
import { FieldProps } from "@ant-design/pro-form/lib/interface";

export interface FormError {
    fieldName: string,
    message: string
}

interface InputProps {
    name: string,
    errors?: FormError[],
    overrides?: any
}

interface ConfirmInputProps extends InputProps {
    passwordName: string
}

// Match alphanumeric/hyphen/underscores but do not begin with hyphens or spaces.
const USERNAME_PATTERN = /^[\w]([\w-_]*[\w])?$/;

export const UsernameInput = ({ name, overrides, errors=[] }: InputProps) => (
    <ProFormText
        {...overrides}
        name={name}
        fieldProps={{
            size: "middle",
            prefix: <UserOutlined className="prefixIcon"/>,
            ...overrides.fieldProps
        }}
        placeholder="Username"
        rules={[
            {
                required: true,
                message: "Please enter your username"
            },
            {
                pattern: new RegExp(USERNAME_PATTERN),
                message: "Usernames may only contain alphanumeric characters, hyphens, and underscores and cannot start or end with hyphens"
            },
            ({ getFieldValue }) => ({
                validator(_, value) {
                    const error = errors.find((err) => err.fieldName === name);
                    if (error) return Promise.reject(error.message);
                    else return Promise.resolve();
                }
            }),
            ...(overrides.rules || [])
        ]}
    />
);
export const PasswordInput = ({ name, overrides, errors=[] }: InputProps) => (
    <ProFormText.Password
        {...overrides}
        name={name}
        fieldProps={{
            size: "middle",
            prefix: <LockOutlined className="prefixIcon"/>,
            ...overrides.fieldProps
        }}
        placeholder="Password"
        rules={[
            {
                required: true,
                message: "Please enter your password"
            },
            ...(overrides.rules || [])
        ]}
    />
);
export const PasswordConfirmInput = ({ name, passwordName, overrides, errors=[] }: ConfirmInputProps) => (
    <ProFormText.Password
        {...overrides}
        name={name}
        fieldProps={{
            size: "middle",
            prefix: <LockOutlined className="prefixIcon"/>,
            ...overrides.fieldProps
        }}
        placeholder="Confirm Password"
        rules={[
            {
                required: true,
                message: "Please enter your password again"
            },
            ({ getFieldValue }) => ({
                validator(_, value) {
                    if (!value || getFieldValue(passwordName) === value) return Promise.resolve();
                    else return Promise.reject(new Error("Your passwords do not match."));
                }
            }),
            ...(overrides.rules || [])
        ]}
        dependencies={[passwordName]}
    />
);
export const EmailInput = ({ name, overrides, errors=[] }: InputProps) => (
    <ProFormText
        {...overrides}
        name={name}
        fieldProps={{
            size: "middle",
            prefix: <MailOutlined className="prefixIcon"/>,
            ...overrides.fieldProps
        }}
        placeholder="Email"
        rules={[
            {
                type: "email",
                message: "Please fix your email"
            },
            {
                required: true,
                message: "Please enter your email"
            },
            ...(overrides.rules || [])
        ]}
    />
);