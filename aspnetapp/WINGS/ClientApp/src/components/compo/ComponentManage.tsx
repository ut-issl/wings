import React, {useEffect, useState } from 'react';
import { Component } from '../../models';
import ComponentList from './ComponentList';

const ComponentManage = () => {
  const [compos, setCompos] = useState<Component[]>([]);

  const fetchData = async () => {
    const response_compo = await fetch('/api/components', {
      method: 'GET'
    });
    if (response_compo.status == 200) {
      const json_compo = await response_compo.json();
      const data_compo = json_compo.data as Component[];
      setCompos(data_compo);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <section className="c-section-container">
       <ComponentList compos={compos} updateState={fetchData} />
       <div className="module-spacer--medium"/>
    </section>
  );
}

export default ComponentManage;
