from __future__ import annotations

import os
from pathlib import Path


def stage2_chrome_profile_dir(seed: int | str) -> Path:
    """Return a persistent, writable Chrome QA profile path.

    Stage2 QA must not use tempfile.TemporaryDirectory for --user-data-dir.
    Chrome may outlive the Python context briefly on Windows, which can make
    a deleted Temp profile unreadable and trigger a data-directory popup.
    """
    local = os.environ.get("LOCALAPPDATA")
    if not local:
        raise RuntimeError("LOCALAPPDATA is required for Stage2 Chrome QA")
    root = Path(local) / "LuckyGirlsQA" / "ChromeProfiles" / "stage2_foundation"
    profile = root / f"seed_{seed}"
    profile.mkdir(parents=True, exist_ok=True)
    probe = profile / ".write_probe"
    probe.write_text("ok", encoding="utf-8")
    if probe.read_text(encoding="utf-8") != "ok":
        raise RuntimeError(f"Chrome QA profile is not writable: {profile}")
    probe.unlink()
    return profile


def chrome_user_data_arg(seed: int | str) -> str:
    return "--user-data-dir=" + str(stage2_chrome_profile_dir(seed))
