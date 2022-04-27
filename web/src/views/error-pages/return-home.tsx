import { Button } from "antd";
import { Link } from "react-router-dom";

export const ReturnHome = () => {
    return (
        <Button type="link">
            <Link to="/">Return home</Link>
        </Button>
    );
};