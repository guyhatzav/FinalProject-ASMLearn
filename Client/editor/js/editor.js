//init firebase
﻿const functions = firebase.functions();
const auth = firebase.auth();
const database = firebase.database();
const storage = firebase.storage();

const noProfileImageURL = "dashboard/img/noImage.jpg";

//get all the data about the task from local storage.
var decipherData = null;
try { decipherData = String(decipher('fJx1ikJRS9lf4AIJdg1A')(new URLSearchParams(window.location.search).get('task'))) }
catch { window.location = 'dashboard.html' }
const taskID = decipherData;
var authorUID = localStorage.getItem('taskAuthorUID');
document.getElementById('div_taskNameBox').innerHTML = localStorage.getItem('taskName');
var authorImage = localStorage.getItem('taskAuthorImage');
document.getElementById('div_taskAuthorNameBox').innerHTML = localStorage.getItem('taskAuthorName');
document.getElementById('img_taskAuthorImage').src = (authorImage !== 'null') ? authorImage : noProfileImageURL;
updateDifficulty(Number(localStorage.getItem('taskDifficulty')));
updateSubject(localStorage.getItem('taskSubject'));

//variables.
var editorFontSize = 15;
var taskDescription;
var tasksTags = '', inputFormat = '', outputFormat = '';
var isEverRan = false;
var openTCInput = null;
var isFrontendCompiler = false;

var numOfTCs, initCode, initCodeForEdit;

//inits the code editor with ace api.
const editor = ace.edit("editor");
editor.setTheme("ace/theme/ambiance");
editor.session.setMode("ace/mode/assembly_x86");
editor.setShowPrintMargin(false);
editor.setOption("enableSnippets", true);
editor.setOption("enableBasicAutocompletion", true);
editor.focus();
editor.session.getUndoManager().reset();

editor.addEventListener('click', e => { $('.drop-down').removeClass('drop-down--active') });

//settings the fron down click event button.
document.getElementById('btn_fontdown').addEventListener('click', e => {
    editorFontSize--;
    editor.setFontSize(editorFontSize);
    database.ref('users').child(auth.currentUser.uid).child('fontSize').set(editorFontSize);
});
//settings the fron up click event button.
document.getElementById('btn_fontup').addEventListener('click', e => {
    editorFontSize++;
    editor.setFontSize(editorFontSize);
    database.ref('users').child(auth.currentUser.uid).child('fontSize').set(editorFontSize);
});
//settings the editor undo click event button.
document.getElementById('btn_undo').addEventListener('click', e => { editor.undo() });
//settings the editor redo click event button.
document.getElementById('btn_redo').addEventListener('click', e => { editor.redo() });
//settings the editor reset to default click event button.
document.getElementById('btn_reset').addEventListener('click', e => {
    editor.setValue(initCode);
    editor.focus();
    editor.gotoLine(editor.getSelectionRange().end.row - 3, 1, true);
});

//inits the editor themes in the list (in the HTML)
['twilight', 'sqlserver', 'chaos', 'clouds', 'ambiance', 'tomorrow_night_blue', 'xcode'].forEach(item => {
    document.getElementById(`li_${item}_theme`).addEventListener('click', e => {
        editor.setTheme(`ace/theme/${item}`);
        $('.drop-down').toggleClass('drop-down--active');
    });
});

document.getElementById('dropDown').addEventListener('click', e => {
    $('.drop-down').toggleClass('drop-down--active');
});

//transfers subject name to HTML tag
function updateSubject(subject) {
    const divDifficlutyBox = document.getElementById('div_taskSubjectBox');
    switch (subject) {
        case 'movarray': divDifficlutyBox.innerHTML = getSubjectItemCode("שיטות מיעון ומערכים", "rgb(51, 89, 204)"); break;
        case 'aritlogic': divDifficlutyBox.innerHTML = getSubjectItemCode("אריתמטיקה ולוגיקה", "rgb(67, 134, 45)"); break;
        case 'loopif': divDifficlutyBox.innerHTML = getSubjectItemCode("לולאות ומבני בקרה", "rgb(191, 64, 64)"); break;
        case 'stack': divDifficlutyBox.innerHTML = getSubjectItemCode("מחסנית", "rgb(191, 191, 64)"); break;
        case 'subroutines': divDifficlutyBox.innerHTML = getSubjectItemCode("שגרות ומאקרו", "rgb(191, 128, 64)"); break;
        case 'interrupts': divDifficlutyBox.innerHTML = getSubjectItemCode("פסיקות", "rgb(128, 64, 191)"); break;
    }
    function getSubjectItemCode(text, dotColor) { return `<div class='task-subject-color-dot' style='background-color: ${dotColor};'></div><h2 class='task-subject-item'>${text}</h2>` }
}
var isFirstTime = true;
//transfers status to HTML tag
function updateStatus(status) {
    const divStatusBox = document.getElementById('div_taskStatusBox');
    switch (status) {
        case 1: divStatusBox.style.backgroundColor = "rgba(153, 255, 153, 0.15)";
            divStatusBox.innerHTML = statusHTML("v", "נפתרה");
            if (!isFirstTime) confetti({ particleCount: 1000, spread: 100, origin: { x: 0.25, y: 0 } });
            break;
        case 2: divStatusBox.style.backgroundColor = "rgba(230, 204, 255, 0.25)";
            divStatusBox.innerHTML = statusHTML("partiallySolved", "נפתרה חלקית"); break;
        case 3: divStatusBox.style.backgroundColor = "rgba(179, 209, 255, 0.25)";
            divStatusBox.innerHTML = statusHTML("unknown", "טרם נפתרה");  break;
    }
    if (isFirstTime) isFirstTime = false;
    function statusHTML(en, he) { return `<img src="editor/img/${en}.png" class="task-status-icon"/><h2 class='task-subject-item'>${he}</h2>` }
}
//transfers difficluty index to HTML tag
function updateDifficulty(difficluty) {
    const divDifficlutyBox = document.getElementById('div_taskDifficultyBox');
    switch (difficluty) {
        case 1: divDifficlutyBox.innerHTML = difficultyHTML("easy", "קלה"); break;
        case 2: divDifficlutyBox.innerHTML = difficultyHTML("medium", "בינונית"); break;
        case 3: divDifficlutyBox.innerHTML = difficultyHTML("hard", "קשה"); break;
    }
    function difficultyHTML(en, he) { return `<img src="dashboard/img/${en}.png" class="difficulty-icon"/><h2 class="difficulty-item">${he}</h2>` }
}
document.getElementById('btn_edittask').addEventListener('click', e => {
    if (auth.currentUser !== null) {
        localStorage.setItem('editorFontSize', String(editorFontSize));
        localStorage.setItem('taskDescription', taskDescription);

        if (String(inputFormat) !== '') { localStorage.setItem('inputFormat', inputFormat) }
        else { localStorage.removeItem('inputFormat') }

        if (String(outputFormat) !== '') { localStorage.setItem('outputFormat', outputFormat) }
        else { localStorage.removeItem('outputFormat') }

        if (String(tasksTags).trim() !== '') { localStorage.setItem('tasksTags', tasksTags) }
        else { localStorage.removeItem('tasksTags') }
         
        localStorage.setItem('taskCodeTemplate', initCodeForEdit);
        window.location = `newtask.html?task=${cipher('fJx1ikJRS9lf4AIJdg1A')(taskID)}`;
    }
});
auth.onAuthStateChanged(user => {
    //checks if the user logged in
    if (user) {
        if (taskID !== localStorage.getItem("taskID")) {
            //loads the tasks data from local storage and cloud.
            database.ref('menuTasksInfo').child(taskID).once('value', snapshot => {
                document.getElementById('div_taskNameBox').innerHTML = snapshot.val().name;
                localStorage.setItem('taskName', snapshot.val().name);

                updateDifficulty(Number(snapshot.val().difficulty));
                localStorage.setItem('taskDifficulty', snapshot.val().difficulty);

                updateSubject(snapshot.val().subject);
                localStorage.setItem('taskSubject', snapshot.val().subject);

                const authorPromise = (functions.httpsCallable('getUserData'))({ uid: snapshot.val().author });
                authorPromise.then(authorsData => {
                    const data = authorsData.data;
                    if (typeof data === 'string') {
                        document.getElementById('div_taskAuthorNameBox').innerHTML = data;
                        document.getElementById('img_taskAuthorImage').src = noProfileImageURL;
                        localStorage.removeItem('taskAuthorImage');
                        localStorage.setItem('taskAuthorName', data);
                    }
                    else {
                        document.getElementById('div_taskAuthorNameBox').innerHTML = data[0];
                        document.getElementById('img_taskAuthorImage').src = data[1];
                        localStorage.setItem('taskAuthorName', data[0]);
                        localStorage.setItem('taskAuthorImage', data[1]);
                    }
                });
                localStorage.setItem('taskID', taskID);
            });
        }
        if (!(((localStorage.getItem("teacher") !== null) && authorUID === user.uid) || (localStorage.getItem("admin") !== null))) {
            document.getElementById('btn_edittask').remove();
            document.getElementById('btn_deleteTask').remove()
        }

        database.ref('users').child(user.uid).child('fontSize').once('value', fontSnapshot => {
            if (fontSnapshot.exists()) {
                editorFontSize = Number(fontSnapshot.val());
                editor.setFontSize(editorFontSize);
            }
        });
        database.ref('global').child('isFrontendCompiler').on('value', snapshot => { isFrontendCompiler = snapshot.exists() });
        database.ref('tasks').child(taskID).once('value', snapshot => {
            numOfTCs = Number(snapshot.val().numOfTCs);
            const submissionsResultsForm = document.getElementById('submissionsResultsForm');
            //create the test cases result boxes
            for (var i = 1; i < numOfTCs; i++) {
                submissionsResultsForm.appendChild(createElement('img', 'test-case-title-icon', 'editor/img/test.png'));
                submissionsResultsForm.appendChild(createElement('h3', 'test-case-title-text', `מקרה בדיקה ${i + 1}`));
                submissionsResultsForm.appendChild(createElement('h3', (i > 8) ? 'test-case-title-openclose-text-morespace' : 'test-case-title-openclose-text', 'חסוי'));
                submissionsResultsForm.appendChild(createElement('br'));
                submissionsResultsForm.appendChild(createElement('br'));
                submissionsResultsForm.appendChild(createElement('br'));
                submissionsResultsForm.appendChild(createElement('h3', 'test-case-subject', 'סטטוס:'));
                const divStatus = createElement('div', 'test-case-container-colored', null, `divTestCase-${i}-status`);
                divStatus.appendChild(createElement('img', 'test-case-icon', 'editor/img/unknown.png', `imgTestCase-${i}-status`));
                divStatus.appendChild(createElement('p', 'test-case-status-text', 'טרם התבצעה הרצה', `pTestCase-${i}-status`));
                submissionsResultsForm.appendChild(divStatus);
                submissionsResultsForm.appendChild(createElement('hr'));
            }
            //checks for optional params if they exists and updates the data on page.
            if (snapshot.child('notAllowedCommands').exists()) {
                tasksTags = String(snapshot.val().notAllowedCommands);
                ReactDOM.render(React.createElement(Tags, { tags: tasksTags }), document.getElementById("notAllowedCommands"));
            }
            else { document.getElementById('notAllowedCommands-container').remove() }
            if (snapshot.child('inputFormat').exists()) {
                const taskInputFormatEditor = new Quill('#div_taskInputFormat', { theme: 'snow', modules: { toolbar: false } });
                taskInputFormatEditor.enable(false);
                inputFormat = String(snapshot.val().inputFormat).trim();
                taskInputFormatEditor.root.innerHTML = inputFormat;
            }
            else { document.getElementById('input-format-container').remove() }
            if (snapshot.child('outputFormat').exists()) {
                const taskOutputFormatEditor = new Quill('#div_taskOutputFormat', { theme: 'snow', modules: { toolbar: false } });
                taskOutputFormatEditor.enable(false);
                outputFormat = String(snapshot.val().outputFormat).trim();
                taskOutputFormatEditor.root.innerHTML = outputFormat;
            }
            else { document.getElementById('output-format-container').remove() }

            if (snapshot.child('openTCInput').exists()) { openTCInput = String(snapshot.val().openTCInput) }
            
            //define the listtener in the cloud in case the engine return the results.
            database.ref('usersTasksData').child(user.uid).child(taskID).on('value', snapshot => {
                //checks if the data added or removed.
                if (snapshot.exists()) {
                    isEverRan = true;
                    snapshot.child('status').exists() ? (String(snapshot.val().status).includes('0') ? updateStatus(2) : updateStatus(1)) : updateStatus(3)
                    snapshot.child('testcases').forEach(childSnapshot => {
                        const result = String(childSnapshot.val().result);
                        //updates the HTML according to the engines status
                        const key = String(childSnapshot.key);
                        switch (result) {
                            case 'correct': updateTestCaseState(key, "התשובה נכונה", "editor/img/v.png", "rgba(5, 199, 5, 0.5)"); break;
                            case 'wrong': updateTestCaseState(key, "התשובה שגויה", "editor/img/x.png", "rgba(255, 26, 26, 0.5)"); break;
                            case 'timeout': updateTestCaseState(key, "זמן הריצה של התוכנית היה ארוך מידי ולכן היא הופסקה", "editor/img/timeout.png", "rgba(179, 128, 255, 0.5)"); break;
                            case 'infinite loop': updateTestCaseState(key, "התוכנית נכנסה ללולאה אינסופית", "editor/img/loop.png", "rgba(173, 31, 173, 0.5)"); break;
                            case 'compilation failed': updateTestCaseState(key, "התוכנית לא הצליחה לעבור את שלב הקומפילציה", "editor/img/error.png", "rgba(255, 194, 102, 0.5)"); break;
                            case 'runtime error': updateTestCaseState(key, "קרתה שגיאה בעת הרצת התוכנית", "editor/img/error.png", "rgba(255, 194, 102, 0.5)"); break;
                            case 'malicious code': updateTestCaseState(key, "התוכנית הכילה קוד שזוהה כזדוני ולכן הופסקה", "editor/img/evil.png", "rgba(255, 179, 209, 0.5)"); break;
                        }
                        //the first test case is an open one => handles the expected output on page.
                        if (key == 0) {
                            document.getElementById('pTestCase-expectedOutput').innerHTML = String(childSnapshot.val().expectedOutput);
                            if (result === 'correct' || result === 'wrong') {
                                document.getElementById('pTestCase-yourOutput').innerHTML = String(childSnapshot.val().yourOutput);
                                document.getElementById('h3TestCase-yourOutput').innerHTML = 'התוצאה שלך:';
                                document.getElementById('divTestCase-yourOutput').style.backgroundColor = "rgba(230, 230, 230, 0.5)";

                            }
                            else if (result === 'runtime error' || result === 'compilation failed') {
                                document.getElementById('pTestCase-yourOutput').innerHTML = String(childSnapshot.val().errorMessage);
                                document.getElementById('h3TestCase-yourOutput').innerHTML = 'הודעת השגיאה:';
                                document.getElementById('divTestCase-yourOutput').style.backgroundColor = "rgba(255, 194, 102, 0.5)";
                            }
                        }
                    });
                }
                //if removed update the status to: not solved.
                else { updateStatus(3) }
            });
            //inits the quill text boxes.
            const taskDescriptionEditor = new Quill('#div_taskDescription', { theme: 'snow', modules: { toolbar: false } });
            taskDescriptionEditor.enable(false);
            taskDescription = String(snapshot.val().description);
            taskDescriptionEditor.root.innerHTML = taskDescription;
            storage.ref(`usersSubmissions/${user.uid}/${taskID}/0.asm`).getDownloadURL().then(onInitCodeEditorResolve, onInitCodeEditorReject);

        });
    }
    else { window.location = 'index.html' }
});

function updateTestCaseState(key, innerHTML, src, backgroundColor) {
    document.getElementById(`pTestCase-${key}-status`).innerHTML = innerHTML;
    document.getElementById(`imgTestCase-${key}-status`).src = src;
    document.getElementById(`divTestCase-${key}-status`).style.backgroundColor = backgroundColor;
}

//getting the task's code template to show to the user at load - success
function onInitCodeEditorResolve(url) {
    jQuery.get(url, data => {
        editor.setValue(String(data));
        editor.clearSelection();
        editor.session.getUndoManager().reset();
        storage.ref(`tasksCodeTemplates/${taskID}.asm`).getDownloadURL().then(newUrl =>
            jQuery.get(newUrl, newData => {
                initCode = String(newData).replace('@{testcases}', openTCInput != null ? openTCInput : '');
                initCodeForEdit = String(newData);
            })).catch(error => { console.error(error) });
        document.getElementById('page-start-loading').style.display = 'none';
        document.getElementById('editor-full-container').style.display = 'block';
    });
}

//getting the task's code template to show to the user at load - failed
function onInitCodeEditorReject() {
    storage.ref(`tasksCodeTemplates/${taskID}.asm`).getDownloadURL().then(url => {
        jQuery.get(url, data => {
            initCode = String(data).replace('@{testcases}', openTCInput != null ? openTCInput : '');
            editor.setValue(initCode);
            editor.clearSelection();
            initCodeForEdit = String(data);
            editor.session.getUndoManager().reset();
            document.getElementById('page-start-loading').style.display = 'none';
            document.getElementById('editor-full-container').style.display = 'block';
        });
    }).catch(error => { console.error(error) });
}

//HELPER FUNCTION - creates an HTML element with the given params.
function createElement(type, classAtt = null, text = null, id = null) {
    const item = document.createElement(type);
    if (classAtt !== null) { item.setAttribute("class", classAtt) }
    if (type === 'img') { item.setAttribute("src", text) }
    else if (text !== null) { item.innerHTML = text }
    if (id !== null) { item.setAttribute("id", id) }
    return item;
}
//submits the task to the engine.
const btn_submitTask = document.getElementById('submit_button');
btn_submitTask.addEventListener('click', e => {
    //updates the HTML
    btn_submitTask.classList.add("onclic");
    document.getElementById('pTestCase-yourOutput').innerHTML = '...התוצאה שלך תופיע כאן בסיום ההרצה'
    document.getElementById('pTestCase-expectedOutput').innerHTML = '...התוצאה המצופה תופיע כאן בסיום ההרצה'
    for (var i = 0; i < numOfTCs; i++) { updateTestCaseState(i, "...מחשב את מקרה הבדיקה", "editor/img/loading.gif", "rgba(153, 153, 153, 0.5)") }
    //sends the code to the engine using HTTP Request
    const submitTaskPromise = (functions.httpsCallable('submitTask'))({
        taskID: taskID,
        code: String(editor.getValue())
    });
    submitTaskPromise.then(result => {
        btn_submitTask.classList.remove("onclic");
        btn_submitTask.classList.add("validate");
        setTimeout(() => { btn_submitTask.classList.remove("validate") }, 1500);
        openModal();
    });
    submitTaskPromise.catch(error => {
        btn_submitTask.classList.remove("onclic");
        btn_submitTask.classList.add("validate");
        setTimeout(() => { btn_submitTask.classList.remove("validate") }, 1500);
        openModal();
    });
});
//inits the SAVE button (calls the submitTask cloud function with onlySave param)
const btn_saveTask = document.getElementById('save_button');
btn_saveTask.addEventListener('click', e => {
    btn_saveTask.classList.add("onclic");
    const saveTaskPromise = (functions.httpsCallable('submitTask'))({
        taskID: taskID,
        onlySave: true,
        code: String(editor.getValue())
    });
    saveTaskPromise.then(result => {
        btn_saveTask.classList.remove("onclic");
        btn_saveTask.classList.add("validate-light");
        setTimeout(() => { btn_saveTask.classList.remove("validate-light") }, 1500);
    });
    saveTaskPromise.catch(error => {
        btn_saveTask.classList.remove("onclic");
        btn_saveTask.classList.add("validate-light");
        setTimeout(() => { btn_saveTask.classList.remove("validate-light") }, 1500);
    });
});
