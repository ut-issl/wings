import React, { useEffect, useState } from 'react';
import { Component, ComponentJson } from '../../models';
import ComponentList from './ComponentList';
import { apiFetch } from '../../lib/fetch';

const ComponentManage = () => {
  const [compos, setCompos] = useState<Component[]>([]);

  const fetchData = async () => {
    try {
      const response_compo = await apiFetch('/api/components', {
        method: 'GET'
      });
      if (response_compo.status === 200) {
        const json_compo = await response_compo.json() as ComponentJson;
        const data_compo = json_compo.data;
        setCompos(data_compo);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleFetchData = () => {
    fetchData().catch(error => {
      console.error("Error executing fetchData:", error);
    });
  };

  useEffect(() => {
    handleFetchData();
  }, []);

  return (
    <section className="c-section-container">
      <ComponentList compos={compos} updateState={handleFetchData} />
      <div className="module-spacer--medium" />
    </section>
  );
}

export default ComponentManage;
