import React from 'react';

const highlightCode = (code, language) => {
  const lineClasses = "flex";
  const numClasses = "text-gray-600 select-none text-right border-r border-gray-700/50 pr-4 mr-4 w-8 shrink-0";
  const contentClasses = "whitespace-pre";

  if (language === 'bash') {
    return code.split('\n').map((line, i) => {
      // Highlight command names or flags
      const parts = line.split(' ');
      const highlighted = parts.map((part, j) => {
        if (j === 0 && ['npm', 'npx', 'yarn', 'mkdir', 'cd', 'ls', 'GET', 'POST', 'PUT', 'DELETE'].includes(part)) {
          return `<span class="text-teal-400 font-semibold">${part}</span>`;
        }
        if (part.startsWith('-')) {
          return `<span class="text-gray-400">${part}</span>`;
        }
        return part;
      }).join(' ');
      return `<div class="${lineClasses}"><span class="${numClasses}">${i + 1}</span><span class="${contentClasses}">${highlighted}</span></div>`;
    }).join('');
  }

  if (language === 'javascript') {
    // Basic JS highlighting
    let highlighted = code
      .replace(/(const|let|var|function|return|if|else|for|while|import|export|from|require|async|await)/g, '<span class="text-teal-400 font-bold">$1</span>')
      .replace(/(['"`].*?['"`])/g, '<span class="text-yellow-300">$1</span>')
      .replace(/(\/\/.*)/g, '<span class="text-gray-500 italic">$1</span>')
      .replace(/(\b\d+\b)/g, '<span class="text-purple-400">$1</span>')
      .replace(/(\w+)(?=\()/g, '<span class="text-blue-300">$1</span>');
    
    return highlighted.split('\n').map((line, i) => 
      `<div class="${lineClasses}"><span class="${numClasses}">${i + 1}</span><span class="${contentClasses}">${line}</span></div>`
    ).join('');
  }

  // Default text rendering
  return code.split('\n').map((line, i) => 
    `<div class="${lineClasses}"><span class="${numClasses}">${i + 1}</span><span class="${contentClasses}">${line}</span></div>`
  ).join('');
};

const DocCodeBlock = ({ code, language = 'text' }) => {
  return (
    <div className="relative group my-6">
      <div className="absolute -top-3 left-4 px-2 py-0.5 bg-gray-800 text-gray-400 text-[10px] font-black uppercase tracking-widest rounded-md z-10 shadow-sm border border-gray-700">
        {language}
      </div>
      <div className="bg-[#111827] rounded-2xl overflow-hidden shadow-xl border border-gray-800 transition-all duration-300 group-hover:border-gray-700">
        <div className="overflow-x-auto p-4 pt-6">
          <pre className="text-sm text-gray-200 font-mono w-full">
            <code dangerouslySetInnerHTML={{ __html: highlightCode(code, language) }} className="block" />
          </pre>
        </div>
      </div>
    </div>
  );
};

export default DocCodeBlock;
