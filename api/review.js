export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Метод не разрешён" });
  }

  const { table, name, rating, message } = req.body || {};

  const ratingNum = Number(rating);

  if (!message || typeof message !== "string" || message.trim() === "") {
    return res.status(400).json({ error: "Поле 'message' обязательно" });
  }

  if (!Number.isFinite(ratingNum) || ratingNum < 1 || ratingNum > 5) {
    return res.status(400).json({
      error: "Поле 'rating' должно быть числом от 1 до 5",
    });
  }

  // ⭐ Если оценка 4 или 5 — ничего не отправляем в Telegram
  if (ratingNum >= 4) {
    return res.status(200).json({
      success: true,
      redirectTo2gis: true,
      url: "https://2gis.kz/uralsk/firm/70000001069030477",
    });
  }

  // Только оценки 1–3 идут в Telegram
  const token = process.env.TELEGRAM_TOKEN;
  const chatId = process.env.CHAT_ID;

  if (!token || !chatId) {
    console.error("Отсутствуют переменные окружения");
    return res.status(500).json({
      error: "Сервер настроен некорректно",
    });
  }

  const text = `
📢 Новый отзыв

🍽 Стол: ${table || "-"}
👤 Имя: ${name || "Не указано"}
⭐ Оценка: ${ratingNum}/5

💬 Отзыв:
${message}
`;

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: chatId,
          text,
        }),
      }
    );

    if (!response.ok) {
      const errBody = await response.text();
      console.error(errBody);

      return res.status(502).json({
        error: "Не удалось отправить сообщение",
      });
    }

    return res.status(200).json({
      success: true,
      redirectTo2gis: false,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      error: "Внутренняя ошибка сервера",
    });
  }
}
