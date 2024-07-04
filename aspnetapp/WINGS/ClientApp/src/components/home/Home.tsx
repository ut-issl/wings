import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import OperationList from './OperationList';
import StartOperationArea from './StartOperationArea';
import { Operation } from '../../models';
import { RootState } from '../../redux/store/RootState';
import { getOpid } from '../../redux/operations/selectors';
import { leaveOperationAction } from '../../redux/operations/actions';

const Home = () => {
  const dispatch = useDispatch();
  const selector = useSelector((state: RootState) => state);
  const opid = getOpid(selector);

  const [operations, setOperations] = useState<Operation[]>([]);

  const fetchOperations = async () => {
    try {
      const res = await fetch('/api/operations', {
        method: 'GET'
      });
      if (res.status === 200) {
        const json = await res.json() as { data: Operation[], message: string };
        const data = json.data;
        if (opid !== "" && !data.some(operation => operation.id === opid)) {
          dispatch(leaveOperationAction());
        }
        const sortedData = data.sort((a, b) => {
          if (a.pathNumber < b.pathNumber) return 1;
          if (a.pathNumber > b.pathNumber) return -1;
          return 0;
        });
        setOperations(sortedData);
      } else {
        console.error(`Failed to fetch operations: ${res.statusText}`);
      }
    } catch (error) {
      console.error('An error occurred while fetching operations:', error);
    }
  };

  const fetchOperationsWrapper = () => {
    fetchOperations().catch((error) => {
      console.error('An unhandled error occurred:', error);
    })
  };


  useEffect(() => {
    fetchOperationsWrapper();
  }, []);

  return (
    <section className="c-section-container">
      <h2 className="u-text__headline">Operation Lists</h2>
      <OperationList operations={operations} updateState={fetchOperationsWrapper} />
      <div className="module-spacer--medium" />
      <h2 className="u-text__headline">Start New Operation</h2>
      <StartOperationArea updateState={fetchOperationsWrapper} />
    </section>
  )
};

export default Home;
