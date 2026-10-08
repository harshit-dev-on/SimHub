"use client";

import React, { useState, useRef } from "react";
import {
  Bold,
  Italic,
  Heading,
  Code,
  List,
  CheckSquare,
  Quote,
  Link as LinkIcon,
  Table as TableIcon,
  Columns,
  Eye,
  Edit3,
} from "lucide-react";
import { MarkdownRenderer } from "./MarkdownRenderer";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minRows?: number;
  className?: string;
}

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  value,
  onChange,
  placeholder = "Write description in GitHub Markdown (.md / README format)...",
  minRows = 6,
  className = "",
}) => {
  const [viewMode, setViewMode] = useState<"write" | "preview" | "split">("split");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Helper to insert markdown syntax at cursor
  const insertSyntax = (before: string, after: string = "", defaultText: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.slice(start, end) || defaultText;
    const replacement = `${before}${selected}${after}`;

    const nextValue = value.slice(0, start) + replacement + value.slice(end);
    onChange(nextValue);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + selected.length
      );
    }, 10);
  };

  const handleInsertTable = () => {
    const tableTemplate = `\n| Metric / Parameter | Symbol | Default Value | Notes |\n|---|---|---|---|\n| Learning Rate | η | 0.01 | Step convergence |\n| Momentum | β | 0.9 | Velocity damping |\n`;
    insertSyntax(tableTemplate);
  };

  const handleInsertCodeBlock = () => {
    insertSyntax("\n```javascript\n", "\n```\n", "// Mathematical model or implementation");
  };

  return (
    <div className={`rounded-2xl border border-slate-700 bg-slate-900/95 overflow-hidden shadow-sm transition-all focus-within:border-cyan-500 ${className}`}>
      {/* Top Action & Mode Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-slate-950/80 border-b border-slate-800 text-xs">
        {/* Formatting Toolbar */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5">
          <button
            type="button"
            onClick={() => insertSyntax("**", "**", "bold text")}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Bold (**text**)"
          >
            <Bold className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onClick={() => insertSyntax("*", "*", "italic text")}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Italic (*text*)"
          >
            <Italic className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onClick={() => insertSyntax("### ", "", "Section Title")}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Heading (### Title)"
          >
            <Heading className="h-3.5 w-3.5" />
          </button>

          <div className="h-4 w-px bg-slate-800 mx-0.5" />

          <button
            type="button"
            onClick={() => insertSyntax("`", "`", "code")}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Inline Code (`code`)"
          >
            <Code className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onClick={handleInsertCodeBlock}
            className="px-1.5 py-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer font-mono text-[11px] font-bold"
            title="Code Block (```)"
          >
            {"</>"}
          </button>

          <button
            type="button"
            onClick={() => insertSyntax("- ", "", "List item")}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Bulleted List (- item)"
          >
            <List className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onClick={() => insertSyntax("- [ ] ", "", "Task checklist item")}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Checklist Task (- [ ])"
          >
            <CheckSquare className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onClick={() => insertSyntax("> ", "", "Scientific note or observation")}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Blockquote (> quote)"
          >
            <Quote className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onClick={() => insertSyntax("[", "](https://example.com)", "Link description")}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Link ([title](url))"
          >
            <LinkIcon className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onClick={handleInsertTable}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Markdown Table"
          >
            <TableIcon className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* View Mode Toggle (Write / Preview / Split) */}
        <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setViewMode("write")}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              viewMode === "write"
                ? "bg-slate-800 text-white shadow-xs"
                : "text-slate-400 hover:text-slate-200"
            }`}
            title="Markdown Source Input"
          >
            <Edit3 className="h-3 w-3" />
            <span>Write</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode("preview")}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              viewMode === "preview"
                ? "bg-slate-800 text-white shadow-xs"
                : "text-slate-400 hover:text-slate-200"
            }`}
            title="Rendered README.md Preview"
          >
            <Eye className="h-3 w-3" />
            <span>Preview</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode("split")}
            className={`hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              viewMode === "split"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-xs"
                : "text-slate-400 hover:text-slate-200"
            }`}
            title="Split Side-by-Side Live Preview"
          >
            <Columns className="h-3 w-3" />
            <span>Split View</span>
          </button>
        </div>
      </div>

      {/* Editor Body */}
      <div className="relative">
        {/* Write Only */}
        {viewMode === "write" && (
          <textarea
            ref={textareaRef}
            rows={minRows}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-slate-950 px-4 py-3 text-slate-100 font-mono text-xs sm:text-sm placeholder-slate-500 focus:outline-none resize-y leading-relaxed"
          />
        )}

        {/* Preview Only */}
        {viewMode === "preview" && (
          <div className="min-h-[140px] max-h-[360px] overflow-y-auto bg-white p-4 sm:p-5 rounded-b-2xl">
            {value.trim() ? (
              <MarkdownRenderer content={value} />
            ) : (
              <div className="text-slate-400 italic text-xs py-6 text-center">
                Nothing to preview yet. Write some markdown above to see it formatted like a README.md!
              </div>
            )}
          </div>
        )}

        {/* Split View (Side-by-Side) */}
        {viewMode === "split" && (
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-800">
            {/* Left: Input Textarea */}
            <div className="flex flex-col">
              <div className="px-3 py-1 bg-slate-950/40 text-[10px] font-mono text-slate-500 border-b border-slate-800/60 uppercase tracking-wider">
                Raw Markdown (.md)
              </div>
              <textarea
                ref={textareaRef}
                rows={minRows}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full h-full min-h-[150px] bg-slate-950 px-3.5 py-2.5 text-slate-100 font-mono text-xs placeholder-slate-500 focus:outline-none resize-none leading-relaxed"
              />
            </div>

            {/* Right: Live Rendered README.md */}
            <div className="flex flex-col bg-white">
              <div className="px-3 py-1 bg-slate-100/90 text-[10px] font-mono font-bold text-slate-600 border-b border-slate-200 uppercase tracking-wider flex items-center justify-between">
                <span>README.md Live Preview</span>
                <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-sans font-semibold">
                  Live Sync
                </span>
              </div>
              <div className="p-3.5 overflow-y-auto max-h-[260px] min-h-[150px]">
                {value.trim() ? (
                  <MarkdownRenderer content={value} />
                ) : (
                  <div className="text-slate-400 italic text-xs py-8 text-center">
                    Type on the left to see live README.md formatting here...
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Subtle Hint Footer */}
      <div className="px-3.5 py-1.5 bg-slate-950 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 inline-block" />
          Supports GitHub Flavored Markdown (headings, tables, code blocks, lists)
        </span>
        <span className="font-mono text-[10px] text-slate-400">
          {value.length} chars
        </span>
      </div>
    </div>
  );
};
