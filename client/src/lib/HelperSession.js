class HelperSession {
  constructor(initialData) {
    this.initialEditorContent = initialData.initialEditorContent;
    this.textHint = initialData.textHint;
    this.codeHint = initialData.codeHint;
    this.solution = initialData.solution;
    this.problemDescription = initialData.problemDescription;
    this.keyConcepts = initialData.keyConcepts || [];
  }

  updateHints(textHint, codeHint) {
    this.textHint = textHint;
    this.codeHint = codeHint;
  }
}

export default HelperSession;
