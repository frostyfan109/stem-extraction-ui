import { useHistory } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { SchemaArgs, SeparatorConfig } from "../../../api";
import { SeparatorForm } from "../../../components/separator-form";
import { useApi } from "../../../contexts";
import { appConfigState } from "../../../recoil/state/app-config";

interface SeparatorConfigurationViewProps {
    activeSeparatorKey: string,
    startSeparate: (separator: SeparatorConfig, file: Blob, fileName: string, args: SchemaArgs) => Promise<void>
}

export const SeparatorConfigurationView = ({ activeSeparatorKey, startSeparate }: SeparatorConfigurationViewProps) => {
    const history = useHistory();
    const api = useApi();

    const { separator_config: separatorConfig } = useRecoilValue(appConfigState)!;
    const activeSeparator = separatorConfig.find((separator) => separator.key === activeSeparatorKey)!;

    return (
        <SeparatorForm
            separator={activeSeparator}
            startSeparate={(file, fileName, args) => startSeparate(activeSeparator, file, fileName, args)}/>
    );
};