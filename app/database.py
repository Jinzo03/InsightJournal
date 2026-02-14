from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

#1. THE URL
# This tells python: "the database is a file named journal.db in this folder."
SQLACHELMY_DATABASE_URL = "sqlite:///./journal.db"

#2. THE ENGINE
# The "Engine" is the actual worker that talks to the database.
#connect_args={"check_same_thread": False} is needed only for SQLite.
engine = create_engine(
    SQLACHELMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

#3. THE SESSION
# A "Session" is a temporary workspace.
# You open a session, do your work (save/read), and the close it.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

#4. THE BASE 
# This is a class that all our Database Models will inherit from.
# It basically says :"Anything inheriting from this class is a Database Table"
Base = declarative_base()
