import React from 'react';
import CmdLogDisplayArea from './log_display/CmdLogDisplayArea';

const CommandLog = () => {
  return (
    <section className="c-section-container">
      <div className="p-grid__row">
        <CmdLogDisplayArea />
      </div>
    </section>
  );
};

export default CommandLog;
