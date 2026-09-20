from pathlib import Path
import sys

html = Path("app/src/main/assets/index.html").read_text(encoding="utf-8")
checks = {
    "merge enters exclusive modal state":
        "function openMergeChoice(ids,sourceStar)" in html and
        "prepareExclusiveBattleModal()" in html,
    "merge timer cleanup":
        "if(tick)clearInterval(tick)" in html,
    "merge back cleanup":
        "x._onBack=()=>cleanup('cancel')" in html,
    "relic back lock":
        "유물 1개를 선택해야 다음 WAVE로 진행할 수 있습니다." in html,
    "specialization back lock":
        "전문화 인장의 직업을 선택해야 계속할 수 있습니다." in html,
    "overlay honors custom back":
        "typeof o._onBack==='function'" in html,
    "orphan pause watchdog":
        "function recoverOrphanPause()" in html,
    "paused loop validates and recovers":
        "if(paused){validateExclusiveModalState();recoverOrphanPause();if(paused)return;}" in html,
}
failed = [name for name, ok in checks.items() if not ok]
for name, ok in checks.items():
    print(("PASS" if ok else "FAIL") + " - " + name)
if failed:
    print("Modal lifecycle regression detected: " + ", ".join(failed), file=sys.stderr)
    sys.exit(1)
print("Modal lifecycle regression guard passed.")
