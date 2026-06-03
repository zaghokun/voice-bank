"""
Script untuk recreate database dengan schema terbaru (termasuk kolom webauthn_credential_id)
Jalankan: python recreate_db.py
"""

import os
from app.core.database import Base, engine

# Hapus database lama jika ada
db_file = "voicebank.db"
if os.path.exists(db_file):
    print(f"Menghapus {db_file} lama...")
    os.remove(db_file)
    print("✓ Database lama terhapus")

# Create semua tabel dengan schema terbaru
print("Membuat database baru dengan schema terbaru...")
Base.metadata.create_all(bind=engine)
print("✓ Database baru berhasil dibuat dengan kolom webauthn_credential_id")
print("\nSekarang jalankan: uvicorn app.main:app --reload")
