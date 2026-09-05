'use client';
import { useState, useEffect, useRef } from 'react';
import clsx from 'clsx';

export interface TerminalProps {
  lines: string[];
  typingSpeed?: number;
  className?: string;
}

export default function Terminal({ lines, typingSpeed = 50, className }: TerminalProps) {
  const [displayedLines, setDisplayedLines] = useState<string[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentLineIndex >= lines.length) return;
    
    // Check if current line is finished typing
    if (currentCharIndex === lines[currentLineIndex].length) {
      const timeout = setTimeout(() => {
        setCurrentLineIndex(prev => prev + 1);
        setCurrentCharIndex(0);
      }, 500); // pause between lines
      return () => clearTimeout(timeout);
    }

    // Type next char
    const timeout = setTimeout(() => {
      setDisplayedLines(prev => {
        const newLines = [...prev];
        if (!newLines[currentLineIndex]) {
          newLines[currentLineIndex] = '';
        }
        newLines[currentLineIndex] = lines[currentLineIndex].substring(0, currentCharIndex + 1);
        return newLines;
      });
      setCurrentCharIndex(prev => prev + 1);
    }, typingSpeed);

    return () => clearTimeout(timeout);
  }, [currentLineIndex, currentCharIndex, lines, typingSpeed]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [displayedLines]);

  return (
    <div className={clsx("rounded-xl overflow-hidden border border-white/10 bg-[#0a0a0f] text-sm font-mono shadow-2xl flex flex-col", className)}>
      <div className="bg-[#1a1a24] px-4 py-2 flex items-center gap-2 border-b border-white/5 shrink-0">
        <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
        <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
        <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
        <div className="ml-4 text-xs text-slate-500 w-full text-center pr-8">provision-worker</div>
      </div>
      <div 
        ref={scrollRef}
        className="p-4 text-slate-300 leading-relaxed overflow-y-auto h-full space-y-1"
      >
        {displayedLines.map((line, i) => {
          // Add some fake syntax highlighting based on keywords easily
          let coloredLine = line;
          if (line.includes('ERROR')) {
             coloredLine = `<span class="text-rose-400">${line}</span>`;
          } else if (line.includes('SUCCESS') || line.includes('✔')) {
             coloredLine = `<span class="text-emerald-400">${line}</span>`;
          } else if (line.includes('INFO') || line.includes('==>')) {
             coloredLine = `<span class="text-cyan-400">${line}</span>`;
          }
          
          return (
            <div key={i} className="flex gap-4">
               <span className="text-slate-600 shrink-0 select-none">{String(i + 1).padStart(2, ' ')}</span>
               <div dangerouslySetInnerHTML={{ __html: coloredLine }} className="break-all" />
            </div>
          );
        })}
        {currentLineIndex < lines.length && (
          <div className="flex gap-4">
             <span className="text-slate-600 shrink-0 select-none">{String(currentLineIndex + 1).padStart(2, ' ')}</span>
             <span className="w-2 h-4 bg-purple-400 animate-pulse inline-block mt-1"></span>
          </div>
        )}
      </div>
    </div>
  );
}
