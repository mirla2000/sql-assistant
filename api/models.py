from pydantic import BaseModel
from typing import Any


class HistoryMessage(BaseModel):
    role: str
    content: str


class QueryRequest(BaseModel):
    question: str
    history: list[HistoryMessage] = []


class QueryResponse(BaseModel):
    sql: str
    columns: list[str]
    rows: list[list[Any]]
    row_count: int
    error: str | None = None


class DashboardRequest(BaseModel):
    description: str


class ChartSpec(BaseModel):
    id: str
    title: str
    business_question: str = ""
    type: str = "table"
    sql: str
    x: str | None = None
    y: list[str] = []
    layout: dict = {"w": 6, "h": 4}


class DashboardSpecResponse(BaseModel):
    version: str = "1.0"
    title: str
    charts: list[ChartSpec]


class ChartRunRequest(BaseModel):
    id: str
    sql: str


class ChartRunResponse(BaseModel):
    id: str
    columns: list[str]
    rows: list[list[Any]]
    row_count: int
    sql: str
    error: str | None = None
