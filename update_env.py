import re

path = '/Users/gian/Documents/saggin/plannig/app/.env'
with open(path, 'r') as f:
    content = f.read()

# Replace DATABASE_URL
new_db_url = 'DATABASE_URL="postgresql://postgres.reuffgrrgurdpkzdlqbb:pallamano24@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true"'
content = re.sub(r'^DATABASE_URL=.*$', new_db_url, content, flags=re.MULTILINE)

# Ensure DIRECT_URL is in the file
new_direct_url = 'DIRECT_URL="postgresql://postgres.reuffgrrgurdpkzdlqbb:pallamano24@aws-1-eu-west-1.pooler.supabase.com:5432/postgres"'
if 'DIRECT_URL' in content:
    content = re.sub(r'^DIRECT_URL=.*$', new_direct_url, content, flags=re.MULTILINE)
else:
    content = content.replace(new_db_url, f"{new_db_url}\n{new_direct_url}")

with open(path, 'w') as f:
    f.write(content)
