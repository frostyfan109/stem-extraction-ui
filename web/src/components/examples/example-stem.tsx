import { Space } from "antd";
import { Fragment, useEffect, useRef, useState } from "react";
import { ExampleStem as ExampleStemType } from "../../api";

interface AudioSyncProps {

}

const AudioSync = ({ }: AudioSyncProps) => {
    return (
        null
    );
};

interface ExampleStemProps {
    stem: ExampleStemType
}

export const ExampleStem = ({ stem }: ExampleStemProps) => {
    const [position, setCurrentPosition] = useState(0);
    const [playing, setPlaying] = useState(false);
    const audioRefs = useRef<HTMLAudioElement[]|null[]>([]);
    return (
        <Space direction="vertical">
            {/* {stem.original && (
                <Fragment>
                    Stem (studio)
                    <audio key={stem.original} ref={(el) => audioRefs.current[0] = el}>
                        <source src={stem.original}/>
                    </audio>
                </Fragment>
            )}
            {stem.path && (
                <Fragment>
                    {!stem.source ? "Stem (generated)" : "Original source"}
                    <audio key={stem.path} ref={(el) => audioRefs.current[1] = el}>
                        <source src={stem.path}/>
                    </audio>
                </Fragment>
            )} */}
            <AudioSync/>
        </Space>
    );
};