import React, { useEffect } from 'react';
import Router from './Router';
import Header from './components/header/Header';
import LoadingBackDrop from './components/common/LoadingBackDrop';
import ErrorDialog from './components/common/ErrorDialog';
import { useDispatch, useSelector } from 'react-redux';
import { getOpid } from './redux/operations/selectors';
import { RootState } from './redux/store/RootState';
import { updateLatestTelemetriesAction, addTelemetryHistoriesAction } from './redux/telemetries/actions';
import "./assets/style.css";
import { TelemetryPacketJson } from './models';

export function useValueRef<T>(val: T) {
  const ref = React.useRef(val);
  React.useEffect(() => {
    ref.current = val;
  }, [val]);
  return ref
}

const App = () => {
  const selector = useSelector((state: RootState) => state);
  const dispatch = useDispatch();
  const opid = getOpid(selector);
  const [refTlmTime, setRefTlmTime] = React.useState("");
  const refTime = useValueRef(refTlmTime);

  const fetchTelemetry = async () => {
    if (opid === "") return;
    const res = await fetch(`/api/operations/${opid}/tlm?refTlmTime=${refTime.current}`, {
      method: 'GET'
    });
    if (res.status == 200) {
      const json = await res.json() as TelemetryPacketJson;
      const data = json.data;
      setRefTlmTime(json.latestTlmTime);
      dispatch(updateLatestTelemetriesAction(data));
      dispatch(addTelemetryHistoriesAction(data));
    }
  }

  useEffect(() => {
    const interval = setInterval(() => {
      (async () => {
        try {
          await fetchTelemetry();
        } catch (error) {
          console.error('Error fetching telemetry:', error);
        }
      })().catch(error => {
        console.error('Error in interval function:', error);
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [opid]);

  return (
    <div>
      <Header />
      <main className="c-main">
        <Router />
      </main>
      <LoadingBackDrop />
      <ErrorDialog />
    </div>
  )
};

export default App;
