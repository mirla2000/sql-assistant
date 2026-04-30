import os
import json
import base64
from decimal import Decimal
from datetime import date, datetime, time
from google.cloud import bigquery
from google.oauth2 import service_account

try:
    from json_schemas import JSON_METADATA_DOCS
except ImportError:
    from backend.json_schemas import JSON_METADATA_DOCS


def _get_bq_client():
    creds_b64 = os.getenv("GOOGLE_CREDENTIALS_JSON")
    if creds_b64:
        creds_dict = json.loads(base64.b64decode(creds_b64))
        creds = service_account.Credentials.from_service_account_info(
            creds_dict,
            scopes=["https://www.googleapis.com/auth/bigquery"],
        )
        return bigquery.Client(credentials=creds, project=os.getenv("BQ_PROJECT_ID"))
    return bigquery.Client()


def _serialize_value(val):
    if val is None:
        return None
    if isinstance(val, (datetime, date, time)):
        return val.isoformat()
    if isinstance(val, Decimal):
        return float(val)
    if isinstance(val, bytes):
        return val.decode("utf-8", errors="replace")
    if not isinstance(val, (str, int, float, bool)):
        return str(val)
    return val


class BigQueryClient:
    def __init__(self):
        self.client = _get_bq_client()
        self.project = os.getenv("BQ_PROJECT_ID")
        self.datasets = [d.strip() for d in os.getenv("BQ_DATASETS", "").split(",") if d.strip()]
        self.schema_string = self._build_schema_string()

    def _fetch_schema(self) -> dict[str, list[tuple[str, str]]]:
        tables: dict[str, list[tuple[str, str]]] = {}
        for dataset in self.datasets:
            query = f"""
                SELECT table_name, column_name, data_type
                FROM `{self.project}.{dataset}.INFORMATION_SCHEMA.COLUMNS`
                ORDER BY table_name, ordinal_position
            """
            for row in self.client.query(query).result():
                key = f"{self.project}.{dataset}.{row.table_name}"
                tables.setdefault(key, []).append((row.column_name, row.data_type))
        return tables

    def _build_schema_string(self) -> str:
        tables = self._fetch_schema()
        lines = []
        for table_name, columns in tables.items():
            lines.append(f"Table: {table_name}")
            json_docs = JSON_METADATA_DOCS.get(table_name, {})
            for col_name, col_type in columns:
                col_doc = json_docs.get(col_name)
                if col_doc:
                    lines.append(f"  - {col_name} (JSON) — {col_doc['description']}")
                    for event_type, keys in col_doc.get("event_types", {}).items():
                        keys_str = ", ".join(f"{k} ({v})" for k, v in keys.items())
                        lines.append(f"      event_type='{event_type}': {keys_str}")
                else:
                    lines.append(f"  - {col_name} ({col_type})")
            lines.append("")
        return "\n".join(lines)

    def execute_query(self, sql: str) -> tuple[list[str], list[list]]:
        job = self.client.query(sql)
        results = job.result()
        columns = [field.name for field in results.schema]
        rows = [[_serialize_value(row[col]) for col in columns] for row in results]
        return columns, rows
