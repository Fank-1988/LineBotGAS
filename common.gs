// ส่งข้อความตอบกลับไปยัง LINE
function replyMessages(messages, replyToken) {
  var LINE_REPLY_ENDPOINT = 'https://api.line.me/v2/bot/message/reply';
  UrlFetchApp.fetch(LINE_REPLY_ENDPOINT, {
    'headers': {
      'Content-Type': 'application/json; charset=UTF-8',
      'Authorization': 'Bearer ' + CHANNEL_ACCESS_TOKEN,
    },
    'method': 'post',
    'payload': JSON.stringify({
      'replyToken': replyToken,
      'messages': messages || [{
        type: "text",
        text: "เกิดข้อผิดพลาด"// แก้ไขล่าสุด: เปลี่ยนข้อความแจ้งเตือนเป็นภาษาไทย
      }],
    }),
  });
}

function getGoogleCalendarLink(datetime) {
  var getUTC = function(date) {
    return date.getUTCFullYear() +
      zfill(date.getUTCMonth() + 1) +
      zfill(date.getUTCDate()) +
      'T' +
      zfill(date.getUTCHours()) +
      zfill(date.getUTCMinutes()) +
      zfill(date.getUTCSeconds()) +
      'Z';
  };
  
  // ฟังก์ชันสำหรับเติมเลข 0 ข้างหน้าตัวเลขที่มีหลักเดียว
  var zfill = function(num) {
    return ('0' + num).slice(-2);
  };

    // แก้ไขล่าสุด: เปลี่ยนข้อความเป็นภาษาไทย
  return 'http://www.google.com/calendar/event?' +
    'action=' + 'TEMPLATE' +
    '&text=' + encodeURIComponent('การออกกำลังกายกับเพื่อน') +
    '&details=' + encodeURIComponent('') +
    '&location=' + encodeURIComponent('') +
    '&dates=' + getUTC(datetime) + '/' + getUTC(datetime.addHours(1)) +
    '&trp=' + 'false' +
    '&sprop=' + encodeURIComponent('ลิงก์ต้นทาง') +
    '&sprop=' + 'name:' + encodeURIComponent('LINE bot');
}

function getProfile(userId, token) {
  var url = "https://api.line.me/v2/bot/profile/" + userId.toString();
  var params = {
    headers: {
      Authorization: "Bearer " + token.toString()
    }
  };
  var response = UrlFetchApp.fetch(url, params);
  var json = response.getContentText();
  var data = JSON.parse(json);
  return data;
}
