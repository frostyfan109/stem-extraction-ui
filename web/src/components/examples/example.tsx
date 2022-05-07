import { Button, Card, Checkbox, Col, Radio, Row, Space, Typography } from "antd";
import { useEffect, useMemo, useState } from "react";
import { Example as ExampleType, ExampleStem } from "../../api";
import { AudioPlayer, Source } from "../audio-player";

interface ExampleProps {
    example: ExampleType
}

export const Example = ({ example }: ExampleProps) => {
    const [sources, setSources] = useState<Source[]>([]);
    useEffect(() => {
        const newSources = example.stems.reduce<Source[]>((acc, stem) => {
            if (stem.path) acc.push({
                key: !stem.source ? `${stem.name} (stem)` : `${stem.name}`,
                name: !stem.source ? `${stem.name} (stem)` : `${stem.name}`,
                url: stem.path,
                muted: false,
                solo: false
            });
            if (stem.original) acc.push({
                key: `${stem.name} (studio)`,
                name: `${stem.name} (studio)`,
                url: stem.original,
                muted: false,
                solo: false
            });
            return acc;
        }, []);
        setSources(newSources);
    }, [example]);
    return (
        <AudioPlayer sources={sources}/>
    );
};