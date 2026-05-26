import React, { useState } from "react";
import { Check, Copy, Info, AlertTriangle, AlertCircle, Sparkles } from "lucide-react";

// Light custom syntax highlighting for code blocks
const highlightCode = (code, language) => {
  let escaped = code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  const tokenRegex = /(\/\/.*|\/\*[\s\S]*?\*\/|#.*)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)|(\b(?:const|let|var|function|return|import|export|class|if|else|try|catch|from|default|async|await|new|extends|implements|interface|package|type|module|hasMany|belongsTo|hasOne|as|onDelete|CASCADE|require|express|app|use|get|post|patch|put|delete|protect|protectAdmin|superAdminOnly|PORT|DB_HOST|DB_USER|DB_PASSWORD|DB_NAME|DB_PORT|JWT_SECRET|JWT_ADMIN_SECRET|VITE_API_URL|GEMINI_API_KEY|CLOUDINARY_CLOUD_NAME|CLOUDINARY_API_KEY|CLOUDINARY_API_SECRET)\b)|(\b(?:true|false|null|undefined|pending|generating|ready|error)\b)|(\b\d+\b)|(\b\w+(?=\())/g;

  return escaped.replace(tokenRegex, (match, comment, string, keyword, status, number, func) => {
    if (comment) {
      return `<span class="text-zinc-500 italic">${comment}</span>`;
    }
    if (string) {
      return `<span class="text-emerald-400 font-medium">${string}</span>`;
    }
    if (keyword) {
      return `<span class="text-teal-400 font-semibold">${keyword}</span>`;
    }
    if (status) {
      return `<span class="text-indigo-400 font-medium">${status}</span>`;
    }
    if (number) {
      return `<span class="text-amber-400">${number}</span>`;
    }
    if (func) {
      return `<span class="text-sky-400">${func}</span>`;
    }
    return match;
  });
};

const CodeBlock = ({ code, language }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const highlightedHtml = highlightCode(code, language);

  return (
    <div className="relative group my-6 border border-border/50 rounded-2xl overflow-hidden bg-zinc-950 font-mono text-xs shadow-2xl">
      <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900 border-b border-border/10 text-zinc-400 select-none">
        <span className="text-[10px] font-bold tracking-widest uppercase text-zinc-500">{language || "code"}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-zinc-800 hover:text-white transition-all text-xs font-semibold uppercase tracking-wider"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 text-[10px]">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-300" />
              <span className="text-[10px]">Copy</span>
            </>
          )}
        </button>
      </div>
      <div className="p-4 overflow-x-auto scrollbar-hide text-zinc-300 leading-relaxed">
        <pre dangerouslySetInnerHTML={{ __html: highlightedHtml }} />
      </div>
    </div>
  );
};

const AlertBox = ({ type, content }) => {
  const styles = {
    NOTE: {
      border: "border-blue-500/30",
      bg: "bg-blue-500/5 dark:bg-blue-500/10",
      text: "text-blue-700 dark:text-blue-300",
      icon: <Info className="w-5 h-5 text-blue-500 shrink-0" />,
      title: "Note"
    },
    TIP: {
      border: "border-emerald-500/30",
      bg: "bg-emerald-500/5 dark:bg-emerald-500/10",
      text: "text-emerald-700 dark:text-emerald-300",
      icon: <Sparkles className="w-5 h-5 text-emerald-500 shrink-0" />,
      title: "Tip"
    },
    IMPORTANT: {
      border: "border-teal-500/30",
      bg: "bg-teal-500/5 dark:bg-teal-500/10",
      text: "text-teal-700 dark:text-teal-300",
      icon: <Info className="w-5 h-5 text-teal-500 shrink-0" />,
      title: "Important"
    },
    WARNING: {
      border: "border-amber-500/30",
      bg: "bg-amber-500/5 dark:bg-amber-500/10",
      text: "text-amber-700 dark:text-amber-300",
      icon: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />,
      title: "Warning"
    },
    CAUTION: {
      border: "border-red-500/30",
      bg: "bg-red-500/5 dark:bg-red-500/10",
      text: "text-red-700 dark:text-red-300",
      icon: <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />,
      title: "Caution"
    }
  };

  const activeStyle = styles[type] || styles.NOTE;

  return (
    <div className={`flex gap-4 p-5 my-6 border ${activeStyle.border} ${activeStyle.bg} rounded-2xl transition-all shadow-md`}>
      {activeStyle.icon}
      <div className="flex-1 text-sm leading-relaxed">
        <div className={`font-black uppercase tracking-wider text-[11px] mb-1.5 ${activeStyle.text}`}>
          {activeStyle.title}
        </div>
        <div className="text-zinc-600 dark:text-zinc-300">{content}</div>
      </div>
    </div>
  );
};

export const MarkdownRenderer = ({ content }) => {
  if (!content) return null;

  const codeBlocks = [];
  const tables = [];
  const alerts = [];

  let processedContent = content;

  // 1. Extract Code Blocks
  processedContent = processedContent.replace(/```(\w*)\n([\s\S]*?)\n```/g, (match, language, code) => {
    const placeholder = `%%CODEBLOCK_${codeBlocks.length}%%`;
    codeBlocks.push({ language, code });
    return placeholder;
  });

  // 2. Extract Alerts (GitHub Style: > [!NOTE])
  processedContent = processedContent.replace(/^> \[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\r?\n> (.*)$/gm, (match, type, text) => {
    const placeholder = `%%ALERT_${alerts.length}%%`;
    alerts.push({ type, text });
    return placeholder;
  });

  // 3. Extract Tables
  processedContent = processedContent.replace(/^\|(.*?)\|\r?\n\|[-:| ]*\|\r?\n((?:\|[^\n\r]*\|\r?\n?)*)/gm, (match, headerLine, bodyLines) => {
    const placeholder = `%%TABLE_${tables.length}%%`;
    const headers = headerLine.split("|").map(h => h.trim()).filter(Boolean);
    const rows = bodyLines
      .split("\n")
      .map(line => line.split("|").map(cell => cell.trim()).filter(Boolean))
      .filter(row => row.length > 0);
    tables.push({ headers, rows });
    return placeholder;
  });

  // Helper to parse inline formats: bold, italic, inline code
  const parseInline = (text) => {
    let parts = [text];

    // Inline code parsing: `code`
    parts = parts.flatMap(part => {
      if (typeof part !== "string") return part;
      const subparts = [];
      const regex = /`([^`]+)`/g;
      let lastIndex = 0;
      let match;
      while ((match = regex.exec(part)) !== null) {
        if (match.index > lastIndex) {
          subparts.push(part.substring(lastIndex, match.index));
        }
        subparts.push(
          <code key={match.index} className="px-2 py-0.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-teal-500 font-mono text-[11px] font-bold border border-border/30">
            {match[1]}
          </code>
        );
        lastIndex = regex.lastIndex;
      }
      if (lastIndex < part.length) {
        subparts.push(part.substring(lastIndex));
      }
      return subparts;
    });

    // Bold parsing: **bold**
    parts = parts.flatMap(part => {
      if (typeof part !== "string") return part;
      const subparts = [];
      const regex = /\*\*([^*]+)\*\*/g;
      let lastIndex = 0;
      let match;
      while ((match = regex.exec(part)) !== null) {
        if (match.index > lastIndex) {
          subparts.push(part.substring(lastIndex, match.index));
        }
        subparts.push(
          <strong key={match.index} className="font-extrabold text-main">
            {match[1]}
          </strong>
        );
        lastIndex = regex.lastIndex;
      }
      if (lastIndex < part.length) {
        subparts.push(part.substring(lastIndex));
      }
      return subparts;
    });

    return parts;
  };

  const lines = processedContent.split("\n");
  const elements = [];
  let currentList = [];
  let currentListType = null; // 'ul' or 'ol'

  const flushList = (key) => {
    if (currentList.length > 0) {
      if (currentListType === "ul") {
        elements.push(
          <ul key={`ul-${key}`} className="list-disc pl-6 my-4 space-y-2 text-sm text-muted">
            {currentList}
          </ul>
        );
      } else {
        elements.push(
          <ol key={`ol-${key}`} className="list-decimal pl-6 my-4 space-y-2 text-sm text-muted">
            {currentList}
          </ol>
        );
      }
      currentList = [];
      currentListType = null;
    }
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    // Handle Empty Line
    if (!trimmed) {
      flushList(index);
      return;
    }

    // Handle Placeholders (CodeBlocks, Tables, Alerts)
    if (trimmed.startsWith("%%CODEBLOCK_") && trimmed.endsWith("%%")) {
      flushList(index);
      const codeIndex = parseInt(trimmed.replace("%%CODEBLOCK_", "").replace("%%", ""), 10);
      const block = codeBlocks[codeIndex];
      if (block) {
        elements.push(<CodeBlock key={`code-${index}`} code={block.code} language={block.language} />);
      }
      return;
    }

    if (trimmed.startsWith("%%ALERT_") && trimmed.endsWith("%%")) {
      flushList(index);
      const alertIndex = parseInt(trimmed.replace("%%ALERT_", "").replace("%%", ""), 10);
      const alert = alerts[alertIndex];
      if (alert) {
        elements.push(<AlertBox key={`alert-${index}`} type={alert.type} content={alert.text} />);
      }
      return;
    }

    if (trimmed.startsWith("%%TABLE_") && trimmed.endsWith("%%")) {
      flushList(index);
      const tableIndex = parseInt(trimmed.replace("%%TABLE_", "").replace("%%", ""), 10);
      const table = tables[tableIndex];
      if (table) {
        elements.push(
          <div key={`table-wrapper-${index}`} className="w-full overflow-x-auto border border-border/50 rounded-2xl my-6 bg-card shadow-sm">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-canvas-alt border-b border-border text-[10px] font-black uppercase text-main tracking-wider">
                  {table.headers.map((h, i) => (
                    <th key={i} className="px-5 py-4 font-bold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 text-muted">
                {table.rows.map((row, ri) => (
                  <tr key={ri} className="hover:bg-canvas-alt/50 transition-colors">
                    {row.map((cell, ci) => (
                      <td key={ci} className="px-5 py-3.5 font-medium leading-relaxed font-sans">{parseInline(cell)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
      return;
    }

    // Handle Headers: #, ##, ###
    if (trimmed.startsWith("# ")) {
      flushList(index);
      const headingText = trimmed.substring(2);
      const anchorId = headingText.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      elements.push(
        <h1 key={`h1-${index}`} id={anchorId} className="scroll-mt-24 text-3xl font-black text-main tracking-tight mt-8 mb-4 border-b border-border/40 pb-2">
          {parseInline(headingText)}
        </h1>
      );
      return;
    }

    if (trimmed.startsWith("## ")) {
      flushList(index);
      const headingText = trimmed.substring(3);
      const anchorId = headingText.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      elements.push(
        <h2 key={`h2-${index}`} id={anchorId} className="scroll-mt-24 text-xl font-bold text-main tracking-tight mt-10 mb-3 flex items-center group">
          {parseInline(headingText)}
          <a href={`#${anchorId}`} className="ml-2.5 opacity-0 group-hover:opacity-100 text-teal-500 transition-opacity font-normal text-sm select-none">#</a>
        </h2>
      );
      return;
    }

    if (trimmed.startsWith("### ")) {
      flushList(index);
      const headingText = trimmed.substring(4);
      const anchorId = headingText.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      elements.push(
        <h3 key={`h3-${index}`} id={anchorId} className="scroll-mt-24 text-sm font-black text-main uppercase tracking-widest mt-6 mb-2">
          {parseInline(headingText)}
        </h3>
      );
      return;
    }

    // Handle Lists: - or * or numbers
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      if (currentListType !== "ul") {
        flushList(index);
        currentListType = "ul";
      }
      currentList.push(
        <li key={`li-${index}`} className="leading-relaxed font-sans">
          {parseInline(line.replace(/^[-*]\s+/, ""))}
        </li>
      );
      return;
    }

    const orderedMatch = line.match(/^(\d+)\.\s+(.*)/);
    if (orderedMatch) {
      if (currentListType !== "ol") {
        flushList(index);
        currentListType = "ol";
      }
      currentList.push(
        <li key={`li-${index}`} className="leading-relaxed font-sans">
          {parseInline(orderedMatch[2])}
        </li>
      );
      return;
    }

    // Default Paragraph line
    flushList(index);
    elements.push(
      <p key={`p-${index}`} className="my-4 text-sm text-muted leading-relaxed font-sans font-medium">
        {parseInline(line)}
      </p>
    );
  });

  flushList(lines.length);

  return <div className="markdown-body pr-4">{elements}</div>;
};
