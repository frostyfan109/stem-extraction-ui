import { Breadcrumb, List, Select, Space, Typography } from 'antd';
import { Link, RouteComponentProps } from 'react-router-dom';
import QueueAnim from 'rc-queue-anim';
import { SeparatorCard } from '../../components/separator-card';
import { useRecoilValue } from 'recoil';
import { appConfigState } from '../../recoil/state/app-config';
import './source-separation.css';
import { SeparatorConfig, SpecConfig } from '../../api';
import { Fragment, useState } from 'react';

const { Title, Text } = Typography;
const { Option } = Select;

interface SourceSeparationViewProps {
    activeSeparatorKey?: string,
    setActiveSeparator?: (key: string) => void
}

export const SourceSeparationView = ({ activeSeparatorKey, setActiveSeparator=()=>{} }: SourceSeparationViewProps) => {
    const [currentSort, setSort] = useState<string>("quality");
    const { separator_config: separatorConfig } = useRecoilValue(appConfigState)!;

    const activeSeparator = separatorConfig.find((separator) => separator.key === activeSeparatorKey);

    const sortOptions = separatorConfig[0].specs;
    if (activeSeparator) return (
        <Fragment>
        <Breadcrumb>
            <Breadcrumb.Item key={"/"}><Link to="/">Separate</Link></Breadcrumb.Item>
            <Breadcrumb.Item key={"/"}>{activeSeparator.name}</Breadcrumb.Item>
        </Breadcrumb>
        <Text>{activeSeparator.name}</Text>
        </Fragment>
    );
    return (
        <Fragment>
        
        <Space direction="vertical" style={{ width: "100%" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Title level={4}>Supported models</Title>
                <Select value={currentSort} onChange={setSort}>
                    {Object.entries(sortOptions).map(([key, spec]) => (
                        <Option key={key}>
                            {spec.name}
                        </Option>
                    ))}
                </Select>
            </div>
            <List
                grid={{ gutter: 16, column: 2 }}
                dataSource={[...separatorConfig].sort((a, b) => {
                    const getScore = (x: SeparatorConfig) => {
                        const [, spec] = Object.entries(x.specs).find(([key, spec]) => key === currentSort)!;
                        return spec.score;
                    };
                    return getScore(b) - getScore(a);
                })}
                renderItem={(separator) => (
                    <List.Item>
                        <SeparatorCard separator={separator} key={separator.key} onSelect={setActiveSeparator}/>
                    </List.Item>
                )}
            />
            {/* {
                // Shallow-copy to avoid mutating read-only state.
                [...separatorConfig].sort((a, b) => {
                    const getScore = (x: SeparatorConfig) => {
                        const [, spec] = Object.entries(x.specs).find(([key, spec]) => key === currentSort)!;
                        return spec.score;
                    };
                    return getScore(b) - getScore(a);
                })
                .map((separator, i) => (
                    <SeparatorCard separator={separator} key={separator.key} onSelect={setActiveSeparator}/>
                ))
            } */}
        </Space>
        </Fragment>
    );
};