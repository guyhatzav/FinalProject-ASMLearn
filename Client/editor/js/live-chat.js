const msgsScroll = document.getElementById('chat-messages'), $messages = $('.messages-content');

$(window).on('load', () => { $messages.mCustomScrollbar() });

function updateScrollbar() { msgsScroll.scrollTop = msgsScroll.scrollHeight }

var m;
function setDate(name = '', official = false) {
  const d = new Date()
    if (m != d.getMinutes()) {
        m = d.getMinutes() < 10 ? `0${d.getMinutes()}` : `${d.getMinutes()}`;
        const h = d.getHours() < 10 ? `0${d.getHours()}` : `${d.getHours()}`;
        $(`<div class="timestamp">${h}:${m}  ${official ? ('•  ' + name + ' ✅') : ((name !== '') ? ('•  ' + name) : '')}</div >`).appendTo($('.message:last'));
    }
    else {
        $(`<div class="timestamp">${official ? (name + ' ✅') : name}</div>`).appendTo($('.message:last'));
    }
}

function insertMessage() {
    msg = $('.message-input').val();
    if ($.trim(msg) == '') { return false }
    $(`<div class="message message-personal">${msg}</div>`).appendTo($('.mCSB_container')).addClass('new');
    setDate();
    const send = {
        msg: $.trim(msg),
        uid: auth.currentUser.uid,
        name: auth.currentUser.displayName
    }
    if (auth.currentUser.photoURL != '') send.photoURL = auth.currentUser.photoURL;
    const msgKey = database.ref('chatRooms').child(taskID).push(send);
    msgKey.then(() => { database.ref('chatRooms').child(taskID).child(msgKey.key).remove() });
    $('.message-input').val(null);
    updateScrollbar();
    document.getElementById('ta_msgInput').style.height = '';

}
function ta_msgInputKeyPressed(o) {
    o.style.height = "";
    o.style.height = `${10 + o.scrollHeight}px`;
}

$('.message-submit').click(() => { insertMessage() });

$(window).on('keydown',  e => {
    if (e.which == 13 && isChatModalOpen) {
        insertMessage();
        return false;
    }
});
database.ref('chatRooms').child(taskID).on('child_added', snapshot => {
    if (String(snapshot.val().uid) !== auth.currentUser.uid) {
        $(`<div class="message new"><figure class="avatar"><img src="${snapshot.child('photoURL').exists() ? String(snapshot.val().photoURL) : 'dashboard/img/noImage.jpg'}" /></figure>${String(snapshot.val().msg)}</div >`).appendTo($('.mCSB_container')).addClass('new');
        setDate(String(snapshot.val().name), authorUID === String(snapshot.val().uid));
    }
});