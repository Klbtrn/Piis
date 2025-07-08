import React from "react";
import CodeMirror from "@uiw/react-codemirror";
import { python } from "@codemirror/lang-python";
import { javascript } from "@codemirror/lang-javascript";

export default function Editor({ height, language, code, setCode, editable }) {
  const extensions = {
    python: python(),
    javascript: javascript(),
  };

  return (
    <div className="flex-grow rounded-xl overflow-hidden border border-purple-700">
      <CodeMirror
        value={code}
        height={height || "70vh"}
        basicSetup={{
          lineNumbers: true,
          highlightActiveLine: true,
          indentOnInput: true,
        }}
        extensions={[extensions[language] || python()]}
        onChange={(value) => setCode(value)}
        editable={editable}
        theme="dark"
        className="text-sm text-left"
      />
    </div>
  );
}
