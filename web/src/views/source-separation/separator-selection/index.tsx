import { Breadcrumb, List, Select, Space, Typography } from 'antd';
import { Link, RouteComponentProps, useHistory } from 'react-router-dom';
import QueueAnim from 'rc-queue-anim';
import { SeparatorCard } from '../../../components/separator-card';
import { useRecoilValue } from 'recoil';
import { appConfigState } from '../../../recoil/state/app-config';
import { SchemaArgs, SeparatorConfig, SpecConfig } from '../../../api';
import { Fragment, useMemo, useState } from 'react';
import { SeparatorForm } from '../../../components/separator-form';
import { useApi } from '../../../contexts';

const { Title, Text } = Typography;
const { Option } = Select;

interface SeparatorSelectionViewProps {
    setActiveSeparator: (key: string) => void,
    startSeparate: (separator: SeparatorConfig, file: Blob, fileName: string, args: SchemaArgs) => Promise<void>
}

export const SeparatorSelectionView = ({ setActiveSeparator, startSeparate }: SeparatorSelectionViewProps) => {
    const history = useHistory();
    const api = useApi();
    const [currentSort, setSort] = useState<string>("quality");
    const { separator_config: separatorConfig } = useRecoilValue(appConfigState)!;

    const sortOptions = separatorConfig[0].specs;

    const sortedSeparators = useMemo(() => [...separatorConfig].sort((a, b) => {
        const getScore = (x: SeparatorConfig) => {
            const [, spec] = Object.entries(x.specs).find(([key, spec]) => key === currentSort)!;
            return spec.score;
        };
        return getScore(b) - getScore(a);
    }), [separatorConfig, currentSort]);

    return (
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
                dataSource={sortedSeparators}
                renderItem={(separator) => (
                    <List.Item key={separator.key}>
                        <SeparatorCard
                            separator={separator}
                            onConfigure={() => setActiveSeparator(separator.key)}
                            startSeparate={(file, fileName, args) => startSeparate(separator, file, fileName, args)}/>
                    </List.Item>
                )}
            />
        </Space>
    );
};