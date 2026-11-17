@echo off
chcp 65001 >nul
cd /d "%~dp0"

if not exist "G:\图片保存" mkdir "G:\图片保存"

REM 保证脚本在目标目录
copy /Y "%~dp0feishu_img_to_ppt.py" "G:\图片保存\feishu_img_to_ppt.py" >nul
copy /Y "%~dp0requirements.txt" "G:\图片保存\requirements.txt" >nul
copy /Y "%~dp0启动.bat" "G:\图片保存\启动.bat" >nul 2>nul

cd /d "G:\图片保存"

python -c "import PIL, pptx, keyboard, win32clipboard" 2>nul
if errorlevel 1 (
  echo 正在安装依赖...
  python -m pip install -r requirements.txt
)

echo.
echo 即将启动飞书图片转 PPT 工具...
echo.
python feishu_img_to_ppt.py
pause
