import { Radio, Space, Tabs, Typography } from "antd";
import { SeparatorConfig } from "../../api";
import { Example } from "./example";

const { Title } = Typography;
const { TabPane } = Tabs;

interface ExamplesProps {
    separator: SeparatorConfig
}

export const Examples = ({ separator }: ExamplesProps) => {
    return (
        <Tabs>
            {
                separator.examples.map((example) => (
                    <TabPane tab={example.name} key={example.name}>
                        <Example example={example}/>
                    </TabPane>
                ))
            }
        </Tabs>
    );
};