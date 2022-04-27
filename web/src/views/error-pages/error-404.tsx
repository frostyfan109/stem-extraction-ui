import { Fragment } from 'react';
import { Typography } from 'antd';
import { ReturnHome } from './return-home';

const { Title, Paragraph } = Typography;

export const Error404View = () => {
    return (
        <Fragment>
            <div style={{ height: "100%", display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
                <Title>404</Title>
                <Paragraph type="secondary">The page you are looking for does not exist.</Paragraph>
                <Paragraph>
                    <ReturnHome/>
                </Paragraph>
            </div>
        </Fragment>
    );
};