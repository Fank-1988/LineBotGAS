Date.prototype.addHours = function(h) {
  this.setTime(this.getTime() + (h * 60 * 60 * 1000));
  return this;
}

Date.prototype.toLINEString = function() {
  // แก้ไขล่าสุด: ปรับเวลาให้เป็นเวลาประเทศไทย (GMT+7)
  var thaiString = this.addHours(7).toISOString();
  var lineString = thaiString.substring(0, thaiString.length - 8);
  return lineString;
}

Date.prototype.toThaiString = function(includeTime) {
  // แก้ไขล่าสุด: เปลี่ยนชื่อฟังก์ชันและปรับให้แสดงวันเป็นภาษาไทย
  if (typeof includeTime === "undefined") {
    includeTime = true;
  }
  
  var result = "%Y-%m-%d(%a) %h:%M";
  var weekdays = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];
  result = result.replace('%Y-', '')
    .replace("%m", ("00" + (this.getMonth() + 1).toString()).slice(-2))
    .replace("%d", ("00" + this.getDate().toString()).slice(-2))
    .replace("%a", weekdays[this.getDay()]);
    
  if (includeTime) {
    result = result.replace("%h", ("00" + this.getHours().toString()).slice(-2))
      .replace("%M", ("00" + this.getMinutes().toString()).slice(-2));
  } else {
    result = result.replace(" %h:%M", "");
  }

  result = result.replace(/^\s*|\s*$/g, "");
  return result;
}
