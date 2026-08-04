from fastapi import APIRouter, Depends, status

from app.api.dependencies import (
    get_auth_service,
    get_user_service,
    get_current_user,
)
from app.schemas.auth import (
    LoginRequest,
    TokenResponse,
)
from app.schemas.user import (
    UserCreate,
    UserResponse,
)
from app.services import (
    AuthService,
    UserService,
)

from app.models import User

router = APIRouter()

@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def register(
    user_data: UserCreate,
    service: UserService = Depends(get_user_service),
) -> UserResponse:
    """
    Register a new user.
    """
    return service.create_user(user_data)

@router.post(
    "/login",
    response_model=TokenResponse,
)
def login(
    credentials: LoginRequest,
    service: AuthService = Depends(get_auth_service),
) -> TokenResponse:
    """
    Authenticate a user and return an access token.
    """

    access_token = service.login(
        credentials.email,
        credentials.password,
    )

    return TokenResponse(
        access_token=access_token,
    )

@router.get(
    "/me",
    response_model=UserResponse,
)
def get_current_user_profile(
    current_user: User = Depends(get_current_user),
) -> UserResponse:
    """
    Retrieve the currently authenticated user's profile.
    """
    return current_user