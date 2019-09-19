import React, { useState } from "react";
import ReactDOM from "react-dom";

import "./styles.css";

const ToggleContent = ({ toggle, content }) => {
  const [isShown, setIsShown] = useState(false);
  const hide = () => setIsShown(false);
  const show = () => setIsShown(true);

  return (
    <>
      {toggle(isShown ? hide : show)}
      {isShown && content({ hide, show })}
    </>
  );
};

const AddElementsWrapper = ({ children, onClickAddElement }) => {
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

const id = () =>
  String(Math.random())
    .split(".")
    .pop();

const componentsTree = {
  text: {
    generator: () => ({
      id: id(),
      type: "text",
      props: { text: "Hello!", color: "red-400", size: "4xl" }
    })
  },
  button: {
    generator: () => ({
      id: id(),
      type: "button",
      props: { text: "my button", url: "http://sapo.pt" }
    })
  }
};

class Disp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedElement: undefined,
      elements: [
        {
          id: "aaa",
          type: "wrapper",
          children: [
            componentsTree.text.generator(),
            {
              id: "blablabla",
              type: "buttons",
              props: {
                styleChildren: { border: "1px solid red", marginRight: "20px" }
              },
              children: [
                componentsTree.button.generator(),
                componentsTree.button.generator()
              ]
            }
          ]
        }
      ]
    };
  }

  addElement(id, type) {
    this.setState({ selectedElement: { id, type } });
    /*let elements = this.state.elements;

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

    this.setState({ elements });*/
  }

  render() {
    const elements = this.state.elements;

    const RenderButton = ({ element, parent }) => {
      let style = {};
      if (parent.type === "buttons") {
        style = parent.props.styleChildren;
      }
      return (
        <a key={element.id} href={element.props.url} style={style}>
          {element.props.text}
        </a>
      );
    };

    const CustomizeElementWrapper = ({ id, type, children }) => (
      <div
        style={{ border: "1px solid green", padding: 3 }}
        onClick={() => this.addElement(id, type)}
      >
        {children}
      </div>
    );

    const render = (element, parent) => {
      switch (element.type) {
        case "button":
          return (
            <CustomizeElementWrapper
              id={element.id}
              type={element.type}
              key={element.id}
            >
              <RenderButton element={element} parent={parent} />
            </CustomizeElementWrapper>
          );

        case "buttons":
          const children = element.children.map(el => render(el, element));

          return (
            <CustomizeElementWrapper
              id={element.id}
              type={element.type}
              key={element.id}
            >
              {children}
            </CustomizeElementWrapper>
          );

        case "wrapper":
          return (
            <CustomizeElementWrapper
              id={element.id}
              type={element.type}
              key={element.id}
            >
              {element.children.map(el => render(el, element))}
            </CustomizeElementWrapper>
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

    return (
      <div>
        <ToggleContent
          toggle={show => <button onClick={show}>Open</button>}
          content={({ show, hide }) => (
            <p>
              <Modal>
                {JSON.stringify(this.state.selectedElement)}
                <fieldset>
                  <legend>Add elements</legend>
                  ---
                </fieldset>
                <fieldset>
                  <legend>Customize</legend>
                  ---
                </fieldset>
                <button onClick={hide}>Close</button>
              </Modal>
            </p>
          )}
        />
        <hr />
        {elements.map(render)}
      </div>
    );
  }
}

const Modal = ({ children }) =>
  ReactDOM.createPortal(
    <div className="modal">{children}</div>,
    document.getElementById("modal-root")
  );

function App() {
  return (
    <div className="App">
      <Disp />
    </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
