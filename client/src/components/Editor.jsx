import React, { forwardRef } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { python } from "@codemirror/lang-python";
import { javascript } from "@codemirror/lang-javascript";

const Editor = forwardRef(
  (
    {
      language = "python",
      value,
      onChange,
      height = "70vh",
      className = "",
      ...props
    },
    ref
  ) => {
    const extensions = {
      python: python(),
      javascript: javascript(),
    };

    return (
      <div className={`flex-grow rounded-xl overflow-hidden ${className}`}>
        <CodeMirror
          ref={ref}
          value={value || ""}
          height={height}
          basicSetup={{
            lineNumbers: true,
            highlightActiveLine: true,
            indentOnInput: true,
          }}
          extensions={[extensions[language] || python()]}
          onChange={onChange}
          theme="dark"
          className="text-sm text-left"
          {...props}
        />
      </div>
    );
  }
);

Editor.displayName = "Editor";

export default Editor;
