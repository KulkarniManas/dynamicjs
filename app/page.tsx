"use client"
import Image from "next/image";
import { Editor } from "@monaco-editor/react";
import { useState } from "react";
import parseCode from './utils/acorn'
import codeImage from './images/code.jpeg'

export default function Home() {

  const [code, setCode] = useState('//Start coding here')
  const [variables, setVariables] = useState([] as any)
  const [stack, setStack] = useState([] as any)
  const [heap, setHeap] = useState([] as any)
  const [open,setOpen] = useState(false)

  function handleCodeChange(value: any, event: any) {
    setCode(value)

  }

  const modalHandeler = ()=>{
     setOpen(!open)
  }

  const getVariables = () => {
    let stackvalues: any[] = []
    let heapvalues: any[] = []

    const variables = parseCode(code)
    setVariables(variables)
    console.log(variables)


    // now add into stack and queue
    variables.forEach((item) => {



      if (item.dataType === 'object') {
        stackvalues.push({ variable: item.name, value: 'Object Reference', color : 'bg-yellow-800 text-white text-bold' ,associated : 'reference'})
        heapvalues.push({variable : item.name,value : Object.entries(item.value).map((key,value)=>{return JSON.stringify({key : key,value:value})}),color : 'bg-yellow-800 text-white text-bold'})
        // Object.entries(item.value).forEach(([key,value])=>{
        //   console.log(key,value)
        // })
      }
      else if (item.type === 'function') {
        stackvalues.push({ variable: item.name, value: 'Function Reference' , color : 'bg-pink-600 text-white text-bold',associated : 'reference'})
        heapvalues.push({variable : item.name,value:item.body,color : 'bg-pink-600 text-white text-bold'})}

      else if(item.dataType === 'array'){
           let arrayvalues : any [] = []
           stackvalues.push({variable : item.name,value : 'Array Reference',color : 'bg-gray-600 text-white text-bold',associated : 'reference'})
           item.value.forEach((item:any)=>{
                arrayvalues.push(item.value + " ")
           })
           heapvalues.push({variable : item.name,value : "[" + arrayvalues + "]",color : 'bg-gray-600 text-white text-bold' })

      }

      else {
        stackvalues.push({ variable: item.name, value: item.value ,color : 'bg-red-400 text-white text-bold',associated : 'primitive'})
      }
    })

    setStack(stackvalues)
    setHeap(heapvalues)


    //console.log(stack, 'stack')
    //console.log(heap,'heap')

  


  }


  // deleteFromHeap
  const deleteFromHeap = (id:number) =>{

    //  delete from heap
    // make the heap reference null

    // get the heap reference
    let heapval = heap[id]
    let name = heapval.variable
    //console.log(name)
    
    const ref_stack = stack.map((item:any)=>{
      if(item.variable === name ){
         item.value = 'null'
      }

      return item
    })

    setStack(ref_stack)


    // remove the element from the heap
     const newHeap = heap.filter((item:any)=> item.variable!==name)
     console.log(newHeap,'heapval')
     setHeap(newHeap)
    console.log(ref_stack)
    
    

     
  }

  const runGarbageCollectior = () =>{
       
    let newStack = stack.filter((item:any)=>item.value!=='null')
    setStack(newStack)
  }


  const deleteVariables = (id:number) =>{

    let toDelete = stack[id]
    let newStack : any [] = []
    if(toDelete.associated === 'primitive'){
       newStack = stack.filter((item:any)=>item.variable!==toDelete.variable)
       setStack(newStack)
    }
    
      
  }







  return (
    <section className="w-screen h-screen bg-black flex flex-col">
      <div className="w-full flex items-center justify-around">
      <button className="bg-blue-600 w-1/4 p-4 my-2 mx-2 self-center" onClick={runGarbageCollectior}>
          Run Garbage Collector
        </button>

        <button className="bg-blue-600 w-[20%] p-4 my-2 mx-2 text-lg text-white self-center" onClick={modalHandeler}>
          Info
        </button>
      </div>
      
      <section className="w-full h-full flex bg-black p-4  justify-around gap-2" >

        

        <div className="w-1/2 h-full bg-white flex flex-col-reverse">
          
          {stack.map((item:any,index:number)=>{
                return (
                  <div key={index} className={`w-full ${item.color} h-[40px] text-center text-lg my-2`} onClick={()=>{deleteVariables(index)}}>
                     {item.variable} = {item.value}
                  </div>
                )
          })}

        </div>

        

        <div className="w-1/2 bg-white h-full flex flex-col-reverse">
             
        {heap.map((item:any,index:number)=>{
                return (
                  <div key={index} className={`w-full ${item.color} h-auto text-center text-lg my-2`} onClick={()=>deleteFromHeap(index)}>
                     {item.variable} = {item.value}
                  </div>
                )
          })}

        </div>

      </section>
      <div className="flex p-4 w-full h-max-content justify-around items-start bg-red-400 ">
        <Editor
          height="40vh"
          width="200vh"
          defaultLanguage='javascript'
          value={code}
          theme='vs-dark'
          options={{fontSize : 20}}
          onChange={handleCodeChange}
          className="text-lg"
        />
      
      <div className=" self-center  flex items-center w-full justify-center">
        <button onClick={getVariables} className="w-1/2 p-2 bg-orange-400 text-white font-mono ">
          Submit
        </button>
        </div>
      </div>


      {open ?<div className="w-screen h-screen backdrop-blur-sm flex items-center justify-center absolute ">
        <div className="bg-slate-200 w-3/4 h-3/4  overflow-y-scroll rounded-xl backdrop-blur-lg border-4 border-red-800 flex flex-col gap-6">
        <span onClick={modalHandeler} className="cursor-pointer">
          Close
        </span>
        <h1 className="text-2xl text-center font-mono text-bold uppercase">Memory Management Simulation!</h1>

        <div className="bg-white w-full self-start mx-4 p-4">
          <h2 className="text-xl text-bold underline">About this Simulator</h2>
          <p>
            This is a simulator application, which demonstrates allocation of memory in Javascript.
            <h3 className="text-lg text-bold uppercase italic mt-4">The Code Editor</h3>
            <p>In the available code editor, the user can enter the javascript code, for memory allocation of javascript types.</p>
            <p>The <b>'let'</b>, <b>'const'</b> and <b> 'var'</b> keywords are used to declare a variable in javascript</p>
            <Image src={codeImage} alt = 'image' width={1000} height={1000} className="p-4"/>
            <p>Once you hit the <b>'Submit'</b> button, all the variable declarations are accordingly added to the containers above! </p>

          </p>
        </div>

        <div className="bg-white w-full self-start mx-4 p-4 rounded-lg">
          <h2 className="text-xl text-bold underline">How memory Management is handled in this Simulator!</h2>
            <h3 className="mt-2 text-lg text-bold">What data structures are added to the Stack?</h3>
            <ol className="mt-4">
            <li>1. The primitive data structures, whose memory size is decided at runtime, are allocated into the stack</li>
            <li>2. The variables, which store references to Objects, Functions and Arrays. </li>
            </ol>

            <h3 className="mt-2 text-lg text-bold">What data structures are added to the Heap?</h3>
            <ol className="mt-4">
            <li>1. The function body is added to the heap!</li>
            <li>2. The Objects are added to the heap </li>
            <li>3. The Arrays are added to the heap</li>
            </ol>
            
            

        </div>

        <div className="bg-white w-full self-start mx-4 p-4 rounded-lg">
          <h2 className="text-2xl text-bold underline">Deallocation of Memory!</h2>
            <h3 className="mt-2 text-lg text-bold underline ">Deallocation of the Heap Memory</h3>
            <p className="mt-2">To Deallocate the memory in the heap, just <b>Click!</b> on the memory block </p>
            <p><b>Once you Click on the memory block in the heap!</b></p>
            <ul>
              <li>1. The memory block dissapears!</li>
              <li>2. The memory block pointing to it in the stack, becomes null, and ready for garbage collection!</li>
            </ul>

            <h3 className="mt-2 text-lg text-bold underline ">Deallocation of the Stack Memory</h3>
            <p className="mt-2">To Deallocate the memory of primitive types, in the stack, just <b>Click!</b> on the memory block </p>
            <p><b>Once you Click on the memory block in the stack!</b></p>
            <ul>
              <li>The memory block dissapears!</li>
              
            </ul>
            
            

        </div>


        <div className="bg-white w-full self-start mx-4 my-4 p-4 rounded-lg">
          <h1 className="text-2xl underline text-bold my-4">The Garbage Collector</h1>
            <p>For all the memory blocks, which are available for garbage collection, i.e the variables which have become 'null' are removed from the memory</p>
            <p>Mark and Sweep algoritms works same, but a bit complex to visualize here!</p>
            

        </div>
      </div></div> :null}




    </section>


  );
}
