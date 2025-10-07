"use client";

import { Editor } from "@tinymce/tinymce-react";

/**
 * ✅ RichTextEditor Component
 * ใช้ง่าย ปลอดภัย ไม่มีปัญหา SSR และให้ HTML สะอาดสุด
 */
export default function RichTextEditor({ value, onChange }) {
  return (
    <div className="rounded-lg border bg-white">
      <Editor
        apiKey="5hc6djpdmfv1m4z49fn07b1t7ddzhfv0s48ra3ad23h82obj"
        value={value}
        onEditorChange={onChange}
        init={{
          height: 400,
          menubar: false,
          plugins: "lists link image code table fullscreen",
          toolbar:
            "undo redo | blocks | bold italic underline | bullist numlist | link image | code fullscreen",
          branding: false,
          content_style: "body { font-family:Inter, sans-serif; font-size:14px; }",
        }}
      />
    </div>
  );
}
