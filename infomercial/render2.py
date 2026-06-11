#!/usr/bin/env python3
"""
30-second infomercial, v2 — Anthropic-inspired design language.
Warm cream paper, serif headlines with italic coral emphasis, soft-shadow
cards, grain, a coral full-bleed closer, and a felt-piano score with
convolution reverb. Every frame is drawn at 2x and downsampled (LANCZOS)
for clean edges. No stock assets.

Usage:
  python3 render2.py preview 45 150 ...   # dump single frames as PNG
  python3 render2.py render               # full render -> mp4
"""

import math
import os
import subprocess
import sys
import wave

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

W, H = 1920, 1080
SS = 2                       # supersample factor
W2, H2 = W * SS, H * SS
FPS = 30
DUR = 30.0
TOTAL = int(DUR * FPS)
OUT = os.path.dirname(os.path.abspath(__file__))
FONTS = "/mnt/skills/examples/canvas-design/canvas-fonts"

# ---- palette (Anthropic-ish) ----
CREAM = (240, 238, 230)
INK = (31, 30, 29)
MUTED = (135, 134, 127)
CORAL = (217, 119, 87)
CORAL_DEEP = (199, 102, 70)
KRAFT = (212, 162, 127)
SAGE = (125, 155, 118)
SLATE = (43, 42, 39)          # dark code card
CREAM_TXT = (240, 238, 230)
BAR = (231, 228, 219)         # doc skeleton lines
RULE = (220, 217, 206)

SERIF = "Lora-Regular.ttf"
SERIF_B = "Lora-Bold.ttf"
SERIF_I = "Lora-Italic.ttf"
SERIF_BI = "Lora-BoldItalic.ttf"
SANS = "InstrumentSans-Regular.ttf"
SANS_B = "InstrumentSans-Bold.ttf"
MONO = "JetBrainsMono-Regular.ttf"

_fc = {}


def F(name, size):
    key = (name, size)
    if key not in _fc:
        _fc[key] = ImageFont.truetype(os.path.join(FONTS, name), size)
    return _fc[key]


def clamp01(x):
    return max(0.0, min(1.0, x))


def eo(t):
    t = clamp01(t)
    return 1 - (1 - t) ** 3


def eio(t):
    t = clamp01(t)
    return t * t * (3 - 2 * t)


def eob(t):  # ease-out back (slight overshoot)
    t = clamp01(t)
    c1, c3 = 1.70158, 2.70158
    return 1 + c3 * (t - 1) ** 3 + c1 * (t - 1) ** 2


def seg(t, start, dur):
    if dur <= 0:
        return 1.0
    return clamp01((t - start) / dur)


class Z:
    """draw wrapper that scales all coords by SS"""

    def __init__(self, img):
        self.d = ImageDraw.Draw(img)
        self.img = img

    def text(self, xy, s, fname, size, fill, anchor="la"):
        self.d.text((xy[0] * SS, xy[1] * SS), s, font=F(fname, size * SS),
                    fill=fill, anchor=anchor)

    def tlen(self, s, fname, size):
        return self.d.textlength(s, font=F(fname, size * SS)) / SS

    def tracked(self, xy, s, fname, size, fill, tracking=7, center=True):
        fnt = F(fname, size * SS)
        tk = tracking * SS
        widths = [self.d.textlength(ch, font=fnt) for ch in s]
        total = sum(widths) + tk * (len(s) - 1)
        x = xy[0] * SS - (total / 2 if center else 0)
        for ch, w in zip(s, widths):
            self.d.text((x, xy[1] * SS), ch, font=fnt, fill=fill, anchor="lm")
            x += w + tk

    def rrect(self, box, radius, fill=None, outline=None, width=1):
        self.d.rounded_rectangle([v * SS for v in box], radius=radius * SS,
                                 fill=fill, outline=outline, width=width * SS)

    def rect(self, box, fill=None):
        self.d.rectangle([v * SS for v in box], fill=fill)

    def ellipse(self, box, fill=None, outline=None, width=1):
        self.d.ellipse([v * SS for v in box], fill=fill, outline=outline,
                       width=max(1, int(width * SS)))

    def dot(self, cx, cy, r, fill):
        self.ellipse([cx - r, cy - r, cx + r, cy + r], fill=fill)

    def line(self, pts, fill, width=1):
        self.d.line([(p[0] * SS, p[1] * SS) for p in pts], fill=fill,
                    width=max(1, int(width * SS)), joint="curve")

    def polygon(self, pts, fill):
        self.d.polygon([(p[0] * SS, p[1] * SS) for p in pts], fill=fill)

    def arc(self, box, start, end, fill, width=2):
        self.d.arc([v * SS for v in box], start, end, fill=fill,
                   width=max(1, int(width * SS)))

    def segments(self, x, y, parts, anchor_center=True):
        """mixed-font text on a shared baseline; parts=(text,fname,size,fill)"""
        total = sum(self.tlen(s, fn, sz) for s, fn, sz, _ in parts)
        cx = x - (total / 2 if anchor_center else 0)
        for s, fn, sz, fill in parts:
            self.d.text((cx * SS, y * SS), s, font=F(fn, sz * SS),
                        fill=fill, anchor="ls")
            cx += self.tlen(s, fn, sz)


def wavy(z, x0, x1, y, color, width=4, amp=5, wl=85, p=1.0, phase=0.0):
    """hand-drawn-feel underline, drawn on by p"""
    xe = x0 + (x1 - x0) * eo(p)
    pts = []
    x = x0
    while x <= xe:
        pts.append((x, y + amp * math.sin((x - x0) / wl * 2 * math.pi + phase)))
        x += 5
    if len(pts) > 1:
        z.line(pts, fill=color, width=width)
        z.dot(*pts[0], width / 2, color)
        z.dot(*pts[-1], width / 2, color)


def spark_pts(cx, cy, r, rot):
    pts = []
    for k in range(8):
        ang = rot + k * math.pi / 4
        rr = r if k % 2 == 0 else r * 0.34
        pts.append((cx + rr * math.cos(ang), cy + rr * math.sin(ang)))
    return pts


def draw_spark(z, cx, cy, r, color, rot=-math.pi / 2):
    z.polygon(spark_pts(cx, cy, r, rot), fill=color)


def arcs_corner(z, cx, cy, n, r0, step, color, sweep_p, width=2):
    """concentric quarter-ish arcs from a corner point, drawn on"""
    for i in range(n):
        r = r0 + i * step
        a = eo(seg(sweep_p, i * 0.06, 0.7))
        if a <= 0:
            continue
        z.arc([cx - r, cy - r, cx + r, cy + r], 90, 90 + 90 * a, color, width)


_shadow_cache = {}


def card_shadow(w, h, radius=28, blur=22, alpha=48):
    key = (w, h, radius, blur, alpha)
    if key not in _shadow_cache:
        pad = blur * 3
        im = Image.new("L", ((w + 2 * pad) * SS, (h + 2 * pad) * SS), 0)
        dd = ImageDraw.Draw(im)
        dd.rounded_rectangle([pad * SS, pad * SS, (pad + w) * SS, (pad + h) * SS],
                             radius=radius * SS, fill=alpha)
        im = im.filter(ImageFilter.GaussianBlur(blur * SS / 1.6))
        rgba = Image.new("RGBA", im.size, (60, 50, 40, 0))
        rgba.putalpha(im)
        _shadow_cache[key] = (rgba, pad)
    return _shadow_cache[key]


def white_card(z, ov, x, y, w, h, radius=28):
    sh, pad = card_shadow(w, h, radius)
    ov.alpha_composite(sh, (int((x - pad) * SS), int((y - pad + 10) * SS)))
    z.rrect([x, y, x + w, y + h], radius, fill=(250, 249, 245, 255),
            outline=(228, 225, 215, 255), width=1)


def apply_alpha(overlay, a):
    if a >= 0.999:
        return overlay
    alpha = overlay.getchannel("A").point(lambda v: int(v * a))
    overlay.putalpha(alpha)
    return overlay


def words_rise(z, ov, words, y, t, start, stagger=0.10, dur=0.5, gap_w=None):
    """centered line of (text,fname,size,fill) words, staggered rise-in"""
    if gap_w is None:
        gap_w = z.tlen(" ", words[0][1], words[0][2])
    total = sum(z.tlen(s, fn, sz) for s, fn, sz, _ in words) + gap_w * (len(words) - 1)
    x = W / 2 - total / 2
    for i, (s, fn, sz, fill) in enumerate(words):
        a = eo(seg(t, start + i * stagger, dur))
        if a > 0:
            dy = (1 - a) * 22
            z.d.text(((x) * SS, (y + dy) * SS), s, font=F(fn, sz * SS),
                     fill=fill + (int(255 * a),), anchor="ls")
        x += z.tlen(s, fn, sz) + gap_w


# ======================================================================
# scenes — each draws content on a transparent overlay above its bg
# ======================================================================

def s1_hook(z, ov, t):
    a0 = eio(seg(t, 0.25, 0.5))
    z.tracked((W / 2, 372), "A 30-SECOND DEMONSTRATION",
              SANS, 23, CORAL + (int(255 * a0),), tracking=7)
    l1 = [(w, SERIF, 84, INK) for w in "What can the new generation".split()]
    l2 = [("of", SERIF, 84, INK), ("AI", SERIF, 84, INK),
          ("actually", SERIF_I, 84, CORAL), ("do?", SERIF, 84, INK)]
    words_rise(z, ov, l1, 510, t, 0.55)
    words_rise(z, ov, l2, 625, t, 1.15)
    # little coral spark appears at the end
    a = eob(seg(t, 1.9, 0.5))
    if a > 0:
        draw_spark(z, W / 2, 740, 17 * a, CORAL + (int(255 * clamp01(a)),))


def s2_title(z, ov, t):
    arcs_corner(z, W - 30, 24, 5, 110, 64, KRAFT + (120,), seg(t, 0.1, 1.4))
    arcs_corner(z, 30, H - 24, 5, 110, 64, KRAFT + (100,), seg(t, 0.3, 1.4))
    a0 = eio(seg(t, 0.15, 0.5))
    z.tracked((W / 2, 340), "THE NEW GENERATION OF AI", SANS, 24,
              MUTED + (int(255 * a0),), tracking=7)
    a1 = eo(seg(t, 0.35, 0.6))
    if a1 > 0:
        z.text((W / 2, 455 + (1 - a1) * 30), "Knowledge work,", SERIF, 104,
               INK + (int(255 * a1),), anchor="mm")
    a2 = eo(seg(t, 0.6, 0.6))
    if a2 > 0:
        z.text((W / 2, 588 + (1 - a2) * 30), "reimagined.", SERIF_BI, 112,
               CORAL + (int(255 * a2),), anchor="mm")
    wavy(z, W / 2 - 270, W / 2 + 270, 672, CORAL + (230,), width=5,
         p=seg(t, 1.15, 0.6))


# ---- demo sub-scenes -------------------------------------------------
CARD_X, CARD_Y, CARD_W, CARD_H = 760, 150, 1010, 780


def demo_left(z, ov, t, idx, title, sub):
    a0 = eio(seg(t, 0.1, 0.45))
    z.tracked((150, 295), f"WATCH IT WORK  —  0{idx}", SANS, 22,
              MUTED + (int(255 * a0),), tracking=5, center=False)
    a1 = eo(seg(t, 0.2, 0.55))
    if a1 > 0:
        z.text((146, 380 + (1 - a1) * 28), title, SERIF, 104,
               INK + (int(255 * a1),), anchor="lm")
    a2 = eio(seg(t, 0.45, 0.5))
    z.text((150, 470), sub, SANS, 30, MUTED + (int(255 * a2),), anchor="lm")
    wavy(z, 150, 420, 522, CORAL + (220,), width=4, amp=4, wl=70,
         p=seg(t, 0.55, 0.5))


def card_enter(t):
    a = eob(seg(t, 0.12, 0.55))
    fade = eio(seg(t, 0.12, 0.35))
    return CARD_X + (1 - a) * 70, fade


def s3a_write(z, ov, t):
    demo_left(z, ov, t, 1, "It writes.", "essays · feedback · lesson plans")
    x, fade = card_enter(t)
    if fade <= 0:
        return
    tmp = Image.new("RGBA", ov.size, (0, 0, 0, 0))
    zt = Z(tmp)
    white_card(zt, tmp, x, CARD_Y, CARD_W, CARD_H)
    for i, c in enumerate([CORAL, KRAFT, SAGE]):
        zt.dot(x + 48 + i * 34, CARD_Y + 46, 7, c + (255,))
    zt.line([(x, CARD_Y + 84), (x + CARD_W, CARD_Y + 84)], RULE + (255,), 1)
    zt.text((x + 70, CARD_Y + 150), "The Industrial Revolution", SERIF, 40,
            INK + (255,), anchor="lm")
    zt.text((x + 70, CARD_Y + 205), "Essay draft  ·  Claude’s feedback", SANS,
            24, MUTED + (255,), anchor="lm")
    widths = [0.88, 0.72, 0.81, 0.62, 0.0, 0.84, 0.68, 0.77, 0.45]
    ty0 = CARD_Y + 265
    for j, bw in enumerate(widths):
        if bw == 0:
            continue
        ba = eo(seg(t, 0.55 + j * 0.10, 0.4))
        if ba <= 0:
            continue
        yy = ty0 + j * 50
        bl = (CARD_W - 320) * bw * ba
        col = CORAL + (90,) if j == 3 else BAR + (255,)
        zt.rrect([x + 70, yy, x + 70 + bl, yy + 20], 10, fill=col)
        if j == 3:
            wavy(zt, x + 70, x + 70 + bl, yy + 30, CORAL + (255,), width=3,
                 amp=3, wl=46, p=seg(t, 1.15, 0.45))
    # annotation pill
    pa = eob(seg(t, 1.45, 0.5))
    if pa > 0:
        pw, ph = 392 * 1, 64
        px = x + CARD_W - pw - 64
        py = ty0 + 3 * 50 + 58 + (1 - pa) * 18
        zt.line([(x + 70 + (CARD_W - 320) * 0.62, ty0 + 3 * 50 + 34),
                 (px + 40, py + ph / 2)], CORAL + (int(160 * pa),), 2)
        zt.rrect([px, py, px + pw, py + ph], 32, fill=CORAL + (int(255 * pa),))
        zt.text((px + pw / 2, py + ph / 2), "suggestion: tighten this argument",
                SANS, 24, (255, 252, 248, int(255 * pa)), anchor="mm")
    apply_alpha(tmp, fade)
    ov.alpha_composite(tmp)


CODE = [
    [("# a study buddy, any subject", (138, 135, 130))],
    [("def ", (232, 155, 123)), ("quiz", (168, 192, 154)), ("(topic):", CREAM_TXT)],
    [("    questions = ", CREAM_TXT), ("make", (168, 192, 154)), ("(topic)", CREAM_TXT)],
    [("    for ", (232, 155, 123)), ("q ", CREAM_TXT), ("in ", (232, 155, 123)),
     ("questions:", CREAM_TXT)],
    [("        grade(ask(q))", CREAM_TXT)],
    [("    return ", (232, 155, 123)), ("encouragement()", CREAM_TXT)],
]


def s3b_code(z, ov, t):
    demo_left(z, ov, t, 2, "It codes.", "real software, explained line by line")
    x, fade = card_enter(t)
    if fade <= 0:
        return
    tmp = Image.new("RGBA", ov.size, (0, 0, 0, 0))
    zt = Z(tmp)
    sh, pad = card_shadow(CARD_W, CARD_H)
    tmp.alpha_composite(sh, (int((x - pad) * SS), int((CARD_Y - pad + 10) * SS)))
    zt.rrect([x, CARD_Y, x + CARD_W, CARD_Y + CARD_H], 28, fill=SLATE + (255,))
    for i, c in enumerate([CORAL, KRAFT, SAGE]):
        zt.dot(x + 48 + i * 34, CARD_Y + 46, 7, c + (255,))
    zt.text((x + CARD_W - 60, CARD_Y + 46), "study_buddy.py", MONO, 22,
            (138, 135, 130, 255), anchor="rm")
    zt.line([(x, CARD_Y + 84), (x + CARD_W, CARD_Y + 84)], (60, 58, 54, 255), 1)
    n_total = sum(len(s) for ln in CODE for s, _ in ln)
    budget = int(eio(seg(t, 0.45, 1.85)) * n_total)
    cy = CARD_Y + 160
    last_xy = None
    for ln in CODE:
        cx = x + 70
        for s, col in ln:
            take = max(0, min(len(s), budget))
            budget -= take
            if take:
                zt.text((cx, cy), s[:take], MONO, 28, tuple(col) + (255,),
                        anchor="lm")
            cx += zt.tlen(s[:take], MONO, 28)
            last_xy = (cx, cy)
            if take < len(s):
                budget = -1
                break
        if budget < 0:
            break
        cy += 62
    if last_xy and (int(t * 2.4) % 2 == 0):
        zt.rect([last_xy[0] + 6, last_xy[1] - 16, last_xy[0] + 22,
                 last_xy[1] + 16], fill=CORAL + (255,))
    apply_alpha(tmp, fade)
    ov.alpha_composite(tmp)


CHART_PTS = [(0.0, 0.26), (0.13, 0.40), (0.27, 0.35), (0.42, 0.52),
             (0.55, 0.49), (0.70, 0.64), (0.85, 0.78), (1.0, 0.85)]


def s3c_analyze(z, ov, t):
    demo_left(z, ov, t, 3, "It analyzes.", "from raw data to clear insight")
    x, fade = card_enter(t)
    if fade <= 0:
        return
    tmp = Image.new("RGBA", ov.size, (0, 0, 0, 0))
    zt = Z(tmp)
    white_card(zt, tmp, x, CARD_Y, CARD_W, CARD_H)
    zt.text((x + 70, CARD_Y + 92), "Class progress, fall term", SERIF, 40,
            INK + (255,), anchor="lm")
    gx0, gy0 = x + 80, CARD_Y + 200
    gx1, gy1 = x + CARD_W - 80, CARD_Y + 640
    for i in range(5):
        gy = gy0 + (gy1 - gy0) * i / 4
        ga = eio(seg(t, 0.35 + i * 0.05, 0.4))
        zt.line([(gx0, gy), (gx1, gy)], RULE + (int(255 * ga),), 1)
    # polyline draw-on
    pts = [(gx0 + (gx1 - gx0) * px, gy1 - (gy1 - gy0) * py)
           for px, py in CHART_PTS]
    p = eio(seg(t, 0.6, 1.3))
    if p > 0:
        # cumulative length walk
        lens = [0.0]
        for i in range(1, len(pts)):
            lens.append(lens[-1] + math.dist(pts[i - 1], pts[i]))
        target = lens[-1] * p
        draw = [pts[0]]
        for i in range(1, len(pts)):
            if lens[i] <= target:
                draw.append(pts[i])
            else:
                f = (target - lens[i - 1]) / (lens[i] - lens[i - 1])
                draw.append((pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * f,
                             pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * f))
                break
        # area fill
        if len(draw) > 1:
            zt.polygon(draw + [(draw[-1][0], gy1), (gx0, gy1)], CORAL + (38,))
            zt.line(draw, CORAL + (255,), 5)
        for i, pt in enumerate(pts):
            if lens[i] <= target:
                da = eob(seg(p, lens[i] / lens[-1], 0.18))
                zt.dot(pt[0], pt[1], 8 * min(1, da), INK + (255,))
    pa = eob(seg(t, 1.85, 0.5))
    if pa > 0:
        pw, ph = 330, 60
        px, py = x + CARD_W - pw - 64, CARD_Y + 660 + (1 - pa) * 16
        zt.rrect([px, py, px + pw, py + ph], 30, fill=SAGE + (int(255 * pa),))
        zt.text((px + pw / 2, py + ph / 2), "insight: steady growth", SANS, 24,
                (255, 252, 248, int(255 * pa)), anchor="mm")
    apply_alpha(tmp, fade)
    ov.alpha_composite(tmp)


def s4_stats(z, ov, t):
    a0 = eio(seg(t, 0.1, 0.5))
    z.tracked((W / 2, 250), "AT A SCALE NO CLASSROOM HAS SEEN", SANS, 24,
              MUTED + (int(255 * a0),), tracking=7)
    stats = [("100", "+", "pages read & summarized", "in seconds"),
             ("24", "/7", "a patient tutor", "that never clocks out"),
             ("1", ":1", "personal attention", "for every single learner")]
    xs = [400, 960, 1520]
    for i, (big, suf, l1, l2) in enumerate(stats):
        a = eo(seg(t, 0.35 + i * 0.4, 0.65))
        if a <= 0:
            continue
        tmp = Image.new("RGBA", ov.size, (0, 0, 0, 0))
        zt = Z(tmp)
        y = 520 + (1 - a) * 36
        val = big
        if i == 0:
            val = str(int(eo(seg(t, 0.35, 1.25)) * 100))
        bw = zt.tlen(val, SERIF_B, 168) + zt.tlen(suf, SERIF_B, 168)
        zt.text((xs[i] - bw / 2, y), val, SERIF_B, 168, INK + (255,), anchor="lm")
        zt.text((xs[i] - bw / 2 + zt.tlen(val, SERIF_B, 168), y), suf,
                SERIF_B, 168, CORAL + (255,), anchor="lm")
        zt.text((xs[i], y + 135), l1, SANS, 31, INK + (255,), anchor="mm")
        zt.text((xs[i], y + 180), l2, SANS, 31, MUTED + (255,), anchor="mm")
        apply_alpha(tmp, a)
        ov.alpha_composite(tmp)
    for x in (680, 1240):
        ra = eio(seg(t, 0.55, 0.6))
        z.line([(x, 430), (x, 430 + 290 * ra)], RULE + (255,), 1)


def s5_students(z, ov, t):
    a0 = eo(seg(t, 0.1, 0.55))
    if a0 > 0:
        z.text((W / 2, 255 + (1 - a0) * 26), "What does this mean",
               SERIF, 78, INK + (int(255 * a0),), anchor="mm")
        z.text((W / 2, 355 + (1 - a0) * 26), "for your students?",
               SERIF, 78, INK + (int(255 * a0),), anchor="mm")
    rows = [
        [("Every student gets ", SANS, 42, INK), ("a personal tutor.", SERIF_I, 46, CORAL)],
        [("Every teacher gets ", SANS, 42, INK), ("a planning assistant.", SERIF_I, 46, CORAL)],
        [("Every graduate enters ", SANS, 42, INK), ("an AI-fluent world.", SERIF_I, 46, CORAL)],
    ]
    for i, parts in enumerate(rows):
        a = eo(seg(t, 0.85 + i * 0.6, 0.55))
        if a <= 0:
            continue
        tmp = Image.new("RGBA", ov.size, (0, 0, 0, 0))
        zt = Z(tmp)
        y = 545 + i * 125 + (1 - a) * 24
        total = sum(zt.tlen(s, fn, sz) for s, fn, sz, _ in parts)
        draw_spark(zt, W / 2 - total / 2 - 52, y - 14, 13, CORAL + (255,))
        zt.segments(W / 2, y, [(s, fn, sz, c + (255,)) for s, fn, sz, c in parts])
        apply_alpha(tmp, a)
        ov.alpha_composite(tmp)


def s6_closer(z, ov, t):
    # decorative arcs in deeper coral
    arcs_corner(z, W - 30, 24, 5, 110, 64, CORAL_DEEP + (170,), seg(t, 0.1, 1.2))
    arcs_corner(z, 30, H - 24, 5, 110, 64, CORAL_DEEP + (150,), seg(t, 0.25, 1.2))
    a1 = eio(seg(t, 0.25, 0.55))
    if a1 > 0:
        z.text((W / 2, 405), "Your students will graduate", SERIF, 66,
               CREAM_TXT + (int(255 * a1),), anchor="mm")
        z.text((W / 2, 495), "into an AI-powered world.", SERIF, 66,
               CREAM_TXT + (int(255 * a1),), anchor="mm")
    a2 = eo(seg(t, 1.0, 0.6))
    if a2 > 0:
        z.text((W / 2, 670 + (1 - a2) * 30), "Let’s prepare them to lead it.",
               SERIF_BI, 88, (255, 252, 248, int(255 * a2)), anchor="mm")
    wavy(z, W / 2 - 250, W / 2 + 250, 750, (255, 252, 248, 235), width=5,
         p=seg(t, 1.6, 0.6))


def s7_end(z, ov, t):
    a0 = eob(seg(t, 0.15, 0.6))
    if a0 > 0:
        draw_spark(z, W / 2, 300, 56 * min(1, a0),
                   CORAL + (255,), rot=-math.pi / 2 + t * 0.05)
    a1 = eo(seg(t, 0.5, 0.55))
    if a1 > 0:
        z.text((W / 2, 470 + (1 - a1) * 22), "Every frame of this film was made by AI —",
               SERIF, 58, INK + (int(255 * a1),), anchor="mm")
    a2 = eo(seg(t, 0.85, 0.55))
    if a2 > 0:
        z.text((W / 2, 558 + (1 - a2) * 22), "script, design, animation & score.",
               SERIF_I, 58, CORAL + (int(255 * a2),), anchor="mm")
    a3 = eio(seg(t, 1.4, 0.6))
    z.tracked((W / 2, 700), "GENERATED END-TO-END BY CLAUDE  ·  NO STOCK ASSETS",
              SANS, 22, MUTED + (int(255 * a3),), tracking=6)


# scene table: (t0, t1, bg_color, draw_fn, fade_in, fade_out)
SCENES = [
    (0.0, 3.4, CREAM, s1_hook, 0.30, 0.35),
    (3.4, 6.4, CREAM, s2_title, 0.30, 0.35),
    (6.4, 9.1, CREAM, s3a_write, 0.25, 0.30),
    (9.1, 11.8, CREAM, s3b_code, 0.25, 0.30),
    (11.8, 14.5, CREAM, s3c_analyze, 0.25, 0.30),
    (14.5, 19.0, CREAM, s4_stats, 0.30, 0.35),
    (19.0, 23.8, CREAM, s5_students, 0.30, 0.30),
    (23.8, 27.3, CORAL, s6_closer, 0.0, 0.0),   # enters/exits via wipe
    (27.3, 30.0, CREAM, s7_end, 0.0, 0.35),
]
WIPES = [(23.8, 0.55), (27.3, 0.55)]  # (start, duration)

_bg_cache = {}


def bg_solid(color):
    if color not in _bg_cache:
        _bg_cache[color] = Image.new("RGBA", (W2, H2), color + (255,))
    return _bg_cache[color]


def scene_image(si, t):
    t0, t1, bgc, fn, fin, fout = SCENES[si]
    img = bg_solid(bgc).copy()
    ov = Image.new("RGBA", (W2, H2), (0, 0, 0, 0))
    z = Z(ov)
    fn(z, ov, t - t0)
    a = 1.0
    if fin:
        a *= eio(seg(t, t0, fin))
    if fout:
        a *= 1 - eio(seg(t, t1 - fout, fout))
    apply_alpha(ov, clamp01(a))
    img.alpha_composite(ov)
    return img.resize((W, H), Image.LANCZOS).convert("RGB")


# ---- film-look post pass ----
_noise = None
_vig = None


def post(img, fidx):
    global _noise, _vig
    arr = np.asarray(img, dtype=np.float32)
    if _vig is None:
        yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
        r2 = ((xx / W - 0.5) ** 2 + (yy / H - 0.5) ** 2) / 0.5
        _vig = (1.0 - 0.075 * r2 ** 1.4)[..., None]
        rng = np.random.default_rng(11)
        _noise = rng.normal(0, 2.6, (H + 90, W + 90, 1)).astype(np.float32)
    ox = (fidx * 37) % 90
    oy = (fidx * 23) % 90
    arr = arr * _vig + _noise[oy:oy + H, ox:ox + W]
    return Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8))


def find_scene(t):
    for i, (t0, t1, *_rest) in enumerate(SCENES):
        if t0 <= t < t1:
            return i
    return len(SCENES) - 1


def render_frame(fidx):
    t = min(fidx / FPS, DUR - 1e-4)
    si = find_scene(t)
    img = scene_image(si, t)
    # soft left-to-right wipe into scenes 7 and 8
    for ws, wd in WIPES:
        if ws <= t < ws + wd and si == find_scene(ws):
            prev = scene_image(si - 1, min(t, SCENES[si - 1][1] - 1e-3))
            p = eio((t - ws) / wd)
            edge = 240
            xx = np.arange(W, dtype=np.float32)
            thresh = p * (W + edge)
            m = np.clip((thresh - xx) / edge, 0, 1)[None, :, None]
            a = np.asarray(img, dtype=np.float32)
            b = np.asarray(prev, dtype=np.float32)
            img = Image.fromarray((a * m + b * (1 - m)).astype(np.uint8))
    img = post(img, fidx)
    d = ImageDraw.Draw(img)
    wm_col = (250, 240, 234) if SCENES[si][2] == CORAL else (165, 162, 152)
    d.text((W - 36, H - 32), "AI-generated · made by Claude",
           font=F(SANS, 21), fill=wm_col, anchor="rm")
    return img


# ======================================================================
# score — felt piano + pad + bass, convolution reverb
# ======================================================================
def midi(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def felt(f, dur, sr, vel):
    t = np.arange(int(dur * sr)) / sr
    env = np.exp(-t * 2.0) * (1 - np.exp(-t * 250))
    s = (np.sin(2 * np.pi * f * t)
         + 0.38 * np.sin(2 * np.pi * 2.001 * f * t) * np.exp(-t * 3.5)
         + 0.12 * np.sin(2 * np.pi * 3.003 * f * t) * np.exp(-t * 6))
    return s * env * vel


def fft_reverb(x, sr, decay=2.2, mix=0.32, seed=5):
    n_ir = int(decay * sr)
    rng = np.random.default_rng(seed)
    ir = rng.standard_normal(n_ir) * np.exp(-np.linspace(0, 7.5, n_ir))
    ir = np.convolve(ir, np.ones(10) / 10, mode="same")  # soften highs
    n = len(x) + n_ir
    wet = np.fft.irfft(np.fft.rfft(x, n) * np.fft.rfft(ir, n))[:len(x)]
    pk = np.abs(wet).max() + 1e-9
    wet = wet / pk * (np.abs(x).max() + 1e-9)
    return x * (1 - mix) + wet * mix


def make_audio(path):
    sr = 44100
    n = int(sr * DUR)
    slot = DUR / 9.0
    beat = slot / 4.0
    # chords: pad voicings + bass root (midi)
    C = ([48, 52, 55, 62], 36)
    GB = ([47, 55, 59, 62], 35)
    Am = ([45, 52, 57, 60], 33)
    Fm9 = ([41, 45, 48, 55], 29)
    CE = ([48, 55, 60, 64], 40)
    G = ([43, 50, 55, 59], 31)
    prog = [C, GB, Am, Fm9, CE, Fm9, G, G, C]
    melody = [
        [(0.0, 67, .55), (1.5, 72, .45), (2.5, 74, .5)],
        [(0.0, 71, .5), (2.0, 67, .4)],
        [(0.0, 69, .55), (1.5, 72, .42), (3.0, 76, .5)],
        [(0.0, 72, .5), (2.0, 69, .42), (3.0, 65, .38)],
        [(0.0, 67, .5), (1.5, 64, .4)],
        [(0.0, 72, .5), (1.0, 74, .45), (2.0, 76, .5)],
        [(0.0, 74, .52), (2.0, 71, .42)],
        [(0.0, 79, .5), (1.5, 74, .42), (3.0, 71, .4)],
        [(0.0, 72, .6)],
    ]
    rng = np.random.default_rng(3)
    Lc, Rc = np.zeros(n), np.zeros(n)
    mel = np.zeros(n)
    for ci, ((pad_notes, bass_root), notes) in enumerate(zip(prog, melody)):
        s0 = ci * slot
        i0 = int(s0 * sr)
        i1 = min(n, int((s0 + slot + 1.2) * sr))
        ln = i1 - i0
        tl = np.arange(ln) / sr
        e = np.ones(ln)
        na, nr = int(1.0 * sr), int(1.3 * sr)
        e[:na] = np.linspace(0, 1, na) ** 2
        if nr < ln:
            e[-nr:] *= np.linspace(1, 0, nr) ** 2
        pad = np.zeros(ln)
        padL = np.zeros(ln)
        padR = np.zeros(ln)
        for m in pad_notes:
            f = midi(m)
            padL += np.sin(2 * np.pi * f * 0.9985 * tl)
            padR += np.sin(2 * np.pi * f * 1.0015 * tl)
        Lc[i0:i1] += padL * e * 0.035
        Rc[i0:i1] += padR * e * 0.035
        fb = midi(bass_root)
        bass = (np.sin(2 * np.pi * fb * tl)
                + 0.2 * np.sin(4 * np.pi * fb * tl)) * e * 0.13
        Lc[i0:i1] += bass
        Rc[i0:i1] += bass
        for (b, m, v) in notes:
            tstart = s0 + b * beat + rng.normal(0, 0.012)
            a0 = max(0, int(tstart * sr))
            note = felt(midi(m), 3.2, sr, v * (1 + rng.normal(0, 0.05)))
            end = min(n, a0 + len(note))
            mel[a0:end] += note[:end - a0]
    Lc += fft_reverb(mel * 0.92, sr, seed=5) * 0.9
    Rc += fft_reverb(mel * 1.08, sr, seed=9) * 1.1
    # gentle master fades
    fi, fo = int(0.7 * sr), int(3.0 * sr)
    for ch in (Lc, Rc):
        ch[:fi] *= np.linspace(0, 1, fi)
        ch[-fo:] *= np.linspace(1, 0, fo) ** 1.4
    peak = max(np.abs(Lc).max(), np.abs(Rc).max())
    Lc, Rc = Lc / peak * 0.74, Rc / peak * 0.74
    data = np.empty(n * 2, dtype=np.int16)
    data[0::2] = (Lc * 32767).astype(np.int16)
    data[1::2] = (Rc * 32767).astype(np.int16)
    with wave.open(path, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(sr)
        w.writeframes(data.tobytes())


# ======================================================================
def main():
    import imageio_ffmpeg
    ff = imageio_ffmpeg.get_ffmpeg_exe()

    if len(sys.argv) > 1 and sys.argv[1] == "preview":
        for fs in sys.argv[2:]:
            fr = render_frame(int(fs))
            p = os.path.join(OUT, f"v2_preview_{int(fs):04d}.png")
            fr.save(p)
            print("wrote", p)
        return

    vid = os.path.join(OUT, "v2_video_only.mp4")
    proc = subprocess.Popen(
        [ff, "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}",
         "-r", str(FPS), "-i", "-", "-an", "-c:v", "libx264", "-preset",
         "medium", "-crf", "17", "-pix_fmt", "yuv420p", vid],
        stdin=subprocess.PIPE, stderr=subprocess.DEVNULL)
    for f in range(TOTAL):
        proc.stdin.write(render_frame(f).tobytes())
        if f % 100 == 0:
            print(f"frame {f}/{TOTAL}", flush=True)
    proc.stdin.close()
    proc.wait()
    print("video done")

    aud = os.path.join(OUT, "v2_music.wav")
    make_audio(aud)
    print("audio done")

    final = os.path.join(OUT, "ai_knowledge_work_30s_v2.mp4")
    subprocess.run(
        [ff, "-y", "-i", vid, "-i", aud, "-c:v", "copy", "-c:a", "aac",
         "-b:a", "192k", "-shortest", final],
        check=True, stderr=subprocess.DEVNULL)
    print("final:", final)


if __name__ == "__main__":
    main()
