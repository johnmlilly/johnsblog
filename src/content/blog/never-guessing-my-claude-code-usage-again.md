---
published: true
title: Never Guessing My Claude Code Usage Again
description: A small bash script that keeps my context window and usage limits
  right where I can see them.
date: 2026-10-09
tags:
  - Terminal
logo: claude
---
I spend most of my day in Claude Code these days, and while it has increased my understanding, learning, and productivity when coding, I still keep coming back to these questions -  How full is the context window, and how close am I to my usage limit?

Here's how I wrote my own bash script to view the status line at the bottom of my screen, similar to the below.

```
Opus 5.5 | ⎇ main | Context: ▰▰▱▱▱▱▱▱▱▱ 20% 200k/1M | 5h: 6% ↻2h30m | Week: 4% ↻3d11h
```

The first part is the git branch to orient me to what I'm working on. The context part is a ten-block meter that offers a clear visual of how much context has been used along with the number of tokens. The last two pieces are my account usage across every session. The labels are bold so they're easy to spot. At 70% the meter turns yellow and when it hits 90% it turns red.

I actually tried something fancier first. Claude Code has mods now, and I built one called token-weather that put a little forecast above the prompt. Sunny when the context was mostly empty, storms when it was filling up, plus a sparkline of the last few turns. It was fun to build. But I didn't need a forecast. I just wanted the numbers, always visible, in the spot I already look.

So I deleted the mod and went back to a plain bash script. Claude Code pipes a chunk of JSON into the script every time it updates. Everything I wanted was already in there, including a `rate_limits` field with the 5-hour and weekly percentages and their reset times, and the working directory, which is all `git` needs to find the branch. A little `jq`, a little `awk` for formatting, and that was it.

However, there was two bugs I ran into. First, if the script exits with an error, Claude Code hides the status line completely, even if it printed everything fine. I had a `[ -n "$color" ] && printf` as the last line, which returns 1 whenever usage is low, and my status line just vanished.

Second, the status line only redraws when something happens in the conversation, so the countdown froze while I was away. Setting `refreshInterval` fixes that. Here's the config in `~/.claude/settings.json`:

```json
"statusLine": {
  "type": "command",
  "command": "bash ~/.claude/statusline.sh",
  "refreshInterval": 60
}
```

And the script, saved as `~/.claude/statusline.sh`. You'll need jq installed, and git if you want the branch line to show.

```shellscript
#!/usr/bin/env bash
# Model | ⎇ main | Context: ▰▱▱▱▱▱▱▱▱▱ 7% 74k/1M | 5h: 12% ↻2h14m | Week: 31% ↻3d4h
input=$(cat)

IFS=$'\x1f' read -r model cwd pct used size h5_pct h5_reset wk_pct wk_reset < <(echo "$input" | jq -r '
  .context_window as $c
  | ($c.current_usage // {}) as $u
  | (($u.input_tokens // 0) + ($u.cache_creation_input_tokens // 0) + ($u.cache_read_input_tokens // 0)) as $tok
  | ($c.context_window_size // 0) as $size
  | ($c.used_percentage // (if $size > 0 then $tok * 100 / $size else 0 end)) as $pct
  | (if $tok == 0 and $size > 0 then ($pct * $size / 100 | floor) else $tok end) as $used
  | [(.model.display_name // "Claude"), (.workspace.current_dir // .cwd // ""), $pct, $used, $size,
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

# 42 -> ▰▰▰▰▱▱▱▱▱▱
meter() {
  local n=$(( ($1 + 5) / 10 )) bar='' i
  (( n > 10 )) && n=10; (( n < 0 )) && n=0
  for (( i = 0; i < 10; i++ )); do (( i < n )) && bar+='▰' || bar+='▱'; done
  printf '%s' "$bar"
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


pct=$(printf '%.0f' "${pct:-0}")
branch=$(git -C "${cwd:-.}" branch --show-current 2>/dev/null)
[ -z "$branch" ] && git -C "${cwd:-.}" rev-parse --git-dir >/dev/null 2>&1 && branch=detached

printf '%s' "$model"
[ -n "$branch" ] && printf ' | \e[1m⎇\e[22m %s' "$branch"
# Meter and percentage yellow from 70%, red from 90%, as the limits are
ctx_color=''
if (( pct >= 90 )); then ctx_color=$'\e[31m'; elif (( pct >= 70 )); then ctx_color=$'\e[33m'; fi
printf ' | \e[1mContext:\e[22m %s%s %d%%' "$ctx_color" "$(meter "$pct")" "$pct"
if [ -n "$ctx_color" ]; then printf '\e[0m'; fi
if [ "${size:-0}" -gt 0 ] 2>/dev/null; then printf ' %s/%s' "$(fmt "$used")" "$(fmt "$size")"; fi
limit 5h "$h5_pct" "$h5_reset"
limit Week "$wk_pct" "$wk_reset"

```

