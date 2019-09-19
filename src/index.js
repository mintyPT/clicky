import _ from "lodash";
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

const id = t =>
  t +
  "-" +
  String(Math.random())
    .split(".")
    .pop();

const componentsTree = {
  text: {
    generator: (s = {}) => ({
      id: id("text"),
      type: "text",
      props: { text: "Hello!", color: "red-400", size: "4xl", ...s }
    })
  },
  button: {
    generator: (s = {}) => ({
      id: id("button"),
      type: "button",
      props: { text: "my button", url: "http://sapo.pt", ...s }
    })
  },
  buttons: {
    allow: ["button"],
    generator: ({ ...s } = {}, children) => ({
      id: id("buttons"),
      type: "buttons",
      props: {
        styleChildren: {
          border: "1px solid #333",
          marginRight: "20px",
          borderRadius: "500px",
          padding: "5px 10px",
          display: "inline-block",
          fontWeight: "bold"
        },
        ...s
      },
      children
    })
  },
  wrapper: {
    allow: ["wrapper", "buttons", "text"],
    generator: (s, children) => ({
      id: id("wrapper"),
      type: "wrapper",
      children
    })
  }
};
const CustomizeElementWrapper = ({
  As = "div",
  children,
  active = false,
  type,
  style = {},
  ...etc
}) => (
  <As
    {...etc}
    className={"target " + (active ? "active" : "")}
    style={{ margin: 5, ...style }}
  >
    {children}
  </As>
);

class Disp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedId: undefined,
      selected: undefined,
      elements: [
        componentsTree.wrapper.generator({}, [
          componentsTree.text.generator(),
          componentsTree.buttons.generator({}, [
            componentsTree.button.generator({ text: "facebook" }),
            componentsTree.button.generator({ text: "twitter" })
          ])
        ])
      ]
    };
  }

  selectElement(id, type) {
    let selected;
    processTree(e => {
      if (e.id === id) {
        selected = e;
      }
    }, this.state.elements);

    this.setState({ selectedId: id, selected });
  }

  action(id, action) {
    this.setState({
      elements: processTree(
        e => (e.id === id ? elementAction(action, e) : e),
        this.state.elements
      )
    });
  }

  render() {
    const elements = this.state.elements;
    const activeId = this.state.selectedId;

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

    const render = (element, parent) => {
      const isActive = element.id === activeId;

      const onClick = e => {
        e.stopPropagation();
        this.selectElement(element.id);
      };

      let inner;
      const innerProps = {};
      switch (element.type) {
        case "button":
          inner = <RenderButton element={element} parent={parent} />;
          innerProps.style = { display: "inline-block" };
          break;

        case "buttons":
          const children = element.children.map(el => render(el, element));
          inner = <div>{children}</div>;
          break;

        case "wrapper":
          inner = element.children.map(el => render(el, element));
          break;

        case "text": {
          let classNames = "";
          classNames = classNames + " text-" + element.props.color;
          classNames = classNames + " text-" + element.props.size;
          inner = <span className={classNames}>{element.props.text}</span>;
          innerProps.style = { display: "inline-block" };
          break;
        }
        default:
          return "Missing render for " + element.type;
      }

      return (
        <CustomizeElementWrapper
          active={isActive}
          id={element.id}
          type={element.type}
          key={element.id}
          onClick={onClick}
          {...innerProps}
        >
          {inner}
        </CustomizeElementWrapper>
      );
    };

    return (
      <div>
        <ToggleContent
          toggle={show => <button onClick={show}>Open</button>}
          content={({ show, hide }) => (
            <p>
              <Modal>
                {JSON.stringify(this.state.selectedId)}
                {this.state.selectedId && (
                  <div>
                    <fieldset>
                      <legend>Add elements</legend>
                      <button
                        style={{ background: "#333333" }}
                        onClick={() =>
                          this.action(this.state.selectedId, {
                            type: "add",
                            component: componentsTree.text.generator()
                          })
                        }
                      >
                        add text
                      </button>
                      <button
                        style={{ background: "#333333" }}
                        onClick={() =>
                          this.action(this.state.selectedId, {
                            type: "add",
                            component: componentsTree.button.generator()
                          })
                        }
                      >
                        add button
                      </button>
                      ---
                    </fieldset>
                    <fieldset>
                      <legend>Customize</legend>
                      ---
                    </fieldset>

                    <button
                      style={{ background: "#333333" }}
                      onClick={() =>
                        this.action(this.state.selectedId, { type: "delete" })
                      }
                    >
                      Delete element
                    </button>

                    <button
                      style={{ background: "#333333" }}
                      onClick={() =>
                        this.action(this.state.selectedId, {
                          type: "update_props",
                          key: "styleChildren.border",
                          value: "1px solid red"
                        })
                      }
                    >
                      Update border
                    </button>
                  </div>
                )}

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

/**
 *
 */
const processTree = (cb, element) => {
  element = _.cloneDeep(element);

  if (_.isArray(element)) {
    return element.map(e => processTree(cb, e)).filter(v => !!v);
  }

  if (element.children) {
    element.children = processTree(cb, element.children);
  }

  return cb(element);
};

/**
 *
 * @param {int} id id of the element to change
 * @param {function} elementAction function to call with the element we are looking for
 * @param {*} element element we are currently checking
 */
const elementAction = (action, element) => {
  switch (action.type) {
    case "add":
      return elementActionAdd(element, action);
    case "delete":
      return undefined;
    case "update_props":
      return elementActionUpdateProps(action, element);
    default:
      break;
  }

  return element;
};

function elementActionUpdateProps(action, element) {
  const key = "props." + action.key;
  element = _.set(element, key, action.value);
  return element;
}

function elementActionAdd(element, action) {
  element.children.push(action.component);
  return element;
}
