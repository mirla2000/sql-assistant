import os
import re
from openai import OpenAI

_SYSTEM_TEMPLATE = """\
You are a BigQuery SQL expert. Convert the user's question into a valid BigQuery SQL query.

Available schema:
{schema}

Rules:
- Only use tables and columns listed in the schema above
- Always use fully qualified table names: `project.dataset.table`
- Return ONLY the raw SQL query — no explanation, no markdown, no backticks
- Add LIMIT 500 unless the user explicitly asks for all records or specifies a number
- Use standard BigQuery SQL syntax (e.g. DATE_TRUNC, TIMESTAMP_DIFF, JSON_VALUE)
- For JSON columns use JSON_VALUE(col, '$.key') for scalar values

Examples:
Q: Show monthly revenue for this year
SQL: SELECT DATE_TRUNC(created_at, MONTH) AS month, SUM(amount) AS revenue
     FROM `project.dataset.orders`
     WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE())
     GROUP BY 1 ORDER BY 1

Q: How many users signed up per day last week?
SQL: SELECT DATE(created_at) AS day, COUNT(*) AS signups
     FROM `project.dataset.users`
     WHERE created_at >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)
     GROUP BY 1 ORDER BY 1
"""

_FIX_TEMPLATE = """\
The following SQL query returned an error:

SQL:
{sql}

Error:
{error}

Please fix the SQL and return only the corrected query, no explanation.\
"""


def _clean_sql(text: str) -> str:
    text = text.strip()
    text = re.sub(r"^```(?:sql)?\s*", "", text, flags=re.IGNORECASE)
    text = re.sub(r"\s*```$", "", text)
    return text.strip()


class ClaudeClient:
    def __init__(self, schema_string: str):
        self.client = OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=os.getenv("OPENROUTER_API_KEY"),
        )
        self.system_prompt = _SYSTEM_TEMPLATE.format(schema=schema_string)

    def _call(self, prompt: str) -> str:
        response = self.client.chat.completions.create(
            model="google/gemini-3-flash-preview",
            messages=[
                {"role": "system", "content": self.system_prompt},
                {"role": "user", "content": prompt},
            ],
            temperature=0.0,
        )
        return _clean_sql(response.choices[0].message.content)

    def generate_sql(self, question: str) -> str:
        return self._call(question)

    def fix_sql(self, failed_sql: str, error: str) -> str:
        return self._call(_FIX_TEMPLATE.format(sql=failed_sql, error=error))
