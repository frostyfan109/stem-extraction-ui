import { NodeExpandOutlined } from "@ant-design/icons";
import { Space, Typography, Layout, Menu, Button, Modal } from "antd";
import { Fragment, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useRecoilState, useRecoilValue } from "recoil";
import { useApi, useDest } from "../../contexts";
import { environmentState, SHOW_PAGE } from "../../recoil/state/environment";
import { loggedInState } from "../../recoil/state/login";
import { LoginView, LOGIN, SIGNUP, LoginType } from "../../views";
import './header.css';

const { Title } = Typography;


const { Header: AntHeader, Content, Footer } = Layout;

export const Header = ({ onLogout }: { onLogout: () => void }) => {
    const location = useLocation();
    const dest = useDest();
    const api = useApi();
    const loggedIn = useRecoilValue(loggedInState);
    const environment = useRecoilValue(environmentState)!;
    const [loginModalVisible, setLoginModalVisible] = useState(false);
    const [loginModalType, setLoginModalType] = useState<LoginType>(LOGIN);

    const login = (e: React.MouseEvent, type: LoginType) => {
        e.preventDefault();
        if (environment?.loginPopupBehavior === SHOW_PAGE) {
            if (type === LOGIN) dest.redirectWithDest("/login");
            else dest.redirectWithDest("/signup");
        } else {
            setLoginModalVisible(true);
            setLoginModalType(type);
        }
    };
    const handleLogout = () => {
        onLogout();
    };
    return (
        <Fragment>
        <AntHeader className="Header">
            <Space className="left-header">
                <Link className="logo" to="/">
                    <Space>
                        <NodeExpandOutlined style={{ fontSize: "24px", verticalAlign: "middle" }}/>
                        <Title level={3} style={{ margin: 0 }}>Stem Extractor</Title>
                    </Space>
                </Link>
                <Menu theme="light" mode="horizontal" selectedKeys={[location.pathname]}>
                    <Menu.Item key="/"><Link to="/">Home</Link></Menu.Item>
                    {loggedIn && (
                        <Fragment>
                        <Menu.Item key="/history"><Link to="/history">Saved</Link></Menu.Item>
                        </Fragment>
                    )}
                </Menu>
            </Space>
            <Space>
            {
                loggedIn ? (
                    <Button type="default" onClick={handleLogout}>Logout</Button>
                ) : (
                    <Fragment>
                        <Button type="text" onClick={(e) => login(e, LOGIN)} href="/login">Sign in</Button>
                        <Button type="ghost" onClick={(e) => login(e, SIGNUP)} href="/signup">Sign up</Button>
                    </Fragment>
                    )
                }
            </Space>
        </AntHeader>
        <Modal
            className="login-modal"
            visible={loginModalVisible}
            destroyOnClose
            onCancel={() => setLoginModalVisible(false)}
        >
                <LoginView
                    type={loginModalType}
                    asComponent={true}
                    typeChanged={setLoginModalType}
                    rememberMeClicked={() => setLoginModalVisible(false)}
                    onCompleted={() => setLoginModalVisible(false)}
                />
        </Modal>
        </Fragment>
    );
};