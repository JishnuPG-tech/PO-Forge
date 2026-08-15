import os
import sys
import json
import time
import subprocess

def run_automated_test_suite():
    print("=========================================================")
    print("      BANKING COACHING PLATFORM - TEST RUNNER            ")
    print("=========================================================")

    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    os.chdir(root_dir)

    start_time = time.time()
    cmd = [
        sys.executable, "-m", "pytest", "backend/tests/",
        "-v",
        "--junitxml=junit_report.xml"
    ]

    print(f"Executing: {' '.join(cmd)}")
    result = subprocess.run(cmd, capture_output=True, text=True)
    duration = time.time() - start_time

    print(result.stdout)
    if result.stderr:
        print(result.stderr)

    passed = "passed" in result.stdout
    success = (result.returncode == 0)

    report_data = {
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
        "duration_seconds": round(duration, 2),
        "exit_code": result.returncode,
        "success": success,
        "raw_output": result.stdout[:2000]
    }

    report_json_path = os.path.join(root_dir, "test_report.json")
    with open(report_json_path, "w", encoding="utf-8") as f:
        json.dump(report_data, f, indent=2)

    print("---------------------------------------------------------")
    print(f"Machine-readable JSON Report saved to: {report_json_path}")
    print(f"Machine-readable JUnit XML Report saved to: {os.path.join(root_dir, 'junit_report.xml')}")
    print("---------------------------------------------------------")

if __name__ == "__main__":
    run_automated_test_suite()
