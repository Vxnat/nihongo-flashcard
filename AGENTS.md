<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Gamification Currency Rules
- `coins` in the codebase refers to **Bones (Xương)**.
- `goldenFur` in the codebase refers to **Coins (Xu Vàng)**.
- Therefore, when displaying values or items associated with `coins`, always use the Lucide icon `Bone` (usually rotated 45 degrees for a cute visual) instead of `Coins` or any gold coin graphics/icons.
- Change any text labels showing "Xu kiếm được" or similar for `coins` to "Xương" or "Xương kiếm được".

# Icon and Emoji Rules
- Nghiêm cấm sử dụng các ký tự emoji trong giao diện người dùng (UI).
- Chỉ sử dụng các icon từ thư viện Lucide (Lucide icons) để làm biểu tượng minh họa.
