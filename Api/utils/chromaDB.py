# pip install chromadb

import chromadb
client = chromadb.HttpClient(
  ssl=True,
  host='api.trychroma.com',
  tenant='6f5fe8a0-316b-4218-9342-acc5b00bb402',
  database='helio-scan-dev',
  headers={
    'x-chroma-token': 'ck-GMF8ZdRGYoMPFoxepbumxd2bE1wbUmfmHqh3RDHYBmLL'
  }
)
  