import { Fragment } from 'react';
import { Typography } from 'antd';
import { ReturnHome } from './return-home';

const { Title, Paragraph } = Typography;

export const Error401View = () => {
    return (
        <Fragment>
            <div style={{ height: "100%", display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
                <Title>401</Title>
                <Paragraph type="secondary">You need to be logged in to view this page.</Paragraph>
                <Paragraph>
                    <ReturnHome/>
                </Paragraph>
            </div>
        </Fragment>
    );
};