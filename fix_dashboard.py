import re

path = '/Users/gian/Documents/saggin/plannig/app/src/app/(office)/dashboard/page.tsx'
with open(path, 'r') as f:
    content = f.read()

content = content.replace("if (!session || session.user.type !== 'OFFICE') redirect('/')", "if (!session || (session.user as any)?.type !== 'OFFICE') redirect('/')")

with open(path, 'w') as f:
    f.write(content)
