#!/bin/zsh
cd -- "${0:A:h}" || exit 1
if /usr/bin/curl --silent --fail --max-time 2 http://127.0.0.1:8765/ >/dev/null; then
  /usr/bin/open http://127.0.0.1:8765/
  exit 0
fi
preview_python=$(command -v python3)
if [[ -z "$preview_python" ]]; then
  echo '未找到 Python 3，无法启动预览。'
  read -r '?按回车关闭'
  exit 1
fi
"$preview_python" -m http.server 8765 --bind 127.0.0.1 &
preview_pid=$!
trap 'kill "$preview_pid" 2>/dev/null' EXIT INT TERM
for attempt in {1..30}; do
  if /usr/bin/curl --silent --fail --max-time 1 http://127.0.0.1:8765/ >/dev/null; then
    /usr/bin/open http://127.0.0.1:8765/
    echo '预览已启动。使用期间请保持此终端窗口打开，按 Ctrl+C 停止。'
    wait "$preview_pid"
    exit $?
  fi
  sleep 0.2
done
echo '预览启动失败，请检查上方错误信息。'
read -r '?按回车关闭'
