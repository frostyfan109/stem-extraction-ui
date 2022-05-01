import { Select, Space, Typography } from 'antd';
import { RouteComponentProps } from 'react-router-dom';
import { SeparatorCard } from '../../components/separator-card';
import { useRecoilValue } from 'recoil';
import { appConfigState } from '../../recoil/state/app-config';
import './source-separation.css';
import { SeparatorConfig, SpecConfig } from '../../api';
import { useState } from 'react';

const { Title } = Typography;
const { Option } = Select;

interface SourceSeparationViewProps extends RouteComponentProps {
    activeSeparatorKey?: string,
    setActiveSeparator: (key: string) => void
}

export const SourceSeparationView = ({ activeSeparatorKey, setActiveSeparator }: SourceSeparationViewProps) => {
    const [currentSort, setSort] = useState<string>("quality");
    const { separator_config: separatorConfig, default_separator: defaultSeparator } = useRecoilValue(appConfigState)!;

    if (!activeSeparatorKey) activeSeparatorKey = defaultSeparator;
    const activeSeparator = separatorConfig.find((separator) => separator.key === activeSeparatorKey)!;
    if (!activeSeparator.enabled) setActiveSeparator(defaultSeparator);
    
    // Just in case the first separator or whatever should be arbitrarily chosen
    // for its SpecConfig to generate sort options was missing specs,
    // collect all the specs that every separator has and reduce them down to a single
    // SpecConfig.
    // const sortOptions = separatorConfig.flatMap((separator) => Object.entries(separator.specs))
    //     .reduce<SpecConfig>((acc: any, cur) => {
    //         const [key, value] = cur;
    //         if (!acc[key]) acc[key] = value;
    //         return acc;
    //     }, {} as SpecConfig);
    const sortOptions = separatorConfig[0].specs;
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
            {
                // Shallow-copy to avoid mutating read-only state.
                [...separatorConfig].sort((a, b) => {
                    const getScore = (x: SeparatorConfig) => {
                        const [, spec] = Object.entries(x.specs).find(([key, spec]) => key === currentSort)!;
                        return spec.score;
                    };
                    return getScore(b) - getScore(a);
                })
                .map((separator, i) => (
                    <SeparatorCard separator={separator} key={separator.key}/>
                ))
            }
        </Space>
    );
};