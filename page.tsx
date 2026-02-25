import { kv } from "@vercel/kv";
import { revalidatePath } from "next/cache";

export default async function GamePage() {
  // 1. Fetch comments from the database
  const comments = await kv.lrange("comments", 0, -1) || [];

  // 2. This function runs when someone clicks "Submit"
  async function addComment(formData: FormData) {
    "use server";
    const name = formData.get("name");
    const rating = formData.get("rating");
    const text = formData.get("comment");

    if (!text) return;

    // Save to Vercel's database
    await kv.lpush("comments", { name, rating, text, date: new Date().toLocaleDateString() });
    
    // Refresh the page to show the new comment
    revalidatePath("/");
  }

  return (
    <main style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Rate My Game! 🎮</h1>
      
      {/* Form to submit feedback */}
      <form action={addComment} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '40px' }}>
        <input name="name" placeholder="Your Name" style={{ padding: '8px' }} />
        <select name="rating" style={{ padding: '8px' }}>
          <option value="5">⭐⭐⭐⭐⭐ (Amazing)</option>
          <option value="4">⭐⭐⭐⭐ (Good)</option>
          <option value="3">⭐⭐⭐ (Okay)</option>
          <option value="2">⭐⭐ (Bad)</option>
          <option value="1">⭐ (Terrible)</option>
        </select>
        <textarea name="comment" placeholder="Write your thoughts..." required style={{ padding: '8px', minHeight: '80px' }} />
        <button type="submit" style={{ padding: '10px', background: '#0070f3', color: 'white', border: 'none', cursor: 'pointer' }}>
          Post Comment
        </button>
      </form>

      <hr />

      {/* Displaying the comments */}
      <h2>Recent Reviews</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {comments.map((c: any, i: number) => (
          <div key={i} style={{ borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
            <strong>{c.name || "Anonymous"}</strong> — {c.rating} Stars
            <p>{c.text}</p>
            <small style={{ color: '#888' }}>{c.date}</small>
          </div>
        ))}
      </div>
    </main>
  );
}
