var isOpen = false, isOnSignIn = false;

document.getElementById('btn_login').addEventListener('click', e => {
	document.getElementById('login_menu').classList.remove('hided');
	document.getElementById('signup_menu').classList.add('hided');
	if (!isOpen || isOnSignIn) { toggleMenu() }
	isOnSignIn = true;
});
document.getElementById('btn_signup').addEventListener('click', e => {
	document.getElementById('login_menu').classList.add('hided');
	document.getElementById('signup_menu').classList.remove('hided');
	if (!isOpen || !isOnSignIn) { toggleMenu() }
	isOnSignIn = false;
});

function closeMenu() {
	if (isOpen) { classie.remove(document.body, 'show-menu') }
	isOpen = false;
}
function toggleMenu() {
	if (isOpen) { classie.remove(document.body, 'show-menu') }
	else { classie.add(document.body, 'show-menu') }
	isOpen = !isOpen;
}

