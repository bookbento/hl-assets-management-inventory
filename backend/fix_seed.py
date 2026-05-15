import re
f=open('prisma/seed.ts', 'r')
c=f.read()
f.close()
c=re.sub(r'price:\s*"\\$([\d,]+)"', lambda m: f'price: {m.group(1).replace(",", "")}', c)
c=re.sub(r'annualCost:\s*"\\$([\d,]+)"', lambda m: f'annualCost: {m.group(1).replace(",", "")}', c)
f=open('prisma/seed.ts', 'w')
f.write(c)
f.close()
