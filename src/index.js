import React from "react";
import ReactDOM from "react-dom";

import "./styles.css";

const ChildWrapper = ({ children, onClickAddElement }) => {
  return (
    <div style={{ border: "1px dotted grey", position: "relative" }}>
      {children}
      <button
        style={{ position: "absolute", left: 0, top: "0", background: "red" }}
        onClick={() => onClickAddElement && onClickAddElement()}
      >
        +
      </button>
    </div>
  );
};

const id = () => Math.random();
const textComponent = () => ({
  id: id(),
  type: "text",
  props: { text: "Hello!", color: "red-400", size: "4xl" }
});
const buttonComponent = () => ({
  id: id(),
  type: "button",
  props: { text: "my button", url: "http://sapo.pt" }
});

const componentsTree = {
  text: {
    generator: textComponent
  },
  button: {
    generator: buttonComponent
  }
};

class Disp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      elements: [
        {
          id: "aaa",
          type: "wrapper",
          children: [
            textComponent(),
            {
              id: "blablabla",
              type: "buttons",
              props: {
                styleChildren: { border: "1px solid red", marginRight: "20px" }
              },
              children: [buttonComponent(), buttonComponent()]
            }
          ]
        }
      ]
    };
  }

  addElement(id, type) {
    let elements = this.state.elements;

    const loop = element => {
      if (element.children) {
        element.children = element.children.map(loop);
      }
      if (element.id === id) {
        const comp = componentsTree[type];
        if (comp) {
          element.children.push(comp.generator());
        }
      }
      return element;
    };

    elements = elements.map(loop);

    this.setState({ elements });
  }

  render() {
    const elements = this.state.elements;

    const render = (element, parent) => {
      switch (element.type) {
        case "button":
          let style = {};
          if (parent.type === "buttons") {
            style = parent.props.styleChildren;
          }
          return (
            <a key={element.id} href="{element.props.url}" style={style}>
              {element.props.text}
            </a>
          );
        case "buttons":
          return (
            <ChildWrapper
              key={element.id}
              onClickAddElement={() => this.addElement(element.id, "button")}
            >
              {element.children.map(el => render(el, element))}
            </ChildWrapper>
          );

        case "wrapper":
          return (
            <ChildWrapper
              key={element.id}
              onClickAddElement={() => this.addElement(element.id, "text")}
            >
              {element.children.map(el => render(el, element))}
            </ChildWrapper>
          );
        case "text": {
          let classNames = "";
          classNames = classNames + " text-" + element.props.color;
          classNames = classNames + " text-" + element.props.size;
          return (
            <p key={element.id} className={classNames}>
              {element.props.text}
            </p>
          );
        }
        default:
          return "Missing render for " + element.type;
      }
    };

    return elements.map(render);
  }
}

function App() {
  return (
    <div className="App">
      <Disp />
    </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
