var draftlistItemTemplate = document.createElement('draftlistItemTemplate');
draftlistItemTemplate.innerHTML = `
<style>
* {
    cursor: pointer;
}
.item-box {
    display: flex;
    direction:rtl;
    width: calc(100% - 60px);
    float: right;
    height: 50px;
    background-color: rgba(255,255,255,0.5);
    margin: 5px;
    border-radius: 10px;
    box-shadow: 0 1px 5px #19304764;
}
.item-box:hover {
    background-color: rgba(255,255,255,0.9);
}
.delete-icon {
    display:inline;
    width: 30px;
    height: 30px;
    float: left;
    padding: 2px;
    line-height: 30px;
    margin-left: 10px;
    font-size: 15px;
    text-align: center;
    background-color: rgba(168, 36, 36,0.7);
    border: 2px solid rgba(168, 36, 36,0.5);
    transition: all 0.3s ease;
    box-shadow: 0 2px 10px #19304764;
    border-radius: 20px;
    cursor: pointer !important;
    outline: none;
}
  .delete-icon:hover {
        background: rgb(168, 36, 36);
        box-shadow: 0px 1px 5px 2px rgba(168, 36, 36,0.5);
        color: rgba(255,255,255,0.7);
    }
.icon {
    display:inline;
    width: 30px;
    height: 30px;
    margin: 10px;
}
.task-title {
    display:inline;
    font-size: 18px;
    font-weight: lighter;
    font-family: 'Secular One', sans-serif;
    margin-top: 18px;
    text-align: right;
}
</style>

<div id="item_box" class="item-box">  
<img src="newtask/img/draft.png" class="icon" />
<h1 id="task_title" class="task-title"></h1>
    
</div>
<h1 id="btn_delete" title="מחיקת טיוטה מהרשימה" class="delete-icon">🗑️</h1>
`;

class DraftListItem extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot.appendChild(draftlistItemTemplate.cloneNode(true));

        this.index = tasksDrafts.length - 1;
        this.name = tasksDrafts[this.index].name;
        
        const taskTitle = this.shadowRoot.getElementById('task_title');
        taskTitle.innerText = this.name;

        const itemBox = this.shadowRoot.getElementById('item_box');
        itemBox.addEventListener('click', e => {
            tasksDrafts[this.index].setDraftToPage();
        });

        const btnDelete = this.shadowRoot.getElementById('btn_delete');
        btnDelete.addEventListener('click', e => {
            database.ref('tasksDrafts').child(auth.currentUser.uid).child(tasksDrafts[this.index].dbKey).remove().then(() => {
                btnDelete.remove();
                this.shadowRoot.getElementById('item_box').remove();
            });
        });
    }
}

window.customElements.define("draftlist-item", DraftListItem);
