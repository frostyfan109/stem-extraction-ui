import { Space } from "antd";
import { useEffect, useState } from "react";
import "./audio-player.css";
import { SourceControl } from "./source-control";

export interface Source {
    key: any,
    name: string,
    url: string,
    muted: boolean,
    solo: boolean
}

interface AudioPlayerProps {
    sources: Source[]
}

export const AudioPlayer = ({ sources: _sources }: AudioPlayerProps) => {
    const [sources, setSources] = useState<Source[]>(_sources);
    useEffect(() => {

    }, [_sources]);
    const handleMute = (source: Source, muted: boolean) => {

    };
    const handleSolo = (source: Source, solo: boolean) => {

    };
    return (
        <Space direction="vertical" size="small" className="source-control">
            {
                sources.map((source) => (
                    <SourceControl
                        key={source.key}
                        source={source}
                        onMute={(muted) => handleMute(source, muted)}
                        onSolo={(solo) => handleSolo(source, solo)}
                    />
                ))
            }
        </Space>
    );
};