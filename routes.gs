// สร้างข้อความตอบกลับตามประเภทของอีเวนต์
function generateMessagesToEvent(event) {
  var messages = [];

  if (event.type === "message") {
    messages = messages.concat(generateMessagesToMessageEvent(event));

  } else if (event.type === "follow") {
    // กรณีผู้ใช้เริ่มติดตาม
  } else if (event.type === "unfollow") {
    // กรณีผู้ใช้เลิกติดตาม
  } else if (event.type === "join") {
    // กรณีบอทถูกเพิ่มเข้ากลุ่ม
    messages.push(generateWelcomeMessage());
    messages.push(generateQuickReplyTopMessage());

  } else if (event.type === "leave") {
    // กรณีบอทถูกลบออกจากกลุ่ม
  } else if (event.type === "postback") {
    // กรณีผู้ใช้เลือกตัวเลือกที่ส่งค่ากลับมา
    messages = generateMessagesToPostbackEvent(event);

  } else if (event.type === "beacon") {
    // กรณีผู้ใช้เข้าใกล้ beacon
  } else if (event.type === "accountLink") {
    // กรณีมีการเชื่อมต่อบัญชี
  }
  return messages;
}

// สร้างข้อความตอบกลับสำหรับอีเวนต์ประเภทข้อความ
function generateMessagesToMessageEvent(event) {
  var messageType = event.message.type;
  var messages = [];

  if (messageType === "text") {
    // กรณีข้อความเป็นตัวอักษร
    var messageToTextMessage = generateMessageToTextMessage(event);
    if (messageToTextMessage) { // ข้อความอาจเป็น null ขึ้นอยู่กับข้อความที่ได้รับ
      messages.push(messageToTextMessage);
    }

  } else if (messageType === "image") {
    // กรณีข้อความเป็นรูปภาพ
  } else if (messageType === "video") {
    // กรณีข้อความเป็นวิดีโอ
    messages.push(generateMessageForAddWorkout(event));
    messages.push(generateMessageForRandomMaxim());
    messages.push(generateQuickReplyWorkoutMessage());

  } else if (messageType === "audio") {
    // กรณีข้อความเป็นเสียง
  } else if (messageType === "file") {
    // กรณีข้อความเป็นไฟล์
  } else if (messageType === "location") {
    // กรณีข้อความเป็นตำแหน่ง
  } else if (messageType === "sticker") {
    // กรณีข้อความเป็นสติกเกอร์
  }
  return messages;
}

// สร้างข้อความตอบกลับสำหรับข้อความที่เป็นตัวอักษร
function generateMessageToTextMessage(event) {
  var userMessage = event.message.text;
  userMessage = userMessage.replace(/　/g, " "); // แทนที่ช่องว่างแบบเต็มด้วยช่องว่างแบบครึ่ง

  if (userMessage.match(/よく生きるとは/)) {
    return {
      type: "text",
      text: "「よく生きる」とは「幸福に生きる」ことではないことを知ること、それが決定的に重要なのだ。"
    };

  } else if (userMessage.match(/^(admin|Admin|ADMIN|root|Root|ROOT|管理|全員|管理者|管理用)$/)) {
    return generateQuickReplyAdminMessage();

  } else if (userMessage.match(/^debug$/)) {
    return generateMessageForCreateReservationByFlex();

  } else if (userMessage.match(/^.+$/)) {
    return generateQuickReplyTopMessage();
  }
}

// สร้างข้อความตอบกลับสำหรับอีเวนต์ประเภท postback
function generateMessagesToPostbackEvent(event) {
  var data = JSON.parse(event.postback.data);
  var messages = [];

  if (data.state === "ROOT") {
    // กรณีอยู่ที่เมนูหลัก
    messages.push(generateQuickReplyTopMessage());

  } else if (data.state === 'RESERVATION') {
    // กรณีอยู่ที่เมนูการจอง
    messages.push(generateQuickReplyReservationMessage());

  } else if (data.state === "RESERVATION_CREATE") {
    // กรณีสร้างการจอง
    messages.push(generateMessageForCreateReservationByFlex());
    messages.push(generateQuickReplyReservationMessage());

  } else if (data.state === "RESERVATION_CREATE_CONFIRMATION") {
    // กรณียืนยันการสร้างการจอง
    messages.push(generateMessageForConfirmReservation(event));
    messages.push(generateQuickReplyReservationMessage());

  } else if (data.state === "RESERVATION_READ") {
    // กรณีอ่านข้อมูลการจอง
    messages.push(generateMessageForReadReservation(event, getProfile, CHANNEL_ACCESS_TOKEN));
    messages.push(generateQuickReplyReservationMessage());

  } else if (data.state === "RESERVATION_DELETE") {
    // กรณีลบการจอง
    messages.push(generateMessageForDeleteReservation(event));
    messages.push(generateQuickReplyReservationMessage());

  } else if (data.state === "RESERVATION_DELETE_CONFIRMATION") {
    // กรณียืนยันการลบการจอง
    messages.push(generateMessageForDeleteReservationConfirmation(event, getProfile, CHANNEL_ACCESS_TOKEN));
    messages.push(generateQuickReplyReservationMessage());

  } else if (data.state === "WORKOUT") {
    // กรณีอยู่ที่เมนูการออกกำลังกาย
    messages.push(generateQuickReplyWorkoutMessage());

  } else if (data.state === "WORKOUT_COUNT") {
    // กรณีนับจำนวนการออกกำลังกาย
    messages.push(generateMessageForCountWorkout(event, getProfile, CHANNEL_ACCESS_TOKEN));
    messages.push(generateQuickReplyWorkoutMessage());

  } else if (data.state === "ADMIN_RESERVATION_READ") {
    // กรณีผู้ดูแลระบบอ่านข้อมูลการจองทั้งหมด
    messages.push(generateMessageForReadAllReservation());
    messages.push(generateQuickReplyAdminMessage());

  } else if (data.state === "RESERVATION_RETRIEVE") {
    // กรณีดึงข้อมูลการจอง
    messages.push(generateMessageForRetrieveReservation(event, getProfile, CHANNEL_ACCESS_TOKEN));
    messages.push(generateQuickReplyAdminMessage());

  } else if (data.state === "ADMIN_WORKOUT_COUNT") {
    // กรณีผู้ดูแลระบบนับจำนวนการออกกำลังกายทั้งหมด
    messages.push(generateMessageForCountAllWorkouts(getProfile, CHANNEL_ACCESS_TOKEN));
    messages.push(generateQuickReplyAdminMessage());
  }

  return messages;
}
