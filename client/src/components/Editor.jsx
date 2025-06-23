import React from "react";
import CodeMirror from "@uiw/react-codemirror";
import { python } from "@codemirror/lang-python";
import { javascript } from "@codemirror/lang-javascript";

export default function Editor({ language, code, setCode }) {
  const extensions = {
    python: python(),
    javascript: javascript(),
  };

  return (
    <div className="flex-grow rounded-xl overflow-hidden border border-purple-700">
      <CodeMirror
        value={code}
        height="70vh"
        basicSetup={{
          lineNumbers: true,
          highlightActiveLine: true,
          indentOnInput: true,
        }}
        extensions={[extensions[language] || python()]}
        onChange={(value) => setCode(value)}
        theme="dark"
        className="text-sm text-left"
      />
    </div>
  );
}
