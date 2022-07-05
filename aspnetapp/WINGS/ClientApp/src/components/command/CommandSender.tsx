import React from 'react';
import PlanDisplayArea from './plan_display/PlanDisplayArea';
import CommandSelectionArea from './plan_edit/CommandSelectArea';

const CommandSender = () => {
  return (
    <section className="c-section-container">
      <div className="p-grid__row">
        <PlanDisplayArea />
        <CommandSelectionArea />
      </div>
    </section>
  );
};

export default CommandSender;
