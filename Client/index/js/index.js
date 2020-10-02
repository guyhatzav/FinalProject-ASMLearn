if (window.localStorage.getItem('isLoggedIn') === '1') { window.location = 'dashboard.html' }

const auth = firebase.auth();
const btnLogin = document.getElementById('btn_send_login');
const btnSignup = document.getElementById('btn_send_signup');
alertify.set({ delay: 3000 });

btnLogin.addEventListener('click', e => {
    const email = String(document.getElementById('txb_login_email').value).trim();
    const password = String(document.getElementById('txb_login_password').value).trim();
    if (email != '' && password != '') {
        if (email.includes("@") && email.includes(".")) {
            btnLogin.classList.add("onclic");
            auth.signInWithEmailAndPassword(email, password).then(() => {
                window.localStorage.setItem('loggedin', '1');
                btnLogin.classList.remove("onclic");
                btnLogin.classList.add("validate");
                setTimeout(() => { btnLogin.classList.remove("validate"); toggleMenu(); }, 500);
            }).catch(error => {
                alertify.error('⚠️ הדוא"ל או הסיסמה שגויים');
                btnLogin.classList.remove("onclic");
            });
        }
        else { alertify.log('📧 שדה הדוא"ל אינו חוקי');
        }
    }
    else { alertify.log('ℹ️ יש למלא את כל השדות') }
});
document.getElementById('divMainForm').addEventListener('click', e => { closeMenu() });

var isARobot = true;
function recaptch_callback() { isARobot = false }

btnSignup.addEventListener('click', e => {
    if (isARobot) { alertify.log('ℹ️ אנחנו צריכים שתוכיח/י לנו שאינך רובוט') }
    else {
        const email = String(document.getElementById('txb_signup_email').value).trim();
        const password = String(document.getElementById('txb_signup_password').value).trim();
        const name = String(document.getElementById('txb_signup_name').value).trim();
        if (email != '' && password != '' && name != '') {
            if (email.includes("@") && email.includes(".")) {
                if (password.length > 6) {
                    btnSignup.classList.add("onclic");
                    auth.createUserWithEmailAndPassword(email, password).then(() => {
                        auth.currentUser.updateProfile({ displayName: name }).then(() => {
                            window.localStorage.setItem('loggedin', '1');
                            btnSignup.classList.remove("onclic");
                            btnSignup.classList.add("validate");
                            setTimeout(() => { btnSignup.classList.remove("validate"); toggleMenu(); }, 500);
                            window.location = 'dashboard.html';
                        }).catch(error => {
                            // An error happened.
                        });
                    }).catch(error => {
                        switch (error.code) {
                            case 'auth/email-already-in-use': alertify.log('ℹ️ .כתובת המייל כבר נמצאת בשימוש. נסה/י להתחבר בחלון ההתחברות'); break;
                            default: alertify.error('⚠️ התרחשה שגיאה לא צפויה'); break;
                        }
                        btnSignup.classList.remove("onclic");
                    });
                }
                else { alertify.log('ℹ️ על הסיסמה להכיל לפחות 6 תווים') }
            }
            else { alertify.log('📧 שדה הדוא"ל אינו חוקי') }
        }
        else { alertify.log('ℹ️ יש למלא את כל השדות') }
    }
});

function loginTextInputKeyPressed() {
    if (event.key === 'Enter') { btnLogin.click() }
}
function signupTextInputKeyPressed() {
    if (event.key === 'Enter') { btnSignup.click()  }
}

$(document).ready(function () {
    $('.has-animation').each(function (index) {
        $(this).delay($(this).data('delay')).queue(function () {
            $(this).addClass('animate-in');
        });
    });
});

auth.onAuthStateChanged(user => { if (user) { window.location = 'dashboard.html' } });