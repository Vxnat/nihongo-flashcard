Phase 1: Kiến tạo Không gian & Bối cảnh (The Atmosphere)
Đây là bước tạo nền tảng thị giác. Chúng ta sẽ làm việc với component gốc (layout hoặc trang chủ) để thiết lập bối cảnh trước khi đụng đến các tấm thẻ.

Cài đặt Background Image: Chèn đường link ảnh bầu trời Ghibli vào nền. Ta sẽ cấu hình CSS để ảnh bao phủ toàn màn hình (cover) và không bị vỡ khi resize.

Tạo Depth of Field (Độ sâu trường ảnh): Tách biệt background và foreground. Ta sẽ thêm một lớp mờ nhẹ (blur) cho bối cảnh, mô phỏng cảm giác xóa phông mượt mà của những bức ảnh cinematic chụp bằng ống kính 85mm khẩu độ lớn.

Thêm Cinematic Grain: Phủ một lớp hạt nhiễu (noise) tĩnh siêu mỏng lên toàn bộ ứng dụng để tạo texture hoài cổ của phim nhựa.

Phase 2: Chế tác Thẻ Kính (Glassmorphism & Lighting)
Ta sẽ đi sâu vào file FlashcardFront, FlashcardBack và SwipeCard để gỡ bỏ lớp giao diện phẳng hiện tại.

Áp dụng Glassmorphism: Đổi nền trắng đặc (solid) thành nền bán trong suốt kết hợp thuộc tính backdrop-blur của Tailwind, cho phép màu của nền trời Ghibli lấp ló phía sau tấm thẻ.

Xử lý Ánh sáng tự nhiên (Nature Lighting): Thêm các đường viền sáng (border-white/40) ở góc trên và góc trái, kết hợp với shadow cực nhẹ để tạo cảm giác tia sáng đang hắt vào cạnh kính.

Bảng màu Pastel: Điều chỉnh lại màu sắc của các UI phụ (như Dấu X đỏ, Dấu Tick xanh) sang tông màu pastel mộng mơ (ví dụ: xanh lá cỏ non, cam đào hoàng hôn) để không bị "chói" so với tổng thể.

Phase 3: Nghệ thuật Typography (Chữ viết)
Thay đổi font chữ là cách nhanh nhất để mang lại cảm giác "điện ảnh".

Tích hợp Font Mincho (Serif): Nhúng một font chữ có chân từ Google Fonts (như Noto Serif JP hoặc Shippori Mincho).

Căn chỉnh Layout: Phóng to tối đa chữ Kanji ở mặt trước, nới lỏng khoảng cách (tracking/letter-spacing) để nó đứng uy nghi giữa tấm thẻ kính như một Title Card đầu phim.

Hệ thống thứ bậc (Hierarchy): Làm mềm màu sắc của Romaji và Nghĩa tiếng Việt (chuyển sang xám khói hoặc trắng ngà tùy độ sáng của nền), giữ sự tập trung tuyệt đối vào Hán tự.

Phase 4: Cinematic Motion (Hiệu ứng chuyển động)
Tối ưu lại các hàm animation của Framer Motion để thao tác tay có cảm giác "lả lướt" hơn.

Tinh chỉnh Spring Physics: Giảm độ cứng (stiffness) và tăng độ nhún (damping) để khi vuốt, tấm thẻ bay đi và nảy lại mềm mại như trôi trong gió.

Hiệu ứng Lens Flare (Tia sáng lướt): Thêm một thẻ div chứa dải gradient trắng chéo, cấu hình animation lướt ngang qua mặt thẻ mỗi khi thực hiện thao tác Lật (onFlip).

Fade-in Overlay: Chỉnh lại lớp màu phản hồi khi vuốt (Trái/Phải) sao cho nó loang ra nhẹ nhàng như màu nước thay vì hiện lên đột ngột.