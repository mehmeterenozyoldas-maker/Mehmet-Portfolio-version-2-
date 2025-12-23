import React from 'react';
import { useContent } from '../contexts/ContentContext';

interface EditableTextProps {
  id: string; // The key in the texts dictionary
  className?: string;
  multiline?: boolean;
  as?: any; // To render as h1, p, span, etc.
}

const EditableText: React.FC<EditableTextProps> = ({ id, className, multiline = false, as: Component = 'span' }) => {
  const { isEditMode, texts, updateText } = useContent();
  const value = texts[id] || '';

  if (isEditMode) {
    if (multiline) {
      return (
        <textarea
          value={value}
          onChange={(e) => updateText(id, e.target.value)}
          className={`w-full bg-zinc-900/50 border-2 border-dashed border-indigo-500 rounded p-2 text-zinc-100 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-all ${className}`}
          rows={4}
        />
      );
    }
    return (
      <input
        type="text"
        value={value}
        onChange={(e) => updateText(id, e.target.value)}
        className={`bg-zinc-900/50 border-b-2 border-dashed border-indigo-500 px-1 text-zinc-100 focus:outline-none focus:border-indigo-400 transition-all w-full md:w-auto ${className}`}
      />
    );
  }

  // Add html parsing safety if needed, but for now plain text
  return (
    <Component className={className}>
      {value}
    </Component>
  );
};

export default EditableText;