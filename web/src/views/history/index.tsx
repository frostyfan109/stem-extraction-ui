import { Spin } from "antd";
import { Fragment, useEffect, useState } from "react";
import { UserHistory } from "../../api";
import { useApi, useError, useLoading } from "../../contexts";

interface HistoryViewProps {

}
export const HistoryView = ({}: HistoryViewProps) => {
    const api = useApi();
    const { loading } = useLoading();
    const { handleApiError } = useError()!;
    const [history, setHistory] = useState<UserHistory|null>(null);
    useEffect(() => {
        (async () => {
        if (!loading) {
            try {
                const { data: history } = await api!.getUserHistory();
                setHistory(history);
            } catch (error: any) {}
        }
        })();
    }, [loading]);
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