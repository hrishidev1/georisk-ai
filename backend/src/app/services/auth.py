from app.core.security import (
    create_access_token,
    decode_access_token,
    verify_password,
)
from app.exceptions.auth import (
    InvalidCredentialsError,
    InvalidTokenError,
)
from app.exceptions.user import UserNotFoundError
from app.models.user import User
from app.repositories.user import UserRepository


class AuthService:
    """
    Handles authentication-related business logic.
    """

    def __init__(
        self,
        repository: UserRepository,
    ) -> None:
        self._repository = repository

    def authenticate(
        self,
        email: str,
        password: str,
    ) -> User:
        """
        Authenticate a user using email and password.
        """

        user = self._repository.get_by_email(email)

        if user is None:
            raise InvalidCredentialsError()

        if not verify_password(password, user.hashed_password):
            raise InvalidCredentialsError()

        return user

    def login(
        self,
        email: str,
        password: str,
    ) -> str:
        """
        Authenticate the user and return a JWT access token.
        """

        user = self.authenticate(email, password)

        return create_access_token(
            subject=str(user.id),
        )

    def get_current_user(
        self,
        token: str,
    ) -> User:
        """
        Retrieve the currently authenticated user from a JWT access token.
        """

        payload = decode_access_token(token)

        try:
            user_id = int(payload.sub)
        except (TypeError, ValueError) as exc:
            raise InvalidTokenError() from exc

        user = self._repository.get(user_id)

        if user is None:
            raise UserNotFoundError()

        return user