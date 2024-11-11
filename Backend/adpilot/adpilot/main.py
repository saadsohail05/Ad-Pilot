from fastapi import FastAPI
from sqlmodel import SQLModel, Field,create_engine,Session
from adpilot import settings


# Create Model
class User(SQLModel, table=True):
    id:int | None =Field(default=None,primary_key=True)
    name:str=Field(index=True)
    email:str=Field(index=True,unique=True) 
    password:str=Field()


# Create Database Connection,One Engine for whole application
connection_string:str=str(settings.DATABASE_URL).replace("postgresql","postgresql+psycopg")
engine=create_engine(connection_string,connect_args={"sslmode":"require"},pool_recycle=300,pool_size=10,echo=True)

SQLModel.metadata.create_all(engine)
 
User1:User=User(name="John Doe",email="john@email.com",password="password")

# Session:Seperate Session for each request/Transaction
session=Session(engine)
# Add User to Database
session.add(User1)
session.commit()
session.close()

app=FastAPI()

@app.get("/")   
async def root():
    return {"message": "Welcome to Adpilot!"}


