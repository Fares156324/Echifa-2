from PIL import Image
import numpy as np
import shutil

src_backup = r"C:\Users\DIDI\Desktop\EchifaVFF\assets\img\amblogo-transparent-backup.png"
out = r"C:\Users\DIDI\Desktop\EchifaVFF\assets\img\amblogo-transparent.png"

# Start from backup to avoid accumulated edits
shutil.copyfile(src_backup, out)

img = Image.open(out).convert("RGBA")
arr = np.array(img)

# Regions for the two words
regions = [
    (290, 320, 950, 600),   # Transport
    (330, 620, 1020, 940),  # Medicalise
]

for x1, y1, x2, y2 in regions:
    sub = arr[y1:y2, x1:x2, :]
    r = sub[:, :, 0].astype(np.int16)
    g = sub[:, :, 1].astype(np.int16)
    b = sub[:, :, 2].astype(np.int16)
    a = sub[:, :, 3]

    mx = np.maximum(np.maximum(r, g), b)
    mn = np.minimum(np.minimum(r, g), b)

    # Letters are bright and low saturation; exclude transparent and vivid colors
    text_mask = (a > 20) & (mx > 130) & ((mx - mn) < 70)

    # Force pure white with preserved antialias alpha
    sub[text_mask, 0] = 255
    sub[text_mask, 1] = 255
    sub[text_mask, 2] = 255

arr = arr.astype(np.uint8)
Image.fromarray(arr, "RGBA").save(out)
print(out)
