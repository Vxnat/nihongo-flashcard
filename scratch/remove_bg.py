import os
from PIL import Image

def remove_background(input_path, output_path):
    print(f"Reading image from: {input_path}")
    img = Image.open(input_path).convert("RGBA")
    width, height = img.size
    data = img.load()

    # Find background pixels using flood fill from corners
    visited = set()
    bg_pixels = set()

    # Threshold for "close to white"
    def is_white(r, g, b):
        return r > 240 and g > 240 and b > 240

    # Flood fill starting from a coordinate
    def flood_fill(start_x, start_y):
        queue = [(start_x, start_y)]
        while queue:
            x, y = queue.pop(0)
            if (x, y) in visited:
                continue
            visited.add((x, y))
            
            r, g, b, a = data[x, y]
            if is_white(r, g, b):
                bg_pixels.add((x, y))
                # Add neighbors
                for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
                    nx, ny = x + dx, y + dy
                    if 0 <= nx < width and 0 <= ny < height and (nx, ny) not in visited:
                        queue.append((nx, ny))

    # Run flood fill from the four corners
    corners = [(0, 0), (width - 1, 0), (0, height - 1), (width - 1, height - 1)]
    for cx, cy in corners:
        r, g, b, a = data[cx, cy]
        if is_white(r, g, b):
            flood_fill(cx, cy)

    # Apply alpha = 0 to detected background pixels
    for x, y in bg_pixels:
        r, g, b, a = data[x, y]
        data[x, y] = (r, g, b, 0)

    # Save output
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    img.save(output_path, "PNG")
    print(f"Background-removed image saved to: {output_path}")

if __name__ == "__main__":
    input_file = "/home/ubuntu/.gemini/antigravity-ide/brain/ba4eff29-1ae6-4c69-ba45-b478ad0e2fff/rpg_shop_lantern_1782468362286.png"
    output_file = "/home/ubuntu/DuAn/nihongo-flashcard/public/images/ui/shiba-room/rpg_shop_lantern.png"
    remove_background(input_file, output_file)
