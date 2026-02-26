from flask import Flask, render_template, request, session, redirect, url_for

app = Flask(__name__)

@app.route("/")
def login():
    return render_template("Login.html")  # แสดงหน้าเข้าสู่ระบบ

# 12. จัดการสถานที่และอุปกรณ์ (ผู้ดูแล: ณัฐดนัย ทองสรรค์)

# แสดงรายการสถานที่และอุปกรณ์
@app.route("/resources1", methods=["GET"])
def list_resources():
    return render_template("room_01.html")  # แสดงหน้าแหล่งข้อมูล

# เพิ่มข้อมูลสถานที่หรืออุปกรณ์
@app.route("/resources2", methods=["GET", "POST"]) # ลบ GET ออกเพื่อให้แสดงหน้าเพิ่มข้อมูลเท่านั้น
def create_resource():
    return render_template("room_2.html")  # แสดงหน้าเพิ่มข้อมูล


# 15. ระบบถาม-ตอบ (Q&A) สโมสรกับนักศึกษา ผู้ดูแล ณัฐดนัย ทองสรรค์

# แสดงคำถามทั้งหมด
@app.route("/qa/questions", methods=["GET"])
def list_questions():
    return render_template("QA.html")  

# สร้างคำถามใหม่
@app.route("/qa/questions", methods=["POST"])
def create_question():
    # บันทึกคำถามใหม่เข้าสู่ระบบ
    pass

# ตอบคำถามตาม id
@app.route("/qa/questions/<int:id>/answer", methods=["POST"])
def answer_question(id):
    # บันทึกคำตอบของสโมสร
    pass


# Run Server
if __name__ == "__main__":
    # รันเซิร์ฟเวอร์ในโหมด debug สำหรับพัฒนา
    app.run(debug=True, port=5000)