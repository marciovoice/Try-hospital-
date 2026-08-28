import math
import subprocess
import random
import os

WIDTH = 1280
HEIGHT = 720
FPS = 30
DURATION_SEC = 6.0
TOTAL_FRAMES = int(FPS * DURATION_SEC)

# We can render using Python writing raw RGB frames to ffmpeg
ffmpeg_cmd = [
    "ffmpeg", "-y",
    "-f", "rawvideo",
    "-vcodec", "rawvideo",
    "-s", f"{WIDTH}x{HEIGHT}",
    "-pix_fmt", "rgb24",
    "-r", str(FPS),
    "-i", "-",
    "-c:v", "libx264",
    "-pix_fmt", "yuv420p",
    "-g", "1",  # Keyframe every frame for instant scroll seeking!
    "-preset", "veryfast",
    "-crf", "18",
    "public/charaka_samhita.mp4"
]

print(f"Rendering {TOTAL_FRAMES} frames...")
process = subprocess.Popen(ffmpeg_cmd, stdin=subprocess.PIPE)

# Fixed seed for deterministic particles
random.seed(42)
particles = []
for _ in range(90):
    particles.append({
        'x': random.random() * WIDTH,
        'y': random.random() * HEIGHT,
        'vx': (random.random() - 0.5) * 0.4,
        'vy': -random.random() * 0.8 - 0.2,
        'size': random.randint(2, 5),
        'alpha': random.random() * 0.8 + 0.2
    })

# Node definition matching the user's video:
nodes = [
    {"label": "TRIDOSHA", "x": 640, "y": 140, "color": (255, 220, 140), "connect": ["VATA", "PITTA", "KAPHA"]},
    {"label": "VATA", "x": 420, "y": 280, "color": (240, 210, 160), "connect": ["PRAKRITI", "AGNI"]},
    {"label": "PITTA", "x": 560, "y": 340, "color": (255, 180, 100), "connect": ["AGNI", "AHARA"]},
    {"label": "KAPHA", "x": 860, "y": 480, "color": (220, 200, 140), "connect": ["PRAKRITI"]},
    {"label": "AGNI", "x": 700, "y": 300, "color": (255, 160, 80), "connect": ["AHARA"]},
    {"label": "PRAKRITI", "x": 520, "y": 520, "color": (240, 220, 180), "connect": ["RASAYANA"]},
    {"label": "AHARA", "x": 840, "y": 360, "color": (255, 215, 130), "connect": ["RASAYANA"]},
    {"label": "RASAYANA", "x": 680, "y": 560, "color": (250, 230, 170), "connect": []},
]

def blend_pixel(buf, x, y, r, g, b, a):
    if 0 <= x < WIDTH and 0 <= y < HEIGHT:
        idx = (y * WIDTH + x) * 3
        inv_a = 1.0 - a
        buf[idx] = int(buf[idx] * inv_a + r * a)
        buf[idx+1] = int(buf[idx+1] * inv_a + g * a)
        buf[idx+2] = int(buf[idx+2] * inv_a + b * a)

def draw_line(buf, x0, y0, x1, y1, r, g, b, a):
    dx = abs(x1 - x0)
    dy = abs(y1 - y0)
    sx = 1 if x0 < x1 else -1
    sy = 1 if y0 < y1 else -1
    err = dx - dy
    x, y = x0, y0
    for _ in range(max(dx, dy) + 1):
        blend_pixel(buf, x, y, r, g, b, a)
        blend_pixel(buf, x+1, y, r, g, b, a * 0.5)
        blend_pixel(buf, x, y+1, r, g, b, a * 0.5)
        if x == x1 and y == y1:
            break
        e2 = 2 * err
        if e2 > -dy:
            err -= dy
            x += sx
        if e2 < dx:
            err += dx
            y += sy

def draw_box(buf, cx, cy, w, h, bg_color, border_color, border_w=2):
    x1 = int(cx - w / 2)
    y1 = int(cy - h / 2)
    x2 = int(cx + w / 2)
    y2 = int(cy + h / 2)
    for y in range(max(0, y1), min(HEIGHT, y2)):
        for x in range(max(0, x1), min(WIDTH, x2)):
            is_border = (x < x1 + border_w or x > x2 - border_w or y < y1 + border_w or y > y2 - border_w)
            if is_border:
                blend_pixel(buf, x, y, border_color[0], border_color[1], border_color[2], 0.9)
            else:
                blend_pixel(buf, x, y, bg_color[0], bg_color[1], bg_color[2], 0.7)

# Precomputed font bitmaps for simple glowing text render:
FONT_DATA = {
    'A': [" 0 ", "0 0", "000", "0 0", "0 0"],
    'B': ["00 ", "0 0", "00 ", "0 0", "00 "],
    'C': [" 00", "0  ", "0  ", "0  ", " 00"],
    'D': ["00 ", "0 0", "0 0", "0 0", "00 "],
    'E': ["000", "0  ", "00 ", "0  ", "000"],
    'F': ["000", "0  ", "00 ", "0  ", "0  "],
    'G': [" 00", "0  ", "0 0", "0 0", " 00"],
    'H': ["0 0", "0 0", "000", "0 0", "0 0"],
    'I': ["000", " 0 ", " 0 ", " 0 ", "000"],
    'K': ["0 0", "00 ", "00 ", "0 0", "0 0"],
    'L': ["0  ", "0  ", "0  ", "0  ", "000"],
    'M': ["0 0", "000", "0 0", "0 0", "0 0"],
    'N': ["0 0", "000", "000", "0 0", "0 0"],
    'O': ["000", "0 0", "0 0", "0 0", "000"],
    'P': ["000", "0 0", "000", "0  ", "0  "],
    'R': ["000", "0 0", "000", "00 ", "0 0"],
    'S': [" 00", "0  ", " 0 ", "  0", "00 "],
    'T': ["000", " 0 ", " 0 ", " 0 ", " 0 "],
    'U': ["0 0", "0 0", "0 0", "0 0", "000"],
    'V': ["0 0", "0 0", "0 0", " 0 ", " 0 "],
    'Y': ["0 0", "0 0", " 0 ", " 0 ", " 0 "],
    ' ': ["   ", "   ", "   ", "   ", "   "],
    '-': ["   ", "   ", "000", "   ", "   "]
}

def draw_text(buf, text, start_x, start_y, color, scale=3):
    cx = start_x
    for ch in text.upper():
        if ch in FONT_DATA:
            matrix = FONT_DATA[ch]
            for row_idx, row in enumerate(matrix):
                for col_idx, pixel in enumerate(row):
                    if pixel == '0':
                        for dy in range(scale):
                            for dx in range(scale):
                                px = cx + col_idx * scale + dx
                                py = start_y + row_idx * scale + dy
                                blend_pixel(buf, px, py, color[0], color[1], color[2], 0.95)
                                # subtle glow
                                blend_pixel(buf, px+1, py, color[0], color[1], color[2], 0.3)
                                blend_pixel(buf, px, py+1, color[0], color[1], color[2], 0.3)
            cx += (len(matrix[0]) + 1) * scale

for f in range(TOTAL_FRAMES):
    progress = f / float(TOTAL_FRAMES - 1)
    
    # Background: Deep warm dark ambient vignette
    buffer = bytearray(WIDTH * HEIGHT * 3)
    cx, cy = WIDTH // 2, HEIGHT // 2
    
    # Compute ambient background with radial warm gradient
    for y in range(0, HEIGHT, 2):
        dy = (y - cy) / cy
        for x in range(0, WIDTH, 2):
            dx = (x - cx) / cx
            dist = math.sqrt(dx*dx + dy*dy)
            # Warm vignette from center #1a0f0a to edges #080403
            val = max(0.0, 1.0 - dist * 0.75)
            r = int(24 * val + 8)
            g = int(14 * val + 5)
            b = int(10 * val + 4)
            for yy in (y, min(HEIGHT-1, y+1)):
                for xx in (x, min(WIDTH-1, x+1)):
                    idx = (yy * WIDTH + xx) * 3
                    buffer[idx] = r
                    buffer[idx+1] = g
                    buffer[idx+2] = b

    # Particles floating
    for p in particles:
        p['x'] = (p['x'] + p['vx']) % WIDTH
        p['y'] = (p['y'] + p['vy']) % HEIGHT
        px = int(p['x'])
        py = int(p['y'])
        p_alpha = p['alpha'] * (0.8 + 0.2 * math.sin(f * 0.1 + px))
        for dy in range(-p['size'], p['size']+1):
            for dx in range(-p['size'], p['size']+1):
                if dx*dx + dy*dy <= p['size']*p['size']:
                    blend_pixel(buffer, px + dx, py + dy, 255, 210, 120, p_alpha * 0.6)

    # State machine for the book animation:
    # 0.0 -> 0.15: Closed Book with golden filigree & Sanskrit emblem, latch starts sliding
    # 0.15 -> 0.40: Book opening & spine expanding, golden rays bursting
    # 0.40 -> 0.85: Pages exploded in full 3D matrix with floating nodes & lines
    # 0.85 -> 1.00: Majestic deep focus into the sacred core and closing loop
    
    if progress < 0.18:
        # Phase 1: Closed Book
        book_w = 340
        book_h = 460
        book_x = cx
        book_y = cy
        
        # Leather cover base
        draw_box(buffer, book_x, book_y, book_w, book_h, (75, 45, 25), (218, 165, 32), 6)
        draw_box(buffer, book_x, book_y, book_w - 24, book_h - 24, (55, 32, 18), (184, 134, 11), 3)
        
        # Golden Sanskrit Plate
        draw_box(buffer, book_x, book_y - 20, 220, 110, (110, 75, 35), (255, 215, 0), 4)
        draw_text(buffer, "CHARAK", book_x - 65, book_y - 45, (255, 235, 160), 3)
        draw_text(buffer, "SAMHITA", book_x - 75, book_y - 15, (255, 220, 120), 3)
        
        # Latch lock
        latch_offset = int(progress * 100)
        draw_box(buffer, book_x + book_w//2 - 10 + latch_offset, book_y, 45, 70, (190, 140, 40), (255, 230, 100), 3)
        
    elif progress < 0.42:
        # Phase 2: Opening Book & Fanning Pages
        open_factor = (progress - 0.18) / (0.42 - 0.18)
        smooth_open = math.sin(open_factor * math.pi / 2)
        
        spine_x = cx
        page_spread = int(smooth_open * 420)
        
        # Left and Right Covers
        draw_box(buffer, spine_x - page_spread//2 - 60, cy, 260, 480, (60, 35, 20), (200, 150, 30), 4)
        draw_box(buffer, spine_x + page_spread//2 + 60, cy, 260, 480, (60, 35, 20), (200, 150, 30), 4)
        
        # Fanning Parchment layers
        num_layers = 9
        for i in range(num_layers):
            layer_progress = i / float(num_layers - 1)
            angle = (layer_progress - 0.5) * smooth_open * 1.6
            lx = int(spine_x + math.sin(angle) * (200 * smooth_open))
            ly = cy + int(math.cos(angle) * 15) - (num_layers - i)*3
            pw = int(240 * (0.8 + 0.2 * math.cos(angle)))
            draw_box(buffer, lx, ly, pw, 440, (230 - i*8, 215 - i*7, 180 - i*6), (160, 130, 80), 2)
            
        # Glowing Sanskrit Central Core
        draw_text(buffer, "TRIDOSHA", cx - 70, cy - 80, (255, 230, 140), 3)
        
    elif progress <= 0.88:
        # Phase 3: Fully Exploded 3D Matrix of Pages and Holographic Nodes
        matrix_factor = (progress - 0.42) / (0.88 - 0.42)
        sway = math.sin(matrix_factor * math.pi * 2) * 12
        
        # Draw background floating parchment sheets
        parchment_sheets = [
            {"x": 260, "y": 360, "w": 220, "h": 360, "tilt": -0.25},
            {"x": 480, "y": 380, "w": 240, "h": 400, "tilt": -0.1},
            {"x": 760, "y": 370, "w": 250, "h": 410, "tilt": 0.12},
            {"x": 1000, "y": 350, "w": 220, "h": 350, "tilt": 0.28},
        ]
        
        for p in parchment_sheets:
            px = int(p["x"] + sway * p["tilt"])
            py = int(p["y"] + math.sin(f * 0.08 + p["x"]) * 6)
            draw_box(buffer, px, py, p["w"], p["h"], (235, 220, 185), (170, 140, 90), 2)
            # Draw fake ancient Sanskrit text lines on parchment
            for line_y in range(py - p["h"]//2 + 40, py + p["h"]//2 - 40, 22):
                draw_line(buffer, px - p["w"]//2 + 25, line_y, px + p["w"]//2 - 25, line_y, 110, 90, 70, 0.45)
        
        # Connect nodes with glowing golden lines
        node_dict = {n["label"]: n for n in nodes}
        for n in nodes:
            for target_name in n["connect"]:
                if target_name in node_dict:
                    t = node_dict[target_name]
                    draw_line(buffer, n["x"], int(n["y"] + sway), t["x"], int(t["y"] + sway), 255, 215, 120, 0.75)
        
        # Draw node badges
        for n in nodes:
            ny = int(n["y"] + sway)
            badge_w = len(n["label"]) * 20 + 26
            draw_box(buffer, n["x"], ny, badge_w, 36, (30, 20, 12), n["color"], 2)
            draw_text(buffer, n["label"], n["x"] - (badge_w // 2) + 12, ny - 8, n["color"], 2)
            
    else:
        # Phase 4: Smooth resolution / Reconverging into pristine golden tome
        res_factor = (progress - 0.88) / (1.0 - 0.88)
        smooth_close = math.cos(res_factor * math.pi / 2)
        
        book_w = int(340 + smooth_close * 120)
        book_h = int(460 + smooth_close * 60)
        
        draw_box(buffer, cx, cy, book_w, book_h, (75, 45, 25), (218, 165, 32), 6)
        draw_box(buffer, cx, cy, book_w - 24, book_h - 24, (55, 32, 18), (184, 134, 11), 3)
        draw_box(buffer, cx, cy - 20, 220, 110, (110, 75, 35), (255, 215, 0), 4)
        draw_text(buffer, "CHARAK", cx - 65, cy - 45, (255, 235, 160), 3)
        draw_text(buffer, "SAMHITA", cx - 75, cy - 15, (255, 220, 120), 3)
        
        # Latch locking back into place
        latch_offset = int((1.0 - res_factor) * 40)
        draw_box(buffer, cx + book_w//2 - 10 + latch_offset, cy, 45, 70, (190, 140, 40), (255, 230, 100), 3)

    process.stdin.write(buffer)

process.stdin.close()
process.wait()
print("Video generated successfully at public/charaka_samhita.mp4!")
