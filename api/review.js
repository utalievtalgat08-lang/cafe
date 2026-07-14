export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { table, name, rating, message } = req.body;

  const text = `
📢 Новый отзыв

🍽 Стол: ${table || "-"}

👤 Имя: ${name || "Не указано"}

⭐ Оценка: ${rating}/5

💬 Отзыв:
${message}
`;

  const response = await fetch(
    `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendMessage`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: process.env.CHAT_ID,
        text,
      }),
    }
  );

  if (!response.ok) {
    return res.status(500).json({ error: "Telegram error" });
  }

  res.status(200).json({ success: true });
}