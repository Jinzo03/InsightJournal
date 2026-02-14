from sqlalchemy import Column, Integer, String, DateTime, Float
from datetime import datetime, timezone
from app.database import Base

class Entry(Base):
    # 1. The Table name
    # This will be the actual name of the sheet inside SQLite
    __tablename__ = "entries"

    # 2. The columns (The data structure)

    # 'id' the unique fingerprint for every row.
    # primary_key=True means every entry must have a unique ID.
    # index=True makes searching by ID extremely fast.
    id = Column(Integer, primary_key=True, index=True)

    # 'content' : The text of the journal.
    content = Column(String)

    # 'mood' : The number (1-10).
    mood = Column(Integer)
    # We use 'Float' because the score is a decimal (e.g ., -0.15)
    sentiment= Column(Float,default=0.0)
    # We use a 'lambda' (a tiny function) to get the time right when the entry is saved.
    # We use datetime.now(timezone.utc) to satisfy the new Python standard. 
    created_at=Column(DateTime, default=lambda: datetime.now(timezone.utc))
    