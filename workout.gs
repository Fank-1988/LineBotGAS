var workout = {
  sheet: SpreadsheetApp.getActive().getSheetByName('workout'),
  create: function(userId, messageId) {
    var timestamp = new Date()
    this.sheet.appendRow([userId, timestamp.getTime(), timestamp.toString(), messageId]);
  },
  /**
   * ฟังก์ชันอ่านข้อมูลการออกกำลังกาย
   * @param  {[string]} userId [ID ผู้ใช้ Line]
   * @param  {[date]} from [ดึงข้อมูลที่มี timestamp มากกว่า from]
   * @param  {[date]} to   [ดึงข้อมูลที่มี timestamp น้อยกว่า to]
   * @return {[array]}     [[userid, unixtime], [userid, unixtime], ...]
   */
  read: function(userId, from, to) {
    var data = this.sheet.getDataRange().getValues();
    data = data.slice(1, data.length); // ลบส่วนหัวตาราง
    if (userId) {
      data = data.filter(function(row) {
        return row[0] === userId
      });
    }
    if (from) {
      var from_unixtime = from.getTime();
      data = data.filter(function(row) {
        return parseInt(row[1]) > from_unixtime;
      });
    }
    if (to) {
      var to_unixtime = to.getTime();
      data = data.filter(function(row) {
        return parseInt(row[1]) < to_unixtime;
      });
    }
    return data;
  },
  clean: function() {
    var date = new Date();
    var firstDate = new Date(date.getFullYear(), date.getMonth(), 1);
    var firstDateTimestamp = firstDate.getTime();
    for (var i = data.length - 1; i >= 0; i--) {
      var row = data[i];
      if (parseInt(row[1]) < firstDateTimestamp) {
        this.sheet.deleteRow(i + 1);
      }
    }
  },
  count: function(userId, from, to) {
    var data = this.read(userId, from, to);
    var userIds = data.map(function(row) {
      return row[0];
    }); // ตัวอย่าง: [usrid1, userid2, userid2]
    var counted = userIds.reduce(function(accum, userId) {
      if (userId in accum) {
        accum[userId]++;
      } else {
        accum[userId] = 1;
      }
      return accum;
    }, {}); // ตัวอย่าง: {userid1: 1, userid2: 2}
    var sorted = Object.keys(counted).map(function(key) {
      return [key, counted[key]];
    }).sort(function(a, b) {
      return b[1] - a[1];
    });
    return sorted; // ตัวอย่าง: [[userid2, 2], [userid1, 1]]
  }
}
