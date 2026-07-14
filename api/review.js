export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Метод не разрешён" });
  }

  const { table, name, rating, message } = req.body || {};

  const ratingNum = Number(rating);

  // Проверка обязательных полей
  if (!message || typeof message !== "string" || message.trim() === "") {
    return res.status(400).json({ error: "Поле 'message' обязательно" });
  }

  if (!Number.isFinite(ratingNum) || ratingNum < 1 || ratingNum > 5) {
    return res.status(400).json({
      error: "Поле 'rating' должно быть числом от 1 до 5",
    });
  }

  // Проверка переменных окружения
  const token = process.env.TELEGRAM_TOKEN;
  const chatId = process.env.CHAT_ID;

  if (!token || !chatId) {
    console.error("Отсутствуют TELEGRAM_TOKEN или CHAT_ID");
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
      console.error("Ошибка Telegram API:", errBody);

      return res.status(502).json({
        error: "Не удалось отправить сообщение в Telegram",
      });
    }

    // Возвращаем информацию для сайта
    return res.status(200).json({
      success: true,
      redirectTo2gis: ratingNum >= 4,
      url: "https://2gis.kz/uralsk/firm/70000001069030477",
    });

  } catch (err) {
    console.error("Ошибка:", err);

    return res.status(500).json({
      error: "Внутренняя ошибка сервера",
    });
  }
}
