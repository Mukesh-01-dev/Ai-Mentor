import React, { useMemo } from 'react';
import DocHeading from '../../components/common/DocElements/DocHeading';
import DocSection from '../../components/common/DocElements/DocSection';

const DocContent = ({ docData }) => {
  return (
    <div className="max-w-4xl mx-auto pb-[60vh]">
      {docData.map((category) => (
        <div key={category.id} className="mb-20">
          <DocHeading id={category.id} title={category.title} level={1} />
          
          <div className="mt-8 space-y-16">
            {category.sections.map((section) => (
              <div key={section.id} className="scroll-mt-24" id={section.id}>
                <DocHeading id={`${section.id}-heading`} title={section.title} level={2} />
                <div className="mt-6">
                  <DocSection content={section.content} />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default DocContent;
