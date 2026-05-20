"use client";

import { useState } from "react";
import { useMutation } from "@/lib/events";

export default function CommentForm({ post }: { post: string }) {
  const [body, setBody] = useState("");
  const { submit, loading, error, status } = useMutation("comment/submit");
  const submitted = status === 202;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;
    submit({ post, body: body.trim() });
  };

  if (submitted) {
    return <p className="comment-thanks">Comment submitted. Thanks.</p>;
  }

  return (
    <form className="comment-form" onSubmit={handleSubmit}>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Leave a comment..."
        rows={3}
        disabled={loading}
      />
      {error && <p className="comment-error">{error}</p>}
      <button type="submit" disabled={loading || !body.trim()}>
        {loading ? "Sending..." : "Submit"}
      </button>
    </form>
  );
}
