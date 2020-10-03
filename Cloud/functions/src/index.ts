import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp({
    credential: admin.credential.cert(require("../key/admin.json")),   //developer private API key file
    databaseURL: "https://asm-learn.firebaseio.com",
    storageBucket: "asm-learn.appspot.com"
});
const adminAuth = admin.auth();
const database = admin.database();
const storage = admin.storage().bucket();

//private token, without adding this token to the http requests - it won't work.
const appToken = 'z^mp0a6tPS8hAQZ@RfZg^dvxKOCEw(Pc';

//http request for creating new tasks / updating an existing task.
export const createTask = functions.https.onCall((data, context): void => {
    //getting from the request the crucial params
    const taskName = String(data.name);
    const taskDifficulty = Number(data.difficulty);
    const taskSubject = String(data.subject);
    const taskDescription = String(data.description);
    const taskInputFormat = String(data.inputFormat);
    const taskID = String(data.taskID);
    const taskOutputFormat = String(data.outputFormat);
    const taskNotAllowedCommands = String(data.notAllowedCommands);
    const taskCodeTemplate = String(data.taskCodeTemplate);
    const taskTCsInputs = data.testCasesInputs as string[];
    const taskTCsOutputs = data.testCasesOutputs as string[];
    const auth = context.auth;
    
    //checks if the request was sent by an authenticated user.
    if (auth) {
        const uid = auth.uid;
        //ensures all the crucial params were given and defined.
        if (typeof data.name === 'undefined' || 
            typeof data.difficulty === 'undefined' || 
            typeof data.subject === 'undefined' || 
            typeof data.description === 'undefined' || 
            typeof data.taskCodeTemplate === 'undefined' || !taskTCsOutputs || !taskTCsInputs) {
            console.error(`ERROR: The User (UID: ${uid}) tried to create a task but one or more curcial parameters were missing.`);
            return;
        }
        //checks if the user who sent the request is a verified teacher
        database.ref('users').child(uid).child('teacher').once('value').then(dbData => {
            //validates that the user marked as verified teacher in the database
            if (dbData.exists()) {
                //creates the basic object - this object will be stored in the database 
                const sendingObj = {
                    description: taskDescription,
                    numOfTCs: taskTCsOutputs.length,
                    submitedOn: new Date().toLocaleString('he-IL', { timeZone: 'Asia/Jerusalem' })
                };
                //adds optional params to the object (if the teacher added).
                if ((taskTCsInputs.length > 0) && (taskTCsInputs[0] !== 'nil')) { 
                    definePropertyInObject(sendingObj, "openTCInput", taskTCsInputs[0]); 
                }
                if (typeof data.inputFormat !== 'undefined' && taskInputFormat.trim() !== '') { 
                    definePropertyInObject(sendingObj, "inputFormat", taskInputFormat); 
                }
                if (typeof data.outputFormat !== 'undefined' && taskOutputFormat.trim() !== '') { 
                    definePropertyInObject(sendingObj, "outputFormat", taskOutputFormat); 
                }
                if (typeof data.notAllowedCommands !== 'undefined' && taskNotAllowedCommands.trim() !== '') {
                    definePropertyInObject(sendingObj, "notAllowedCommands", taskNotAllowedCommands); 
                }
                //creates the data will be shown/used in the tasks list (in the main dashboard). [saving the informat apart makes the reading process faster]
                const menuTaskInfoObj = {
                    name: taskName,
                    difficulty: taskDifficulty,
                    author: uid,
                    subject: taskSubject,
                    query: `${taskDifficulty}_${taskSubject}`
                };
                //checks if the task isn't already there [there is no task with the same id]. (in this case the user creates a new task).
                if (typeof data.taskID === 'undefined') {
                    const newTask = database.ref('tasks').push(sendingObj); //pushing the data object to the database. the method returns unique task id.
                    newTask.then(() => {
                        const newTaskKey = newTask.key;
                        if (newTaskKey !== null) {
                            //creates the template asm file in storage.
                            storage.file(`tasksCodeTemplates/${newTaskKey}.asm`)
                                .save(taskCodeTemplate, { gzip: true, metadata: { cacheControl: 'no-cache' } /* the contents will change */ }).then(() => {
                                    database.ref('menuTasksInfo').child(newTaskKey).set(menuTaskInfoObj).catch(error => { return false; });
                                    taskTCsInputs.forEach((value, key) => {
                                        database.ref('tasksPrivateTCs').child(newTaskKey).child('inputs').child(String(key)).set(value).catch(error => { return false; });
                                    });
                                    taskTCsOutputs.forEach((value, key) => {
                                        database.ref('tasksPrivateTCs').child(newTaskKey).child('outputs').child(String(key)).set(value).catch(error => { return false; });
                                    });
                                }).catch(error => { return false });
                        }
                        //increases the number of tasks by 1.
                        database.ref('global').child('numOfTasks').once('value').then(numOfTasksData => {
                            database.ref('global').child('numOfTasks').set(Number(numOfTasksData.val()) + 1).catch(error => { return false; });
                            console.info(`The user (UID: ${uid} ) created a new task (TaskID: ${newTaskKey}, Name: ${taskName}).`);
                        }).catch(error => { return false; });
                    }).catch(error => { return false; });
                }
                //if the user isn't the teacher who created the task, it will check if the user is an admin. admins have premissions to update any task.
                //if the user is an admin, same process will happend (as above).
                else {
                    database.ref('users').child(uid).child('admin').once('value')
                        .then(dbAdmin => {
                            const isAdmin = dbAdmin.exists();
                            database.ref('menuTasksInfo').child(taskID).child('author').once('value').then(authorDataSnapshot => {
                                if (isAdmin || (authorDataSnapshot.exists() && String(authorDataSnapshot.val()) === uid)) {
                                    menuTaskInfoObj.author = String(authorDataSnapshot.val()); 
                                    storage.file(`tasksCodeTemplates/${taskID}.asm`)
                                        .save(taskCodeTemplate, { gzip: true, metadata: { cacheControl: 'no-cache' } /* the contents will change */ }).then(() => {
                                            database.ref('menuTasksInfo').child(taskID).set(menuTaskInfoObj).catch(error => { return false; });
                                            taskTCsInputs.forEach((value, key) => {
                                                database.ref('tasksPrivateTCs').child(taskID).child('inputs').child(String(key)).set(value).catch(error => { return false; });
                                            });
                                            taskTCsOutputs.forEach((value, key) => {
                                                database.ref('tasksPrivateTCs').child(taskID).child('outputs').child(String(key)).set(value).catch(error => { return false; });
                                            });
                                            database.ref('tasks').child(taskID).set(sendingObj).then(() => {
                                                if (isAdmin && String(authorDataSnapshot.val()) !== uid) { 
                                                    console.info(`The Admin (UID: ${uid}) updated an existing task (TaskID: ${taskID}, Name: ${taskName}).`) 
                                                }
                                                else { console.info(`The user (UID: ${uid}) updated an existing task (TaskID: ${taskID}, Name: ${taskName}).`) }
                                            }).catch(error => { return false; });
                                        }).catch(error => { return false });
                                }
                                else { console.error(`ERROR: The User (UID: ${uid}) tried to update a task (TaskID: ${taskID}) even though he isn't the original author.`) }
                            }).catch(error => { return false });
                        })
                        .catch(error => { return false; });
                }
            }
            else { console.error(`ERROR: The User (UID: ${uid}) tried to create a task even though he isn't a teacher.`) }
        }).catch(error => { return false });
    }
    else { console.error('ERROR: An unregistered user tried to submit a task.') }
});
//the function deletes an existing task.
export const removeTask = functions.https.onCall((data, context): Promise<boolean> => {
    //getting the curcial params
    const taskID = String(data.taskID);
    const auth = context.auth;
    //checks if the request was sent by an authenticated user.
    if (auth) {
        const uid = auth.uid;
         //ensures all the crucial params were given and defined.
        if (typeof data.taskID === 'undefined') {
            console.error(`ERROR: The User (UID: ${uid}) tried to delete a task but didn't specify TaskID.`);
            return Promise.reject(false);
        }
        //getting from database if the user is an admin.
        return database.ref('users').child(uid).child('admin').once('value').then(adminSnap => {
            return database.ref('menuTasksInfo').child(taskID).child('author').once('value').then(datasnapshot => {
                if (datasnapshot.exists()) {
                    const authorUID = String(datasnapshot.val());
                    //checks if the requester is either an admin or the author.
                    if ((uid === authorUID) || adminSnap.exists()) {
                        //removes from all the paths where there are task's records.
                        return database.ref('menuTasksInfo').child(taskID).remove().then(() => {
                            return database.ref('tasks').child(taskID).remove().then(() => {
                                return database.ref('tasksPrivateTCs').child(taskID).remove().then(() => {
                                    return database.ref('global').child('numOfTasks').once('value').then(numOfTasksData => {
                                        return database.ref('global').child('numOfTasks').set(Number(numOfTasksData.val()) - 1).then(() => {
                                                console.info(`The user (UID: ${uid}) deleted a task (TaskID: ${taskID}).`);
                                                return true;
                                            }).catch(error => { return false; });
                                    }).catch(error => { return false; });
                                }).catch(error => { return false; });
                            }).catch(error => { return false; });
                        }).catch(error => { return false; });
                    }
                    else {
                        console.error(`ERROR: A non admin user (UID: ${uid}) tried to delete a task that not written by him/her (TaskID: ${taskID}).`);
                        return false;
                    }
                }
                else {
                    console.error(`ERROR: The user (UID: ${uid}) tried to delete a task that doesn't exist (TaskID: ${taskID}).`);
                    return false;
                }
            }).catch(error => { return false; });
        }).catch(error => { return false; });
    }
    else {
        console.error('ERROR: An unregistered user tried to delete a task.');
        return Promise.reject(false);
    }
});
export const submitTask = functions.https.onCall((data, context): Promise<boolean> => {
    //getting the curcial params
    const taskID = String(data.taskID);
    const code = String(data.code);
    const onlySave = (typeof data.onlySave === 'undefined') ? false : Boolean(data.onlySave);
    const auth = context.auth;
    //checks if the request was sent by an authenticated user.
    if (auth) {
        const uid = auth.uid;
        //ensures all the crucial params were given and defined.
        if (typeof data.taskID === 'undefined' || typeof data.code === 'undefined') {
            console.error(`ERROR: The User (UID: ${uid}) tried to submit a task but one or more curcial parameters were missing.`);
            return Promise.reject(false);
        }
        else {
            //getting all task's private inputs from database 
            return database.ref("tasksPrivateTCs").child(taskID).child("inputs").once('value').then(dataSnapshot => {  /* TC = Test Case */
                return database.ref("global").child('isFrontendCompiler').once('value').then(fronCompDS => {
                    const isFrontendCompiler = fronCompDS.exists();
                    return database.ref("usersTasksData").child(uid).child(taskID).remove().then(() => {
                        //declares the promises list -> all the test cases will be done at parallel.
                        const promises: Promise<boolean>[] = [];
                        //foreach test-case it will add an async task.
                        dataSnapshot.forEach(childSnapshot => {
                            promises.push(new Promise((resolve, reject) => {
                                Promise.resolve(String(childSnapshot.key)).then(testcaseID => {
                                    //creates the asm file in storage after replacing the inputs to each test-case.
                                    storage.file(`usersSubmissions/${uid}/${taskID}/${testcaseID}.asm`)
                                        .save(code.replace(dataSnapshot.child('0').val(), dataSnapshot.child(testcaseID).val()), { 
                                        gzip: true, metadata: { cacheControl: 'no-cache' } /* the contents will change */ })
                                        .then(() => { 
                                        resolve((isFrontendCompiler || onlySave) ? true : (database.ref('usersSubmissions').push({ 
                                            userID: uid, taskID, testcaseID 
                                        }).key !== null)) })
                                        .catch(error => { reject(false) });
                                }).catch(error => { reject(false) })
                            }));
                        });
                        //executes all the requests in parallel.
                        return Promise.all(promises).then(values => {
                            if (onlySave) {
                                console.info(`The user (UID: ${uid}) saved a task in the database (TaskID: ${taskID}, NumOfTCs: ${values.length}).`);
                            }
                            else {
                                console.info(`The user (UID: ${uid}) submitted a task to the engine (TaskID: ${taskID}, NumOfTCs: ${values.length}).`);
                            }
                            return true;
                        }).catch(error => { return false });
                    }).catch(error => { return false; });
                })

            }).catch(error => { return false; });
        }
    }
    else {
        console.error('ERROR: An unregistered user tried to submit a task.');
        return Promise.reject(false);
    }
});
//getting a spesific user's data (name & image) by his uid.
export const getUserData = functions.https.onCall((data, context) => {
    //getting the curcial params
    const requestedUser = String(data.uid), auth = context.auth;
    //checks if the request was sent by an authenticated user.
    if (auth) {
        const uid = auth.uid;
        //ensures all the crucial params were given and defined.
        if (typeof data.uid === 'undefined') {
            console.error(`ERROR: The User (UID: ${uid}) tried to get details about another user but did not specify his\her UID.`);
            return null;
        }
        //getting from firebase's admin service all the data and returns it to the client.
        return adminAuth.getUser(requestedUser)
            .then(userRecord => {
                //leaving a record in the log that someone got someones else info (for security purposes).
                console.info(`A user (UID: ${uid}) got the data of another user (UID: ${requestedUser}).`);
                if (userRecord.photoURL) return [userRecord.displayName ? userRecord.displayName : null, userRecord.photoURL];
                return userRecord.displayName ? userRecord.displayName : null
            })
            .catch(error => {
                console.warn(`A user (UID: ${uid}) tried to get the data of another user (UID: ${requestedUser}) but the user not found. MORE INFO: ${error}`);
                return null;
            });
    }
    console.error(`ERROR: An unregistered user tried to get user's data`);
    return null;
});
export const resultFromEngine = functions.https.onRequest((request, response): void => {
    if (typeof request.query.token === 'undefined') {
        console.error(`ERROR: The socket ${getRequestSenderIPPort(request)} tried to invoke the action but with no token.`);
        response.status(401).send('You are not allowed to use this action. Do not try again.');
    }
    else {
        const token = String(request.query.token);
        if (token === appToken) {
            const taskID = String(request.query.taskID);
            const testcaseID = String(request.query.testcaseID);
            const userID = String(request.query.userID);
            const statusCode = String(request.query.statusCode);

            if (typeof request.query.taskID === 'undefined') {
                console.error(`ERROR: The socket ${getRequestSenderIPPort(request)} tried to send the results for:
The user (UID: ${userID}),
The testcase (TestcaseID: ${testcaseID}),
Status code: ${statusCode},
but the task ID not found.`);
                response.status(400).send('We were unable to understand your request, one or more curcial parameters were missing.');
            }
            if (typeof request.query.testcaseID === 'undefined') {
                console.error(`ERROR: The socket ${getRequestSenderIPPort(request)} tried to send the results for:
The user (UID: ${userID}),
The task (TaskID: ${taskID}),
Status code: ${statusCode},
but the testcase ID not found.`);
                response.status(400).send('We were unable to understand your request, one or more curcial parameters were missing.');
            }
            if (typeof request.query.userID === 'undefined') {
                console.error(`ERROR: The socket ${getRequestSenderIPPort(request)} tried to send the results for:
The task (TaskID: ${taskID}),
The testcase (TestcaseID: ${testcaseID}),
Status code: ${statusCode},
but the user ID (UID) not found.`);
                response.status(400).send('We were unable to understand your request, one or more curcial parameters were missing.');
            }
            else {
                if (Number(testcaseID) >= 0 && Number(testcaseID) <= 10) {
                    adminAuth.getUser(userID).then(() => {
                        if (typeof request.query.eventID !== 'undefined') { 
                            database.ref('usersSubmissions').child(String(request.query.eventID)).remove().catch(error => {  return false; })
                        }
                        if (typeof request.query.statusCode !== 'undefined') {
                            /*
                             * 200 - OK
                             * The cases when somthing bad happend. The error codes:
                             * 408 - Request Timeout 
                             * 417 - Expectation Failed - The program failed to compile. 
                             * 420 - Runtime Error - The program failed in runtime.
                             * 429 - Too Many Requests
                             * 451 - Unavailable For Legal Reasons - The program has malicious code.
                             * 508 - Loop Detected - The engine detected an infinte loop in the program.
                             */
                            if (statusCode === '200') {
                                console.info(`The socket ${getRequestSenderIPPort(request)} succeeded to send the results for:
The user (UID: ${userID}),
The task (TaskID: ${taskID}),
The testcase (TestcaseID: ${testcaseID}),
Status code: ${statusCode},
Output: ${String(request.query.output)}`);
                            }
                            else {
                                console.info(`The socket ${getRequestSenderIPPort(request)} succeeded to send the results for:
The user (UID: ${userID}),
The task (TaskID: ${taskID}),
The testcase (TestcaseID: ${testcaseID}),
Status code: ${statusCode}`);
                            }
                            database.ref('tasksPrivateTCs').child(taskID).child('outputs').child(String(testcaseID)).once('value')
                                .then(dataSnapshot => {
                                    const expectedOutput = String(dataSnapshot.val());
                                    const usersTasksDataPath = database.ref('usersTasksData').child(userID).child(taskID).child('testcases').child(testcaseID);
                                    database.ref('tasks').child(taskID).child('numOfTCs').once('value', numOfTCsSnapshot => {
                                        const numOfTCs = Number(numOfTCsSnapshot.val());
                                        database.ref('usersTasksData').child(userID).child(taskID).child('status').once('value', statusSnapshot => {
                                            let status = '';
                                            if (statusSnapshot.exists()) { status = String(statusSnapshot.val()); }
                                            else { for (let i = 0; i < numOfTCs; i++) { status += '0' } }
                                            if (statusCode === '200') {
                                                const yourOutput = String(request.query.output);
                                                if (yourOutput === expectedOutput || yourOutput === `${expectedOutput}\n`) {
                                                    status = setCharAt(status, Number(testcaseID), '1');
                                                    usersTasksDataPath.set((testcaseID === '0') ? { expectedOutput, yourOutput, result: 'correct' } : { result: 'correct' })
                                                        .catch(error => { return false }); 
                                                }
                                                else {
                                                    status = setCharAt(status, Number(testcaseID), '0');
                                                    usersTasksDataPath.set((testcaseID === '0') ? { expectedOutput, yourOutput, result: 'wrong' } : { result: 'wrong' })
                                                        .catch(error => { return false }); 
                                                }
                                                database.ref('usersTasksData').child(userID).child(taskID).child('status').set(status).catch(error => { return false });
                                                if (!status.includes("0")) {
                                                    database.ref('users').child(userID).child('tasksSolvedList').child(taskID).set("true").catch(error => { return false });
                                                    database.ref('users').child(userID).child('tasksPartiallySolvedList').child(taskID).remove().catch(error => { return false });
                                                }
                                                else {
                                                    database.ref('users').child(userID).child('tasksPartiallySolvedList').child(taskID).set("true").catch(error => { return false });
                                                    database.ref('users').child(userID).child('tasksSolvedList').child(taskID).remove().catch(error => { return false });
                                                }
                                            }
                                            else if (statusCode === '408' || 
                                                     statusCode === '417' || 
                                                     statusCode === '420' || 
                                                     statusCode === '429' || 
                                                     statusCode === '451' || 
                                                     statusCode === '508') {
                                                function updateResultWithError(result: string): void {
                                                    const errorMessage = String(request.query.errorMessage);
                                                    if (testcaseID === '0') {
                                                        usersTasksDataPath.set((typeof request.query.errorMessage !== 'undefined') ?
                                                                               { expectedOutput, result, errorMessage } : 
                                                                               { expectedOutput, result }).catch(error => { return false }) 
                                                    }
                                                    else { usersTasksDataPath.set((typeof request.query.errorMessage !== 'undefined') ?
                                                                                  { result, errorMessage } : 
                                                                                  { result }).catch(error => { return false }) }
                                                }
                                                switch (statusCode) {
                                                    // #region Status Code 408
                                                    case '408': usersTasksDataPath.set((testcaseID === '0') ? 
                                                                                       { expectedOutput, result: 'timeout' } : 
                                                                                       { result: 'timeout' }).catch(error => { return false; });
                                                        break;
                                                    // #endregion

                                                    // #region Status Code 417
                                                    case '417': updateResultWithError('compilation failed'); break;
                                                    // #endregion

                                                    // #region Status Code 420
                                                    case '420': updateResultWithError('runtime error'); break;
                                                    // #endregion

                                                    // #region Status Code 429
                                                    case '429': usersTasksDataPath.set((testcaseID === '0') ? 
                                                                                       { expectedOutput, result: 'overload' } :
                                                                                       { result: 'overload' })
                                                        .catch(error => { return false; });
                                                        break;
                                                    // #endregion

                                                    // #region Status Code 451
                                                    case '451': usersTasksDataPath.set((testcaseID === '0') ? 
                                                                                       { expectedOutput, result: 'malicious code' } : 
                                                                                       { result: 'malicious code' }).catch(error => { return false; });
                                                        break;
                                                    // #endregion

                                                    // #region Status Code 508
                                                    case '508': usersTasksDataPath.set((testcaseID === '0') ? 
                                                                                       { expectedOutput, result: 'infinite loop' } : 
                                                                                       { result: 'infinite loop' }).catch(error => { return false; });
                                                        break;
                                                    // #endregion
                                                }
                                                status = setCharAt(status, Number(testcaseID), '0');
                                                database.ref('usersTasksData').child(userID).child(taskID).child('status').set(status).catch(error => { return false; });
                                            }
                                            else { console.error(`ERROR: The socket ${getRequestSenderIPPort(request)} tried to send the results for:
The user (UID: ${userID}),
The task (TaskID: ${taskID}),
The testcase (TestcaseID: ${testcaseID}),
but the status code (${statusCode}) isn't valid.`);
                                                response.status(400).send('The Status Code is not valid.');
                                            }
                                        }).catch(error => { return false; });
                                    }).catch(error => { return false; });
                                }).catch(error => { return false; });
                            response.status(200).send('The result was received.');
                        }
                        else { console.error(`ERROR: The socket ${getRequestSenderIPPort(request)} tried to send the results for:
The user (UID: ${userID}),
The task (TaskID: ${taskID}),
The testcase (TestcaseID: ${testcaseID}),
but the status code not found.`);
                            response.status(400).send('We were unable to understand your request, one or more curcial parameters were missing.');
                        }
                    }).catch(error => {
                        if (error.code === 'auth/user-not-found') {
                            console.error(`ERROR: The socket ${getRequestSenderIPPort(request)} tried to send the results for the user (UID: ${userID}) but the user doesn't exists.`);
                            response.status(400).send('The user you tried to return the results to does not exist.');
                        }
                        else {
                            console.error(`ERROR: The socket ${getRequestSenderIPPort(request)} tried to send the results for the user (UID: ${userID}) but there was an error to validate his UID. MORE INFO: ${error}`);
                            response.status(400).send('We could not validate the user you tried to return the results to.');
                        }
                    });
                }
                else {
                    console.error(`ERROR: The socket ${getRequestSenderIPPort(request)} tried to send the results for the user (UID: ${userID}) but the test case id (${testcaseID}) was out of range.`);
                    response.status(400).send('The test case id is out of range.');
                }
            }
        }
        else {
            console.error(`ERROR: The socket ${getRequestSenderIPPort(request)} tried to invoke the action but with incorrect token. (Token: ${token})`);
            response.status(401).send('You are not allowed to use this action. Do not try again.');
        }
    }
});
export const getTaskPrivateInputs = functions.https.onRequest((request, response) => {
    if (typeof request.query.token === 'undefined') {
        console.error(`ERROR: The socket ${getRequestSenderIPPort(request)} tried to invoke the action but with no token.`);
        response.status(401).send('You are not allowed to use this action. Do not try again.');
        return;
    }
    const token = String(request.query.token);
    if (token === appToken) {
        if (typeof request.query.taskID === 'undefined') {
            console.error(`ERROR: The socket ${getRequestSenderIPPort(request)} tried to invoke the action but the task ID was missing.`);
            response.status(400).send(`We were unable to understand your request, the task's ID was missing.`);
            return;
        }
        const taskID = String(request.query.taskID);
        database.ref("tasksPrivateTCs").child(taskID).child("inputs").once('value')
            .then(dataSnapshot => {
                console.info(`The socket ${getRequestSenderIPPort(request)} succeeded to invoke the action and got the task's input(s). (TaskID: ${taskID})`);
                response.status(200).send(dataSnapshot.toJSON())
            })
            .catch(error => {
                console.error(`ERROR: The socket ${getRequestSenderIPPort(request)} tried to invoke the action but something went wrong with the database. MORE INFO: ${error}`);
                response.status(500).send('Something went wrong while processing your request. Please Try Again Later.');
            });
    }
    else {
        console.error(`ERROR: The socket ${getRequestSenderIPPort(request)} tried to invoke the action but with incorrect token. (Token: ${token})`);
        response.status(401).send('You are not allowed to use this action. Do not try again.');
    }
});

function setCharAt(str: string, index: number, chr: string): string {
    return (index > str.length - 1) ? str : `${str.substr(0, index)}${chr}${str.substr(index + 1)}`;
}
function getRequestSenderIPPort(request: functions.https.Request): string {
    return `${(request.headers['x-forwarded-for']  || request.connection.remoteAddress)}:${String(request.connection.remotePort)}`;
}
function definePropertyInObject(obj: object, name: string, value: string): void {
    Object.defineProperty(obj, name, {
        value: value,
        writable: true,
        enumerable: true,
        configurable: true
    });
}
