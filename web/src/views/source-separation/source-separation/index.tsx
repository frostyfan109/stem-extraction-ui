import { Fragment, useCallback, useEffect, useState } from "react";
import { Breadcrumb, Button, Card, Divider, List, Progress, Space, Spin, Typography } from "antd";
import { CeleryState, MonitorSeparationState, SeparationFile } from "../../../api";
import { useApi } from "../../../contexts";
import { Error404View } from "../../error-pages";
import { appConfigState } from "../../../recoil/state/app-config";
import { useRecoilValue } from "recoil";
import { GradientWave } from "../../../components/gradient-wave";
import { SoundWave } from "../../../components/sound-wave";
import "./source-separation.scss";
import { FileCard } from "./file-card";
import moment from "moment";
import { Link } from "react-router-dom";

const { Title, Text } = Typography;

interface SourceSeparationViewProps {
    separationId: string
}

enum ProcessingStage {
    Pending,
    Running,
    Finished,
}
namespace ProcessingStage {
    export const fromCeleryState = (state: CeleryState): ProcessingStage => {
        switch (state) {
            case "PENDING":
                return ProcessingStage.Pending;
            case "SUCCESS":
            case "FAILURE":
                return ProcessingStage.Finished;
            default:
                return ProcessingStage.Running;
        }
    };
}

export const SourceSeparationView = ({ separationId }: SourceSeparationViewProps) => {
    const api = useApi()!;
    const [separationState, setSeparationState] = useState<MonitorSeparationState|null>(null);
    const { separator_config: separatorConfig } = useRecoilValue(appConfigState)!;
    const [is404, setIs404] = useState(false);
    const [elapsed, setElapsed] = useState<string|null>(null);

    const updateElapsed = useCallback(() => {
        if (separationState?.separation.creation_date) {
            const diff = moment().diff(separationState?.separation.creation_date * 1000);
            const date = moment.utc(diff);
            const duration = moment.duration(diff);
            const format = duration.asHours() < 1 ? "m:ss" : "H:mm:ss";
            // const format = moment.duration()
            setElapsed("(" + date.format(format) + ")");
        }
    }, [separationState]);
    const pollSeparationState = useCallback(async () => {
        try {
            const { data } = await api.monitorSeparation(separationId, separationState);
            setSeparationState(data);
        } catch (e: any) {
            if (e.response.status_code === 404) {
                setIs404(true);
            }
        }
    }, [separationId, separationState, api]);
    useEffect(() => {
        if (separationState === null || separationState.state !== "SUCCESS" && separationState.state !== "FAILURE") {
            pollSeparationState();
        }
    }, [separationState]);
    useEffect(() => {
        const timeout = setTimeout(() => {
            updateElapsed();
        }, 1000);
        updateElapsed();
        return () => clearTimeout(timeout);
    }, [separationState, elapsed]);
    if (is404) return (
        <Error404View/>
    );
    if (separationState === null) return (
        <div style={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
            <Spin />
        </div>
    );
    const { state, data: separationData, separation } = separationState;
    const separator = separatorConfig.find((separator) => separator.key === separation.separator)!;
    const sourceFile = separation.files.find((file) => file.stem_type === "SOURCE")!;
    const fileOrder = [
        "SOURCE",
        "VOCALS",
        "BASS",
        "DRUMS",
        "PIANO",
        "OTHER"
    ];
    const files = [
        ...separation.files.filter((file) => file !== sourceFile),
        {id: "1234", stem_type: "BASS", file_name: "bass.wav"} as SeparationFile,
        {id: "5678", stem_type: "VOCALS", file_name: "vocals.wav"} as SeparationFile,
        {id: "6542", stem_type: "DRUMS", file_name: "drums.wav"} as SeparationFile,
        {id: "7865", stem_type: "PIANO", file_name: "piano.wav"} as SeparationFile,
        {id: "4323", stem_type: "OTHER", file_name: "other.wav"} as SeparationFile
    ].sort((a, b) => fileOrder.indexOf(a.stem_type) - fileOrder.indexOf(b.stem_type));
    const stage = ProcessingStage.fromCeleryState(state);
    // const stage = ProcessingStage.Running as any;
    // if (state === "SUCCESS" || state === "FAILURE") return (
    //     <Fragment>
    //         <Title level={4}>Done</Title>
    //         <pre>{JSON.stringify(separationState, undefined, 4)}</pre>
    //     </Fragment>
    // );
    // if (state === "PENDING") return (
    //     <Space direction="vertical" size="middle" align="center" style={{ width: "100%", height: "100%", justifyContent: "center" }}>
    //         <Spin />
    //         <Title level={5} type="secondary">Waiting for processing</Title>
    //     </Space>
    // );
    const title = (
        <Fragment>
            {
            stage === ProcessingStage.Pending ? (
                "Waiting for processing"
            ) : stage === ProcessingStage.Running ? (
                `Separation in progress ${elapsed}`
            ) : (
                "Separation complete"
            )
            }
        </Fragment>
    );
    return (
        <div className="separation-container" style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%" }}>
            <Breadcrumb>
                <Breadcrumb.Item key={"/"}><Link to="/">Separate</Link></Breadcrumb.Item>
                <Breadcrumb.Item key={`/${separator.key}`}>
                    <Link to={`/${separator.key}`}>{separator.name}</Link>
                </Breadcrumb.Item>
                <Breadcrumb.Item key={`/${separator.key}/${separation.id}`}>
                    File
                </Breadcrumb.Item>
            </Breadcrumb>
            <Space direction="vertical" size="middle" style={{ alignItems: "center" }}>
                <Title level={4} style={{ margin: 0 }}>
                    {title}
                </Title>
                <Text type="secondary">{sourceFile.file_name}</Text>
                {/* <Progress percent={30} style={{ width: "min(350px, 100vw - 32px)" }}/> */}
                {/* <GradientWave/> */}
                <Divider style={{ marginTop: 0, borderColor: "#1890ff" }}><SoundWave color="#1890ff"/></Divider>
            </Space>
            <Space
                direction="vertical"
                style={{ display: stage === ProcessingStage.Pending ? "none" : undefined, flexGrow: 1, zIndex: 1, }}
                className="separation-bottom-container"
            >
                <List
                    className="trackout-list"
                    grid={{ gutter: 16, column: 4 }}
                    dataSource={files}
                    renderItem={(file) => (
                        <List.Item key={file.id}>
                            <FileCard file={file} />
                        </List.Item>
                    )}
                    style={{ width: "100%", height: "100%" }}
                />
                <Space>
                    <Button type="primary" disabled={stage !== ProcessingStage.Finished}>Download all</Button>
                    {stage !== ProcessingStage.Finished && <Button danger>Cancel</Button>}
                </Space>
            </Space>
            {/* <GradientWave style={{ position: "absolute", transform: "scaleY(-1)", bottom: 0, left: 0, opacity: .5 }}/> */}
        </div>
        // <pre>{JSON.stringify(separationState, undefined, 4)}</pre>
    );
};