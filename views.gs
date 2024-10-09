function generateQuickReplyTopMessage() {
  return {
    type: "text",
    text: "กรุณาเลือกเมนู",
    quickReply: {
      items: [{
          type: "action",
          imageUrl: "https://www.newsclick.in/sites/default/files/2018-03/rese12.jpg",
          action: {
            type: "postback",
            label: "จอง",
            displayText: "แสดงเมนูการจอง",
            data: JSON.stringify({
              state: "RESERVATION"
            })
          }
        },
        {
          type: "action",
          imageUrl: "https://content.active.com/Assets/Active.com+Content+Site+Digital+Assets/Fitness/580x350/Push-Up.jpg",
          action: {
            type: "postback",
            label: "ออกกำลังกาย",
            displayText: "แสดงเมนูการออกกำลังกาย",
            data: JSON.stringify({
              state: "WORKOUT"
            })
          }
        }
      ]
    }
  }
}


// --------
// มุมมองการจอง
// --------

function generateQuickReplyReservationMessage() {

  // เพิ่ม 9 ชั่วโมงเพราะ ISO timezone เป็น zero offset กับ UTC เสมอ ดังที่แสดงด้วยคำต่อท้าย "Z"
  var initialDatetimeString = new Date().toLINEString();
  var maxDatetimeString = new Date().addHours(24 * 14).toLINEString();

  return {
    type: "text",
    text: "แสดงเมนูการจอง",
    quickReply: {
      items: [{
          type: "action",
          imageUrl: "https://upload.wikimedia.org/wikipedia/en/8/86/Modern-ftn-pen-cursive.jpg",
          action: {
            type: "postback",
            label: "จองใหม่",
            displayText: "จองใหม่",
            data: JSON.stringify({
              state: "RESERVATION_CREATE"
            })
          }
        },
        {
          type: "action",
          imageUrl: "https://techflourish.com/images/clipart-calendar-august-2015-22.jpg",
          action: {
            type: "postback",
            label: "ตรวจสอบการจอง",
            displayText: "ตรวจสอบการจอง",
            data: JSON.stringify({
              state: "RESERVATION_READ"
            })
          }
        },
        {
          type: "action",
          imageUrl: "https://vignette.wikia.nocookie.net/oscarthegrouch/images/b/be/Trash_Can.jpg/revision/latest?cb=20120928224249",
          action: {
            type: "postback",
            label: "ลบการจอง",
            displayText: "ลบการจอง",
            data: JSON.stringify({
              state: "RESERVATION_DELETE"
            })
          }
        },
        {
          type: "action",
          imageUrl: "https://pickup.cinemacafe.net/uploads/article/image/1906/card_haul.jpg",
          action: {
            type: "postback",
            label: "กลับไปหน้าแรก",
            displayText: "กลับไปหน้าแรก",
            data: JSON.stringify({
              state: "ROOT"
            })
          }
        }
      ]
    }
  }
}

function generateMessageForCreateReservationByFlex() {
  // วิธีนี้ค่อนข้างซับซ้อนและขาดความทั่วไป
  // ขั้นแรก สร้างอาร์เรย์ที่มีทุก 30 นาทีตั้งแต่ตอนนี้
  // โดยเริ่มจากนาทีที่ 0 ไปจนถึงสองสัปดาห์ข้างหน้า จากนั้นกรองเพื่อ
  // ให้ได้วันที่และเวลาที่ถูกต้อง แล้วกรองอีกครั้งเพื่อตัดวันที่และเวลาที่ถูกจองแล้วออก
  var unoccupied_candidate = [];
  var datetime = new Date();
  datetime.setMinutes(0, 0, 0);
  datetime.setHours(datetime.getHours() + 1);

  // สร้างอาร์เรย์ที่มี Date ทุก 30 นาทีตั้งแต่ตอนนี้ไปจนถึงสองสัปดาห์
  for (var i = 0; i < 14 * 24 * 60; i += 30) {
    var ele_datetime = new Date(datetime.getTime())
    ele_datetime.setMinutes(ele_datetime.getMinutes() + i);
    unoccupied_candidate.push(ele_datetime);
  }
  var counted = reservation.countReservation(new Date(), null);

  var unoccupied = unoccupied_candidate.filter(function(datetime) {
    return isValidReservationDatetime(datetime);
  }).filter(function(datetime) {
    var timestamp = datetime.getTime();
    var isOccupied = false;
    if (counted.hasOwnProperty(timestamp)) {
      if (counted[timestamp] >= 6) {
        isOccupied = true;
      }
    }
    return !isOccupied;
  });

  var buttons = unoccupied.map(function(datetime) {
    return {
      type: "button",
      style: "link",
      action: {
        type: "postback",
        label: datetime.toJPString(),
        displayText: datetime.toJPString(),
        data: JSON.stringify({
          state: "RESERVATION_CREATE_CONFIRMATION",
          timestamp: datetime.getTime()
        })
      }
    }

  })

  return {
    type: "flex",
    altText: "นี่คือข้อความ Flex",
    contents: {
      type: "carousel",
      contents: [{
        type: "bubble",
        header: {
          type: "box",
          layout: "vertical",
          contents: [{
            type: "text",
            text: "จอง"
          }]
        },
        body: {
          type: "box",
          layout: "vertical",
          contents: buttons
        }
      }]
    }
  };
}

function generateMessageForConfirmReservation(event) {
  var userId = event.source.userId;

  if (event.postback.hasOwnProperty("params")) {
    // datetimepicker
    // event.postback.params.datetime อยู่ในรูปแบบเช่น "2018-11-05T21:00"
    var reservationDatetime = new Date(event.postback.params.datetime);
    var reservationTimestamp = reservationDatetime.getTime();
  } else if (event.postback.hasOwnProperty("data")) {
    // postback
    var data = JSON.parse(event.postback.data);
    var reservationTimestamp = data.timestamp;
    var reservationDatetime = new Date(reservationTimestamp);
  }
  var counted = reservation.countReservation(new Date(), null);

  if (!isValidReservationDatetime(reservationDatetime)) {
    return {
      type: "text",
      text: reservationDatetime.toJPString() + "เป็นเวลาที่ไม่รับการจอง"
    }
  }

  if (counted.hasOwnProperty(reservationTimestamp)) {
    if (counted[reservationTimestamp] >= 6) {
      return {
        type: "text",
        text: reservationDatetime.toJPString() + "เต็มแล้ว กรุณาลองเวลาอื่น"
      };
    }
  }

  reservation.createReservation(userId, reservationDatetime);
  return {
    type: "text",
    text: reservationDatetime.toJPString() + "ได้รับการจองแล้ว คุณสามารถเพิ่มลงใน Calendar ได้จากลิงก์นี้:\n" + getGoogleCalendarLink(reservationDatetime)
  };
}

function generateMessageForReadReservation(event, getProfile, CHANNEL_ACCESS_TOKEN) {
  var userId = event.source.userId;
  var reservations = reservation.readReservation(userId, new Date());
  var text = reservations.map(function(row) {
    return new Date(parseInt(row[1])).toJPString() + ' ' + getProfile(row[0], CHANNEL_ACCESS_TOKEN).displayName;
  }).join("\n");
  text = text || "ไม่มีการจอง";

  return {
    type: "text",
    text: text
  };
}

function generateMessageForDeleteReservation(event) {
  var userId = event.source.userId;
  var reservations = reservation.readReservation(userId, new Date());

  if (reservations.length === 0) {
    return {
      type: "text",
      text: 'ไม่มีการจอง'
    };
  }

  var actions = reservations.map(function(row) {
    var timestamp = parseInt(row[1]);
    return {
      type: "button",
      style: "link",
      action: {
        type: "postback",
        label: new Date(timestamp).toJPString(),
        displayText: new Date(timestamp).toJPString(),
        data: JSON.stringify({
          state: "RESERVATION_DELETE_CONFIRMATION",
          userId: userId,
          timestamp: timestamp
        })
      }
    }
  });

  return {
    type: "flex",
    altText: "นี่คือข้อความ Flex",
    contents: {
      type: "carousel",
      contents: [{
        type: "bubble",
        header: {
          type: "box",
          layout: "vertical",
          contents: [{
            type: "text",
            text: "ลบการจอง"
          }]
        },
        body: {
          type: "box",
          layout: "vertical",
          contents: actions
        }
      }]
    }
  };
}

function generateMessageForDeleteReservationConfirmation(event, getProfile, CHANNEL_ACCESS_TOKEN) {
  var userId = event.source.userId;
  var data = JSON.parse(event.postback.data);
  var response = reservation.deleteReservation(userId, data.timestamp);
  var text;
  if (response.status == 200) {
    text = "ลบการจองของคุณ " + getProfile(userId, CHANNEL_ACCESS_TOKEN).displayName + " วันที่ " + new Date(data.timestamp).toJPString() + " แล้ว";
  } else if (response.status == 404) {
    text = "การจองของคุณ " + getProfile(userId, CHANNEL_ACCESS_TOKEN).displayName + " วันที่ " + new Date(data.timestamp).toJPString() + " ถูกลบไปแล้ว";
  }
  return {
    type: "text",
    text: text
  };
}

// --------
// มุมมองการออกกำลังกาย
// --------

function generateQuickReplyWorkoutMessage() {
  return {
    type: "text",
    text: "แสดงเมนูการออกกำลังกาย",
    quickReply: {
      items: [{
          type: "action",
          imageUrl: "https://us.123rf.com/450wm/newartgraphics/newartgraphics1402/newartgraphics140200108/26170093-red-round-speech-bubble-with-video-icon.jpg?ver=6",
          action: {
            type: "camera",
            label: "เพิ่มจำนวนครั้งการออกกำลังกาย",
          }
        },
        {
          type: "action",
          imageUrl: "https://is5-ssl.mzstatic.com/image/thumb/Purple118/v4/c5/82/c4/c582c405-d78a-ba21-795d-560f19fef45a/AppIcon-1x_U007emarketing-85-220-0-6.png/246x0w.jpg",
          action: {
            type: "postback",
            label: "ตรวจสอบจำนวนครั้ง",
            displayText: "ตรวจสอบจำนวนครั้งการออกกำลังกายเดือนนี้",
            data: JSON.stringify({
              state: "WORKOUT_COUNT"
            })
          }
        },
        {
          type: "action",
          imageUrl: "https://pickup.cinemacafe.net/uploads/article/image/1906/card_haul.jpg",
          action: {
            type: "postback",
            label: "กลับไปหน้าแรก",
            displayText: "กลับไปหน้าแรก",
            data: JSON.stringify({
              state: "ROOT"
            })
          }
        }
      ]
    }
  }
}

function generateMessageForAddWorkout(event) {
  var userId = event.source.userId;
  var messageId = event.message.id
  workout.create(userId, messageId);
  var today = new Date();
  var firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  var count = workout.count(userId, firstDay)[0][1]; // workout.count() returns [[userid, count]];
  var message = {
    type: "text",
    text: "เยี่ยมมาก! คุณออกกำลังกายครั้งที่ " + count + ' ของเดือนนี้แล้ว'
  };
  return message;
}

function generateMessageForRandomMaxim() {
  var message = {
    type: "text",
    text: maxim.readMaxim()[0]
  };
  return message;
}

function generateMessageForCountWorkout(event, getProfile, CHANNEL_ACCESS_TOKEN) {
  var userId = event.source.userId;
  var date = new Date();
  var monthToCount = date.getMonth() + 1;
  var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 1);

  var counts = workout.count(userId, firstDay, lastDay);
  var text = counts.map(function(row) {
    return 'คุณ' + getProfile(row[0], CHANNEL_ACCESS_TOKEN).displayName + ' ออกกำลังกายในเดือน ' + monthToCount.toString() + ' จำนวน ' + row[1].toString() + ' ครั้ง';
  }).join('\n').toString();
  text = text || 'ไม่มีบันทึกการออกกำลังกาย';

  return {
    type: "text",
    text: text
  };
}

// --------
// ข้อความต้อนรับเมื่อคุณเพิ่มแชทบอทเป็นเพื่อน
// --------

function generateWelcomeMessage() {
  return {
    type: "text",
    text: "＜เกี่ยวกับจำนวนครั้งของการออกกำลังกาย＞\n" +
      "ในบัดดี้เทรน เราจะนับ:\n" +
      "・เมื่อคุณอัพโหลดวิดีโอการออกกำลังกายด้วยตัวเอง\n" +
      "・เมื่อคุณอัพโหลดวิดีโอการออกกำลังกายที่บัดดี้เทรน\n" +
      "เงื่อนไขคือวิดีโอต้องยาวอย่างน้อย 1 วินาที ไม่มีข้อกำหนดอื่นๆ\n" +
      "แต่ต้องเป็นการออกกำลังกายที่มีความเข้มข้นสูงอย่างน้อย 30 นาที\n" +
      "กรุณาอย่าอัพโหลดวิดีโอเพื่อวัตถุประสงค์อื่น\n" +
      "เมื่ออัพโหลด บอทจะจดจำพร้อมกับคำคมจากผู้นำหรือนักเพาะกายในอดีต\n" +
      "คำคมเหล่านี้เพียงเพื่อสร้างแรงบันดาลใจ ไม่มีความหมายลึกซึ้งอะไร เป็นเพียงมุกตลกของเรา 😄\n" +
      "ทุกเดือน ผู้ที่ออกกำลังกายมากที่สุดจะได้รับโปรตีนหรือ \"เผาผลาญ\" และอันดับสองจะได้รับ BCAA\n" +
      "\n" +
      "＜เกี่ยวกับการยกเลิก＞\n" +
      "ต่อไปนี้จะจำกัดที่ 6 คนต่อช่วงเวลา บอทที่เราทดลองใช้มาจนถึงตอนนี้จะถูกนำมาใช้งานจริง ไม่สามารถจองได้เกิน 6 คนต่อช่วงเวลา\n" +
      "หากไม่สามารถเข้าร่วมได้ กรุณายกเลิกล่วงหน้าอย่างน้อย 1 ชั่วโมง\n" +
      "หากมีการยกเลิกโดยไม่แจ้งล่วงหน้าบ่อยครั้ง เราอาจต้องพิจารณามาตรการเพิ่มเติม\n" +
      "ในทางกลับกัน หากสถานการณ์ที่จองเต็มอย่างรวดเร็วยังคงดำเนินต่อไป เราจะพิจารณาเพิ่มคลาส โดยทั่วไปเราตั้งใจจะดำเนินการในช่วงเวลาที่ทุกคนสามารถมาได้ คือประมาณ 19:00-23:00 น."
  };
}

// --------
// มุมมองของผู้ดูแลระบบ
// --------

function generateQuickReplyAdminMessage() {
  return {
    type: "text",
    text: "กรุณาเลือกเมนูสำหรับผู้ดูแลระบบ",
    quickReply: {
      items: [{
          type: "action",
          imageUrl: "https://www.newsclick.in/sites/default/files/2018-03/rese12.jpg",
          action: {
            type: "postback",
            label: "แสดงการจองของทุกคน",
            displayText: "แสดงการจองของทุกคน",
            data: JSON.stringify({
              state: "ADMIN_RESERVATION_READ"
            })
          }
        },
        {
          type: "action",
          imageUrl: "https://content.active.com/Assets/Active.com+Content+Site+Digital+Assets/Fitness/580x350/Push-Up.jpg",
          action: {
            type: "postback",
            label: "แสดงจำนวนครั้งออกกำลังกายของทุกคน",
            displayText: "แสดงจำนวนครั้งออกกำลังกายของทุกคน",
            data: JSON.stringify({
              state: "ADMIN_WORKOUT_COUNT"
            })
          }
        },
        {
          type: "action",
          imageUrl: "https://pickup.cinemacafe.net/uploads/article/image/1906/card_haul.jpg",
          action: {
            type: "postback",
            label: "แสดงเมนูทั่วไป",
            displayText: "แสดงเมนูทั่วไป",
            data: JSON.stringify({
              state: "ROOT"
            })
          }
        }
      ]
    }
  }
}

function generateMessageForReadAllReservation() {
  var date = new Date();
  var countsObj = reservation.countReservation(new Date(date.getFullYear(), date.getMonth() - 3, 1), null);
  var counts = Object.keys(countsObj).map(function(key) {
    return [Number(key), countsObj[key]];
  });
  var latestMonth = new Date(counts[counts.length - 1][0]).getMonth() + 1;

  var latestCounts = counts.filter(function(row) {
    return new Date(row[0]).getMonth() + 1 === latestMonth;
  });
  var prevCounts = counts.filter(function(row) {
    return new Date(row[0]).getMonth() + 1 === latestMonth - 1;
  });
  var prevPrevCounts = counts.filter(function(row) {
    return new Date(row[0]).getMonth() + 1 === latestMonth - 2;
  });

  function convertArrToButtons(arr) {
    var contents = arr.map(function(row) {
      var JPString = new Date(parseInt(row[0])).toJPString();
      return {
        type: "button",
        style: "link",
        action: {
          type: "postback",
          label: JPString + " " + row[1] + "คน",
          displayText: JPString,
          data: JSON.stringify({
            state: "RESERVATION_RETRIEVE",
            timestamp: parseInt(row[0])
          })
        }
      }
    }) || {
      type: "text",
      text: "ไม่มีการจอง"
    };
    return contents;
  }

  var latestButtons = convertArrToButtons(latestCounts);
  var prevButtons = convertArrToButtons(prevCounts);
  var prevPrevButtons = convertArrToButtons(prevPrevCounts);

  return {
    type: "flex",
    altText: "นี่คือข้อความ Flex",
    contents: {
      type: "carousel",
      contents: [{
        type: "bubble",
        header: {
          type: "box",
          layout: "vertical",
          contents: [{
            type: "text",
            text: "เดือน " + latestMonth.toString()
          }]
        },
        body: {
          type: "box",
          layout: "vertical",
          contents: latestButtons
        }
      }, {
        type: "bubble",
        header: {
          type: "box",
          layout: "vertical",
          contents: [{
            type: "text",
            text: "เดือน " + (latestMonth - 1).toString()
          }]
        },
        body: {
          type: "box",
          layout: "vertical",
          contents: prevButtons
        }
      }, {
        type: "bubble",
        header: {
          type: "box",
          layout: "vertical",
          contents: [{
            type: "text",
            text: "เดือน " + (latestMonth - 2).toString()
          }]
        },
        body: {
          type: "box",
          layout: "vertical",
          contents: prevPrevButtons
        }
      }]
    }
  };
}

function generateMessageForRetrieveReservation(event, getProfile, CHANNEL_ACCESS_TOKEN) {
  var data = JSON.parse(event.postback.data);
  var res = reservation.retrieve(data.timestamp);
  var userIds = res.userIds;
  var users = userIds.map(function(userId) {
    return getProfile(userId, CHANNEL_ACCESS_TOKEN).displayName
  });

  return {
    type: "text",
    text: new Date(data.timestamp).toJPString() + "\n" + users.join('\n')
  };
}

function generateMessageForCountAllWorkouts(getProfile, CHANNEL_ACCESS_TOKEN) {
  var userToCount = null;
  var date = new Date();
  var latestMonth = date.getMonth() + 1;

  // เดือนล่าสุด
  var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 1);
  var countsThisMonth = workout.count(userToCount, firstDay, lastDay);

  // เดือนก่อนหน้า
  var prevMonth = latestMonth - 1;
  var firstDay = new Date(date.getFullYear(), date.getMonth() - 1, 1);
  var lastDay = new Date(date.getFullYear(), date.getMonth(), 1);
  var countsPrevMonth = workout.count(userToCount, firstDay, lastDay);

  function convertArrToButtons(arr) {
    if (arr.length === 0) {
      return [{
        type: "text",
        text: "ยังไม่มีบันทึก"
      }];
    }
    var contents = arr.map(function(row) {
      var name = getProfile(row[0], CHANNEL_ACCESS_TOKEN).displayName;
      return {
        type: "button",
        style: "link",
        action: {
          type: "postback",
          label: name.substring(0, 8) + ": " + row[1].toString() + "ครั้ง",
          displayText: name + ": " + row[1].toString() + "ครั้ง",
          data: JSON.stringify({
            state: "WORKOUT_RETRIEVE",
            timestamp: parseInt(row[0])
          })
        }
      }
    });
    return contents;
  }

  var latestButtons = convertArrToButtons(countsThisMonth);
  var prevButtons = convertArrToButtons(countsPrevMonth);

  return {
    type: "flex",
    altText: "นี่คือข้อความ Flex",
    contents: {
      type: "carousel",
      contents: [{
        type: "bubble",
        header: {
          type: "box",
          layout: "vertical",
          contents: [{
            type: "text",
            text: "เดือน " + latestMonth.toString()
          }]
        },
        body: {
          type: "box",
          layout: "vertical",
          contents: latestButtons
        }
      }, {
        type: "bubble",
        header: {
          type: "box",
          layout: "vertical",
          contents: [{
            type: "text",
            text: "เดือน " + prevMonth.toString()
          }]
        },
        body: {
          type: "box",
          layout: "vertical",
          contents: prevButtons
        }
      }]
    }
  };
}
