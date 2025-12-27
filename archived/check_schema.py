import pg8000.native

conn = pg8000.native.Connection(
    user='neondb_owner',
    password='npg_u71zdejvgHOR',
    host='ep-morning-violet-ahjfqnv2-pooler.c-3.us-east-1.aws.neon.tech',
    database='neondb',
    port=5432,
    ssl_context=True
)

result = conn.run("SELECT column_name FROM information_schema.columns WHERE table_name = 'docket_entries' ORDER BY ordinal_position")
print("docket_entries table columns:")
for row in result:
    print(f"  - {row[0]}")

conn.close()
