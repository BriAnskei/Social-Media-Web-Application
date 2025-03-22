import React, { useRef, useEffect, ChangeEvent } from "react";

interface AutoResizeTextareaProps {
  placeholder?: string;
  defaultValue?: string;
  className?: string;
  value: string;
  onChange?: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyEvent: (e: any) => void;
}

const AutoResizeTextarea: React.FC<AutoResizeTextareaProps> = ({
  placeholder,
  defaultValue,
  className,
  value,
  onChange,
  onKeyEvent,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Reset the height temporarily to get the correct scrollHeight
    textarea.style.height = "0px";
    // Set the height to the scrollHeight
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  // Initialize height on mount and handle content changes
  useEffect(() => {
    adjustHeight();
    // Adjust on window resize for responsiveness
    window.addEventListener("resize", adjustHeight);

    return () => {
      window.removeEventListener("resize", adjustHeight);
    };
  }, [value]);

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    // Run the height adjustment
    adjustHeight();
    // Call the parent's onChange if provided
    if (onChange) {
      onChange(e);
    }
  };

  return (
    <textarea
      onKeyDown={onKeyEvent}
      ref={textareaRef}
      className={className}
      placeholder={placeholder}
      defaultValue={defaultValue}
      onChange={handleChange}
      value={value}
    />
  );
};

export default AutoResizeTextarea;
