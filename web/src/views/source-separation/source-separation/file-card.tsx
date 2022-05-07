import { Card, Space, Typography } from "antd";
import { faDrum, faMicrophoneLines, faMusic } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { SeparationFile } from "../../../api";
import { PianoKeysIcon, SubwooferIcon } from "../../../components";

const { Title, Text } = Typography;

interface FileCardProps {
    file: SeparationFile
}

export const FileCard = ({ file }: FileCardProps) => {
    let icon = null;
    let title = null;
    let description = null;
    switch (file.stem_type) {
        case "BASS":
            icon = <SubwooferIcon variant="speaker" size={24}/>;
            title = <Title level={4} style={{ marginLeft: "12px", marginBottom: "2px" }}>Bass</Title>;
            description = "Low frequency range covering ~20-100 Hz";
            break;
        case "DRUMS":
            icon = <FontAwesomeIcon icon={faDrum} style={{ fontSize: "24px" }}/>;
            title = <Title level={4} style={{ marginLeft: "12px", marginBottom: "2px" }}>Drums</Title>;
            description = "Hi-hats, snares, and other drums";
            break;
        case "PIANO":
            icon = <PianoKeysIcon size={24}/>;
            title = <Title level={4} style={{ marginLeft: "12px", marginBottom: "2px" }}>Piano</Title>;
            description = "Piano, keyboard, synth, etc.";
            break;
        case "VOCALS":
            icon = <FontAwesomeIcon icon={faMicrophoneLines} style={{ fontSize: "24px" }}/>;
            title = <Title level={4} style={{ marginLeft: "12px", marginBottom: "2px" }}>Vocals</Title>;
            description = "Leading and backing vocals";
            break;
        case "OTHER":
            icon = <FontAwesomeIcon icon={faMusic} style={{ fontSize: "24px" }}/>;
            title = <Title level={4} style={{ marginLeft: "12px", marginBottom: "2px" }}>Other</Title>;
            description = "Everything else";
            break;
        default:
            console.error("Unknown stem type:", file.stem_type);
    }
    const titleContainer = (
        <div style={{ display: "flex", flexDirection: "column", wordBreak: "break-word", whiteSpace: "normal" }}>
            <div style={{ display: "flex", alignItems: "center" }}>
                    {icon}
                    {title}
                </div>
            {/* <Text type="secondary" style={{ fontSize: "14px", fontWeight: "normal" }}>{file.file_name}</Text> */}
            <Text style={{ fontSize: "15px", fontWeight: "normal", marginTop: "4px" }}>{description}</Text>
        </div>
    );
    return (
        <Card title={titleContainer} hoverable>
            {file.id}
        </Card>
    );
};