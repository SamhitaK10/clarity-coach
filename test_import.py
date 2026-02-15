"""
Test script to check what happens when we import modal_client_local
"""
import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent / "backend-python"))

print("=" * 60)
print("TEST: Importing modal_client_local...")
print("=" * 60)

from app.services.modal_client_local import ModalClient

print("\n" + "=" * 60)
print("TEST: Creating ModalClient instance...")
print("=" * 60)

client = ModalClient()

print("\n" + "=" * 60)
print("TEST: Success! No Modal errors.")
print("=" * 60)
