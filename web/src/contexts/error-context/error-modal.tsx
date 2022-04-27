import { Button, Divider, Space, Typography } from 'antd';
import { Fragment, useState } from "react";
import './error-modal.css';

const { Text } = Typography;

interface ErrorContentProps {
    info?: React.ReactNode,
    advanced?: React.ReactNode,
    traceback?: boolean
}

interface ErrorTitleProps {
    name: React.ReactNode,
    description?: React.ReactNode
}
export const ErrorTitle = ({ name, description }: ErrorTitleProps) => {
    return (
        <div>
            <Text>{name}</Text>
            {description !== undefined && (
                <Fragment>
                    <br/>
                    <Text type="secondary" italic><small>{description}</small></Text>
                </Fragment>
            )}
        </div>
    );
};

export const ErrorContent = ({ info, advanced, traceback }: ErrorContentProps) => {
    const [showAdvanced, setShowAdvanced] = useState(false);

    const advancedText = traceback ? (
        <Text style={{ display: "inline-block", whiteSpace: "pre" }}>
            <code style={{ display: "inline-block" }}>{advanced}</code>
        </Text>
    ) : (
        <Text>{advanced}</Text>
    );
    const infoSection = info !== undefined ? (
        <Text>{info}</Text>
    ) : null;
    const advancedSection = advanced !== undefined ? (
        <Fragment>
            <Divider/>
            <Space direction="vertical" className="advanced-section-space">
                <Button type="ghost" onClick={() => setShowAdvanced(!showAdvanced)}>
                        {showAdvanced ? "Hide advanced" : "Show advanced"}
                </Button>
                {showAdvanced ? advancedText : null}
            </Space>
        </Fragment>
    ) : null;
    return (
        <div className="ErrorContent">
            {infoSection}
            {advancedSection}
        </div>
    );
};