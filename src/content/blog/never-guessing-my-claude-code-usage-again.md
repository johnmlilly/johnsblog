---
published: false
title: A Better Claude Code Status Line
description: A small bash script that shows how full my context window is and
  how close I am to my usage limits, right at the bottom of the terminal.
date: 2026-10-09
featured: false
tags:
  - Terminal
logo: claude
---

I spend most of my day in Claude Code now, and there are two things I keep wanting to know. How full is the context window? And how close am I to my usage limit?

Claude Code lets you run your own script for the status line at the bottom of the screen. Mine now looks like this:

```
Opus 5.5 | Context: 20% 200k / 1M | 5h: 6% ↻2h30m | Week: 4% ↻3d11h
```

The context part is the percent used, then tokens used out of the model's window. The last two pieces are my account usage across every session, not just the one I'm in: the 5-hour window and the weekly limit, each with a countdown until it resets. The labels are bold so they're easy to pick out, and at 70% a number turns yellow. At 90% it turns red, so I notice before I run into the wall.

I actually tried something fancier first. Claude Code has mods now, and I built one called token-weather that put a little forecast above the prompt. Sunny when the context was mostly empty, storms when it was filling up, plus a sparkline of the last few turns. It was fun to build. But I didn't need a forecast. I just wanted the numbers, always visible, in the spot I already look.

So I deleted the mod and went back to a plain bash script. Claude Code pipes a chunk of JSON into the script every time it updates, and everything I wanted was already in there, including a `rate_limits` field with the 5-hour and weekly percentages and their reset times. A little `jq`, a little `awk` for formatting, and that was it.

Two gotchas. First, if the script exits with an error, Claude Code hides the status line completely, even if it printed everything fine. I had a `[ -n "$color" ] && printf` as the last line, which returns 1 whenever usage is low, and my status line just vanished. When you test yours, check `echo $?` too.

Second, the status line only redraws when something happens in the conversation, so the countdown froze while I was away. Setting `refreshInterval` fixes that. Here's the config in `~/.claude/settings.json`:

```json
"statusLine": {
  "type": "command",
  "command": "bash ~/.claude/statusline.sh",
  "refreshInterval": 60
}
```

And the script, saved as `~/.claude/statusline.sh`. You'll need `jq` installed.

```bash
#!/usr/bin/env bash
# Model | Context: 7% 74k / 1M | 5h: 12% ↻2h14m | Week: 31% ↻3d4h
input=$(cat)

IFS=$'\x1f' read -r model pct used size h5_pct h5_reset wk_pct wk_reset < <(echo "$input" | jq -r '
  .context_window as $c
  | ($c.current_usage // {}) as $u
  | (($u.input_tokens // 0) + ($u.cache_creation_input_tokens // 0) + ($u.cache_read_input_tokens // 0)) as $tok
  | ($c.context_window_size // 0) as $size
  | ($c.used_percentage // (if $size > 0 then $tok * 100 / $size else 0 end)) as $pct
  | (if $tok == 0 and $size > 0 then ($pct * $size / 100 | floor) else $tok end) as $used
  | [(.model.display_name // "Claude"), $pct, $used, $size,
     (.rate_limits.five_hour.used_percentage // ""), (.rate_limits.five_hour.resets_at // ""),
     (.rate_limits.seven_day.used_percentage // ""), (.rate_limits.seven_day.resets_at // "")]
  | map(tostring) | join("\u001f")')

# 1540 -> 1.5k, 74321 -> 74k, 1000000 -> 1M, 1500000 -> 1.5M
fmt() {
  awk -v n="$1" 'BEGIN {
    if (n >= 1000000) { s = sprintf("%.1f", n / 1000000); sub(/\.0$/, "", s); print s "M" }
    else if (n >= 10000) printf "%dk\n", n / 1000 + 0.5
    else if (n >= 1000) { s = sprintf("%.1f", n / 1000); sub(/\.0$/, "", s); print s "k" }
    else print n
  }'
}

# Time until an epoch timestamp: 45m, 2h14m, 3d4h
until_reset() {
  local s=$(( $1 - $(date +%s) ))
  (( s < 0 )) && s=0
  if (( s >= 86400 )); then printf '%dd%dh' $((s / 86400)) $((s % 86400 / 3600))
  elif (( s >= 3600 )); then printf '%dh%02dm' $((s / 3600)) $((s % 3600 / 60))
  else printf '%dm' $(((s + 59) / 60))
  fi
}

# Account usage segment; yellow from 70%, red from 90%
limit() {
  local label=$1 p=$2 reset=$3 color=''
  [ -z "$p" ] && return
  p=$(printf '%.0f' "$p")
  if (( p >= 90 )); then color=$'\e[31m'; elif (( p >= 70 )); then color=$'\e[33m'; fi
  printf ' | %s\e[1m%s:\e[22m %d%%' "$color" "$label" "$p"
  [ -n "$reset" ] && printf ' ↻%s' "$(until_reset "$reset")"
  if [ -n "$color" ]; then printf '\e[0m'; fi
}


if [ "${size:-0}" -gt 0 ] 2>/dev/null; then
  printf '%s | \e[1mContext:\e[22m %.0f%% %s / %s' "$model" "$pct" "$(fmt "$used")" "$(fmt "$size")"
else
  printf '%s | \e[1mContext:\e[22m %.0f%%' "$model" "${pct:-0}"
fi
limit 5h "$h5_pct" "$h5_reset"
limit Week "$wk_pct" "$wk_reset"
```

If Claude Code doesn't send the usage data, the script just leaves those pieces off.
