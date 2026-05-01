from pydantic import BaseModel
from typing import Any


class QueryRequest(BaseModel):
    question: str


class QueryResponse(BaseModel):
    sql: str
    columns: list[str]
    rows: list[list[Any]]
    row_count: int
    error: str | None = None
