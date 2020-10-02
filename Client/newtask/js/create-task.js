const auth = firebase.auth();
const functions = firebase.functions();
const database = firebase.database();

const btnAddTestcase = document.getElementById('btn_AddTestcase');
const btnBack = document.getElementById('btn_back');
const btnAddDraft = document.getElementById('btn_addDraft');

const btnSubmit = document.getElementById('submit_button');
const txbTaskName = document.getElementById('txb-task-name');

const rbEasy = document.getElementById('rb-easy');
const rbMedium = document.getElementById('rb-medium');
const rbHard = document.getElementById('rb-hard');

const rbMovArray= document.getElementById('rb_movarray');
const rbAritLogic = document.getElementById('rb_aritlogic');
const rbLoopIf = document.getElementById('rb_loopif');
const rbStack = document.getElementById('rb_stack');
const rbSubroutines = document.getElementById('rb_subroutines');
const rbInterrupts = document.getElementById('rb_interrupts');

const isTeacher = (localStorage.getItem("isTeacher") === 'true');

var editorFontSize = 15;
alertify.set({ delay: 3000 });

var loggedin = false;
var tasksDrafts = [];
var numOfTestcases = 1;
var testCasesID = 1;
var testCasesIdsList = [0];
const openTestCaseInputEditor = ace.edit("input-code-editor-0");
openTestCaseInputEditor.setTheme("ace/theme/twilight");
openTestCaseInputEditor.session.setMode("ace/mode/assembly_x86");
openTestCaseInputEditor.setShowPrintMargin(false);

const openTestCaseOutputEditor = ace.edit("output-code-editor-0");
openTestCaseOutputEditor.setTheme("ace/theme/twilight");
openTestCaseOutputEditor.setShowPrintMargin(false);

var initCode = `.model small        ; Small model (64 KB).
.stack 100h         ; This represents the stack size.
.data               ; This represents the data section.
;------ Input(s) for this task #PLEASE DO NOT TOUCH THIS SECTION# -------
@{testcases}
;------------------------------------------------------------------------
;-------------------------- User's Variables ----------------------------

;------------------------------------------------------------------------
.code               ; This represents the code section.
MAIN:               ; The start of the main program.
    MOV AX, @data   ; Assign AX register with the data section.
    MOV DS, AX      ; Assign Data Segment with the data section.
    
EXIT:               ; This code represents exitting the program.
    MOV AX, 4C00h   ; Assign the AX register with the value 4C00h.
    INT 21h         ; Raise an interrupt.
END MAIN            ; The end of the main program.`;

const templateCodeEditor = ace.edit("template-code-editor");
templateCodeEditor.setTheme("ace/theme/ambiance");
templateCodeEditor.session.setMode("ace/mode/assembly_x86");
templateCodeEditor.setShowPrintMargin(false);
templateCodeEditor.setOption("enableSnippets", true);
templateCodeEditor.setOption("enableBasicAutocompletion", true);
templateCodeEditor.setValue(initCode);
templateCodeEditor.focus();
templateCodeEditor.gotoLine(14, 1, true);
templateCodeEditor.session.getUndoManager().reset();

document.getElementById('btn_fontdown').addEventListener('click', e => {
    editorFontSize--;
    templateCodeEditor.setFontSize(editorFontSize);
    database.ref('users').child(auth.currentUser.uid).child('fontSize').set(editorFontSize);
});
document.getElementById('btn_fontup').addEventListener('click', e => {

    editorFontSize++;
    templateCodeEditor.setFontSize(editorFontSize);
    database.ref('users').child(auth.currentUser.uid).child('fontSize').set(editorFontSize);
});
document.getElementById('btn_undo').addEventListener('click', e => { templateCodeEditor.undo() });
document.getElementById('btn_redo').addEventListener('click', e => { templateCodeEditor.redo() });

const toolbarOptions = [
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'font': [] }],
    [{ 'size': ['small', false, 'large', 'huge'] }],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'align': [] }, { 'indent': '-1' }, { 'indent': '+1' }, { 'direction': 'rtl' }],
    ['blockquote', 'code-block'],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    [{ 'script': 'sub' }, { 'script': 'super' }],
    ['formula', 'link', 'video'],
    ['clean']  
];
const editor = new Quill('#editor', {
    theme: 'snow',
    modules: { toolbar: toolbarOptions }
});

const inputFormatEditor = new Quill('#input-format-editor', {
    theme: 'snow',
    modules: { toolbar: toolbarOptions }
});

const outputFormatEditor = new Quill('#output-format-editor', {
    theme: 'snow',
    modules: { toolbar: toolbarOptions }
});

addTooltipToToolbatItem('ql-bold', `(Bold) הדגשה`);
addTooltipToToolbatItem('ql-italic', `(Italic) הטיה`);
addTooltipToToolbatItem('ql-underline', `(Underline) קו תחתון`);
addTooltipToToolbatItem('ql-strike', `(Strike) קו חוצה`);
addTooltipToToolbatItem('ql-font', `בחירת גופן`);
addTooltipToToolbatItem('ql-color', `בחירת צבע הכיתוב`);
addTooltipToToolbatItem('ql-background', `בחירת צבע הרקע לכיתוב`);
addTooltipToToolbatItem('ql-align', `יישור הכיתוב`);
addTooltipToToolbatItem('ql-direction', `(LTR / RTL) כיוון קריאת הטקסט`);
addTooltipToToolbatItem('ql-code-block', `(תיבת קוד (ליציאה - יש ללחוץ 'אנטר' 3 פעמים`);
addTooltipToToolbatItem('ql-link', `(הוספת קישור (יש לסמן כיתוב תחילה`);
addTooltipToToolbatItem('ql-blockquote', `ציטוט`);
addTooltipToToolbatItem('ql-indent', `הזחת שורה מימין`, `-1`);
addTooltipToToolbatItem('ql-indent', `הזחת שורה משמאל`, `+1`);
addTooltipToToolbatItem('ql-list', `רשימה ממוספרת`, `ordered`);
addTooltipToToolbatItem('ql-list', `רשימת נקודות`, `bullet`);
addTooltipToToolbatItem('ql-clean', `(איפוס עיצוב הטקסט (יש לסמן כיתוב תחילה`);
addTooltipToToolbatItem('ql-script', `אינדקס תחתון`, 'sub');
addTooltipToToolbatItem('ql-script', `אינדקס עליון`, 'super');
addTooltipToToolbatItem('ql-size', `בחירת גודל הגופן`);
addTooltipToToolbatItem('ql-video', `הוספת סרטון וידאו`);
addTooltipToToolbatItem('ql-formula', `(הוספת נוסחה (יש לוודא שכיווני הקריאה תואמים`);

function addTooltipToToolbatItem(className, text, value = null, flow = "up") {
    Array.prototype.forEach.call(document.getElementsByClassName(className), el => {
        if (value == null || el.getAttribute('value') === value) {
            el.setAttribute("tooltip", text);
            el.setAttribute("flow", flow);
        }
    });
}

const param = new URLSearchParams(window.location.search).get('task');
const editingTaskID = param !== null ? String(decipher('fJx1ikJRS9lf4AIJdg1A')(param)) : null;
const editingTaskDescription = localStorage.getItem('taskDescription');
const editingInputFormatEditor = localStorage.getItem('inputFormat');
const editingOutputFormatEditor = localStorage.getItem('outputFormat');

if (editingTaskID !== null) {
    btnSubmit.classList.add('edit_button');
    btnSubmit.classList.add('submit_button');
    txbTaskName.value = localStorage.getItem('taskName');
    templateCodeEditor.setValue(localStorage.getItem('taskCodeTemplate'));
    templateCodeEditor.clearSelection();
    templateCodeEditor.session.getUndoManager().reset();
    editorFontSize = Number(localStorage.getItem('editorFontSize'));
    templateCodeEditor.setFontSize(editorFontSize);
    setSubject(localStorage.getItem('taskSubject'));
    setDifficulty(Number(localStorage.getItem('taskDifficulty')));
    if (localStorage.getItem('tasksTags') === null) {
        ReactDOM.render(React.createElement(Tags, null), document.getElementById("notAllowedCommands"));
        document.getElementById('notAllowedCommandsList').innerHTML = '';
    }
    else { ReactDOM.render(React.createElement(Tags, { tags: localStorage.getItem('tasksTags') }), document.getElementById("notAllowedCommands")) }
    if (localStorage.getItem('inputFormat') !== null) { inputFormatEditor.root.innerHTML = editingInputFormatEditor }
    if (localStorage.getItem('outputFormat') !== null) { outputFormatEditor.root.innerHTML = editingOutputFormatEditor }
    editor.root.innerHTML = editingTaskDescription;
    editor.history.clear();
}
else { document.getElementById('btn_toTask').remove() }

if (!isTeacher) { window.location = 'dashboard.html' }

btnAddDraft.addEventListener('click', e => {
    if (String(txbTaskName.value).trim() !== "") {
        if (checkIfEditorValid(editor)) {
            tasksDrafts.push(new Draft());
        }
        else { alertify.error('⚠️ לא הוזן תיאור למטלה') }
    }
    else { alertify.error('⚠️ לא הוזן שם למטלה') }
});

auth.onAuthStateChanged(user => {
    if (user) {
        loggedin = true;
        if (editingTaskID !== null) {
            database.ref('tasksPrivateTCs').child(editingTaskID).once('value')
                .then(snapshot => {
                    const count = Number(snapshot.child('inputs').numChildren());
                    const openInputValue = String(snapshot.child('inputs').child('0').val());
                    if (openInputValue !== 'nil') {
                        const inputCodeEditor0 = ace.edit('input-code-editor-0');
                        inputCodeEditor0.setValue(openInputValue);
                        inputCodeEditor0.clearSelection();
                    }
                    const openOutputValue = String(snapshot.child('outputs').child('0').val());
                    if (openOutputValue !== 'nil') {
                        const outputCodeEditor0 = ace.edit('output-code-editor-0');
                        outputCodeEditor0.setValue(openOutputValue);
                        outputCodeEditor0.clearSelection();
                    }
                    for (var i = 1; i < count; i++) {
                        var tab, pane;
                        if (numOfTestcases < 10) {
                            tab = createElement('li', 'testCasesTabBlock-tab', 'מקרה בדיקה', `testcaseTab${testCasesID}`);
                            document.getElementById("testCasesTabBlock-tabs").appendChild(tab);
                            pane = createElement('div', 'testCasesTabBlock-pane', null, `testcasePane${testCasesID}`);
                            document.getElementById("testCasesTabBlock-content").appendChild(pane);
                            pane.appendChild(createElement('br'));
                            pane.appendChild(createElement('img', 'icon', 'img/input.png'));
                            pane.appendChild(createElement('h3', 'label', 'קלט למשתמש'));
                            pane.appendChild(createElement('br'));
                            pane.appendChild(createElement('br'));
                            pane.appendChild(createElement('h1', 'sublabel', 'בתיבת הקוד הבאה יש להזין את המשתנים וערכיהם (באסמבלי) שיאותחלו בזכרון המעבד בסגמנט המידע בטרם הרצת התוכנית, יש לוודא ששמות המשתנים זהים בכל מקרי הבדיקה'));
                            pane.appendChild(createElement('br'));
                            pane.appendChild(createElement('div', 'input-code-editor', null, `input-code-editor-${String(testCasesID)}`));
                            const testCaseInputTemp = ace.edit(`input-code-editor-${String(testCasesID)}`);
                            testCaseInputTemp.setTheme("ace/theme/twilight");
                            testCaseInputTemp.session.setMode("ace/mode/assembly_x86");
                            testCaseInputTemp.setShowPrintMargin(false);
                            testCaseInputTemp.gotoLine(1, 1, true);
                            const inputValue = String(snapshot.child('inputs').child(String(i)).val());
                            if (inputValue !== 'nil') {
                                testCaseInputTemp.setValue(inputValue);
                                testCaseInputTemp.clearSelection();
                            }
                            pane.appendChild(createElement('img', 'icon', 'img/output.png'));
                            pane.appendChild(createElement('h3', 'label', 'פלט מהמשתמש'));
                            pane.appendChild(createElement('br'));
                            pane.appendChild(createElement('br'));
                            pane.appendChild(createElement('h1', 'sublabel', 'בתיבת הקוד הבאה יש להזין את המשתנים וערכיהם (באסמבלי) שיאותחלו בזכרון המעבד בסגמנט המידע בטרם הרצת התוכנית, יש לוודא ששמות המשתנים זהים בכל מקרי הבדיקה'));
                            pane.appendChild(createElement('br'));
                            pane.appendChild(createElement('div', 'output-code-editor', null, `output-code-editor-${String(testCasesID)}`));
                            const testCaseOutputTemp = ace.edit(`output-code-editor-${String(testCasesID)}`);
                            testCaseOutputTemp.setTheme("ace/theme/twilight");
                            testCaseOutputTemp.setShowPrintMargin(false);
                            const outputValue = String(snapshot.child('outputs').child(String(i)).val());
                            if (outputValue !== 'nil') {
                                testCaseOutputTemp.setValue(outputValue);
                                testCaseOutputTemp.clearSelection();
                            }
                            const removeButton = createElement('button', 'remove-testcase', 'מחיקת מקרה בדיקה 🗑️', `btn-remove-testcase${String(testCasesID)}`);
                            removeButton.addEventListener('click', e => {
                                const id = String(e.srcElement.id).replace('btn-remove-testcase', '');
                                numOfTestcases--;
                                testCasesIdsList.splice(testCasesIdsList.indexOf(id), 1);
                                document.getElementById(`testcaseTab${id}`).remove();
                                document.getElementById(`testcasePane${id}`).remove();
                                document.getElementById('open-testcase-tab').click();
                            });
                            pane.appendChild(removeButton);

                            tab.click();
                            testCasesIdsList.push(testCasesID);
                            numOfTestcases++;
                            testCasesID++;
                        }
                    }
                    document.getElementById('open-testcase-tab').click();
                    getDraftlistFromCloud();
                })
                .catch(error => { window.location = 'dashboard.html' });
        }
        else {
            database.ref('users').child(user.uid).child('fontSize').once('value', fontSnapshot => {
                    if (fontSnapshot.exists()) {
                        editorFontSize = Number(fontSnapshot.val());
                        templateCodeEditor.setFontSize(editorFontSize);
                    }
                    getDraftlistFromCloud();
                })
                .catch(error => { getDraftlistFromCloud() });
        }
    }
    else { window.location = 'index.html' }
});
function getDraftlistFromCloud() {
    database.ref('tasksDrafts').child(auth.currentUser.uid).once('value').then(snapshot => {
        snapshot.forEach(listItem => { new Draft(listItem) });
        document.getElementById('page-start-loading').remove();
        document.getElementById('newtask-full-container').classList.remove('hided');
    });
}
function createElement(type, classAtt = null, text = null, id = null)
{
    const item = document.createElement(type);
    if (classAtt !== null) {
        item.setAttribute("class", classAtt);
    }
    if (type === 'img') {
        item.setAttribute("src", text);
    }
    else if (text !== null) {
        item.innerHTML = text;
    }
    if (id !== null) {
        item.setAttribute("id", id);
    }
    return item;
}

btnSubmit.addEventListener('click', e => {
    if (loggedin) {
        if (String(txbTaskName.value).trim() !== "") {
            if (checkIfEditorValid(editor)) {
                btnSubmit.classList.add('onclic');
                validate();
            }
            else { alertify.error('⚠️ לא הוזן תיאור למטלה') }
        }
        else { alertify.error('⚠️ לא הוזן שם למטלה') }
    }
    else { alertify.error('⚠️ על מנת להעלות מטלה חובה להתחבר ולהיות מורה מאומת/ת') }
});

function getDifficulty() {
    if (rbEasy.checked) {
        return 1;
    }
    if (rbMedium.checked) {
        return 2;
    }
    if (rbHard.checked) {
        return 3;
    } 
    return -1;
}
function setDifficulty(value) {
    switch (value) {
        case 1: rbEasy.checked = true; break;
        case 2: rbMedium.checked = true; break;
        case 3: rbHard.checked = true; break;
    }
}

function getSubject() {
    if (rbMovArray.checked) {
        return "movarray";
    }
    if (rbAritLogic.checked) {
        return "aritlogic";
    }
    if (rbLoopIf.checked) {
        return "loopif";
    }
    if (rbStack.checked) {
        return "stack";
    }
    if (rbSubroutines.checked) {
        return "subroutines";
    }
    if (rbInterrupts.checked) {
        return "interrupts";
    }
    return null;
}
function setSubject(name) {
    switch (name) {
        case 'movarray': rbMovArray.checked = true; break;
        case 'aritlogic': rbAritLogic.checked = true; break;
        case 'loopif': rbLoopIf.checked = true; break;
        case 'stack': rbStack.checked = true; break;
        case 'subroutines': rbSubroutines.checked = true; break;
        case 'interrupts': rbInterrupts.checked = true; break;
    }
}
function validate() {
    var inputs = [];
    var outputs = [];
    for (var i = 0; i < testCasesIdsList.length; i++) {
        var input = String(ace.edit(`input-code-editor-${testCasesIdsList[i]}`).getValue()).trim();
        inputs.push((input === '') ? 'nil' : input);
        var output = String(ace.edit(`output-code-editor-${testCasesIdsList[i]}`).getValue()).trim();
        outputs.push((output === '') ? 'nil' : output);
    }
    const tags = document.getElementsByClassName("tag");
    var notAllowedCommands = '';
    for (var i = 0; i < tags.length; i++) {
        notAllowedCommands += (`${tags[i].innerHTML.trim()} `);
    }
    const submitTaskPromise = functions.httpsCallable('createTask');
    const sendingObj = {
        name: txbTaskName.value,
        difficulty: getDifficulty(),
        subject: getSubject(),
        taskCodeTemplate: templateCodeEditor.getValue(),
        description: editor.root.innerHTML,
        testCasesInputs: inputs,
        testCasesOutputs: outputs
    };
    if (editingTaskID !== null) { sendingObj.taskID = editingTaskID  }
    if (checkIfEditorValid(inputFormatEditor)) {
        sendingObj.inputFormat = inputFormatEditor.root.innerHTML;
    }
    if (checkIfEditorValid(outputFormatEditor)) {
        sendingObj.outputFormat = outputFormatEditor.root.innerHTML;
    }
    if (tags.length > 0) {
        sendingObj.notAllowedCommands = notAllowedCommands.trim();
    }
    submitTaskPromise(sendingObj).then(result => {
        btnSubmit.classList.remove('onclic');
        btnSubmit.classList.add('validate');
        setTimeout(() => { btnSubmit.classList.remove('validate'); }, 1250);
    });
}
function checkIfEditorValid(editor) { return String(editor.root.textContent).trim().replace(' ', '').replace('\n', "") !== "" }

btnAddTestcase.addEventListener('click', e => { if (numOfTestcases < 10) { addTestCase() } });

function addTestCase() {
    const tab = createElement('li', 'testCasesTabBlock-tab', '(מקרה בדיקה (חסוי', `testcaseTab${String(testCasesID)}`),
        pane = createElement('div', 'testCasesTabBlock-pane', null, `testcasePane${String(testCasesID)}`);
    document.getElementById("testCasesTabBlock-tabs").appendChild(tab);
    document.getElementById("testCasesTabBlock-content").appendChild(pane);
    pane.appendChild(createElement('br'));
    pane.appendChild(createElement('img', 'icon', 'img/input.png'));
    pane.appendChild(createElement('h3', 'label', 'קלט למשתמש'));
    pane.appendChild(createElement('br'));
    pane.appendChild(createElement('br'));
    pane.appendChild(createElement('h1', 'sublabel', 'בתיבת הקוד הבאה יש להזין את המשתנים וערכיהם (באסמבלי) שיאותחלו בזכרון המעבד בסגמנט המידע בטרם הרצת התוכנית, יש לוודא ששמות המשתנים זהים בכל מקרי הבדיקה'));
    pane.appendChild(createElement('br'));
    pane.appendChild(createElement('div', 'input-code-editor', null, `input-code-editor-${String(testCasesID)}`));
    const testCaseInputTemp = ace.edit(`input-code-editor-${String(testCasesID)}`);
    testCaseInputTemp.setTheme("ace/theme/twilight");
    testCaseInputTemp.session.setMode("ace/mode/assembly_x86");
    testCaseInputTemp.setShowPrintMargin(false);
    pane.appendChild(createElement('img', 'icon', 'img/output.png'));
    pane.appendChild(createElement('h3', 'label', 'פלט מהמשתמש'));
    pane.appendChild(createElement('br'));
    pane.appendChild(createElement('br'));
    pane.appendChild(createElement('h1', 'sublabel', 'בתיבת הטקסט הבאה יש להזין, כטקסט חופשי (לא כקוד אסמבלי), את הפלט אשר מוגדר כפלט הנכון עבור מקרה בדיקה זה'));
    pane.appendChild(createElement('br'));
    pane.appendChild(createElement('div', 'output-code-editor', null, `output-code-editor-${String(testCasesID)}`));
    const testCaseOutputTemp = ace.edit(`output-code-editor-${String(testCasesID)}`);
    testCaseOutputTemp.setTheme("ace/theme/twilight");
    testCaseOutputTemp.setShowPrintMargin(false);
    const removeButton = createElement('button', 'remove-testcase', 'מחיקת מקרה בדיקה 🗑️', `btn-remove-testcase${String(testCasesID)}`);
    removeButton.addEventListener('click', e => {
        const id = String(e.srcElement.id).replace('btn-remove-testcase', '');
        numOfTestcases--;
        testCasesIdsList.splice(testCasesIdsList.indexOf(id), 1);
        document.getElementById(`testcaseTab${id}`).remove();
        document.getElementById(`testcasePane${id}`).remove();
        document.getElementById('open-testcase-tab').click();
    });
    pane.appendChild(removeButton);

    tab.click();
    testCasesIdsList.push(testCasesID);
    numOfTestcases++;
    testCasesID++;
}

class Draft {
    constructor(datasnapshot = null) {
        if (datasnapshot === null) {
            btnAddDraft.classList.remove('onclic');
            btnAddDraft.classList.add('validate');
            this.name = String(txbTaskName.value);
            this.difficulty = getDifficulty();
            this.subject = getSubject();
            this.templateCodeEditor = String(templateCodeEditor.getValue());
            this.description = editor.root.innerHTML;
            if (checkIfEditorValid(inputFormatEditor)) this.inputFormat = inputFormatEditor.root.innerHTML;
            if (checkIfEditorValid(outputFormatEditor)) this.outputFormat = outputFormatEditor.root.innerHTML;
            // #region Get Not Allowed Commands
            const tags = document.getElementsByClassName("tag");
            var notAllowedCommandsTemp = '';
            for (var i = 0; i < tags.length; i++) notAllowedCommandsTemp += (`${tags[i].innerHTML.trim()} `);
            // #endregion
            if (notAllowedCommandsTemp.trim() !== '') this.notAllowedCommands = notAllowedCommandsTemp.trim();

            this.inputs = [];
            this.outputs = [];
            for (var i = 0; i < testCasesIdsList.length; i++) {
                var input = String(ace.edit(`input-code-editor-${testCasesIdsList[i]}`).getValue()).trim();
                this.inputs.push((input === '') ? 'nil' : input);
                var output = String(ace.edit(`output-code-editor-${testCasesIdsList[i]}`).getValue()).trim();
                this.outputs.push((output === '') ? 'nil' : output);
            }
            const dbItem = database.ref('tasksDrafts').child(auth.currentUser.uid).push();
            dbItem.set(this).then(() => { setTimeout(() => { btnAddDraft.classList.remove('validate'); }, 1250); });
            this.dbKey = String(dbItem.key);
        }
        else {
            this.name = datasnapshot.val().name;
            this.difficulty = datasnapshot.val().difficulty;
            this.subject = datasnapshot.val().subject;
            this.description = datasnapshot.val().description;
            this.templateCodeEditor = datasnapshot.val().templateCodeEditor;
            if (datasnapshot.child('inputFormat').exists()) this.inputFormat = datasnapshot.val().inputFormat;
            if (datasnapshot.child('outputFormat').exists()) this.outputFormat = datasnapshot.val().outputFormat;
            if (datasnapshot.child('notAllowedCommands').exists()) this.notAllowedCommands = datasnapshot.val().notAllowedCommands;
            this.inputs = [];
            if (datasnapshot.child('inputs').exists()) {
                datasnapshot.child('inputs').forEach(item => { this.inputs.push(String(item.val())) });
            }
            this.outputs = [];
            if (datasnapshot.child('outputs').exists()) {
                datasnapshot.child('outputs').forEach(item => { this.outputs.push(String(item.val())) });
            }
            this.dbKey = datasnapshot.key;
        }
        tasksDrafts.push(this);
        document.getElementById('taskslist_container').appendChild(document.createElement('draftlist-item'));
    }

    setDraftToPage() {
        txbTaskName.value = this.name;
        setDifficulty(this.difficulty);
        setSubject(this.subject);
        editor.root.innerHTML = this.description;
        templateCodeEditor.setValue(this.templateCodeEditor);
        templateCodeEditor.clearSelection();
        inputFormatEditor.root.innerHTML = 'inputFormat' in this ? String(this.inputFormat) : '';
        outputFormatEditor.root.innerHTML = 'outputFormat' in this ? String(this.outputFormat) : '';
        const notAllowedCommandsList = document.getElementById('notAllowedCommandsList');
        notAllowedCommandsList.innerHTML = '';
        if ('notAllowedCommands' in this) {
            String(this.notAllowedCommands).split(' ').forEach(item => {
                const element = document.createElement('li');
                element.setAttribute('class', 'tag');
                element.innerHTML = item;
                notAllowedCommandsList.appendChild(element);
            });
        }
        testCasesIdsList.forEach(item => {
            if (item != 0) {
                document.getElementById(`testcasePane${item}`).remove();
                document.getElementById(`testcaseTab${item}`).remove();
            }
        });
        numOfTestcases = 1;
        testCasesID = 1;
        testCasesIdsList = [0];
        if (this.outputs.length > 0 && this.inputs.length > 0) {
            for (var i = 0; i < this.inputs.length - 1; i++) { addTestCase() }
            testCasesIdsList.forEach(item => {
                const testCaseInputTemp = ace.edit(`input-code-editor-${item}`);
                testCaseInputTemp.setValue((this.inputs[item] !== 'nil') ? this.inputs[item] : '');
                testCaseInputTemp.clearSelection();
                const testCaseOutputTemp = ace.edit(`output-code-editor-${item}`);
                testCaseOutputTemp.setValue((this.outputs[item] !== 'nil') ? this.outputs[item] : '');
                testCaseOutputTemp.clearSelection();
            });
        }
        else {
            ace.edit('input-code-editor-0').setValue('');
            ace.edit('output-code-editor-0').setValue('');
        }
        document.getElementById('open-testcase-tab').click();
    }
}