#!/usr/bin/env python3
"""
30-second infomercial: "Knowledge work, reimagined"
Every frame is rendered procedurally with Pillow; the soundtrack is
synthesized with numpy. No pre-made footage or stock assets.

Usage:
  python3 render.py preview 30 150 320 ...   # dump single frames as PNG
  python3 render.py render                   # render video + audio + mux
"""

import math
import os
import subprocess
import sys
import wave

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

W, H = 1920, 1080
FPS = 30
DUR = 30.0
TOTAL = int(DUR * FPS)
OUT = os.path.dirname(os.path.abspath(__file__))

FONTS = "/mnt/skills/examples/canvas-design/canvas-fonts"

# palette
BG_TOP = (16, 21, 32)
BG_BOT = (6, 8, 13)
INK = (242, 239, 234)
MUTED = (139, 147, 161)
CORAL = (255, 138, 92)
AMBER = (255, 196, 107)
SKY = (122, 200, 255)
CARD = (22, 28, 41)
CARD_EDGE = (46, 56, 76)

_font_cache = {}


def F(name, size):
    key = (name, size)
    if key not in _font_cache:
        _font_cache[key] = ImageFont.truetype(os.path.join(FONTS, name), size)
    return _font_cache[key]


def clamp01(x):
    return max(0.0, min(1.0, x))


def eo(t):  # ease-out cubic
    t = clamp01(t)
    return 1 - (1 - t) ** 3


def eio(t):  # smoothstep
    t = clamp01(t)
    return t * t * (3 - 2 * t)


def seg(t, start, dur):
    """normalized progress of a sub-animation"""
    if dur <= 0:
        return 1.0
    return clamp01((t - start) / dur)


def make_bg():
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    cx, cy = W / 2, H * 0.38
    r = np.sqrt(((xx - cx) / (W * 0.75)) ** 2 + ((yy - cy) / (H * 0.85)) ** 2)
    r = np.clip(r, 0, 1)
    img = np.zeros((H, W, 3), dtype=np.float32)
    for c in range(3):
        img[..., c] = BG_TOP[c] * (1 - r) + BG_BOT[c] * r
    return Image.fromarray(img.astype(np.uint8)).convert("RGBA")


def make_glow(size=900, color=CORAL, peak=70):
    s = size
    yy, xx = np.mgrid[0:s, 0:s].astype(np.float32)
    r = np.sqrt((xx - s / 2) ** 2 + (yy - s / 2) ** 2) / (s / 2)
    a = np.clip(1 - r, 0, 1) ** 2.2 * peak
    arr = np.zeros((s, s, 4), dtype=np.uint8)
    arr[..., 0], arr[..., 1], arr[..., 2] = color
    arr[..., 3] = a.astype(np.uint8)
    return Image.fromarray(arr)


BG = make_bg()
GLOW_CORAL = make_glow(1100, CORAL, 60)
GLOW_SKY = make_glow(900, SKY, 36)


def grad_text(overlay, xy, text, fnt, c1, c2, anchor="mm"):
    """draw text filled with a horizontal gradient"""
    mask = Image.new("L", overlay.size, 0)
    md = ImageDraw.Draw(mask)
    md.text(xy, text, font=fnt, fill=255, anchor=anchor)
    bbox = mask.getbbox()
    if not bbox:
        return
    x0, y0, x1, y1 = bbox
    w = max(1, x1 - x0)
    ramp = np.linspace(0, 1, w, dtype=np.float32)
    block = np.zeros((y1 - y0, w, 3), dtype=np.float32)
    for c in range(3):
        block[..., c] = c1[c] * (1 - ramp) + c2[c] * ramp
    gimg = Image.fromarray(block.astype(np.uint8))
    overlay.paste(gimg, (x0, y0), mask.crop(bbox))


def tracked(d, xy, text, fnt, fill, tracking=8, anchor_mid=True):
    """letter-spaced caps label"""
    widths = [d.textlength(ch, font=fnt) for ch in text]
    total = sum(widths) + tracking * (len(text) - 1)
    x = xy[0] - (total / 2 if anchor_mid else 0)
    for ch, w in zip(text, widths):
        d.text((x, xy[1]), ch, font=fnt, fill=fill, anchor="lm")
        x += w + tracking


def fade_alpha(t, t0, t1, fin=0.45, fout=0.45):
    """scene-level fade in/out alpha"""
    a = 1.0
    a *= eio(seg(t, t0, fin))
    a *= 1 - eio(seg(t, t1 - fout, fout))
    return clamp01(a)


def apply_alpha(overlay, a):
    if a >= 0.999:
        return overlay
    alpha = overlay.getchannel("A").point(lambda v: int(v * a))
    overlay.putalpha(alpha)
    return overlay


# ----------------------------------------------------------------------
# Scene 1 (0.0 - 3.6): typed hook
# ----------------------------------------------------------------------
S1_LINES = ["What can the new generation", "of AI actually do?"]


def scene1(d, ov, t):
    fnt = F("JetBrainsMono-Regular.ttf", 64)
    full = S1_LINES[0] + "\n" + S1_LINES[1]
    n_chars = len(S1_LINES[0]) + len(S1_LINES[1])
    typed = int(eio(seg(t, 0.3, 2.2)) * n_chars)
    shown = []
    rem = typed
    for ln in S1_LINES:
        take = min(rem, len(ln))
        shown.append(ln[:take])
        rem -= take
    y0 = H / 2 - 50
    for i, ln in enumerate(shown):
        d.text((W / 2, y0 + i * 92), ln, font=fnt, fill=INK, anchor="mm")
    # cursor after last typed char
    li = 1 if len(shown[0]) == len(S1_LINES[0]) and typed > len(S1_LINES[0]) else 0
    if typed >= n_chars:
        li = 1
    line = shown[li]
    lw = d.textlength(S1_LINES[li], font=fnt)
    cw = d.textlength(line, font=fnt)
    cx = W / 2 - lw / 2 + cw + 14
    cy = y0 + li * 92
    if int(t * 2.6) % 2 == 0 or typed < n_chars:
        d.rectangle([cx, cy - 32, cx + 28, cy + 32], fill=CORAL)
    # tiny prompt label
    tracked(d, (W / 2, H / 2 + 160), "A LIVE ANSWER, IN 30 SECONDS",
            F("Outfit-Regular.ttf", 26), MUTED + (int(255 * seg(t, 2.6, 0.6)),))


# ----------------------------------------------------------------------
# Scene 2 (3.6 - 6.6): title card
# ----------------------------------------------------------------------
def scene2(d, ov, t):
    ov.alpha_composite(GLOW_CORAL, (int(W / 2 - 550), int(H * 0.38 - 550)))
    a1 = eio(seg(t, 0.15, 0.5))
    tracked(d, (W / 2, H / 2 - 150), "THE NEW GENERATION OF AI",
            F("Outfit-Regular.ttf", 30), (CORAL[0], CORAL[1], CORAL[2], int(255 * a1)))
    a2 = eo(seg(t, 0.4, 0.7))
    rise = (1 - a2) * 40
    if a2 > 0:
        tmp = Image.new("RGBA", ov.size, (0, 0, 0, 0))
        grad_text(tmp, (W / 2, H / 2 - 20 + rise), "Knowledge work,",
                  F("Outfit-Bold.ttf", 116), INK, INK)
        grad_text(tmp, (W / 2, H / 2 + 110 + rise), "reimagined.",
                  F("Outfit-Bold.ttf", 116), CORAL, AMBER)
        apply_alpha(tmp, a2)
        ov.alpha_composite(tmp)
    # underline sweep
    a3 = eo(seg(t, 0.9, 0.7))
    if a3 > 0:
        w = 460 * a3
        d.rounded_rectangle([W / 2 - w / 2, H / 2 + 210, W / 2 + w / 2, H / 2 + 220],
                            radius=5, fill=AMBER + (int(220 * a3),))


# ----------------------------------------------------------------------
# Scene 3 (6.6 - 14.4): three live demo cards
# ----------------------------------------------------------------------
CODE = [
    [("def ", CORAL), ("quiz", SKY), ("(topic):", INK)],
    [("    qs = ", INK), ("generate", SKY), ("(topic)", INK)],
    [("    for ", CORAL), ("q ", INK), ("in ", CORAL), ("qs:", INK)],
    [("        ask(q)", INK)],
    [("    return ", CORAL), ("feedback(qs)", INK)],
]

DOC_BARS = [0.92, 0.78, 0.85, 0.6, 0.0, 0.88, 0.72, 0.5]
CHART = [0.32, 0.48, 0.41, 0.62, 0.75, 0.9]


def card_shell(d, ov, x, y, w, h, a, title, badge):
    tmp = Image.new("RGBA", ov.size, (0, 0, 0, 0))
    td = ImageDraw.Draw(tmp)
    td.rounded_rectangle([x, y, x + w, y + h], radius=26, fill=CARD + (255,),
                         outline=CARD_EDGE + (255,), width=2)
    # badge
    bx, by = x + 44, y + 56
    td.ellipse([bx - 26, by - 26, bx + 26, by + 26], outline=CORAL + (255,), width=3)
    td.text((bx, by), badge, font=F("JetBrainsMono-Bold.ttf", 22), fill=CORAL, anchor="mm")
    td.text((x + 96, by), title, font=F("Outfit-Bold.ttf", 40), fill=INK, anchor="lm")
    apply_alpha(tmp, a)
    ov.alpha_composite(tmp)
    return a


def scene3(d, ov, t):
    tracked(d, (W / 2, 110), "WATCH IT WORK",
            F("Outfit-Regular.ttf", 28), MUTED + (int(255 * eio(seg(t, 0.1, 0.5))),))
    cw, ch = 520, 640
    gap = 50
    x0 = (W - 3 * cw - 2 * gap) / 2
    y0 = 200
    starts = [0.35, 0.95, 1.55]
    titles = [("Write", "Aa"), ("Code", "</"), ("Analyze", "%")]

    for i in range(3):
        a = eo(seg(t, starts[i], 0.6))
        if a <= 0:
            continue
        x = x0 + i * (cw + gap)
        y = y0 + (1 - a) * 50
        card_shell(d, ov, x, y, cw, ch, a, titles[i][0], titles[i][1])
        tmp = Image.new("RGBA", ov.size, (0, 0, 0, 0))
        td = ImageDraw.Draw(tmp)
        ts = t - starts[i] - 0.4  # local animation time
        iy = y + 130

        if i == 0:  # writing: typed heading + shimmer paragraph bars
            head = "Essay feedback — draft 2"
            typed = head[: int(eio(seg(ts, 0.0, 1.0)) * len(head))]
            td.text((x + 44, iy + 10), typed, font=F("JetBrainsMono-Regular.ttf", 26),
                    fill=AMBER, anchor="lm")
            for j, bw in enumerate(DOC_BARS):
                if bw == 0:
                    continue
                ba = eo(seg(ts, 0.5 + j * 0.18, 0.45))
                if ba <= 0:
                    continue
                by = iy + 60 + j * 44
                bl = (cw - 88) * bw * ba
                col = CORAL + (200,) if j == 3 else (58, 68, 92, 230)
                td.rounded_rectangle([x + 44, by, x + 44 + bl, by + 18],
                                     radius=9, fill=col)
            cap = "Drafts, feedback & lesson plans"
        elif i == 1:  # code typing with syntax colors
            n_total = sum(len(s) for ln in CODE for s, _ in ln)
            budget = int(eio(seg(ts, 0.0, 2.2)) * n_total)
            cy = iy + 14
            for ln in CODE:
                cx2 = x + 44
                for s, col in ln:
                    take = max(0, min(len(s), budget))
                    budget -= take
                    if take:
                        td.text((cx2, cy), s[:take],
                                font=F("JetBrainsMono-Regular.ttf", 25),
                                fill=col, anchor="lm")
                    cx2 += td.textlength(s[:take], font=F("JetBrainsMono-Regular.ttf", 25))
                    if take < len(s):
                        break
                cy += 46
            cap = "Real software, explained simply"
        else:  # animated bar chart
            bx0, by0 = x + 60, iy + 290
            bw2 = 52
            for j, v in enumerate(CHART):
                ba = eo(seg(ts, 0.15 + j * 0.16, 0.7))
                bh = 260 * v * ba
                cx3 = bx0 + j * (bw2 + 16)
                mix = j / (len(CHART) - 1)
                col = tuple(int(CORAL[k] * (1 - mix) + AMBER[k] * mix) for k in range(3))
                td.rounded_rectangle([cx3, by0 - bh, cx3 + bw2, by0],
                                     radius=8, fill=col + (235,))
            td.line([x + 50, by0 + 2, x + cw - 50, by0 + 2], fill=CARD_EDGE + (255,), width=2)
            cap = "From raw data to clear insight"

        td.text((x + cw / 2, y + ch - 52), cap, font=F("Outfit-Regular.ttf", 27),
                fill=MUTED, anchor="mm")
        apply_alpha(tmp, a)
        ov.alpha_composite(tmp)


# ----------------------------------------------------------------------
# Scene 4 (14.4 - 19.2): stats
# ----------------------------------------------------------------------
def scene4(d, ov, t):
    tracked(d, (W / 2, 200), "AT A SCALE NO TEXTBOOK CAN MATCH",
            F("Outfit-Regular.ttf", 28), MUTED + (int(255 * eio(seg(t, 0.1, 0.5))),))
    stats = [
        ("100+", "pages read & summarized", "in seconds"),
        ("24/7", "a patient tutor", "that never clocks out"),
        ("1:1", "personal attention", "for every single learner"),
    ]
    xs = [W / 6 * 1 + 40, W / 2, W / 6 * 5 - 40]
    for i, (big, l1, l2) in enumerate(stats):
        a = eo(seg(t, 0.35 + i * 0.45, 0.7))
        if a <= 0:
            continue
        tmp = Image.new("RGBA", ov.size, (0, 0, 0, 0))
        td = ImageDraw.Draw(tmp)
        y = 480 + (1 - a) * 40
        val = big
        if i == 0:  # animate the counter
            n = int(eo(seg(t, 0.35, 1.3)) * 100)
            val = f"{n}+" if n >= 100 else str(n)
        grad_text(tmp, (xs[i], y), val, F("Outfit-Bold.ttf", 150), CORAL, AMBER)
        td.text((xs[i], y + 130), l1, font=F("Outfit-Regular.ttf", 36), fill=INK, anchor="mm")
        td.text((xs[i], y + 180), l2, font=F("Outfit-Regular.ttf", 36), fill=MUTED, anchor="mm")
        apply_alpha(tmp, a)
        ov.alpha_composite(tmp)
    for x in (W / 3, 2 * W / 3):
        d.line([x, 420, x, 700], fill=CARD_EDGE + (int(160 * eio(seg(t, 0.5, 0.6))),), width=2)


# ----------------------------------------------------------------------
# Scene 5 (19.2 - 24.2): what it means for students
# ----------------------------------------------------------------------
def scene5(d, ov, t):
    a0 = eio(seg(t, 0.1, 0.5))
    d.text((W / 2, 240), "What does this mean for your students?",
           font=F("Outfit-Bold.ttf", 66), fill=INK + (int(255 * a0),), anchor="mm")
    lines = [
        "Every student gets a personal tutor.",
        "Every teacher gets a planning assistant.",
        "Every graduate enters an AI-fluent workplace.",
    ]
    for i, ln in enumerate(lines):
        a = eo(seg(t, 0.8 + i * 0.7, 0.6))
        if a <= 0:
            continue
        tmp = Image.new("RGBA", ov.size, (0, 0, 0, 0))
        td = ImageDraw.Draw(tmp)
        y = 430 + i * 120 + (1 - a) * 30
        td.ellipse([W / 2 - 480, y - 9, W / 2 - 462, y + 9], fill=CORAL + (255,))
        td.text((W / 2 - 430, y), ln, font=F("Outfit-Regular.ttf", 46), fill=INK, anchor="lm")
        apply_alpha(tmp, a)
        ov.alpha_composite(tmp)


# ----------------------------------------------------------------------
# Scene 6 (24.2 - 27.2): closer
# ----------------------------------------------------------------------
def scene6(d, ov, t):
    ov.alpha_composite(GLOW_CORAL, (int(W / 2 - 550), int(H / 2 - 500)))
    a1 = eio(seg(t, 0.15, 0.6))
    d.text((W / 2, H / 2 - 90), "Your students will graduate",
           font=F("Outfit-Regular.ttf", 58), fill=INK + (int(255 * a1),), anchor="mm")
    d.text((W / 2, H / 2 - 10), "into an AI-powered world.",
           font=F("Outfit-Regular.ttf", 58), fill=INK + (int(255 * a1),), anchor="mm")
    a2 = eo(seg(t, 1.1, 0.7))
    if a2 > 0:
        tmp = Image.new("RGBA", ov.size, (0, 0, 0, 0))
        grad_text(tmp, (W / 2, H / 2 + 130 + (1 - a2) * 30),
                  "Let's prepare them to lead it.",
                  F("Outfit-Bold.ttf", 76), CORAL, AMBER)
        apply_alpha(tmp, a2)
        ov.alpha_composite(tmp)


# ----------------------------------------------------------------------
# Scene 7 (27.2 - 30.0): end card / disclosure
# ----------------------------------------------------------------------
def spark(td, cx, cy, r, color, rot=0.0):
    pts = []
    for k in range(8):
        ang = rot + k * math.pi / 4
        rr = r if k % 2 == 0 else r * 0.32
        pts.append((cx + rr * math.cos(ang), cy + rr * math.sin(ang)))
    td.polygon(pts, fill=color)


def scene7(d, ov, t):
    a = eo(seg(t, 0.1, 0.6))
    tmp = Image.new("RGBA", ov.size, (0, 0, 0, 0))
    td = ImageDraw.Draw(tmp)
    spark(td, W / 2, 300, 64 * (0.6 + 0.4 * a), CORAL + (255,), rot=-math.pi / 2 + t * 0.06)
    td.text((W / 2, 470), "This entire video — script, design,",
            font=F("Outfit-Bold.ttf", 56), fill=INK, anchor="mm")
    td.text((W / 2, 545), "animation & soundtrack —",
            font=F("Outfit-Bold.ttf", 56), fill=INK, anchor="mm")
    apply_alpha(tmp, a)
    ov.alpha_composite(tmp)
    a2 = eo(seg(t, 0.8, 0.6))
    if a2 > 0:
        tmp2 = Image.new("RGBA", ov.size, (0, 0, 0, 0))
        grad_text(tmp2, (W / 2, 660), "was created by AI, from scratch.",
                  F("Outfit-Bold.ttf", 60), CORAL, AMBER)
        apply_alpha(tmp2, a2)
        ov.alpha_composite(tmp2)
    a3 = eio(seg(t, 1.5, 0.6))
    tracked(d, (W / 2, 790), "GENERATED END-TO-END BY CLAUDE  ·  NO STOCK ASSETS",
            F("Outfit-Regular.ttf", 26), MUTED + (int(255 * a3),), tracking=6)


SCENES = [
    (0.0, 3.6, scene1),
    (3.6, 6.6, scene2),
    (6.6, 14.4, scene3),
    (14.4, 19.2, scene4),
    (19.2, 24.2, scene5),
    (24.2, 27.2, scene6),
    (27.2, 30.0, scene7),
]


def render_frame(fidx):
    t = fidx / FPS
    img = BG.copy()
    ov = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(ov)
    for t0, t1, fn in SCENES:
        if t0 <= t < t1:
            fn(d, ov, t - t0)
            apply_alpha(ov, fade_alpha(t, t0, t1))
            break
    img.alpha_composite(ov)
    # persistent transparency watermark
    wm = ImageDraw.Draw(img)
    wm.text((W - 40, H - 36), "AI-generated  ·  made by Claude",
            font=F("Outfit-Regular.ttf", 22), fill=MUTED + (110,), anchor="rm")
    return img.convert("RGB")


# ----------------------------------------------------------------------
# audio
# ----------------------------------------------------------------------
def midi(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def make_audio(path):
    sr = 44100
    n = int(sr * DUR)
    tt = np.arange(n) / sr
    L = np.zeros(n)
    R = np.zeros(n)

    chords = [[48, 52, 55, 59], [45, 48, 52, 55], [41, 45, 48, 52], [43, 47, 50, 53]]
    prog = chords * 2
    slot = DUR / len(prog)

    def env(length, attack, release):
        e = np.ones(length)
        na, nr = int(attack * sr), int(release * sr)
        e[:na] = np.linspace(0, 1, na) ** 2
        e[-nr:] *= np.linspace(1, 0, nr) ** 2
        return e

    for ci, ch in enumerate(prog):
        s0 = int(ci * slot * sr)
        s1 = min(n, int((ci * slot + slot + 0.6) * sr))
        ln = s1 - s0
        tloc = np.arange(ln) / sr
        e = env(ln, 0.9, 1.1)
        pad = np.zeros(ln)
        for m in ch:
            f = midi(m)
            pad += 0.5 * np.sin(2 * np.pi * f * tloc)
            pad += 0.5 * np.sin(2 * np.pi * f * 1.0045 * tloc)
        pad *= e * 0.055
        # bass root, one octave down
        fb = midi(ch[0] - 12)
        bass = (np.sin(2 * np.pi * fb * tloc) + 0.25 * np.sin(4 * np.pi * fb * tloc))
        bass *= e * 0.14
        L[s0:s1] += pad + bass
        R[s0:s1] += pad + bass

        # arpeggio, octave up
        order = [0, 2, 1, 3, 2, 1, 0, 2]
        step = slot / 8
        for k, oi in enumerate(order):
            a0 = int((ci * slot + k * step) * sr)
            pl = int(1.0 * sr)
            if a0 + pl > n:
                pl = n - a0
            if pl <= 0:
                continue
            ta = np.arange(pl) / sr
            f = midi(ch[oi] + 12)
            pluck = np.sin(2 * np.pi * f * ta) * np.exp(-4.5 * ta) * 0.085
            if k % 2 == 0:
                L[a0:a0 + pl] += pluck * 1.3
                R[a0:a0 + pl] += pluck * 0.7
            else:
                L[a0:a0 + pl] += pluck * 0.7
                R[a0:a0 + pl] += pluck * 1.3

    # master fades
    fi, fo = int(0.8 * sr), int(2.8 * sr)
    for chn in (L, R):
        chn[:fi] *= np.linspace(0, 1, fi)
        chn[-fo:] *= np.linspace(1, 0, fo) ** 1.5
    peak = max(np.abs(L).max(), np.abs(R).max())
    L, R = L / peak * 0.72, R / peak * 0.72
    data = np.empty(n * 2, dtype=np.int16)
    data[0::2] = (L * 32767).astype(np.int16)
    data[1::2] = (R * 32767).astype(np.int16)
    with wave.open(path, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(sr)
        w.writeframes(data.tobytes())


# ----------------------------------------------------------------------
def main():
    import imageio_ffmpeg
    ff = imageio_ffmpeg.get_ffmpeg_exe()

    if len(sys.argv) > 1 and sys.argv[1] == "preview":
        for fs in sys.argv[2:]:
            fr = render_frame(int(fs))
            p = os.path.join(OUT, f"preview_{int(fs):04d}.png")
            fr.save(p)
            print("wrote", p)
        return

    vid = os.path.join(OUT, "video_only.mp4")
    proc = subprocess.Popen(
        [ff, "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}",
         "-r", str(FPS), "-i", "-", "-an", "-c:v", "libx264", "-preset", "medium",
         "-crf", "18", "-pix_fmt", "yuv420p", vid],
        stdin=subprocess.PIPE, stderr=subprocess.DEVNULL)
    for f in range(TOTAL):
        proc.stdin.write(render_frame(f).tobytes())
        if f % 150 == 0:
            print(f"frame {f}/{TOTAL}", flush=True)
    proc.stdin.close()
    proc.wait()
    print("video done")

    aud = os.path.join(OUT, "music.wav")
    make_audio(aud)
    print("audio done")

    final = os.path.join(OUT, "ai_knowledge_work_30s.mp4")
    subprocess.run(
        [ff, "-y", "-i", vid, "-i", aud, "-c:v", "copy", "-c:a", "aac",
         "-b:a", "192k", "-shortest", final],
        check=True, stderr=subprocess.DEVNULL)
    print("final:", final)


if __name__ == "__main__":
    main()
