import React from 'react';
import { TelemetryViewIndex } from '../../../models';
import PacketTabPanel from './PacketTabPanel';
import GraphTabPanel from './GraphTabPanel';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux/store/RootState';
import { getViewContents } from '../../../redux/views/selectors';


export interface ViewTabPanelProps {
  tab: TelemetryViewIndex,
  index: any;
  value: any;
  blockNum: number
}

const ViewTabPanel = (props: ViewTabPanelProps) => {
  const { tab, value, index, blockNum } = props;
  const selector = useSelector((state: RootState) => state);
  const contents = getViewContents(selector);

  if (value !== index) {
    return <></>
  };

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
          //   const content = contents[tab.id];
          //   return <CharacterTabPanel tab={tab} content={content} />;
          // }
          
          case "graph": {
            const content = contents[tab.id];
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
