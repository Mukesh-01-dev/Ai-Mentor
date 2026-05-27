import React from 'react';

const DocHeading = ({ id, title, level = 2 }) => {
  const HeadingTag = `h${level}`;
  
  const styles = {
    1: "text-4xl font-black tracking-tight text-main mb-6 mt-12",
    2: "text-3xl font-black tracking-tight text-main mb-6 mt-12 pb-2 border-b border-border/50",
    3: "text-2xl font-black tracking-tight text-main mb-4 mt-8",
    4: "text-xl font-bold tracking-tight text-main mb-4 mt-6",
  };

  return (
    <HeadingTag id={id} className={`scroll-mt-24 ${styles[level] || styles[2]}`}>
      {title}
    </HeadingTag>
  );
};

export default DocHeading;
