function togglePassword() {
    const password = document.getElementById("password");
    const icon = document.querySelector(".password-toggle");

    if (password.type === "password") {
        password.type = "text";
        icon.classList.remove("bi-eye-slash");
        icon.classList.add("bi-eye");
    } else {
        password.type = "password";
        icon.classList.remove("bi-eye");
        icon.classList.add("bi-eye-slash");
    }
}

function login(event) {
    event.preventDefault();

    const username = document.getElementById("username").value;
    const message = document.getElementById("message");

    message.innerHTML = `
                <div class="alert alert-success">
                    ทดสอบล็อกอินสำเร็จ (Demo Mode)<br>
                    ยินดีต้อนรับ ${username}
                </div>
            `;
}