import { Button, Card, Divider, Rate, Space, Tag, Tooltip, Typography } from "antd";
import { useSizeMe } from '../../hooks/use-size-me';
import { Feature, SeparatorConfig, Spec } from "../../api";

const { Title, Text, Link } = Typography;

interface SeparatorCardProps {
    separator: SeparatorConfig,
    onSelect: (key: string) => void
}

export const SeparatorCard = ({ separator, onSelect }: SeparatorCardProps) => {
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
            </Space>
            <Divider/>
            <Space align="center" style={{ width: "100%", justifyContent: "flex-end" }}>
                <Button type="primary" onClick={() => onSelect(separator.key)}>Go</Button>
            </Space>
        </Card>
    );
};