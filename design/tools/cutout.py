"""Remove the flat or gradient background from a character image.

Usage: python cutout.py SRC DST [SRC DST ...]

Background is grown from the image border: a pixel joins when it is close to its
neighbour (gradients) and close to the corner colour (so white bodies stay).
Light specks without any ink, like generator watermarks, are dropped.
The result is cropped, bottom-aligned on a square canvas and resized to 320px.
"""
import sys
from collections import deque

from PIL import Image

STEP = 14       # max colour step between neighbouring background pixels
NEAR_BG = 45    # max distance from the corner background colour
INK = 300       # r+g+b below this counts as outline ink
SIZE = 320


def dist(a, b):
    return sum((a[i] - b[i]) ** 2 for i in range(3)) ** .5


def cutout(src, dst):
    im = Image.open(src).convert("RGBA")
    w, h = im.size
    px = im.load()

    corners = [px[0, 0], px[w - 1, 0], px[0, h - 1], px[w - 1, h - 1]]
    ref = tuple(sorted(c[i] for c in corners)[1] for i in range(3))

    bg = [[False] * h for _ in range(w)]
    q = deque()
    for x in range(w):
        q.extend([(x, 0), (x, h - 1)])
    for y in range(h):
        q.extend([(0, y), (w - 1, y)])
    for x, y in q:
        bg[x][y] = True
    while q:
        x, y = q.popleft()
        c = px[x, y]
        for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
            if 0 <= nx < w and 0 <= ny < h and not bg[nx][ny]:
                n = px[nx, ny]
                if dist(c, n) < STEP and dist(n, ref) < NEAR_BG:
                    bg[nx][ny] = True
                    q.append((nx, ny))

    # keep foreground components that carry ink or are large
    comp = [[0] * h for _ in range(w)]
    keep, cid = set(), 0
    for sx in range(w):
        for sy in range(h):
            if bg[sx][sy] or comp[sx][sy]:
                continue
            cid += 1
            comp[sx][sy] = cid
            st, n, ink = [(sx, sy)], 0, False
            while st:
                x, y = st.pop()
                n += 1
                ink = ink or sum(px[x, y][:3]) < INK
                for nx in (x - 1, x, x + 1):
                    for ny in (y - 1, y, y + 1):
                        if 0 <= nx < w and 0 <= ny < h and not bg[nx][ny] and not comp[nx][ny]:
                            comp[nx][ny] = cid
                            st.append((nx, ny))
            if ink or n > 0.02 * w * h:
                keep.add(cid)

    for x in range(w):
        for y in range(h):
            r, g, b, _ = px[x, y]
            if comp[x][y] not in keep:
                px[x, y] = (r, g, b, 0)
                continue
            # soften the ring next to the background
            for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
                if 0 <= nx < w and 0 <= ny < h and comp[nx][ny] not in keep:
                    px[x, y] = (r, g, b, min(255, int(255 * dist(px[x, y], px[nx, ny]) / 90)))
                    break

    im = im.crop(im.getbbox())
    side = max(im.size) + 8
    out = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    out.paste(im, ((side - im.size[0]) // 2, side - im.size[1] - 4))
    out.resize((SIZE, SIZE), Image.LANCZOS).save(dst, optimize=True)
    print(dst)


if __name__ == "__main__":
    args = sys.argv[1:]
    for src, dst in zip(args[0::2], args[1::2]):
        cutout(src, dst)
