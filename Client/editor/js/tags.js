class Tags extends React.Component {
    constructor(props) {
        super(props);
        this.state = { tags: String(props.tags).toUpperCase().split(' ') };
    }
    render() {
        const { tags, value } = this.state;
        return (React.createElement("div", { className: "form" },
            React.createElement("div", { className: "tags" },
                React.createElement("ul", null, tags.map((tag, i) => React.createElement("li", { key: tag + i, className: "tag" }, tag))),

                React.createElement("div", {
                    value: value,
                    onChange: this.handleChange,
                    ref: "tag",
                    className: "tag-input"
                }))));
    }
}