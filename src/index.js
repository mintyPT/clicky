import _ from "lodash";
import React, { useState } from "react";
import ReactDOM from "react-dom";
import "./styles.css";
/**
 *
 */
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
/**
 *
 */
const id = t =>
  t +
  "-" +
  String(Math.random())
    .split(".")
    .pop();
/**
 *
 */
const componentsTree = {
  text: {
    generator: (s = {}) => ({
      id: id("text"),
      type: "text",
      props: { text: "Hello!", color: "red-400", size: "4xl", ...s }
    })
  },
  image: {
    allowsAdditions: ["wrapper", "buttons", "text", "image"],
    generator: (s = {}, children = []) => ({
      id: id("image"),
      type: "image",
      props: {
        src:
          "https://images.unsplash.com/photo-1558980394-4c7c9299fe96?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1650&q=80",
        ...s
      },
      children
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
    allowsAdditions: ["button"],
    generator: ({ ...s } = {}, children = []) => ({
      id: id("buttons"),
      type: "buttons",
      props: {
        styleChildren: {
          border: "1px solid #333",
          marginRight: "10px",
          marginLeft: "10px",
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
    allowsAdditions: ["wrapper", "buttons", "text", "image"],
    generator: (s, children = []) => ({
      id: id("wrapper"),
      type: "wrapper",
      children
    })
  }
};

/**
 *
 */
const CustomizeElementWrapper = ({
  As = "div",
  children,
  active = false,
  empty = false,
  type,
  style = {},
  ...etc
}) => (
  <As
    {...etc}
    className={
      "relative target" +
      (active
        ? " border border-blue-500 bg-gray-200"
        : " border border-transparent") +
      (empty ? " h-16 bg-gray-200" : "")
    }
    style={{ ...style }}
  >
    {active ? (
      <span className="absolute top-0 left-0 text-xs bg-blue-400 px-2 py-1">
        {type}
      </span>
    ) : (
      undefined
    )}
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
          componentsTree.image.generator(),
          componentsTree.buttons.generator({}, [
            componentsTree.button.generator({ text: "facebook" }),
            componentsTree.button.generator({ text: "twitter" })
          ])
        ])
      ]
    };
  }

  selectElement(id) {
    this.setState({
      selectedId: id,
      selected: getElementById(this.state.elements, id)
    });
  }

  action(id, action) {
    const elements = processTree(
      e => (e.id === id ? elementAction(action, e) : e),
      this.state.elements
    );

    const newId = action.component.id;
    const newElement = getElementById(elements, newId);
    const selectNewElement = _.isArray(newElement.children);

    if (selectNewElement) {
      this.setState({
        elements: elements,
        selectedId: newId,
        selected: newElement
      });
    } else {
      this.setState({
        elements: elements
      });
    }
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
          innerProps.empty = _.castArray(element.children).length === 0;
          break;

        case "wrapper":
          inner = element.children.map(el => render(el, element));
          innerProps.empty = _.castArray(element.children).length === 0;
          break;

        case "text": {
          let classNames = "";
          classNames = classNames + " text-" + element.props.color;
          classNames = classNames + " text-" + element.props.size;
          inner = <span className={classNames}>{element.props.text}</span>;
          innerProps.style = { display: "inline-block" };
          break;
        }
        case "image":
          const inner2 = element.children.map(el => render(el, element));
          inner = (
            <div
              style={{
                height: 500,
                background: "url(" + element.props.src + ")"
              }}
            >
              {inner2}
            </div>
          );

          break;
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

    const { selectedId, selected } = this.state;

    console.log("selectedId, selected", selectedId, selected);
    return (
      <div>
        <ToggleContent
          toggle={show => <button onClick={show}>sidekick</button>}
          content={({ show, hide }) => {
            const allowsAddElementActions = _.get(
              componentsTree,
              _.get(selected, "type") + ".allowsAdditions",
              []
            );
            const isAllowed = arr => k => arr.indexOf(k) > -1;
            const isAllowedAddElementActions = isAllowed(
              allowsAddElementActions
            );

            return (
              <p>
                <Modal>
                  {selectedId && selected && (
                    <div>
                      selected: {selected.type}
                      <fieldset className="border border-red-700">
                        <legend>Add elements</legend>

                        {_.map(
                          componentsTree,
                          (e, k) =>
                            isAllowedAddElementActions(k) && (
                              <button
                                className="border border-black mx-1"
                                onClick={() =>
                                  this.action(selectedId, {
                                    type: "add",
                                    component: componentsTree[k].generator()
                                  })
                                }
                              >
                                add {k}
                              </button>
                            )
                        )}
                      </fieldset>
                      <fieldset className="border border-red-700 mt-4">
                        <legend>Customize</legend>
                        <button
                          className="border border-black ma-1"
                          onClick={() =>
                            this.action(selectedId, {
                              type: "update_props",
                              key: "styleChildren.border",
                              value: "1px solid red"
                            })
                          }
                        >
                          Update border
                        </button>
                      </fieldset>
                      <fieldset className="border border-red-700 mt-4">
                        <legend>Actions</legend>
                        <button
                          className="border border-black mx-1"
                          onClick={() =>
                            this.action(selectedId, { type: "delete" })
                          }
                        >
                          Delete element
                        </button>
                      </fieldset>
                    </div>
                  )}

                  <button onClick={hide}>Close</button>
                </Modal>
              </p>
            );
          }}
        />
        <hr />
        {elements.map(render)}
      </div>
    );
  }
}
/**
 *
 */
const Modal = ({ children }) =>
  ReactDOM.createPortal(
    <div className="modal">{children}</div>,
    document.getElementById("modal-root")
  );
/**
 *
 */
function App() {
  return (
    <div className="App">
      <Disp />
    </div>
  );
}
/**
 *
 */
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
      throw Error("Missing logic for action " + action.type);
  }
};

function elementActionUpdateProps(action, element) {
  return _.set(element, "props." + action.key, action.value);
}

function elementActionAdd(element, action) {
  element.children.push(action.component);
  return element;
}

const getElementById = (elements, id) => {
  let selected;
  processTree(e => {
    if (e.id === id) {
      selected = e;
    }
  }, elements);
  return selected;
};
