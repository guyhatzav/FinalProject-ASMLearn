var isOpen = false;

document.getElementById('btn_drafts').addEventListener('click', e => { toggleMenu() });

function closeMenu() {
	if (isOpen) { classie.remove(document.body, 'show-menu') }
	isOpen = false;
}
function toggleMenu() {
	if (isOpen) { classie.remove(document.body, 'show-menu') }
	else { classie.add(document.body, 'show-menu') }
	isOpen = !isOpen;
}



