const ENTER_KEY = 13;
const COMMA_KEY = 188;
const BACKSPACE_KEY = 8;

class Tags extends React.Component {
    constructor(props) {
        super(props);
        this.state = { tags: localStorage.getItem('taskID') === null ? [] : String(props.tags).toUpperCase().split(' '), value: "" };
        this.handleChange = this.handleChange.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
    }

    handleChange(e) {
        this.setState({ value: e.target.value });
    }

    handleKeyUp(e) {
        const key = e.keyCode;
        if (key === ENTER_KEY || key === COMMA_KEY) { this.addTag() }
    }

    handleKeyDown(e) {
        const key = e.keyCode;
        if (key === BACKSPACE_KEY && !this.state.value) { this.editPrevTag() }
    }

    addTag() {
        const { tags, value } = this.state;
        let tag = value.toUpperCase().trim();
        tag = tag.replace(/,/g, "");
        if (!tag) { return }
        this.setState({ tags: [...tags, tag], value: "" });
    }

    editPrevTag() {
        let { tags } = this.state;
        const tag = tags.pop();
        this.setState({ tags, value: tag });
    }

    render() {
        const { tags, value } = this.state;
        return (React.createElement("div", { className: "form" },
            React.createElement("div", { className: "tags" },
                React.createElement("ul", { id: 'notAllowedCommandsList' }, tags.map((tag, i) => React.createElement("li", { key: tag + i, className: "tag" }, tag))),
                React.createElement("input", {
                    type: "text",
                    id: 'txb_notAllowedCommands',
                    placeholder: "הוספת פקודה...",
                    value: value,
                    onChange: this.handleChange,
                    ref: "tag",
                    className: "tag-input",
                    onKeyUp: this.handleKeyUp,
                    onKeyDown: this.handleKeyDown
                }))));
    }
}
if (localStorage.getItem('taskID') === null) {
    ReactDOM.render(React.createElement(Tags, null), document.getElementById("notAllowedCommands"));
}
