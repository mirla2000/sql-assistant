import os
from contextlib import asynccontextmanager
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from models import QueryRequest, QueryResponse
from bigquery_client import BigQueryClient
from claude_client import ClaudeClient

load_dotenv()

bq_client: BigQueryClient | None = None
claude_client: ClaudeClient | None = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global bq_client, claude_client
    print("Fetching BigQuery schema...")
    bq_client = BigQueryClient()
    claude_client = ClaudeClient(bq_client.schema_string)
    print(f"Schema loaded. {bq_client.schema_string.count('Table:') } table(s) available.")
    yield


app = FastAPI(title="SQL Assistant", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/api/query", response_model=QueryResponse)
async def query(request: QueryRequest):
    if not bq_client or not claude_client:
        raise HTTPException(status_code=503, detail="Service not ready")

    sql = claude_client.generate_sql(request.question)

    try:
        columns, rows = bq_client.execute_query(sql)
        return QueryResponse(sql=sql, columns=columns, rows=rows, row_count=len(rows))
    except Exception as first_error:
        corrected_sql = claude_client.fix_sql(sql, str(first_error))
        try:
            columns, rows = bq_client.execute_query(corrected_sql)
            return QueryResponse(sql=corrected_sql, columns=columns, rows=rows, row_count=len(rows))
        except Exception as second_error:
            return QueryResponse(
                sql=corrected_sql,
                columns=[],
                rows=[],
                row_count=0,
                error=str(second_error),
            )


@app.get("/api/schema")
async def get_schema():
    if not bq_client:
        raise HTTPException(status_code=503, detail="Service not ready")
    return {"schema": bq_client.schema_string}
