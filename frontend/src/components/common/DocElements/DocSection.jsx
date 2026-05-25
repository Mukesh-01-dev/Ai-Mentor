import React from 'react';
import DocCodeBlock from './DocCodeBlock';

const DocSection = ({ content }) => {
  return (
    <div className="space-y-4 text-main/90 leading-relaxed text-[15px]">
      {content.map((block, index) => {
        if (block.type === 'paragraph') {
          // Render paragraph with inline code formatting
          const formattedText = block.text.split(/(`[^`]+`)/).map((part, i) => {
            if (part.startsWith('`') && part.endsWith('`')) {
              return (
                <code key={i} className="px-1.5 py-0.5 bg-border/40 text-main rounded font-mono text-[13px] border border-border/60">
                  {part.slice(1, -1)}
                </code>
              );
            }
            return part;
          });

          return <p key={index} className="mb-4">{formattedText}</p>;
        }

        if (block.type === 'code') {
          return <DocCodeBlock key={index} code={block.text} language={block.language} />;
        }

        if (block.type === 'list') {
          return (
            <ul key={index} className="list-disc list-inside space-y-2 mb-4 ml-4">
              {block.items.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
          );
        }

        return null;
      })}
    </div>
  );
};

export default DocSection;
