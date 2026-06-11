# AI Knowledge-Work Infomercial (30s)

Two versions live here:

- **v2 (`render2.py` → `ai_knowledge_work_30s_v2.mp4`)** — Anthropic-inspired
  design language: warm cream paper, Lora serif headlines with italic coral
  emphasis, soft-shadow cards, hand-drawn underlines, film grain, a coral
  full-bleed closer with wipe transitions, 2x supersampled rendering, and a
  felt-piano score with FFT convolution reverb.
- **v1 (`render.py` → `ai_knowledge_work_30s.mp4`)** — the original dark
  motion-graphics version.

A 30-second motion-graphics infomercial showcasing what current-generation AI
can do for knowledge work, made for a school-administration audience.

Everything is generated from scratch by `render.py`:

- **Video** — all 900 frames (1920x1080 @ 30fps) are drawn procedurally with
  Pillow: typed text, animated demo cards (writing, code, data), counters,
  and end card. No stock footage or pre-made assets.
- **Audio** — an original ambient soundtrack (pad, bass, arpeggio over a
  C–Am–F–G progression) synthesized with numpy and written as WAV.
- **Fonts** — Outfit and JetBrains Mono, both under the SIL Open Font License.

## Reproduce

```bash
pip install pillow numpy imageio-ffmpeg
python3 render.py preview 45 300 510 870   # spot-check individual frames
python3 render.py render                   # full render → ai_knowledge_work_30s.mp4
```
