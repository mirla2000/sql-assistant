import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from models import QueryRequest, QueryResponse, DashboardRequest, DashboardSpecResponse, ChartRunRequest, ChartRunResponse
from bigquery_client import BigQueryClient
from claude_client import ClaudeClient

app = FastAPI(title="SQL Assistant")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

_bq_client: BigQueryClient | None = None
_claude_client: ClaudeClient | None = None


def _get_clients():
    global _bq_client, _claude_client
    if _bq_client is None:
        _bq_client = BigQueryClient()
        _claude_client = ClaudeClient(_bq_client.schema_string)
    return _bq_client, _claude_client


@app.post("/query", response_model=QueryResponse)
async def query(request: QueryRequest):
    bq, claude = _get_clients()
    history = [m.model_dump() for m in request.history]
    sql = claude.generate_sql(request.question, history)
    try:
        columns, rows = bq.execute_query(sql)
        return QueryResponse(sql=sql, columns=columns, rows=rows, row_count=len(rows))
    except Exception as first_error:
        corrected_sql = claude.fix_sql(sql, str(first_error))
        try:
            columns, rows = bq.execute_query(corrected_sql)
            return QueryResponse(sql=corrected_sql, columns=columns, rows=rows, row_count=len(rows))
        except Exception as second_error:
            return QueryResponse(
                sql=corrected_sql, columns=[], rows=[], row_count=0, error=str(second_error)
            )


@app.get("/schema")
async def get_schema():
    bq, _ = _get_clients()
    return {"schema": bq.schema_string}


@app.post("/dashboard/spec", response_model=DashboardSpecResponse)
async def dashboard_spec(request: DashboardRequest):
    _, claude = _get_clients()
    spec = claude.generate_dashboard_spec(request.description)
    return DashboardSpecResponse(**spec)


@app.post("/chart/run", response_model=ChartRunResponse)
async def chart_run(request: ChartRunRequest):
    bq, claude = _get_clients()
    try:
        columns, rows = bq.execute_query(request.sql)
        return ChartRunResponse(id=request.id, columns=columns, rows=rows,
                                row_count=len(rows), sql=request.sql)
    except Exception as first_error:
        fixed_sql = claude.fix_sql(request.sql, str(first_error))
        try:
            columns, rows = bq.execute_query(fixed_sql)
            return ChartRunResponse(id=request.id, columns=columns, rows=rows,
                                    row_count=len(rows), sql=fixed_sql)
        except Exception as second_error:
            return ChartRunResponse(id=request.id, columns=[], rows=[],
                                    row_count=0, sql=fixed_sql, error=str(second_error))
