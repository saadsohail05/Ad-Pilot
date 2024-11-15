from fastapi import APIRouter
from typing import Annotated
from adpilot.models import Register_User
from fastapi import Depends

user_router = APIRouter(
    prefix="/user",
    tags=["user"],
    responses={404: {"description": "Not found"}},
)

@user_router.get("/")
async def read_users():
    return [{"username": "Rick"}, {"username": "Morty"}]

@user_router.post("/register")
async def register_user(form_data: Annotated[Register_User,Depends()]):
    pass
