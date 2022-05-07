import { Card, Radio, Typography } from "antd";
import { Source } from "./audio-player";

const { Text } = Typography;

enum SourceControlSetting {
    Muted = 0,
    Solo = 1
}

interface SourceControlProps {
    source: Source,
    onMute: (muted: boolean) => void,
    onSolo: (solo: boolean) => void
}

export const SourceControl = ({ source }: SourceControlProps) => {
    const { name, muted, solo } = source;
    const value = muted ? (
        SourceControlSetting.Muted
    ) : solo ? (
        SourceControlSetting.Solo
    ) : null;
    const onChange = (e: any) => {
        console.log(e.target.value);
    };
    return (
        <Card className="radio-control">
            <div style={{ display: "flex", flexDirection: "column" }}>
                <Text style={{ padding: "4px 8px", textAlign: "center" }}>{name}</Text>
                <Radio.Group value={value} onChange={onChange} buttonStyle="solid" size="small" className="audio-controls">
                    <Radio.Button value={SourceControlSetting.Muted}>Mute</Radio.Button>
                    <Radio.Button value={SourceControlSetting.Solo}>Solo</Radio.Button>
                </Radio.Group>
            </div>
        </Card>
    );
};