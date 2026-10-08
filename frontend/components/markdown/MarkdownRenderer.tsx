"use client";

import React, { useState } from "react";
import { Check, Copy, ExternalLink } from "lucide-react";

export interface MarkdownRendererProps {
  content: string;
  className?: string;
}

// Helper to parse inline elements: bold, italic, inline code, links, strikethrough
function renderInline(text: string): React.ReactNode[] {
  const elements: React.ReactNode[] = [];
  // Regex to match inline patterns:
  // 1: `code`
  // 2: **bold** or __bold__
  // 3: *italic* or _italic_
  // 4: ~~strike~~
  // 5: [text](url)
  const regex = /(`[^`]+`|\*\*[^*]+\*\*|__[^_]+__|\*[^*]+\*|_[^_]+_|~~[^~]+~~|\[[^\]]+\]\([^)]+\))/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      elements.push(text.slice(lastIndex, match.index));
    }

    const token = match[0];
    const key = `${match.index}-${token.slice(0, 10)}`;

    if (token.startsWith("`") && token.endsWith("`")) {
      elements.push(
        <code
          key={key}
          className="rounded-md bg-slate-100 border border-slate-200 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-rose-600"
        >
          {token.slice(1, -1)}
        </code>
      );
    } else if (
      (token.startsWith("**") && token.endsWith("**")) ||
      (token.startsWith("__") && token.endsWith("__"))
    ) {
      elements.push(
        <strong key={key} className="font-bold text-slate-900">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (
      (token.startsWith("*") && token.endsWith("*")) ||
      (token.startsWith("_") && token.endsWith("_"))
    ) {
      elements.push(
        <em key={key} className="italic text-slate-800">
          {token.slice(1, -1)}
        </em>
      );
    } else if (token.startsWith("~~") && token.endsWith("~~")) {
      elements.push(
        <del key={key} className="line-through text-slate-400">
          {token.slice(2, -2)}
        </del>
      );
    } else if (token.startsWith("[") && token.includes("](")) {
      const splitIdx = token.indexOf("](");
      const linkText = token.slice(1, splitIdx);
      const linkUrl = token.slice(splitIdx + 2, -1);
      elements.push(
        <a
          key={key}
          href={linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-0.5 text-indigo-600 hover:text-indigo-800 underline font-medium hover:underline transition-colors"
        >
          <span>{linkText}</span>
          <ExternalLink className="h-3 w-3 inline shrink-0" />
        </a>
      );
    } else {
      elements.push(token);
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    elements.push(text.slice(lastIndex));
  }

  return elements.length > 0 ? elements : [text];
}

interface CodeBlockProps {
  language: string;
  code: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ language, code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative my-3 rounded-xl border border-slate-800 bg-slate-950 text-slate-100 overflow-hidden shadow-xs">
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-slate-900/80 border-b border-slate-800/80 text-[10px] text-slate-400 font-mono">
        <span className="uppercase tracking-wider font-bold text-slate-300">
          {language || "code"}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-3.5 font-mono text-xs overflow-x-auto leading-relaxed text-slate-200">
        <code>{code}</code>
      </pre>
    </div>
  );
};

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  className = "",
}) => {
  if (!content) return null;

  const lines = content.split("\n");
  const nodes: React.ReactNode[] = [];

  let i = 0;
  let keyIndex = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // 1. Fenced Code Block: ```lang
    if (trimmed.startsWith("```")) {
      const lang = trimmed.slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      // skip the closing ```
      i++;
      nodes.push(
        <CodeBlock
          key={`code-${keyIndex++}`}
          language={lang}
          code={codeLines.join("\n")}
        />
      );
      continue;
    }

    // 2. Headings: # through ######
    if (trimmed.startsWith("#")) {
      const match = trimmed.match(/^(#{1,6})\s+(.*)$/);
      if (match) {
        const level = match[1].length;
        const text = match[2];
        const inner = renderInline(text);

        switch (level) {
          case 1:
            nodes.push(
              <h1
                key={`h1-${keyIndex++}`}
                className="text-lg font-black text-slate-900 border-b border-slate-200 pb-1.5 mt-4 mb-2 tracking-tight"
              >
                {inner}
              </h1>
            );
            break;
          case 2:
            nodes.push(
              <h2
                key={`h2-${keyIndex++}`}
                className="text-base font-bold text-slate-900 border-b border-slate-100 pb-1 mt-3.5 mb-1.5 tracking-tight"
              >
                {inner}
              </h2>
            );
            break;
          case 3:
            nodes.push(
              <h3
                key={`h3-${keyIndex++}`}
                className="text-sm font-bold text-slate-900 mt-3 mb-1 tracking-tight"
              >
                {inner}
              </h3>
            );
            break;
          case 4:
            nodes.push(
              <h4
                key={`h4-${keyIndex++}`}
                className="text-xs font-bold text-slate-800 uppercase tracking-wider mt-2.5 mb-1"
              >
                {inner}
              </h4>
            );
            break;
          default:
            nodes.push(
              <h5
                key={`h5-${keyIndex++}`}
                className="text-xs font-bold text-slate-700 mt-2 mb-1"
              >
                {inner}
              </h5>
            );
            break;
        }
        i++;
        continue;
      }
    }

    // 3. Blockquote: > text
    if (trimmed.startsWith(">")) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith(">")) {
        quoteLines.push(lines[i].trim().replace(/^>\s?/, ""));
        i++;
      }
      nodes.push(
        <blockquote
          key={`quote-${keyIndex++}`}
          className="border-l-4 border-amber-400 bg-[#FEF9C3]/50 pl-3.5 py-1.5 my-2.5 rounded-r-xl text-xs sm:text-sm text-slate-800 italic space-y-1"
        >
          {quoteLines.map((qLine, idx) => (
            <p key={idx} className="leading-relaxed">
              {renderInline(qLine)}
            </p>
          ))}
        </blockquote>
      );
      continue;
    }

    // 4. Horizontal Rule: --- or ***
    if (/^(\*{3,}|-{3,}|_{3,})$/.test(trimmed)) {
      nodes.push(
        <hr key={`hr-${keyIndex++}`} className="my-3.5 border-slate-200" />
      );
      i++;
      continue;
    }

    // 5. Table (Markdown table with | header | and | --- |)
    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      const tableLines: string[] = [];
      while (
        i < lines.length &&
        lines[i].trim().startsWith("|") &&
        lines[i].trim().endsWith("|")
      ) {
        tableLines.push(lines[i].trim());
        i++;
      }

      if (tableLines.length >= 2) {
        const headerRow = tableLines[0]
          .slice(1, -1)
          .split("|")
          .map((c) => c.trim());
        // line 1 is separator |---|---|
        const bodyRows = tableLines.slice(2).map((row) =>
          row
            .slice(1, -1)
            .split("|")
            .map((c) => c.trim())
        );

        nodes.push(
          <div
            key={`table-${keyIndex++}`}
            className="my-3 overflow-x-auto rounded-xl border border-slate-200 shadow-2xs"
          >
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-900">
                  {headerRow.map((cell, cIdx) => (
                    <th key={cIdx} className="px-3 py-2 border-r border-slate-200 last:border-r-0">
                      {renderInline(cell)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {bodyRows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-slate-50/70 transition-colors">
                    {row.map((cell, cIdx) => (
                      <td
                        key={cIdx}
                        className="px-3 py-2 text-slate-700 border-r border-slate-100 last:border-r-0"
                      >
                        {renderInline(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        continue;
      }
    }

    // 6. Unordered List or Task List: - or *
    if (/^[-*]\s+/.test(trimmed)) {
      const listItems: { isTask: boolean; checked: boolean; text: string }[] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
        const itemLine = lines[i].trim().replace(/^[-*]\s+/, "");
        const taskMatch = itemLine.match(/^\[([ xX])\]\s+(.*)$/);
        if (taskMatch) {
          listItems.push({
            isTask: true,
            checked: taskMatch[1].toLowerCase() === "x",
            text: taskMatch[2],
          });
        } else {
          listItems.push({
            isTask: false,
            checked: false,
            text: itemLine,
          });
        }
        i++;
      }

      nodes.push(
        <ul key={`ul-${keyIndex++}`} className="my-2 space-y-1.5 text-xs sm:text-sm text-slate-700">
          {listItems.map((item, lIdx) =>
            item.isTask ? (
              <li key={lIdx} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={item.checked}
                  readOnly
                  className="rounded border-slate-300 text-indigo-600 focus:ring-0 cursor-default h-3.5 w-3.5"
                />
                <span className={item.checked ? "line-through text-slate-400" : ""}>
                  {renderInline(item.text)}
                </span>
              </li>
            ) : (
              <li key={lIdx} className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-400 mt-2 shrink-0" />
                <span className="flex-1">{renderInline(item.text)}</span>
              </li>
            )
          )}
        </ul>
      );
      continue;
    }

    // 7. Ordered List: 1. text
    if (/^\d+\.\s+/.test(trimmed)) {
      const listItems: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        listItems.push(lines[i].trim().replace(/^\d+\.\s+/, ""));
        i++;
      }

      nodes.push(
        <ol key={`ol-${keyIndex++}`} className="my-2 space-y-1.5 list-decimal pl-5 text-xs sm:text-sm text-slate-700">
          {listItems.map((item, lIdx) => (
            <li key={lIdx} className="leading-relaxed">
              {renderInline(item)}
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // 8. Blank Line
    if (trimmed === "") {
      i++;
      continue;
    }

    // 9. Standard Paragraph
    const paraLines: string[] = [line];
    i++;
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !lines[i].trim().startsWith("#") &&
      !lines[i].trim().startsWith("```") &&
      !lines[i].trim().startsWith(">") &&
      !lines[i].trim().startsWith("|") &&
      !/^[-*]\s+/.test(lines[i].trim()) &&
      !/^\d+\.\s+/.test(lines[i].trim())
    ) {
      paraLines.push(lines[i]);
      i++;
    }

    nodes.push(
      <p
        key={`p-${keyIndex++}`}
        className="my-1.5 text-xs sm:text-sm text-slate-700 leading-relaxed font-normal"
      >
        {paraLines.map((pLine, pIdx) => (
          <React.Fragment key={pIdx}>
            {renderInline(pLine)}
            {pIdx < paraLines.length - 1 && <br />}
          </React.Fragment>
        ))}
      </p>
    );
  }

  return (
    <div className={`markdown-body text-slate-800 leading-relaxed font-sans ${className}`}>
      {nodes}
    </div>
  );
};
