import React from 'react';
import { TelemetryViewIndex } from '../../../models';
import PacketTabPanel from './PacketTabPanel';
import GraphTabPanel from './GraphTabPanel';


export interface ViewTabPanelProps {
  tab: TelemetryViewIndex,
  index: number;
  value: number;
  blockNum: number
}

const ViewTabPanel = (props: ViewTabPanelProps) => {
  const { tab, value, index, blockNum } = props;

  if (value !== index) {
    return <></>
  }

  return (
    <div
      role="tabpanel"
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
    >
      {(() => {
        switch (tab.type) {
          case "packet": {
            return <PacketTabPanel tab={tab} blockNum={blockNum} />;
          }

          // case "character": {
          //   return <CharacterTabPanel tab={tab} content={content} />;
          // }

          case "graph": {
            return <GraphTabPanel tab={tab} blockNum={blockNum} />;
          }

          default:
            break;
        }
      })()}
    </div>
  );
}

export default ViewTabPanel;
