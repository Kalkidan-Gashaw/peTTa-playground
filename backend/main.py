from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import subprocess
import os
import tempfile
import re

app = FastAPI()

# Allow frontend (Vite default)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class RunRequest(BaseModel):
    code: str

def strip_ansi(text: str) -> str:
    """Remove ANSI color codes from terminal output."""
    return re.sub(r'\x1B\[[0-?]*[ -/]*[@-~]', '', text)
@app.post("/run")
def run_petta(req: RunRequest):
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(backend_dir)

    # Path to PeTTa main.pl
    petta_main = os.path.join(project_root, "petta", "src", "main.pl")

    if not os.path.exists(petta_main):
        return {"error": f"PeTTa main.pl not found at {petta_main}"}

    # Write user code to temporary file
    with tempfile.NamedTemporaryFile(
        mode="w", suffix=".metta", delete=False, encoding="utf-8"
    ) as f:
        f.write(req.code)
        user_code_file = f.name

    try:
        # Run PeTTa via SWI-Prolog
        result = subprocess.run(
            [
                "swipl",
                "-q",           # quiet
                "-f", petta_main,
                "--",           # ensures argv sees user file
                user_code_file,
                "nodebug",       # tell filereader to only hide debug traces
            ],
            capture_output=True,
            text=True,
            timeout=10,
        )

        # Clean stdout/stderr
        stdout_clean = strip_ansi(result.stdout).strip()
        stderr_clean = strip_ansi(result.stderr).strip()
        
        # Split into lines and remove any debug/tracing lines added by the translator
        lines = stdout_clean.split('\n')
        result_lines = []
        last = None
        for line in lines:
            line = line.strip()
            if line and not line.startswith('-->') and not line.startswith(':-') and not line.startswith('^'):
                # drop consecutive duplicates (e.g. true\ntrue coming from test + result list)
                if line != last:
                    result_lines.append(line)
                    last = line
        filtered_output = '\n'.join(result_lines)

        return {
            "stdout": filtered_output,
            "stderr": stderr_clean,
            "returncode": result.returncode,
        }

    except Exception as e:
        return {"error": str(e)}

    finally:
        if os.path.exists(user_code_file):
            os.remove(user_code_file)