from flask import Flask, render_template, request, session, redirect, url_for
from routes.resources_review import resources_bp
from database import db
from models.equipment import Equipment
from models.place import Place
from models.place_equipment import PlaceEquipment
from models.qa_question import Question
from routes.resources_manager import register_resources_routes
from routes.qa import qa_bp
import os

# สร้าง Flask app
app = Flask(__name__, instance_relative_config=True)

# Secret key (ใช้กับ session)
app.secret_key = "dev_secret_key"

# Database Config
db_path = os.path.join(app.instance_path, "resources.db")

app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{db_path}"
app.config["SQLALCHEMY_BINDS"] = {"qa": "sqlite:///qa.db"}
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False


db.init_app(app)

os.makedirs(app.instance_path, exist_ok=True)

# ---------------------------
# Resources System
# ---------------------------
# หน้าดูข้อมูลสถานที่และอุปกรณ์
app.register_blueprint(resources_bp)

# เพิ่มข้อมูลสถานที่หรืออุปกรณ์ (สำหรับสโมสรนักศึกษา, เจ้าหน้าที่)
register_resources_routes(app)


# Mock Login (สำหรับทดสอบ)
@app.route("/test-login-club")
def test_login_club():
    session["role"] = "club"
    session["student_id"] = "สโมสรนักศึกษาทดสอบ"
    return redirect(url_for("manage_resources"))


# ---------------------------
# Q&A System
# ---------------------------
app.register_blueprint(qa_bp)


# ---------------------------
# Logout (ทดสอบ)
# ---------------------------
@app.route("/logout", methods=["POST"])
def logout():
    session.clear()
    return redirect("/")


# ---------------------------
# Create Tables
with app.app_context():
    db.create_all()


# ---------------------------
# Run Server
if __name__ == "__main__":
    app.run(debug=True, port=5000)
