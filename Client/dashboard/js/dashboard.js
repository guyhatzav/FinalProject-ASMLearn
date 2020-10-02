//firebase settings
const auth = firebase.auth();
const database = firebase.database();
const functions = firebase.functions();

const noProfileImageURL = "dashboard/img/noImage.jpg";

//Images from html
const img_profile = document.getElementById('profile-image');
const tasks_loading = document.getElementById('tasks_loading');

//Textboxes from html
const txt_username = document.getElementById('user-name');
const txt_tasksLeft = document.getElementById('unsolvedTasks');
const txt_changeUsername = document.getElementById('txbUsername');
const txt_changeEmail = document.getElementById('txbEmail');

const isStudentLabel = document.getElementById('isStudent'); /* User status label */

//Buttons from html
const btn_newTask = document.getElementById('new-task-btn');
const btn_changeProfileImage = document.getElementById('btn_changeProfileImage');

//Checkboxes from html
const cb_tasksSolved = document.getElementById('cb_tasksSolved');
const cb_tasksPartiallySolved = document.getElementById('cb_tasksPartiallySolved');
const cb_tasksLeft = document.getElementById('cb_tasksLeft');

const cb_easy = document.getElementById('cb_easy');
const cb_medium = document.getElementById('cb_medium');
const cb_hard = document.getElementById('cb_hard');

//Variables
var isTeacher = false, isAdmin = false;
var TasksSolved = 0;
var NumberOfTasks = 0;
var TasksLeft = 0;
var TasksPartiallySolved = 0;
var TasksAllWrong = 0;

var knownAuthors = new Map();

var tasksSolvedList = [];
var tasksPartiallySolvedList = [];

var isTasksSolvedChecked;
var isTasksPartiallySolvedChecked;
var isTasksLeftChecked;

function getQueriesHelper(queries, text = null) {
    if (Boolean(cb_easy.checked)) { queries.push(`1${text != null ? ('_' + text) : '' }`) }
    if (Boolean(cb_medium.checked)) { queries.push(`2${text != null ? ('_' + text) : '' }`) }
    if (Boolean(cb_hard.checked)) { queries.push(`3${text != null ? ('_' + text) : '' }`) }
}

//translates the checkboxes checks to string queries.
function getQueries() {
    if (isTasksSolvedChecked && isTasksPartiallySolvedChecked && isTasksLeftChecked) {
        isTasksLeftChecked = false;
        isTasksPartiallySolvedChecked = false;
        isTasksSolvedChecked = false;
    }

    const isEasyChecked = Boolean(cb_easy.checked);
    const isMediumChecked = Boolean(cb_medium.checked);
    const isHardChecked = Boolean(cb_hard.checked);

    const isMovArrayChecked = Boolean(document.getElementById('cb_category_movarray').checked);
    const isAritLogicChecked = Boolean(document.getElementById('cb_category_aritlogic').checked);
    const isLoopIfChecked = Boolean(document.getElementById('cb_category_loopif').checked);
    const isStackChecked = Boolean(document.getElementById('cb_category_stack').checked);
    const isSubroutinesChecked = Boolean(document.getElementById('cb_category_subroutines').checked);
    const isInterruptsChecked = Boolean(document.getElementById('cb_category_interrupts').checked);

    var queries = [];
    const isAtLeatOneDiffUp = isEasyChecked || isMediumChecked || isHardChecked;
    const isAtLeatOneSubjUp = isMovArrayChecked || isAritLogicChecked || isLoopIfChecked || isStackChecked || isSubroutinesChecked || isInterruptsChecked;

    const areAllDiffsUp = isEasyChecked && isMediumChecked && isHardChecked;
    const areAllSubjsUp = isMovArrayChecked && isAritLogicChecked && isLoopIfChecked && isStackChecked && isSubroutinesChecked && isInterruptsChecked;

    if (areAllDiffsUp && areAllSubjsUp) return queries;
    if (isAtLeatOneDiffUp && isAtLeatOneSubjUp) {
        if (isMovArrayChecked) { getQueriesHelper(queries, 'movarray') }
        if (isAritLogicChecked) { getQueriesHelper(queries, 'aritlogic') }
        if (isLoopIfChecked) { getQueriesHelper(queries, 'loopif') }
        if (isStackChecked) { getQueriesHelper(queries, 'stack') }
        if (isSubroutinesChecked) { getQueriesHelper(queries, 'subroutines') }
        if (isInterruptsChecked) { getQueriesHelper(queries, 'interrupts') }
    }
    else if (isAtLeatOneDiffUp && !isAtLeatOneSubjUp) { getQueriesHelper(queries) }
    else if (!isAtLeatOneDiffUp && isAtLeatOneSubjUp) {
        if (isMovArrayChecked) { queries.push('movarray') }
        if (isAritLogicChecked) { queries.push('aritlogic') }
        if (isLoopIfChecked) { queries.push('loopif') }
        if (isStackChecked) { queries.push('stack') }
        if (isSubroutinesChecked) { queries.push('subroutines') }
        if (isInterruptsChecked) { queries.push('interrupts') }
    }
    return queries;
}
//returns true iff were selected only checkbox in the difficulty category  
function isDifficultyOnly(item) {
    return (item === '1' || item === '2' || item === '3')
}
//returns true iff were selected only checkbox in the subject category
function isSubjectyOnly(item) {
    return (item === 'movarray' || item === 'aritlogic' || item === 'loopif' || item === 'stack' || item === 'subroutines' || item === 'interrupts')
}
document.getElementById('checklist-submit').addEventListener('click', e => {
    $("#taskslist").empty(); 
    $(".checklist-submit").addClass("loading");
    isTasksSolvedChecked = Boolean(cb_tasksSolved.checked);
    isTasksPartiallySolvedChecked = Boolean(cb_tasksPartiallySolved.checked);
    isTasksLeftChecked = Boolean(cb_tasksLeft.checked);
    const queries = getQueries();
    
    if (queries.length === 0) { getTaskByCategory('name') }
    else {
        queries.forEach(item => {
            if (isDifficultyOnly(item)) { getTaskByCategory('difficulty', Number(item)) }
            else if (isSubjectyOnly(item)) { getTaskByCategory('subject', item) }
            else { getTaskByCategory('query', item) }
        });
    }
});
function getTaskByCategory(orderBy, equalTo = null) {
    ((equalTo == null) ? database.ref('menuTasksInfo').orderByChild(orderBy) : database.ref('menuTasksInfo').orderByChild(orderBy).equalTo(equalTo)).once('value', snapshot => {
        if (isTasksSolvedChecked || isTasksPartiallySolvedChecked || isTasksLeftChecked) {
            var snapshotArr = [];
            snapshot.forEach(element => {
                const solved = Boolean(tasksSolvedList.includes(String(element.key)));
                const halfsSolved = Boolean(tasksPartiallySolvedList.includes(String(element.key)));
                const notSolved = !solved && !halfsSolved;
                if ((isTasksSolvedChecked && solved) || (isTasksPartiallySolvedChecked && halfsSolved) || (isTasksLeftChecked && notSolved)) { snapshotArr.push(element) }
            });
            initTasksFromServer(snapshotArr);
        }
        else { initTasksFromServer(snapshot) }
    }).then(() => { queryButtonStopLoading() });
}
function queryButtonStopLoading() {
    $(".checklist-submit").addClass("hide-loading");
    // For failed icon just replace ".done" with ".failed"
    $(".done").addClass("finish");
    setTimeout(() => {
        $(".checklist-submit").removeClass("loading");
        $(".checklist-submit").removeClass("hide-loading");
        $(".done").removeClass("finish");
        $(".failed").removeClass("finish");
    }, 1000);
}
auth.onAuthStateChanged(user => {
    if (user) {
        window.localStorage.clear();
        window.localStorage.setItem('isLoggedIn', '1');
        txt_username.innerText = user.displayName;
        txt_changeUsername.value = user.displayName;
        txt_changeEmail.value = user.email;

        if (user.photoURL) { img_profile.src = user.photoURL }
        database.ref('global').once('value').then(globalData => {
            NumberOfTasks = Number(globalData.val().numOfTasks);
            database.ref('users').child(user.uid).once('value').then(data => {
                if (data.exists()) {
                    if (data.child('image').exists()) { img_profile.src = String(data.val().image) }
                    if (data.child('name').exists()) { txt_username.innerText = String(data.val().name) }
                    if (data.child('tasksSolvedList').exists()) {
                        TasksSolved = Number(data.child('tasksSolvedList').numChildren());
                        document.getElementById('tasksSolved').innerText = String(TasksSolved);
                        data.child('tasksSolvedList').forEach(childSnapshot => { tasksSolvedList.push(String(childSnapshot.key)) });
                    }
                    if (data.child('tasksAllWrong').exists()) { TasksAllWrong = Number(data.val().tasksAllWrong) }
                    if (data.child('tasksPartiallySolvedList').exists()) {
                        TasksPartiallySolved = Number(data.child('tasksPartiallySolvedList').numChildren());
                        document.getElementById('tasksPartiallySolved').innerText = String(TasksPartiallySolved);
                        data.child('tasksPartiallySolvedList').forEach(childSnapshot => { tasksPartiallySolvedList.push(String(childSnapshot.key)) });
                    }
                    if (data.child('admin').exists()) {
                        isTeacher = true;
                        isAdmin = true;
                        document.getElementById('isAdmin').style.display = 'block';
                        btn_newTask.style.display = 'block';
                    }
                    else if (data.child('teacher').exists()) {
                        isTeacher = true;
                        document.getElementById('isTeacher').style.display = 'block';
                        btn_newTask.style.display = 'block';
                    }
                    else { isStudentLabel.style.display = 'block' }
                }
                else { isStudentLabel.style.display = 'block' }
                localStorage.setItem("isTeacher", String(isTeacher));
                TasksLeft = NumberOfTasks - (TasksSolved + TasksPartiallySolved + TasksAllWrong);
                txt_tasksLeft.innerText = String(TasksLeft);
                database.ref('menuTasksInfo').orderByChild('name').once('value', snapshot => { initTasksFromServer(snapshot) });
                if (isTeacher) { document.getElementById("chart-container").style.height = "calc(100% - 347px)" }
                $("#pieChart").drawPieChart([
                    { title: "נפתרו בהצלחה", value: TasksSolved, color: "rgba(59,181,74, 0.75)" },
                    { title: "נפתרו חלקית", value: TasksPartiallySolved, color: "rgba(123,79,255, 0.75)" },
                    { title: "טרם נפתרו", value: TasksLeft, color: "rgba(35,119,255, 0.75)" }
                ]);
            }).catch(error => {
                isStudentLabel.style.display = 'block';
                localStorage.setItem("isTeacher", "false");
                TasksLeft = NumberOfTasks - (TasksSolved + TasksPartiallySolved);
                txt_tasksLeft.innerText = String(TasksLeft);
            });
        });
    }
    else { window.location = 'index.html' }
});
 
function initTasksFromServer(snapshot) {
    tasks_loading.style.display = 'flex';
    var authorsPromiseList = [];
    var diffrentAuthors = []
    snapshot.forEach(authorChild => {
        const authorUID = String(authorChild.child('author').val());
        if (auth.currentUser.uid === authorUID) { if (!knownAuthors.has(authorUID)) { knownAuthors.set(authorUID, [auth.currentUser.displayName, auth.currentUser.photoURL]) } }
        else { if (!diffrentAuthors.includes(authorUID)) { diffrentAuthors.push(authorUID) } }
    });
    diffrentAuthors.forEach(author => { authorsPromiseList.push((functions.httpsCallable('getUserData'))({ uid: author })) });
    Promise.all(authorsPromiseList).then(authorsData => {
        for (var i = 0; i < authorsData.length; i++) {
            var data = authorsData[i].data;
            if (typeof data === 'string') { knownAuthors.set(diffrentAuthors[i], [data, noProfileImageURL]) }
            else { knownAuthors.set(diffrentAuthors[i], data) }
        }
        addTasksToList(snapshot);
        tasks_loading.style.display = 'none';
    });
}
function addTasksToList(snapshot) {
    snapshot.forEach(childSnapshot => {
        const name = String(childSnapshot.child('name').val());
        const difficulty = Number(childSnapshot.child('difficulty').val());
        const taskID = childSnapshot.key;
        const authorUID = String(childSnapshot.child('author').val());
        const status = getTaskStatus(taskID);
        const subject = String(childSnapshot.child('subject').val());
        const newTask = document.getElementById('taskslist').insertRow();

        newTask.onclick = function () {
            if (isAdmin) { localStorage.setItem('admin', 'true') }
            if (isTeacher) { localStorage.setItem('teacher', 'true') }
            localStorage.setItem('taskID', taskID);
            localStorage.setItem('taskName', name);
            localStorage.setItem('taskAuthorUID', authorUID);
            localStorage.setItem('taskDifficulty', difficulty);
            localStorage.setItem('taskSubject', subject);
            localStorage.setItem('taskAuthorName', String(knownAuthors.get(authorUID)[0]));
            localStorage.setItem('taskAuthorImage', String(knownAuthors.get(authorUID)[1]));
            window.location = `editor.html?task=${cipher('fJx1ikJRS9lf4AIJdg1A')(taskID)}`;
        };

        const authorCell = newTask.insertCell();
        const statusCell = newTask.insertCell();
        const subjectsCell = newTask.insertCell();
        const difficultyCell = newTask.insertCell();
        const nameCell = newTask.insertCell();

        difficultyCell.className = 'task-list-difficulty-head';
        statusCell.className = 'task-list-status-head';
        subjectsCell.className = 'task-list-subject-head';

        nameCell.innerHTML = getNameCode(name);
        statusCell.innerHTML = getStatusCode(status);
        difficultyCell.innerHTML = getDifficultyCode(difficulty);
        subjectsCell.innerHTML = getSubjectCode(subject);
        authorCell.innerHTML = getAuthorHTMLCode(authorUID);
    });
}
function getNameCode(name) {
    return `<div class='task-list-name-div'>${name}</div>`
}
function getDifficultyCode(index) {
    switch (index) {
        case 1: return getDifficultyCodeHelper('easy', 'קלה'); 
        case 2: return getDifficultyCodeHelper('medium', 'בינונית'); 
        case 3: return getDifficultyCodeHelper('hard', 'קשה');
    }
    return null;
}
function getDifficultyCodeHelper(enName, heName) {
    return `<div class='task-list-difficulty-div'>
<h2 class='task-list-difficulty-item'>${heName}</h2 >
<img src="dashboard/img/${enName}.png" class="task-list-difficulty-icon"/></div>`;
}
function getSubjectCode(subjectTag) {
    switch (subjectTag) {
        case 'movarray': return getSubjectItemCode("שיטות מיעון ומערכים", "rgb(51, 89, 204)");
        case 'aritlogic': return getSubjectItemCode("אריתמטיקה ולוגיקה", "rgb(67, 134, 45)");
        case 'loopif': return getSubjectItemCode("לולאות ומבני בקרה", "rgb(191, 64, 64)");
        case 'stack': return getSubjectItemCode("מחסנית", "rgb(191, 191, 64)");
        case 'subroutines': return getSubjectItemCode("שגרות ומאקרו", "rgb(191, 128, 64)");
        case 'interrupts': return getSubjectItemCode("פסיקות", "rgb(128, 64, 191)");
        default: return null;
    }
}
function getSubjectItemCode(text, dotColor) {
    return `<div class='task-list-subject-div'><div class='task-list-subject-color-dot' style='background-color:${dotColor};'></div><h2 class='task-list-subject-item'>${text}</h2></div>`
}
function getTaskStatus(taskID) {
    if (tasksSolvedList.includes(taskID)) return 1;
    if (tasksPartiallySolvedList.includes(taskID)) return 2;
    return 3;
}
function getStatusCode(status) {
    switch (status) {
        case 1: return getStatusCodeHelper('rgba(153, 255, 153, 0.15)', 'v', 'נפתרה');
        case 2: return getStatusCodeHelper('rgba(230, 204, 255, 0.25)', 'partiallySolved', 'נפתרה חלקית');
        default: return getStatusCodeHelper('rgba(179, 209, 255, 0.25)', 'unknown', 'טרם נפתרה');
    }
}
function getStatusCodeHelper(bColor, imgName, text) {
    return `<div class='task-list-status-div' style='background-color:${bColor};'>
       <img src="editor/img/${imgName}.png" class="task-list-status-icon" />
       <h2 class='task-list-status-item'>${text}</h2 ></div>`;
}
function getAuthorHTMLCode(uid) {
    arr = knownAuthors.get(uid);
    return (arr !== null) ? `</div><div class='mini-avatar-holder'><img class='mini-img' onerror="this.src = 'dashboard/img/noImage.jpg'" src='${(arr[1] !== null) ? arr[1] : noProfileImageURL}'/></div><div class='author-name-holder'><h3 class='task-author-name'>${arr[0]}</h3>` : null;
}
btn_newTask.addEventListener('click', e => {
    if (isTeacher) {
        localStorage.removeItem('taskID');
        window.location = 'newtask.html';
    }
});
document.getElementById('btn_logout').addEventListener('click', e => {
    auth.signOut().then(() => {
        window.localStorage.clear();
        window.location = 'index.html';
    });
});
btn_changeProfileImage.addEventListener('click', e => {
    btn_changeProfileImage.classList.add('onclic');
    const photoURL = String(document.getElementById('txbChangeProfileImage').value);
    auth.currentUser.updateProfile({ photoURL: photoURL }).then(() => {
        btn_changeProfileImage.classList.remove('onclic');
        btn_changeProfileImage.classList.add('validate');
        img_profile.src = photoURL;
        setTimeout(() => {
            btn_changeProfileImage.classList.remove('validate');
            $('#changeProfileImageModal').modal('hide');
        }, 1000);
    });
});
document.getElementById('btn_removeProfileImage').addEventListener('click', e => {
    auth.currentUser.updateProfile({ photoURL: null }).then(() => {
        img_profile.src = noProfileImageURL;
        $('#changeProfileImageModal').modal('hide');
    });
});
document.getElementById('btn_settings').addEventListener('click', e => {
    $('#settingsModal').modal('show')
});
document.getElementById('btn_settingsSave').addEventListener('click', e => {
    const txt_PasswordForNewEmail = document.getElementById('txbPasswordForNewEmail');
    const txt_changePasswordNew = document.getElementById('txbNewPassword');
    const txt_changePasswordOld = document.getElementById('txbOldPassword');

    const username = String(txt_changeUsername.value).trim();
    const email = String(txt_changeEmail.value).trim();
    const passwordForNewEmail = String(txt_PasswordForNewEmail.value).trim();
    const passwordForNewPassword = String(txt_changePasswordOld.value).trim();
    const newPassword = String(txt_changePasswordNew.value).trim();

    if (username !== '' && username !== auth.currentUser.displayName) {
        auth.currentUser.updateProfile({ displayName: username }).then(() => { txt_username.innerText = username });
    }
    if (email !== '' && passwordForNewEmail !== '' && email !== auth.currentUser.email) {
        auth.signInWithEmailAndPassword(auth.currentUser.email, passwordForNewEmail).then(userCredential => {
            auth.currentUser.updateEmail(email).then(() => { txt_PasswordForNewEmail.value = "" }).catch(error => { });
        }).catch(error => { });
    }
    if (passwordForNewPassword !== '' && newPassword !== '') {
        auth.signInWithEmailAndPassword(auth.currentUser.email, passwordForNewPassword).then(userCredential => {
            auth.currentUser.updatePassword(newPassword).then(() => {
                txt_changePasswordOld.value = "";
                txt_changePasswordNew.value = "";
            }).catch(error => { });
        }).catch(error => { });
    }
    $('#settingsModal').modal('hide');
});