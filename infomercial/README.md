# AI Knowledge-Work Infomercial (30s)

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
