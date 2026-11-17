# -*- coding: utf-8 -*-
"""
飞书聊天图片 → PPT 自动保存

把本文件放到 G:\\图片保存 后运行（也可从任意位置运行，会自动复制到该目录）。

用法：
1. 安装依赖：  pip install -r requirements.txt
2. 运行：      python feishu_img_to_ppt.py
3. 飞书里有人发文本数字（如 1 / 2）时：
   - 选中该数字消息后按 Ctrl+C，或
   - 直接把数字复制到剪贴板
   脚本会自动新建 / 切换到 G:\\图片保存\\1.pptx
4. 在飞书里右键图片 → 复制，再按 Ctrl+S
   图片会作为一张新幻灯片追加进当前数字对应的 PPT

快捷键：
  Ctrl+S           把剪贴板里的图片追加到当前 PPT
  Ctrl+Shift+0~9   手动指定当前 PPT 编号（0~9）
  Ctrl+Shift+Q     退出
"""

from __future__ import annotations

import os
import re
import shutil
import sys
import tempfile
import threading
import time
from datetime import datetime
from pathlib import Path

# ---------------------------------------------------------------------------
# 配置
# ---------------------------------------------------------------------------
SAVE_DIR = Path(r"G:\图片保存")
SCRIPT_NAME = "feishu_img_to_ppt.py"
# 半角 / 全角数字均可，例如 1、１２
NUMBER_RE = re.compile(r"^\s*([0-9０-９]{1,4})\s*$")
POLL_CLIPBOARD_SEC = 0.35


def normalize_digits(raw: str) -> str:
    table = str.maketrans("０１２３４５６７８９", "0123456789")
    return raw.translate(table)


def ensure_save_dir() -> Path:
    SAVE_DIR.mkdir(parents=True, exist_ok=True)
    return SAVE_DIR


def install_self_to_save_dir() -> None:
    """保证 py 文件也在 G:\\图片保存 下。"""
    ensure_save_dir()
    target = SAVE_DIR / SCRIPT_NAME
    try:
        here = Path(__file__).resolve()
    except NameError:
        return
    if here == target.resolve():
        return
    try:
        shutil.copy2(here, target)
        print(f"[初始化] 已复制脚本到: {target}")
    except OSError as exc:
        print(f"[警告] 无法复制脚本到 {target}: {exc}")


def log(msg: str) -> None:
    stamp = datetime.now().strftime("%H:%M:%S")
    print(f"[{stamp}] {msg}", flush=True)


def beep_ok() -> None:
    try:
        import winsound

        winsound.MessageBeep(winsound.MB_OK)
    except Exception:
        pass


def beep_err() -> None:
    try:
        import winsound

        winsound.MessageBeep(winsound.MB_ICONHAND)
    except Exception:
        pass


# ---------------------------------------------------------------------------
# 剪贴板
# ---------------------------------------------------------------------------
def get_clipboard_text() -> str | None:
    try:
        import win32clipboard
        import win32con

        win32clipboard.OpenClipboard()
        try:
            if win32clipboard.IsClipboardFormatAvailable(win32con.CF_UNICODETEXT):
                data = win32clipboard.GetClipboardData(win32con.CF_UNICODETEXT)
                return str(data) if data is not None else None
            if win32clipboard.IsClipboardFormatAvailable(win32con.CF_TEXT):
                data = win32clipboard.GetClipboardData(win32con.CF_TEXT)
                if isinstance(data, bytes):
                    return data.decode("utf-8", errors="ignore")
                return str(data) if data is not None else None
        finally:
            win32clipboard.CloseClipboard()
    except Exception:
        return None
    return None


def get_clipboard_image():
    """返回 PIL.Image，若剪贴板没有图片则返回 None。"""
    from PIL import Image, ImageGrab

    img = ImageGrab.grabclipboard()
    if img is None:
        return None
    if isinstance(img, list):
        # 有时是文件路径列表
        for path in img:
            try:
                return Image.open(path).convert("RGB")
            except Exception:
                continue
        return None
    try:
        return img.convert("RGB")
    except Exception:
        return None


# ---------------------------------------------------------------------------
# PPT
# ---------------------------------------------------------------------------
class PptSession:
    def __init__(self) -> None:
        self.current_number: str | None = None
        self._lock = threading.Lock()
        self._last_text_seen: str | None = None

    def ppt_path(self, number: str) -> Path:
        return ensure_save_dir() / f"{number}.pptx"

    def set_number(self, number: str, *, reason: str = "") -> None:
        number = str(int(normalize_digits(str(number))))  # 01 / ０１ -> 1
        with self._lock:
            if self.current_number == number:
                return
            self.current_number = number
            path = self.ppt_path(number)
            if not path.exists():
                self._create_empty_ppt(path)
                log(f"新建 PPT: {path}" + (f" ({reason})" if reason else ""))
            else:
                log(f"切换到 PPT: {path}" + (f" ({reason})" if reason else ""))
            beep_ok()

    @staticmethod
    def _clear_slides(prs) -> None:
        """删掉默认空白页，保持演示文稿干净。"""
        sld_id_lst = prs.slides._sldIdLst  # type: ignore[attr-defined]
        for sld_id in list(sld_id_lst):
            r_id = sld_id.rId
            prs.part.drop_rel(r_id)
            sld_id_lst.remove(sld_id)

    def _create_empty_ppt(self, path: Path) -> None:
        from pptx import Presentation

        prs = Presentation()
        self._clear_slides(prs)
        prs.save(str(path))

    def append_image(self, image) -> Path:
        from pptx import Presentation
        from pptx.util import Emu

        with self._lock:
            if not self.current_number:
                raise RuntimeError(
                    "还没有指定 PPT 编号。请先在飞书复制文本数字（如 1），或按 Ctrl+Shift+数字。"
                )
            path = self.ppt_path(self.current_number)

        if path.exists():
            prs = Presentation(str(path))
        else:
            prs = Presentation()
            self._clear_slides(prs)

        # 使用空白版式
        blank = None
        for layout in prs.slide_layouts:
            name = (layout.name or "").lower()
            if "blank" in name or "空白" in (layout.name or ""):
                blank = layout
                break
        if blank is None:
            blank = prs.slide_layouts[min(6, len(prs.slide_layouts) - 1)]

        slide = prs.slides.add_slide(blank)

        # 把图片临时落盘再插入（python-pptx 需要文件或流）
        with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tmp:
            tmp_path = tmp.name
            image.save(tmp_path, format="PNG")

        try:
            slide_w = prs.slide_width
            slide_h = prs.slide_height
            img_w, img_h = image.size
            # 按幻灯片比例自适应，居中
            slide_ratio = slide_w / slide_h
            img_ratio = img_w / img_h
            if img_ratio >= slide_ratio:
                width = slide_w
                height = int(slide_w / img_ratio)
            else:
                height = slide_h
                width = int(slide_h * img_ratio)
            left = int((slide_w - width) / 2)
            top = int((slide_h - height) / 2)
            slide.shapes.add_picture(tmp_path, Emu(left), Emu(top), width=Emu(width), height=Emu(height))
        finally:
            try:
                os.unlink(tmp_path)
            except OSError:
                pass

        # 同时另存一份原图，方便核对
        img_dir = ensure_save_dir() / self.current_number  # type: ignore[arg-type]
        img_dir.mkdir(parents=True, exist_ok=True)
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        raw_path = img_dir / f"{ts}.png"
        image.save(str(raw_path), format="PNG")

        prs.save(str(path))
        return path


SESSION = PptSession()


def try_parse_number_from_text(text: str | None) -> str | None:
    if not text:
        return None
    m = NUMBER_RE.match(text.strip())
    if not m:
        return None
    return normalize_digits(m.group(1))


def clipboard_watcher(stop_event: threading.Event) -> None:
    """监听剪贴板：出现纯数字文本时，切换 / 新建对应 PPT。"""
    last = None
    while not stop_event.is_set():
        text = get_clipboard_text()
        if text is not None and text != last:
            last = text
            number = try_parse_number_from_text(text)
            if number is not None:
                SESSION.set_number(number, reason="剪贴板检测到飞书数字文本")
        stop_event.wait(POLL_CLIPBOARD_SEC)


def save_clipboard_image_to_ppt() -> None:
    img = get_clipboard_image()
    if img is None:
        # 若焦点已在图片上，尝试先复制一次再读剪贴板
        log("剪贴板无图，尝试自动 Ctrl+C 复制当前选中内容…")
        try:
            import keyboard

            keyboard.send("ctrl+c")
            time.sleep(0.45)
        except Exception:
            pass
        img = get_clipboard_image()
    if img is None:
        log("仍没有图片。请先在飞书：右键图片 → 复制，再按 Ctrl+S。")
        beep_err()
        return
    try:
        path = SESSION.append_image(img)
        n = SESSION.current_number
        log(f"已追加 1 张图片到 {path}（当前编号 {n}）")
        beep_ok()
    except Exception as exc:
        log(f"保存失败: {exc}")
        beep_err()


def on_ctrl_s() -> None:
    # 放到线程，避免阻塞键盘钩子
    threading.Thread(target=save_clipboard_image_to_ppt, daemon=True).start()


def bind_hotkeys(stop_event: threading.Event) -> None:
    import keyboard

    keyboard.add_hotkey("ctrl+s", on_ctrl_s, suppress=True)

    def make_setter(n: int):
        def _set():
            SESSION.set_number(str(n), reason="快捷键手动指定")

        return _set

    for i in range(10):
        keyboard.add_hotkey(f"ctrl+shift+{i}", make_setter(i), suppress=False)

    def quit_app():
        log("收到退出指令，正在关闭…")
        stop_event.set()

    keyboard.add_hotkey("ctrl+shift+q", quit_app, suppress=False)


def check_deps() -> None:
    missing = []
    for mod, pip_name in (
        ("PIL", "Pillow"),
        ("pptx", "python-pptx"),
        ("keyboard", "keyboard"),
        ("win32clipboard", "pywin32"),
    ):
        try:
            __import__(mod)
        except ImportError:
            missing.append(pip_name)
    if missing:
        print("缺少依赖，请先执行：")
        print(f"  pip install {' '.join(missing)}")
        print("或：")
        print("  pip install -r requirements.txt")
        sys.exit(1)


def main() -> None:
    if os.name != "nt":
        print("本工具需要在 Windows 上运行（依赖飞书桌面端 + G: 盘路径）。")
        sys.exit(1)

    check_deps()
    ensure_save_dir()
    install_self_to_save_dir()

    stop_event = threading.Event()
    bind_hotkeys(stop_event)
    threading.Thread(target=clipboard_watcher, args=(stop_event,), daemon=True).start()

    print("=" * 56)
    print("  飞书图片 → PPT 自动保存 已启动")
    print(f"  保存目录: {SAVE_DIR}")
    print("=" * 56)
    print("流程：")
    print("  1) 飞书出现数字文本（如 1）→ 选中后 Ctrl+C")
    print("     脚本会自动创建 / 切换到 1.pptx")
    print("  2) 飞书图片右键 → 复制 → 按 Ctrl+S")
    print("     图片写入当前 PPT，同时在 编号子文件夹 留一份原图")
    print("快捷键：Ctrl+Shift+0~9 手动指定编号 | Ctrl+Shift+Q 退出")
    print("请保持本窗口运行。")
    print("=" * 56)

    try:
        while not stop_event.is_set():
            time.sleep(0.2)
    except KeyboardInterrupt:
        stop_event.set()
    log("已退出。")


if __name__ == "__main__":
    main()
