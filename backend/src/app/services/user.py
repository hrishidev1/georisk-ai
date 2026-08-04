from app.core.security import hash_password
from app.exceptions.user import UserAlreadyExistsError
from app.models.user import User
from app.repositories.user import UserRepository
from app.schemas.user import UserCreate


class UserService:
    def __init__(
        self,
        repository: UserRepository,
    ) -> None:
        self._repository = repository

    def create_user(
        self,
        user_data: UserCreate,
    ) -> User:
        """
        Register a new user.
        """

        existing_user = self._repository.get_by_email(
            user_data.email,
        )

        if existing_user is not None:
            raise UserAlreadyExistsError(user_data.email)

        user = User(
            email=user_data.email,
            hashed_password=hash_password(user_data.password),
            full_name=user_data.full_name,
        )

        return self._repository.create(user)

    def get_user_by_email(
        self,
        email: str,
    ) -> User | None:
        return self._repository.get_by_email(email)

    def get_user(
        self,
        user_id: int,
    ) -> User | None:
        return self._repository.get(user_id)