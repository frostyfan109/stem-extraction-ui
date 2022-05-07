import { Fragment, useState } from "react";
import { Breadcrumb, Button, Typography } from "antd";
import { Link, useHistory } from "react-router-dom";
import { SchemaArgs, SeparatorConfig } from "../../api";
import { useApi } from "../../contexts";

const { Title, Text } = Typography;

interface SeparatorFormProps {
    separator: SeparatorConfig,
    startSeparate: (file: Blob, fileName: string, args: SchemaArgs) => Promise<void>
}

export const SeparatorForm = ({ separator, startSeparate }: SeparatorFormProps) => {
    const history = useHistory();
    const api = useApi();
    const [file, setFile] = useState<Blob|null>(null);
    const [args, setArgs] = useState<SchemaArgs>({});

    const onConfirm = () => {
        if (file) {
            // startSeparate(file, args);
        }
    };

    return (
        <Fragment>
            <Breadcrumb>
                <Breadcrumb.Item key={"/"}><Link to="/">Separate</Link></Breadcrumb.Item>
                <Breadcrumb.Item key={"/"}>{separator.name}</Breadcrumb.Item>
            </Breadcrumb>
            <Title level={4}>{separator.name}</Title>
            <Text style={{ display: "inline-block", whiteSpace: "pre" }}>
                <code style={{ display: "inline-block" }}>
                    {JSON.stringify(separator.schema, undefined, 4)}
                </code>
            </Text>
            <Button onClick={onConfirm} disabled={file === null}>Upload</Button>
        </Fragment>
    );
};