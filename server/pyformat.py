import sys

try:
    import black
except ImportError:
    print("[pyformat] Modul 'black' nicht installiert. Bitte mit 'pip install black' installieren.", file=sys.stderr)
    sys.exit(1)

code = sys.stdin.read()
try:
    formatted = black.format_str(code, mode=black.Mode())
    print(formatted, end="")
except Exception as e:
    print(code, end="")
    print(f"[pyformat] Fehler: {e}", file=sys.stderr)
