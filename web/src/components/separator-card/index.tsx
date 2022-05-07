import { Button, Card, Divider, List, Modal, Radio, Rate, Space, Spin, Tabs, Tag, Tooltip, Typography, Upload } from "antd";
import { useSizeMe } from '../../hooks/use-size-me';
import { Feature, SchemaArgs, SeparatorConfig, Spec } from "../../api";
import { LoadingOutlined, PlayCircleOutlined, UploadOutlined } from "@ant-design/icons";
import { UploadFile } from "antd/lib/upload/interface";
import { RcFile } from "antd/lib/upload";
import { Fragment, useEffect, useMemo, useState } from "react";
import { useApi } from "../../contexts";
import "./separator-card.css";
import { Examples } from "../examples";

const { Title, Text, Link } = Typography;
const { Dragger } = Upload;
const { TabPane } = Tabs;

interface SeparatorCardProps {
    separator: SeparatorConfig,
    startSeparate: (file: Blob, fileName: string, args: SchemaArgs) => Promise<void>
    onConfigure: (key: string) => void
}

export const SeparatorCard = ({ separator, startSeparate, onConfigure }: SeparatorCardProps) => {
    const [showExampleModal, setShowExampleModal] = useState(false);
    const [file, setFile] = useState<UploadFile|null>(null);
    const fileLoading = useMemo(() => file !== null, [file]);

    const loadFile = (file: RcFile) => {
        setFile(file);
        const reader = new FileReader();
        reader.onload = () => {
            setTimeout(() => {
            }, 2500);
            console.log("Loaded file", reader.result);
            const blobFile = new Blob([reader.result as ArrayBuffer], { type: file.type });
            console.log(blobFile);
            startSeparate(blobFile, file.name, {});
        };
        reader.onerror = (error) => {
            console.log("Failed to load file", error);
        };
        reader.readAsArrayBuffer(file);
        return false;
    };

    const [sizedTitleBody, width, height]: any = useSizeMe(() => (
        <div style={{ flex: 1 }}>
            <Title level={5} style={{ margin: 0 }}>{separator.name}</Title>
            <Text type="secondary" style={{ fontSize: "12px" }}>
                <a href={separator.url} target="_blank" rel="noopener noreferrer">{separator.url}</a>
            </Text>
            <div style={{ marginTop: "4px" }}>
                {separator.features.map((feature: Feature) => (
                    <Tooltip
                        key={feature.name}
                        title={feature.description+""}
                        // Mobile support: tooltip alignment breaks if when aligned
                        // to the side their width would go off the screen.
                        placement={width < 300 ? "bottom" : "right"}
                    >
                        <Tag>{feature.name}</Tag>
                    </Tooltip>
                ))}
            </div>
        </div>
    ), { monitorHeight: true });
    return (
        <Fragment>
        <Dragger
            openFileDialogOnClick={false}
            accept="audio/*"
            disabled={fileLoading}
            fileList={file ? [file] : []}
            beforeUpload={(file) => loadFile(file)}
            showUploadList={false}
            className="separator-card-upload"
        >
        <Card hoverable title={
            <div style={{ display: "flex", alignItems: "flex-start" }}>
                {/**
                 * There is no apparent solution to sizing an image's height relative to its siblings
                 * in a container with non-fixed height (e.g. a flexbox). Has to be done programmatically.
                 */}
                {separator.logo_url && height !== undefined && (
                    <img
                        src={separator.logo_url}
                        alt=""
                        style={{
                            height: height + "px",
                            objectFit: "contain",
                            marginRight: "16px"
                        }}/>
                )}
                {sizedTitleBody}
            </div>
        } >
            <Space direction="vertical" size="middle" align="start">
                {separator.description && (
                    <Text>
                        {separator.description}
                    </Text>
                )}
                <div style={{ marginLeft: "16px", display: "flex", flexDirection: "column", alignItems: "stretch" }}>
                    {Object.values(separator.specs).map((spec: Spec) => (
                        <Tooltip title={spec.description} placement={width < 300 ? "bottom" : "right"} key={spec.name}>
                            <Space align="center" style={{ justifyContent: "space-between" }}>
                            <Text>{spec.name}:</Text>
                                <Rate
                                    disabled
                                    allowHalf
                                    defaultValue={spec.score}
                                    style={{ marginBottom: "6px" }}
                                />
                            </Space>
                        </Tooltip>
                    ))}
                </div>
                {separator.examples.length > 0 && (
                    <Button type="primary" size="small" onClick={() => setShowExampleModal(true)}>Examples</Button>
                )}
            </Space>
            <Divider/>
            <Space align="center" style={{ width: "100%", justifyContent: "space-between" }}>
                <Button type="ghost" onClick={() => onConfigure(separator.key)}>Configure</Button>
                <Upload
                    accept="audio/*"
                    disabled={fileLoading}
                    fileList={file ? [file] : []}
                    beforeUpload={(file) => loadFile(file)}
                    // onChange={({ file }) => loadFile(file)}
                    showUploadList={false}
                    className="quick-upload-btn"
                >
                    <Button
                        type={!fileLoading ? "primary" : "ghost"}
                        disabled={fileLoading}
                        icon={!fileLoading ? <UploadOutlined/> : <LoadingOutlined />}
                    >
                        {!fileLoading ? "Quick upload" : "Loading"}
                    </Button>
                </Upload>
            </Space>
        </Card>
        </Dragger>
        <Modal
            title={`${separator.name} examples`}
            visible={showExampleModal}
            onOk={() => setShowExampleModal(false)}
            onCancel={() => setShowExampleModal(false)}
            bodyStyle={{ paddingTop: 0 }}
            footer={(
                <Button type="ghost" onClick={() => setShowExampleModal(false)}>Close</Button>
            )}
        >
            <Examples separator={separator}/>
        </Modal>
        </Fragment>
    );
};