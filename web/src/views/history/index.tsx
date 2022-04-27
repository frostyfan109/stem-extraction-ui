import { Spin } from "antd";
import { Fragment, useEffect, useState } from "react";
import { useApi, useError } from "../../contexts";

interface UserHistory {
    title: string
}

interface HistoryViewProps {

}
export const HistoryView = ({}: HistoryViewProps) => {
    const api = useApi();
    const { handleApiError } = useError();
    const [history, setHistory] = useState<UserHistory[] | null>(null);
    useEffect(() => {
        (async () => {
        if (api) {
            try {
                const { data: history } = await api.getUserHistory();
                setHistory(history);
            } catch (error: any) {
                handleApiError({ error });
            }
        }
        })();
    }, [api]);
    if (history === null) return (
        <div style={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
            <Spin/>
        </div>
    );
    return (
        <Fragment>
            {JSON.stringify(history)}
        </Fragment>
    );
};