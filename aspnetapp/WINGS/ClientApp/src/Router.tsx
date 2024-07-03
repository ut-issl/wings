import React from 'react';
import {  Routes, Route } from 'react-router-dom';
import Home from './components/home/Home';
import CommandSender from './components/command/CommandSender';
import CommandLog from './components/command/CommandLog';
import TelemetryViewer from './components/telemetry/TelemetryViewer';
import OperationHistory from './components/history/OperationHistory';
import HistoryDetail from './components/history/HistoryDetail';
import ComponentManage from './components/compo/ComponentManage';


const Router = () => {
  return (
    <Routes>
      <Route path='/'                        element={<Home />} />
      <Route path='/command'                 element={<CommandSender />} />
      <Route path='/telemetry'               element={<TelemetryViewer />} />
      <Route path='/command_log'             element={<CommandLog />} />
      <Route path='/history'                 element={<OperationHistory />} />
      <Route path='/history/:id'             element={<HistoryDetail />} />
      <Route path='/settings/components'     element={<ComponentManage />} />
    </Routes>
  )
};

export default Router;
