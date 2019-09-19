import React from "react";
import ReactDOM from "react-dom";

import "./styles.css";

const ChildWrapper = ({children, onClickAddElement}) => {
    return <div style={{border: '1px dotted grey', position: "relative"}}>
      {children}
      <a style={{position: "absolute", left: 0, top: "0", background: "red"}} onClick={()=>onClickAddElement && onClickAddElement()}>+</a>
    </div>
}

const id = () => Math.random()
const textComponent = () => ({id: id(), type: "text", props: {text: "Hello!", color: 'red', size: '120px'}})
const buttonComponent = () => ({id: id(), type: 'button', props: {text: 'my button', url: 'http://sapo.pt'}})
  
class Disp extends React.Component {

  constructor(props){
    super(props)
    this.state = {
      elements: [
        {id: "aaa", type: "wrapper", children: [
          textComponent(),
          {id: 'blablabla', type: 'buttons', props: {
              styleChildren: {border: '1px solid red', marginRight: '20px'}
            }, children: [
              buttonComponent(),
              buttonComponent()
        ]}]}
        
      ]
    }
  }

  addElement(id, type){
    console.log('add', id, type)
    let elements = this.state.elements;
    
    const loop = element => {

      if(element.children){
        element.children = element.children.map(loop)
      }
      if(element.id === id){
        
        if(type === "button"){
          element.children.push(buttonComponent())
        }
        if(type === 'text'){
          element.children.push(textComponent())
        }
        
      }

      return element;

    }

    elements = elements.map(loop)

    this.setState({elements})


  }

  render(){
    const elements = this.state.elements

    const render = (element, parent) => {
      switch (element.type) {
        case 'button':
          let style={}
          if(parent.type == "buttons"){
            style = parent.props.styleChildren
          }
          return <a id={element.id} href="{element.props.url}" style={style}>{element.props.text}</a>    
        case 'buttons':
          return <ChildWrapper id={element.id} onClickAddElement={()=>this.addElement(element.id, 'button')}>{element.children.map(el => render(el, element))}</ChildWrapper>
        
       case 'wrapper':
          return <ChildWrapper id={element.id} onClickAddElement={()=>this.addElement(element.id, 'text')}>{element.children.map(el => render(el, element))}</ChildWrapper>
        case 'text':{
          const style = {
            color: "blue",
            fontSize: 40,
            ...element.props
          }
          return <p id={element.id} style={style}>{element.props.text}</p>
        }
        default: 
          return 'missing render for ' + element.type
      }
    }

    return elements.map(render)
  }
}


function App() {
  return (
    <div className="App">
      <Disp/>
    </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
