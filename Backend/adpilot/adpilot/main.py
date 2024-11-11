from fastapi import FastAPI,Depends,HTTPException
from sqlmodel import SQLModel, Field,create_engine,Session,select
from adpilot import settings
from typing import Annotated
from contextlib import asynccontextmanager

# Create Model
class User(SQLModel, table=True):
    id:int | None =Field(default=None,primary_key=True)
    name:str=Field(index=True)
    email:str=Field(index=True,unique=True) 
    password:str=Field()

# Create Database Connection,One Engine for whole application
connection_string:str=str(settings.DATABASE_URL).replace("postgresql","postgresql+psycopg")
engine=create_engine(connection_string,connect_args={"sslmode":"require"},pool_recycle=300,pool_size=10,echo=True)



def create_tables():
    SQLModel.metadata.create_all(engine)
 
# User1:User=User(name="John Doe",email="john@email.com",password="password")
# User2:User=User(name="Jane Doe",email="jane@email.com",password="password")


# # Session:Seperate Session for each request/Transaction
# session=Session(engine)
# # Add User to Database
# # session.add(User1)
# # session.add(User2)
# # session.commit()
# # session.close()



def get_session():
    with Session(engine) as session:
        yield session

@asynccontextmanager
async def Lifespan(app):
    print("Creating Tables")
    create_tables()
    print("Tables Created")
    yield


app=FastAPI(lifespan=Lifespan,title="Adpilot",description="Adpilot API",version="0.1.0")


@app.post("/user/",response_model=User)
async def create_user(user:User,session:Annotated[Session,Depends(get_session)]):
    session.add(user)
    session.commit()
    session.refresh(user)
    return user

@app.get("/user/",response_model=list[User])
async def get_user(session:Annotated[Session,Depends(get_session)]):
    statement=select(User)
    users=session.exec(statement)
    return users

    


@app.get("/")   
async def root():
    return {"message": "Welcome to Adpilot!"}


