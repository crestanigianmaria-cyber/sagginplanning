path = '/Users/gian/Documents/saggin/plannig/app/src/app/globals.css'
with open(path, 'r') as f:
    content = f.read()

# Update globals.css body
import re
new_body = """body {
  background: #F8FAFC;
  color: #0F172A;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}"""

content = re.sub(r'body\s*{[^}]+}', new_body, content)

with open(path, 'w') as f:
    f.write(content)
