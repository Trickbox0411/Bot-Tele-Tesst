// index.js
const TelegramBot = require("node-telegram-bot-api");

// Thay TOKEN bằng token của bạn
const TOKEN = "6960207780:AAGmlSrIUkQQ7MuFWdp20OZ3lUbv3Ep0JlQ";

// Khởi tạo bot ở chế độ polling
const bot = new TelegramBot(TOKEN, { polling: true });

// Lệnh /menu để hiện các nút quản trị
bot.onText(/\/menu/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, "Chọn chức năng quản trị:", {
    reply_markup: {
      keyboard: [
        ["👤 Danh sách thành viên", "🚫 Cấm thành viên"],
        ["🔇 Mute", "⚠️ Cảnh cáo"],
        ["📊 Thống kê", "⚙️ Cấu hình bot"]
      ],
      resize_keyboard: true
    }
  });
});

// Khi có thành viên mới vào nhóm
bot.on("new_chat_members", (msg) => {
  const chatId = msg.chat.id;
  const newMember = msg.new_chat_members[0];
  const name = newMember.first_name;

  bot.sendMessage(chatId, `Chào mừng ${name} đến nhóm!`, {
    reply_markup: {
      inline_keyboard: [
        [
          { text: "📋 Quy định nhóm", url: "https://t.me/your_rules_link" }
        ],
        [
          { text: "Kick", callback_data: `kick_${newMember.id}` },
          { text: "Mute", callback_data: `mute_${newMember.id}` }
        ]
      ]
    }
  });
});

// Xử lý callback khi bấm nút
bot.on("callback_query", async (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;

  if (data.startsWith("kick_")) {
    const userId = data.split("_")[1];
    try {
      await bot.banChatMember(chatId, userId);
      bot.sendMessage(chatId, `Đã kick thành viên ${userId}`);
    } catch (err) {
      bot.sendMessage(chatId, `Không thể kick: ${err.message}`);
    }
  }

  if (data.startsWith("mute_")) {
    const userId = data.split("_")[1];
    const until = Math.floor(Date.now() / 1000) + 3600; // mute 1 giờ
    try {
      await bot.restrictChatMember(chatId, userId, {
        permissions: {
          can_send_messages: false
        },
        until_date: until
      });
      bot.sendMessage(chatId, `Đã mute thành viên ${userId} trong 1 giờ`);
    } catch (err) {
      bot.sendMessage(chatId, `Không thể mute: ${err.message}`);
    }
  }

  bot.answerCallbackQuery(query.id);
});