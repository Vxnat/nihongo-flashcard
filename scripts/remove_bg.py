import os
import sys
from PIL import Image

def remove_background(image_path, output_path):
    img = Image.open(image_path).convert("RGBA")
    width, height = img.size
    
    pixels = img.load()
    visited = [[False for _ in range(height)] for _ in range(width)]
    queue = []
    
    # Hàm kiểm tra màu nền gần trắng (RGB > 240)
    def is_bg_color(r, g, b, a):
        return r > 240 and g > 240 and b > 240
        
    # Thêm các pixel biên vào hàng đợi BFS nếu chúng là màu nền
    for x in range(width):
        for y in [0, height - 1]:
            r, g, b, a = pixels[x, y]
            if is_bg_color(r, g, b, a):
                queue.append((x, y))
                visited[x][y] = True
    for y in range(height):
        for x in [0, width - 1]:
            r, g, b, a = pixels[x, y]
            if is_bg_color(r, g, b, a) and not visited[x][y]:
                queue.append((x, y))
                visited[x][y] = True
                
    # Duyệt loang BFS để tìm toàn bộ vùng nền kết nối với các góc
    while queue:
        cx, cy = queue.pop(0)
        # Thiết lập alpha của pixel nền thành 0 (trong suốt)
        r, g, b, a = pixels[cx, cy]
        pixels[cx, cy] = (r, g, b, 0)
        
        for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
            nx, ny = cx + dx, cy + dy
            if 0 <= nx < width and 0 <= ny < height:
                if not visited[nx][ny]:
                    nr, ng, nb, na = pixels[nx, ny]
                    if is_bg_color(nr, ng, nb, na):
                        visited[nx][ny] = True
                        queue.append((nx, ny))
                        
    # Lưu ảnh kết quả
    img.save(output_path, "PNG")
    print(f"Đã xử lý: {image_path} -> {output_path}")

def main():
    if len(sys.argv) < 3:
        print("Sử dụng: python remove_bg.py <thư_mục_nguồn> <thư_mục_đích>")
        sys.exit(1)
        
    src_dir = sys.argv[1]
    dest_dir = sys.argv[2]
    
    if os.path.isfile(src_dir):
        # Xử lý một file đơn lẻ
        if dest_dir.lower().endswith('.png'):
            parent_dir = os.path.dirname(dest_dir)
            if parent_dir and not os.path.exists(parent_dir):
                os.makedirs(parent_dir)
            remove_background(src_dir, dest_dir)
        else:
            if not os.path.exists(dest_dir):
                os.makedirs(dest_dir)
            filename = os.path.basename(src_dir)
            remove_background(src_dir, os.path.join(dest_dir, filename))
        return
        
    # Xử lý toàn bộ file ảnh trong thư mục
    for file in os.listdir(src_dir):
        if file.lower().endswith(('.png', '.jpg', '.jpeg')):
            src_path = os.path.join(src_dir, file)
            dest_path = os.path.join(dest_dir, file)
            try:
                remove_background(src_path, dest_path)
            except Exception as e:
                print(f"Lỗi khi xử lý {file}: {e}")

if __name__ == "__main__":
    main()
