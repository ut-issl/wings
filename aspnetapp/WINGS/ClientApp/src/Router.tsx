import { Switch, Route } from 'react-router';
import Home from './components/home/Home';
import CommandSender from './components/command/CommandSender';
import CommandLog from './components/command/CommandLog';
import TelemetryViewer from './components/telemetry/TelemetryViewer';
import OperationHistory from './components/history/OperationHistory';
import HistoryDetail from './components/history/HistoryDetail';
import ComponentManage from './components/compo/ComponentManage';


const Router = () => {
  return (
    <Switch>
      <Route exact path='/'                        component={Home} />
      <Route exact path='/command'                 component={CommandSender} />
      <Route exact path='/telemetry'               component={TelemetryViewer} />
      <Route exact path='/command_log'             component={CommandLog} />
      <Route exact path='/history'                 component={OperationHistory} />
      <Route exact path='/history/:id'             component={HistoryDetail} />
      <Route exact path='/settings/components'     component={ComponentManage} />
    </Switch>
  )
};

export default Router;
