import React from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

/**
 * Parses inline markdown for a single line:
 * - Bold + Italic: ***text*** or ___text___
 * - Bold: **text** or __text__
 * - Italic: *text* or _text_
 * - Inline code: `text`
 */
function renderInlineMarkdown(line: string): React.ReactNode[] {
  const elements: React.ReactNode[] = [];
  let remaining = line;
  let key = 0;

  while (remaining.length > 0) {
    // 1. Bold + Italic: ***text***
    if (
      remaining.startsWith('***') &&
      remaining.length >= 7 &&
      remaining[3] !== ' '
    ) {
      const end = remaining.indexOf('***', 3);
      if (end !== -1 && remaining[end - 1] !== ' ') {
        const content = remaining.slice(3, end);
        elements.push(
          <strong key={key++} className="font-bold italic text-inherit">
            {content}
          </strong>
        );
        remaining = remaining.slice(end + 3);
        continue;
      }
    }

    // 2. Bold + Italic: ___text___
    if (
      remaining.startsWith('___') &&
      remaining.length >= 7 &&
      remaining[3] !== ' '
    ) {
      const end = remaining.indexOf('___', 3);
      if (end !== -1 && remaining[end - 1] !== ' ') {
        const content = remaining.slice(3, end);
        elements.push(
          <strong key={key++} className="font-bold italic text-inherit">
            {content}
          </strong>
        );
        remaining = remaining.slice(end + 3);
        continue;
      }
    }

    // 3. Bold: **text**
    if (
      remaining.startsWith('**') &&
      remaining.length >= 5 &&
      remaining[2] !== ' '
    ) {
      const end = remaining.indexOf('**', 2);
      if (end !== -1 && remaining[end - 1] !== ' ') {
        const content = remaining.slice(2, end);
        elements.push(
          <strong key={key++} className="font-semibold text-inherit">
            {renderInlineMarkdown(content)}
          </strong>
        );
        remaining = remaining.slice(end + 2);
        continue;
      }
    }

    // 4. Bold: __text__
    if (
      remaining.startsWith('__') &&
      remaining.length >= 5 &&
      remaining[2] !== ' '
    ) {
      const end = remaining.indexOf('__', 2);
      if (end !== -1 && remaining[end - 1] !== ' ') {
        const content = remaining.slice(2, end);
        elements.push(
          <strong key={key++} className="font-semibold text-inherit">
            {renderInlineMarkdown(content)}
          </strong>
        );
        remaining = remaining.slice(end + 2);
        continue;
      }
    }

    // 5. Italic: *text* (single asterisk, not followed by space)
    if (
      remaining.startsWith('*') &&
      !remaining.startsWith('**') &&
      remaining.length >= 3 &&
      remaining[1] !== ' ' &&
      remaining[1] !== '\t'
    ) {
      const end = remaining.indexOf('*', 1);
      if (end !== -1 && remaining[end - 1] !== ' ' && remaining[end - 1] !== '\t') {
        const content = remaining.slice(1, end);
        elements.push(
          <em key={key++} className="italic text-inherit">
            {content}
          </em>
        );
        remaining = remaining.slice(end + 1);
        continue;
      }
    }

    // 6. Italic: _text_ (single underscore, not followed by space)
    if (
      remaining.startsWith('_') &&
      !remaining.startsWith('__') &&
      remaining.length >= 3 &&
      remaining[1] !== ' ' &&
      remaining[1] !== '\t'
    ) {
      const end = remaining.indexOf('_', 1);
      if (end !== -1 && remaining[end - 1] !== ' ' && remaining[end - 1] !== '\t') {
        const content = remaining.slice(1, end);
        elements.push(
          <em key={key++} className="italic text-inherit">
            {content}
          </em>
        );
        remaining = remaining.slice(end + 1);
        continue;
      }
    }

    // 7. Inline code: `text`
    if (remaining.startsWith('`') && remaining.length >= 3) {
      const end = remaining.indexOf('`', 1);
      if (end !== -1) {
        const content = remaining.slice(1, end);
        elements.push(
          <code
            key={key++}
            className="px-1.5 py-0.5 rounded bg-black/10 text-xs font-mono"
          >
            {content}
          </code>
        );
        remaining = remaining.slice(end + 1);
        continue;
      }
    }

    // Find next potential markdown delimiter
    const nextSpecial = remaining.search(/[*_`]/);
    if (nextSpecial === -1) {
      elements.push(<React.Fragment key={key++}>{remaining}</React.Fragment>);
      break;
    } else if (nextSpecial === 0) {
      elements.push(<React.Fragment key={key++}>{remaining[0]}</React.Fragment>);
      remaining = remaining.slice(1);
    } else {
      elements.push(<React.Fragment key={key++}>{remaining.slice(0, nextSpecial)}</React.Fragment>);
      remaining = remaining.slice(nextSpecial);
    }
  }

  return elements;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  if (!content) return null;

  // Split into paragraphs by 2 or more newlines
  const paragraphs = content.split(/\n{2,}/);

  return (
    <div className={`space-y-2.5 ${className}`}>
      {paragraphs.map((para, pIdx) => {
        const lines = para.split('\n');
        return (
          <p key={pIdx} className="leading-relaxed">
            {lines.map((line, lIdx) => (
              <React.Fragment key={lIdx}>
                {renderInlineMarkdown(line)}
                {lIdx < lines.length - 1 && <br />}
              </React.Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
};
